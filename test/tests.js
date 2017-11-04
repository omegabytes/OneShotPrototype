var bst     = require('bespoken-tools');
var assert  = require('assert');
var appId   = "amzn1.ask.skill.cc5fc00c-2a42-4e91-afa9-f0a640147e25";

var server  = null;
var alexa   = null;

// //creates a local lambda server and initializes the emulator
beforeEach(function (done) {
    server = new bst.LambdaServer('./src/index.js', 10000,false);
    alexa = new bst.BSTAlexa('http://localhost:10000?disableSignatureCheck=true',
        './speechAssets/IntentSchema.json',
        './speechAssets/SampleUtterances.txt', appId);

    server.start(function () {
        alexa.start(function (error) {
            if (error != undefined) {
                console.error("Error: " + error);
            } else {
                done();
            }
        });
    });
});

//tears down the local Lambda server and shuts down the emulator
afterEach(function (done) {
    alexa.stop(function () {
        server.stop(function () {
            done();
        });
    });
});

//todo: add tests