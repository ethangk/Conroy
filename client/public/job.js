function remote_fn(data) {
  var hashCode = function(n) {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = n.length; i < len; i++) {
    chr   = n.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}; 

 return hashCode(data);

}
