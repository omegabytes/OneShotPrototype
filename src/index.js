'use strict';

var Alexa = require('alexa-sdk');
var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var dndLib = require('./dndLib.js');

exports.handler = function(event,context,callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.cc5fc00c-2a42-4e91-afa9-f0a640147e25";
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, charSelectHandlers);
    alexa.execute();
};

const states = {
    STARTMODE: '_STARTMODE',    // Beginning of game with menu, start, and help prompts
    CHARSELECT: '_CHARSELECT',  // Prompts user to select a character, and gives info on character
    FORESTSCENE: '_FORESTSCENE' // The first encounter, where the user is described a situation and asked what to do
};

// user opens the skill, either for the first time or is returning
const newSessionHandlers = {
    'NewSession': function () {
        this.handler.state = states.STARTMODE;
        this.attributes['speechOutput'] = langEN.WELCOME_MESSAGE;
        this.attributes['repromptSpeech']  = langEN.WELCOME_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    //Required Amazon Intents
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

//
const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
       this.emit('NewSession'); // uses the handler in newSessionHandlers
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.CHARSELECT;
        this.attributes['speechOutput'] = 'Great! First, you\'ll need to choose the character you wish to play as. '
                                        + 'You can be a wizard, a rogue, or a warrior. What do you choose?';
        this.attributes['repromptSpeech'] = 'Say wizard, rogue, or warrior to choose a class, or say exit to quit';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "Thanks for playing!";
        this.emit(':tell', this.attributes['speechOutput']);
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
});

const charSelectHandlers = Alexa.CreateStateHandler(states.CHARSELECT, {
    'NewSession': function () {
        this.emit('NewSession'); // uses the handler in newSessionHandlers
    },

    // 'CharSelectIntent': function () {
    //
    // },

    // user says rogue
    'RogueIntent' : function () {
        this.attributes['character'] = 'rogue';
        this.attributes['speechOutput'] = dndLib.getClassDescription('rogue') + 'Say yes to confirm, or say wizard or warrior to hear about the other classes. Say more info for detailed stats.';
        this.emit(':ask', this.attributes['speechOutput']);
        // set a user/session attribute 'selectedChar' = rogue
        // prompt user to check if they want description
        // double check to confirm choice

    },

    // user says warrior
    'WarriorIntent' : function () {
        this.attributes['character'] = 'warrior';
        this.attributes['speechOutput'] = dndLib.getClassDescription('warrior');
        this.emit(':tell', this.attributes['speechOutput']);
        // set a user/session attribute 'selectedChar' = warrior
    },

    // user says wizard
    'WizardIntent' : function () {
        this.attributes['character'] = 'wizard';
        this.attributes['speechOutput'] = dndLib.getClassDescription('wizard');
        this.emit(':tell', this.attributes['speechOutput']);
        // set a user/session attribute 'selectedChar' = wizard
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.FORESTSCENE;

        this.attributes['speechOutput'] = "You chose the " + this.attributes['character'] + ". Your adventure begins!";

        this.emit(':tell', this.attributes['speechOutput']); // need to change this to an ask, and include the prompt for the next scene
    },

    'AMAZON.HelpIntent': function () {
        // use char select specific help messages here
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
});
