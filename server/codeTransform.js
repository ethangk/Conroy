module.exports = {
  transformCode: transform
}

var fs = require('fs');
var exec = require('child_process').exec;

var moduleName = 'FayFromJs';

var remoteFnName = 'remoteFn';

function transform(language, code, cb) {
  switch (language) {
     case 'Javascript':
      cb(code); // no transform
      break;
     case 'Haskell':
       var hsFile = "/tmp/" + moduleName +".hs";
       fs.writeFile(hsFile, frameHaskell(code), function(err) {
           if(err) {
               console.log(err);
           } else {
               console.log("The haskell file was written. calling fay...");
               var compile = fayCompileCommand(hsFile)
               child = exec(compile, function (error, stdout, stderr) {
                 if (error !== null) {
                   console.log('exec error: ' + error);
                 }
                 var jsFile = "/tmp/" + moduleName + '.js';
                 fs.readFile(jsFile, function (err, data) {
                   cb(haskellInjectJs(data)); // finally calling the original callback
                 });
               });
           }    
       }); 
     break;
  }
}

function frameHaskell(hsCode) {return 'module FayFromJs where\n' + hsCode;}

// injecting a function call to the designated user function at the end
// of the js code
function haskellInjectJs(jsCode) {
  return jsCode + ';return ' + 'Strict.' + moduleName + '.' + remoteFnName + '(n);'; 
}

function fayCompileCommand(hsFile) { return "HASKELL_PACKAGE_SANDBOX=/home/dan/tools/fay/.cabal-sandbox/x86_64-linux-ghc-7.8.2-packages.conf.d fay " + hsFile + " --strict " + moduleName; }


/*

example function of how to use it

transform('Haskell', 'remoteFn x = x + 13\n', function (jsCode) {
  args = ['n', "n = 2;" + jsCode];
  myFunc = Function.apply(null, args);
  console.log(myFunc());
});

*/
