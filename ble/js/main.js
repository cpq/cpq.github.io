'use strict';
var h = preact.h;
var app;  // App constructor sets this variable

var createClass = function(obj) {
  var F = function() {
    preact.Component.apply(this, arguments);
    if (obj.init) obj.init.call(this, this.props);
  };
  var p = F.prototype = Object.create(preact.Component.prototype);
  for (var i in obj) p[i] = obj[i];
  return p.constructor = F;
};

var map = function(arr, f) {
  var newarr = [];
  for (var i = 0; i < arr.length; i++) newarr.push(f(arr[i], i, arr));
  return newarr;
};

var mkicon = function(icon) {
  return h('i', {class: 'mx-2 fa fa-fw ' + icon});
};

var Header = createClass({
  init: function() {
    this.state = {expanded: false};
  },
  render: function(props) {
    var self = this;
    var title = 'CCM';
    var src = 'images/logo-512x512.png';
    var icon = h('img', {src: src, width: 32, class: 'mr-2'});
    var mkitem = function(icon, href, title, onclick) {
      var active = props.url == href ? ' active' : '';
      return h(
          preactRouter.Router.Link, {
            class: 'nav-item nav-link ' + active,
            href: href,
            onClick: function() {
              self.setState({expanded: false});
            }
          },
          title, mkicon(icon));
    };
    return h(
        'nav', {class: 'navbar navbar-expand navbar-dark bg-dark'},
        h('a', {class: 'navbar-brand', href: '#'}, icon, title),
        h('button', {
          class: 'navbar-toggler',
          type: 'button',
          onClick: function() {
            self.setState({expanded: !self.state.expanded});
          },
        },
          h('span', {class: 'navbar-toggler-icon'})),
        h('div',
          {class: 'navbar-collapse' + (self.state.expanded ? '' : ' collapse')},
          h('ul', {class: 'navbar-nav ml-auto text-right mt-2'},
            mkitem('fa-wifi d-none', '/', 'WiFi'),
            mkitem('fa-gears d-none', '/rpc', 'RPC'))));
  },
});

// See details at https://github.com/mongoose-os-libs/rpc-gatts
var rpc_uuid = '5f6d4f53-5f52-5043-5f53-56435f49445f';  // _mOS_RPC_SVC_ID_
var rpc_data = '5f6d4f53-5f52-5043-5f64-6174615f5f5f';  // _mOS_RPC_data___
var rpc_tx = '5f6d4f53-5f52-5043-5f74-785f63746c5f';    // _mOS_RPC_tx_ctl_
var rpc_rx = '5f6d4f53-5f52-5043-5f72-785f63746c5f';    // _mOS_RPC_rx_ctl_
var bleRPCID = 1;

var blerpc = async function(dev, method, params, cb) {
  var obj = {method: method, id: bleRPCID++};
  if (params) {
    obj.params = typeof (params) == 'string' ? JSON.parse(params) : params;
  }
  var frame = (new TextEncoder()).encode(JSON.stringify(obj));
  var srv = await dev.gatt.connect();
  var svc = await srv.getPrimaryService(rpc_uuid);
  var tx = await svc.getCharacteristic(rpc_tx);
  var n = frame.length;
  var b = [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
  await tx.writeValue(new Uint8Array(b));  // Write frame length to tx
  var dx = await svc.getCharacteristic(rpc_data);
  for (var sent = 0, chunkSize = 50; sent < frame.length; sent += chunkSize) {
    if (chunkSize > frame.length - sent) chunkSize = frame.length - sent;
    var chunk = new DataView(frame.buffer, sent, chunkSize);
    await dx.writeValue(chunk);
  }
  var rx = await svc.getCharacteristic(rpc_rx);
  // console.log('rx', rx);
  for (var i = 0; i < 20; i++) {         // Try up to 20 times
    var b2 = await rx.readValue();       // Read response length
    var u8 = new Uint8Array(b2.buffer);  // big endian 32-bit number
    var r = '', j = 0, n = (u8[0] << 24) | (u8[1] << 16) | (u8[2] << 8) | u8[3];
    if (n == 0) continue;  // If > 0, response is ready
    while (j < n) {
      var chunk = await dx.readValue();
      r += (new TextDecoder('utf-8')).decode(chunk);
      j += chunk.byteLength;
    }
    // console.log('r', r);
    return JSON.parse(r);
  }
  return undefined;
};

var RPC = createClass({
  init: function() {
    this.state = {
      spin: false,
      selectedMethod: '',
      rpcParams: '',
      rpcResult: '',
      methods: [],
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.refresh();
  },
  refresh: async function() {
    var self = this;
    if (!app.state.device) return;
    self.setState({spin: true, methods: []});
    blerpc(app.state.device, 'RPC.List')
        .then(function(f) {
          self.setState({methods: f.result || []});
        })
        .catch(function(err) {
          alert(err);
        })
        .then(function(res) {
          self.setState({spin: false});
        });
  },
  render: function(props, state) {
    var self = this;
    return h(
        'div',
        {class: 'row my-2'},
        h('div', {class: 'col-5 pr-1'},
          h('select', {
            onChange: function(ev) {
              self.setState({selectedMethod: ev.target.value});
            },
            class: 'w-100 form-control form-control-sm'
          },
            map(state.methods,
                function(o) {
                  return h('option', {}, o);
                }))),
        h('div', {class: 'col-5 px-0'},
          h('input', {
            type: 'text',
            onInput: function(ev) {
              self.setState({rpcParams: ev.target.value});
            },
            class: 'form-control form-control-sm'
          },
            state.rpcParams)),
        h('div', {class: 'col-2 pl-1'},
          h('button', {
            class: 'btn btn-block btn-sm btn-warning',
            onClick: function(ev) {
              self.setState({rpcResult: '', spin: true, error: false});
              blerpc(app.state.device, state.selectedMethod, state.rpcParams)
                  .then(function(f) {
                    var res = f.error || f.result;
                    self.setState({
                      error: f.error !== undefined,
                      rpcResult: JSON.stringify(res, null, '  '),
                    });
                  })
                  .catch(function(err) {
                    alert(err);
                  })
                  .then(function(res) {
                    self.setState({spin: false});
                  });
            },
            disabled: state.spin
          },
            state.spin ? mkicon('fa-refresh fa-spin') : 'call')),
        h('div', {class: 'col-12'},
          h('pre', {class: 'my-2 p-2 ' + (state.error ? 'text-danger' : '')},
            state.rpcResult)),
    );
  },
});

var WiFi = createClass({
  init: function() {
    this.state = {
      ssid: '',
      pass: '',
      spin: false,
    };
  },
  render: function(props, state) {
    var self = this;
    return h(
        'div',
        {class: 'form my-2'},
        h('input', {
          type: 'text',
          name: 'wifi_ssid',
          placeholder: 'WiFi network...',
          onInput: function(ev) {
            self.setState({ssid: ev.target.value});
          },
          class: 'form-control form-control-sm my-2'
        },
          state.ssid),
        h('input', {
          type: 'password',
          name: 'wifi_pass',
          placeholder: 'WiFi password...',
          onInput: function(ev) {
            self.setState({pass: ev.target.value});
          },
          class: 'form-control form-control-sm my-2'
        },
          state.pass),
        h('button', {
          class: 'btn btn-block btn-sm btn-warning',
          onClick: function(ev) {
            self.setState({spin: true});
            var params = {
              config: {
                wifi: {
                  ap: {enable: false},
                  sta: {
                    enable: true,
                    ssid: self.state.ssid,
                    pass: self.state.pass,
                  }
                }
              }
            };
            blerpc(app.state.device, 'Config.Set', params)
                .then(function(f) {
                  blerpc(app.state.device, 'Config.Save', {reboot: true})
                })
                .catch(function(err) {
                  alert(err);
                })
                .then(function(res) {
                  self.setState({spin: false});
                });
          },
          disabled: state.spin || !state.ssid || !app.state.device
        },
          mkicon(state.spin ? 'fa-refresh fa-spin' : 'fa-save'),
          'Save WiFi settings'),
    );
  },
});

var Chooser = createClass({
  init: function() {
    this.state = {spin: false};
  },
  render: function(props, state) {
    var self = this;
    if (!navigator.bluetooth) {
      return h(
          'div', {class: 'my-2'},
          h('div', {class: 'alert alert-danger'},
            'BLE is not supported by this platform. Please use Chrome.'));
    }
    var button =
        h('button', {
          class: 'btn btn-sm btn-info btn-block my-2',
          disabled: state.spin,
          onClick: function() {
            self.setState({spin: true});
            navigator.bluetooth
                .requestDevice(
                    {acceptAllDevices: true, optionalServices: [rpc_uuid]})
                .then(function(dev) {
                  app.setState({device: dev});
                  // return blerpc(dev, 'Sys.GetInfo');
                })
                .then(function(f) {
                  // app.setState({appName: f.result.app});
                  // console.log('f', f);
                })
                .catch(function(err) {
                  alert(err);
                })
                .then(function() {
                  self.setState({spin: false});
                });
          },
        },
          mkicon(state.spin ? 'fa-spin fa-refresh' : 'fa-search'),
          'Choose device');
    var name = app.state.device ? app.state.device.name : '<unset>'
    var appName = app.state.appName || '<unknown_app>';
    var deviceName = h('div', {}, 'Device: ' + name);
    return h('div', {class: ''}, button, deviceName);
  },
});

var App = createClass({
  init: function(props) {
    this.state = {device: null, url: '/', appName: ''};
    app = this;
  },
  componentDidMount: function() {},
  render: function(props, state) {
    return h(
        'div', {class: 'page h-100 container-fluid'},
        h(Header, {url: app.state.url}), h(Chooser, props),
        h(preactRouter.Router, {
          history: History.createHashHistory(),
          onChange: function(ev) {
            app.setState({url: ev.url});
            // console.log('route', ev);
          },
        },
          h(RPC, {path: '/rpc'}), h(WiFi, {default: true})));
  },
});

preact.render(h(App), document.body);
