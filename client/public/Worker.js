onmessage = function(e) {
  var taskPiece = e.data;
  console.log('Message received from main script');

  var args = ['data', taskPiece.code];
  var runnable = Function.apply(null, args);
  var result = runnable(taskPiece.data);
  console.log('Posting message back to main script');
  postMessage(result);
}
