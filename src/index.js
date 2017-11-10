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
    CHARSELECT: '_CHARSELECT'  // Prompts user to select a character, and gives info on character
   // FORESTSCENE: '_FORESTSCENE' // The first encounter, where the user is described a situation and asked what to do
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

    // user says rogue
    'RogueIntent' : function () {
        this.attributes['character'] = 'rogue';
        this.attributes['speechOutput'] = dndLib.getClassDescription('rogue') + ' Say yes to confirm, or say wizard or warrior to hear about the other classes. Say more info for detailed stats.';
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // user says warrior
    'WarriorIntent' : function () {
        this.attributes['character'] = 'warrior';
        this.attributes['speechOutput'] = dndLib.getClassDescription('warrior') + ' Say yes to confirm, or say wizard or rogue to hear about the other classes. Say more info for detailed stats.';
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // user says wizard
    'WizardIntent' : function () {
        this.attributes['character'] = 'wizard';
        this.attributes['speechOutput'] = dndLib.getClassDescription('wizard') + ' Say yes to confirm, or say rogue or warrior to hear about the other classes. Say more info for detailed stats.';
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // user wants more information about a character
    'MoreInfoIntent' : function () {
        var cardTitle = "Info: " + this.attributes['character'];
        var imageObject = dndLib.getClassImages(this.attributes['character']);

        var cardOutput = "The " + this.attributes['character'] + " has the following attributes: " +"\n\n"
                            + "Health:       " + dndLib.getStat(this.attributes['character'], 'health') + "\n"
                            + "Attack bonus: " + dndLib.getStat(this.attributes['character'], 'attackBonus') + "\n"
                            + "Damage:       " + dndLib.getStat(this.attributes['character'], 'damageDieSides') + "\n"
                            + "Perception:   " + dndLib.getStat(this.attributes['character'], 'perception') + "\n"
                            + "Stealth:      " + dndLib.getStat(this.attributes['character'], 'stealth') + "\n"
                            + "Diplomacy:    " + dndLib.getStat(this.attributes['character'], 'diplomacy');

        var spokenInfo = "The " + this.attributes['character'] + " has the following attributes: "
                                + dndLib.getStat(this.attributes['character'], 'health') + " health, "
                                + dndLib.getStat(this.attributes['character'], 'attackBonus') + " attack bonus, "
                                + dndLib.getStat(this.attributes['character'], 'damageDieSides') + " damage, "
                                + dndLib.getStat(this.attributes['character'], 'perception') + " perception, "
                                + dndLib.getStat(this.attributes['character'], 'stealth') + " stealth, "
                                + dndLib.getStat(this.attributes['character'], 'diplomacy') + " diplomacy.";

        spokenInfo += " Would you like to play as the " + this.attributes['character'] + "?";

        this.attributes['speechOutput'] = spokenInfo;
        this.attributes['repromptSpeech'] = "Say yes to select this character, or say another character to hear more about it. Say exit to quit.";
        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    'AMAZON.YesIntent': function () {
        // this.handler.state = states.FORESTSCENE;
        this.attributes['userHealth'] = dndLib.getStat(this.attributes['character'], 'health'); // sets the health of the user

        this.attributes['speechOutput'] = "You chose the " + this.attributes['character'] + ". Your adventure begins!";

        this.emit(':tell', this.attributes['speechOutput']); // need to change this to an ask, and include the prompt for the next scene
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "Okay, which character would you like to play as?";
        this.emit(':ask', this.attributes['speechOutput']);
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
