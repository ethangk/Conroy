onmessage = function(e) {
  console.log('Message received from main script');
  result = new Function(e.data)();
  console.log('Posting message back to main script');
  postMessage(result);
}
