var util = {
  generateUniqueID: function() {
    return Math.random().toString(36).substr(2, 9);
  },
  wsconnect: function(url, opts) {
    var wrapper = {
      callbacks: {},
      closed: false,
      close: function() {
        wrapper.closed = true;
        wrapper.ws.close();
      },
    };
    var reconnect = function() {
      var uriParams = '';
      if (opts.auth) {
        var token = opts.auth();
        if (!token) {
          if (!wrapper.closed) wrapper.tid = setTimeout(reconnect, 1000);
          return;
        }
        uriParams = '?access_token=' + token;
      }

      var u = url;
      if (!u || !u.match(/^ws/)) {
        var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        u = proto + '//' + location.host + (u || '/ws') + uriParams;
      }
      // console.log('Reconnecting to', u);
      var ws = new WebSocket(u);
      ws.onmessage = function(ev) {
        var msg;
        try {
          msg = JSON.parse(ev.data);
        } catch (e) {
          console.log('Invalid ws frame:', ev.data);  // eslint-disable-line
        }
        if (msg) wrapper.onmessage(msg);  // Callback outside of try block
      };
      ws.onclose = function() {
        clearTimeout(wrapper.tid);
        if (!wrapper.closed) wrapper.tid = setTimeout(reconnect, 1000);
      };
      wrapper.ws = ws;
    };
    reconnect();
    return wrapper;
  },
};
