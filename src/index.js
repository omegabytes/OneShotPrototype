'use strict';

var Alexa = require('alexa-sdk');
var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var dndLib = require('./dndLib.js');

exports.handler = function(event,context,callback) {
	var alexa = Alexa.handler(event, context);
	alexa.appId = "amzn1.ask.skill.cc5fc00c-2a42-4e91-afa9-f0a640147e25";
	alexa.resources = languageStrings;
	alexa.registerHandlers(handlers)
    alexa.execute();
};

var handlers = {
	'Unhandled': function () {
        this.attributes['continue'] = true;
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    //Required Amazon Intents 
    'LaunchRequest': function () {
        // Alexa, ask [my-skill-invocation-name] to (do something)...
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['continue'] = true;
        this.attributes['speechOutput'] = langEN.WELCOME_MESSAGE;
        this.attributes['repromptSpeech']  = langEN.WELCOME_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = langEN.HELP_MESSAGE;
        this.attributes['repromptSpeech'] = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', langEN.STOP_MESSAGE);
    }
};