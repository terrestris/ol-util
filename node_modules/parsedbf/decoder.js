var iconv = require('iconv-lite');
var StringDecoder = require('string_decoder').StringDecoder;
function defaultDecoder(data) {
  var decoder = new StringDecoder();
  var out = decoder.write(data) + decoder.end();
  return out.replace(/\0/g, '').trim();
}
module.exports = createDecoder;
function createDecoder(encoding) {
  if (!encoding) {
    return defaultDecoder;
  }
  if (!iconv.encodingExists(encoding)) {
    if (encoding.length > 5 && iconv.encodingExists(encoding.slice(5))) {
      encoding = encoding.slice(5);
    } else {
      return defaultDecoder;
    }
  }
  return decoder;
  function decoder(buffer) {
    var out = iconv.decode(buffer, encoding);
    return out.replace(/\0/g, '').trim();
  }
}
