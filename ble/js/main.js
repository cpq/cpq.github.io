'use strict';
var h = preact.h;

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
    var title = 'Provisioning over BLE';
    var src = 'images/logo-512x512.png';
    var icon = h('img', {src: src, width: 32, class: 'mr-2'});
    var mkitem = function(icon, href, title, onclick) {
      return h(
          'a', {class: 'nav-item nav-link', href: href, onClick: onclick},
          title, mkicon(icon));
    };
    return h(
        'nav', {class: 'navbar navbar-expand-* navbar-dark bg-dark'},
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
          h('ul', {class: 'navbar-nav mr-auto text-right mt-2'},
            mkitem('fa-bluetooth', '#', title),
            mkitem('fa-sign-out', '#login', 'Logout', function() {}))));
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
  if (params) obj.params = JSON.parse(params);
  var frame = (new TextEncoder()).encode(JSON.stringify(obj));
  var srv = await dev.gatt.connect();
  var svc = await srv.getPrimaryService(rpc_uuid);
  var tx = await svc.getCharacteristic(rpc_tx);
  var n = frame.length;
  var b = [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
  await tx.writeValue(new Uint8Array(b));  // Write frame length to tx
  var dx = await svc.getCharacteristic(rpc_data);
  await dx.writeValue(frame);  // Write frame itself
  var rx = await svc.getCharacteristic(rpc_rx);
  // console.log('rx', rx);
  for (var i = 0; i < 20; i++) {         // Try up to 20 times
    var b2 = await rx.readValue();       // Read response length
    var u8 = new Uint8Array(b2.buffer);  // big endian 32-bit number
    var n = (u8[0] << 24) | (u8[1] << 16) | (u8[2] << 8) | u8[3];
    if (n == 0) continue;  // If > 0, response is ready
    var chunk = await dx.readValue();
    return JSON.parse((new TextDecoder('utf-8')).decode(chunk));
  }
  return undefined;
};

var BLE = createClass({
  init: function() {
    this.state = {
      bt: navigator.bluetooth,
      device: null,
      spin: false,
      selectedMethod: '',
      rpcParams: '',
      rpcResult: '',
      methods: [],
    };
  },
  render: function(props, state) {
    var self = this;
    if (!self.state.bt) {
      return h(
          'div', {class: 'my-2'},
          h('div', {class: 'alert alert-danger'},
            'BLE is not supported by this platform. Please use Chrome.'));
    }
    var button =
        h('button', {
          class: 'btn btn-sm btn-info btn-block my-2',
          disabled: state.spin,
          onClick: async function() {
            self.setState({spin: true});
            state.bt
                .requestDevice(
                    {acceptAllDevices: true, optionalServices: [rpc_uuid]})
                .then(async function(dev) {
                  self.setState({device: dev});
                  var f = await blerpc(dev, 'RPC.List', '');
                  self.setState({methods: f.result || []});
                })
                .catch(function(err) {
                  alert(err);
                })
                .then(function() {
                  self.setState({spin: false});
                });
          },
        },
          mkicon(state.spin ? 'fa-refresh fa-spin' : 'fa-search'),
          'Choose device');
    var deviceName = h('div', {}, 'Device: ' + (state.device || {}).name);
    var ctl = h(
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
            class: 'btn btn-block btn-sm btn-info',
            onClick: function(ev) {
              self.setState({rpcResult: '', spin: true, error: false});
              blerpc(state.device, state.selectedMethod, state.rpcParams)
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
    return h(
        'div', {class: ''}, button,
        h('div', {class: state.device ? '' : 'xd-none'}, deviceName, ctl));
  },
});

var App = createClass({
  init: function(props) {
    this.state = {};
  },
  componentDidMount: function() {},
  render: function(props, state) {
    return h(
        'div', {class: 'page h-100 container-fluid'},
        h(preactRouter.Router, {history: History.createHashHistory()},
          h('div', {default: true}, h(Header, props), h(BLE, props))));
  },
});

preact.render(h(App), document.body);
