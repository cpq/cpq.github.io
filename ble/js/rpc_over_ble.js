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
