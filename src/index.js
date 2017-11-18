'use strict';

var Alexa = require('alexa-sdk');
var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var classes = require('./classes');
const APPID = require('./appID');

exports.handler = function(event,context,callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APPID;
    alexa.dynamoDBTableName = "OneShotPrototypeTable"; // FIXME: add db error handling and encapsulation (CRUD)
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, charSelectHandlers, continueHandlers, combatBeginHandlers, combatEndHandlers, endGameHandlers, forestSceneHandlers, startGameHandlers);
    alexa.execute();
};

//FIXME: not all of these states will be used. Any state listed here must have a matching handler and include all the required Amazon intents (causes compile-time errors)
const states = {
    CHAR_SELECT:        '_CHARSELECT',         // Prompts user to select a character, and gives info on character
    COMBAT:             '_COMBAT',             // User enters combat
    COMBAT_END:         '_COMBATEND',          // User exits combat with either a success or failure attribute
    CONTINUE_GAME:      '_CONTINUE',           // asks user if they want to continue on ongoing game, or start a new one
    ENDGAME:            '_ENDGAME',            // Resolution message, resets game state to new game
    ENEMY_SEES_USER:    '_ENEMYSEESUSER',      // Messaging and options if user fails perception/stealth checks, user attacks second
    FOREST_SCENE:       '_FORESTSCENE',        // The first encounter, where the user is described a situation and asked what to do
    START_MODE:         '_STARTMODE',          // Beginning of game with menu, start, and help prompts
    USER_SEES_ENEMY:    '_USERSEESENEMY'       // User passes perception/stealth checks, attacks first
};

// user opens the skill, either for the first time or is returning
const newSessionHandlers = {
    'LaunchRequest': function () {
        //FIXME: store all this as a scene
        var cardTitle = "Welcome!";
        var cardOutput = langEN.WELCOME_MESSAGE + "\n" + langEN.WELCOME_REPROMPT;
        var imageObject = {
            smallImageUrl : "https://s3.amazonaws.com/oneshotimages/LIZARDFOLK-BLACKSCALE.tif",
            largeImageUrl : "https://s3.amazonaws.com/oneshotimages/LIZARDFOLK-BLACKSCALE.tif"
        };
        // if the user hasn't opened the application before, or had completed the game
        if(!this.attributes["gameInProgress"]){
            this.handler.state = states.START_MODE;
            // game initialization
            // FIXME: encapsulate into function
            this.attributes['character'] = '';
            this.attributes['userDidDefeatEnemy'] = false;
            this.attributes['userHealth'] = '';
            this.attributes['sceneState'] = "enemy_not_seen";


            this.attributes['speechOutput'] =  langEN.WELCOME_MESSAGE;
            this.attributes['repromptSpeech'] = langEN.WELCOME_REPROMPT;
        } else {
            // if the user is returning to an in-progress game
            // ask if they want to continue where they left off or start a new game
            this.attributes['priorState'] = this.attributes['STATE']; // store the prior state so we can jump to continue game handlers
            this.handler.state = states.CONTINUE_GAME;

            this.attributes["speechOutput"] = "Welcome back! Would you like to continue from where you left off, or start a new game?";
            this.attributes['repromptSpeech'] = "Say continue to pick up where you left off, or say new to start over. Say exit to quit.";

            cardTitle = "Welcome back, " + this.attributes['character'] + "!";
            cardOutput = this.attributes["speechOutput"] + "\n" + this.attributes['repromptSpeech'];
            imageObject = dndLib.getClassImages(this.attributes['character']);
        }
        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },
    'NewSession': function () {
        this.emit('LaunchRequest');
    },
    'NewGameIntent': function () {
        this.emit('AMAZON.NoIntent');
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    // 'AMAZON.YesIntent': function () {
    //     this.emit('ContinueGameIntent');
    // },
    // 'AMAZON.NoIntent': function () {
    //     this.handler.state = states.START_MODE;
    //     this.attributes['speechOutput'] = "Okay, I\'ve reset your progress. Let\'s start again.";
    // },
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

const continueHandlers = Alexa.CreateStateHandler(states.CONTINUE_GAME, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    'ContinueGameIntent': function () {
        this.handler.state = this.attributes['priorState'];
        this.emitWithState('EntryPoint');
    },
    'AMAZON.YesIntent': function () {
        this.emit('ContinueGameIntent');
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.START_MODE;
        this.attributes['speechOutput'] = "Okay, I\'ve reset your progress. Let\'s start again.";
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// Character selection logic
const charSelectHandlers = Alexa.CreateStateHandler(states.CHAR_SELECT, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    
    // Handles class selection
    'UserClassIntent' : function () {
        this.attributes['character'] = dndLib.validateAndSetSlot(this.event.request.intent.slots.Class); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        this.attributes['speechOutput'] = dndLib.getClassDescription(this.attributes['character']) + ' Say yes to confirm, or say warrior, wizard, or rogue to hear about each class. Say more info for detailed stats.';

        var cardTitle = this.attributes['character'];
        var cardOutput = dndLib.getClassDescription(this.attributes['character']);
        var imageObject = dndLib.getClassImages(this.attributes['character']);

        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    // user wants more information about a character
    'MoreInfoIntent' : function () {
        var cardTitle = "Info: " + this.attributes['character'];
        var imageObject = dndLib.getClassImages(this.attributes['character']);

        var cardOutput = "The " + this.attributes['character'] + " has the following attributes: " +"\n\n"
            + "Health:       " + dndLib.getStat(this.attributes['character'], 'health') + "\n"
            + "Attack bonus: " + dndLib.getStat(this.attributes['character'], 'attack') + "\n"
            + "Damage:       " + dndLib.getStat(this.attributes['character'], 'damageDieSides') + "\n"
            + "Perception:   " + dndLib.getStat(this.attributes['character'], 'perception') + "\n"
            + "Stealth:      " + dndLib.getStat(this.attributes['character'], 'stealth') + "\n"
            + "Diplomacy:    " + dndLib.getStat(this.attributes['character'], 'diplomacy');

        var spokenInfo = "The " + this.attributes['character'] + " has the following attributes: "
            + dndLib.getStat(this.attributes['character'], 'health') + " health, "
            + dndLib.getStat(this.attributes['character'], 'attack') + " attack bonus, "
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
        this.handler.state = states.FOREST_SCENE; // we can introduce an intent that asks the user where they want to begin later
        this.attributes['userHealth'] = dndLib.getStat(this.attributes['character'], 'health'); // sets the health of the user
        this.attributes['gameInProgress'] = true;

        this.attributes['speechOutput'] = "You chose the " + this.attributes['character'] + ". Your adventure begins! ";

        this.emitWithState('EntryPoint');
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// User enters combat. These functions should know if the user or the enemy is attacking first. Handles actions that can be taken there, context-sensitive help messaging and reprompts
const combatBeginHandlers = Alexa.CreateStateHandler(states.COMBAT, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    'CombatEntryPoint': function () { //FIXME: implement combat routine
      this.attributes['speechOutput'] += " The combat scene would be here. Say yes to win or no to lose.";
      this.emit(':ask', this.attributes['speechOutput']);
    },

    // Handles user actions
    'UserActionIntent' : function () {
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var action;

        this.attributes["speechOutput"] = action;
        this.emit(this.attributes["speechOutput"]); //FIXME: implement correct emit statement

    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.ENDGAME;
        // this.attributes['sceneState'] = "win";
        this.attributes['userDidDefeatEnemy'] = true;

        this.emitWithState('EndGameIntent');
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.ENDGAME;
        // this.attributes['sceneState'] = "lose";
        this.attributes['userDidDefeatEnemy'] = false; // this is false by default, I reset it here just to be cautious
        this.emitWithState('EndGameIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// User defeats enemy. This may be handled in the COMBAT state
const combatEndHandlers = Alexa.CreateStateHandler(states.COMBAT_END, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.ENDGAME;
        this.attributes['speechOutput'] = "YES: " + this.handler.state + ". Okay let me get a new game started for you..."; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.ENDGAME;
        this.attributes["gameInProgress"] = false;
        this.attributes['speechOutput'] = "NO: " + this.handler.state + ". Okay, thanks for playing!"; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },

    // After combat, user opts to skip searching the area and continues on, or user finishes searching the area
    'ContinueJourney': function () {
        this.handler.state = states.ENDGAME;
        this.emitWithState('EndGameIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// User exits combat either by winning, losing, or runs away
const endGameHandlers = Alexa.CreateStateHandler(states.ENDGAME, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    'EndGameIntent' : function () {
        this.attributes["gameInProgress"] = false;
        if (this.attributes['userDidDefeatEnemy']){
            this.attributes['speechOutput'] = ' You won. Thanks for playing!';
        } else {
            this.attributes['speechOutput'] = ' You lost. Thanks for playing!';
        }

        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// Description of the forest, handles actions that can be taken there, context-sensitive help messaging and reprompts
const forestSceneHandlers = Alexa.CreateStateHandler(states.FOREST_SCENE, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },

    // start here, prompt user for next action
    'EntryPoint': function () {
        var cardTitle = "You find yourself in a forest";
        var cardOutput = scenes.scenes.forest.description;
        var imageObject = { //FIXME: image not displaying
            "imageSmall": "https://s3.amazonaws.com/oneshotimages/forest.jpg",
            "imageLarge": "https://s3.amazonaws.com/oneshotimages/forest.jpg"
        };
        this.attributes['speechOutput'] += scenes.scenes.forest.description + " " + scenes.scenes.forest.prompt;
        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    // Handles all user actions
    // get the action from scenes conditionally based on user request
    'UserActionIntent': function () {
        this.attributes['repromptSpeech'] = langEN.REPROMPT_GLOBAL;
        var character = this.attributes["character"];
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var skillCheckObject = dndLib.skillCheck(scenes.scenes.forest.difficulty_classes[actionRequestedByUser],dndLib.getStat(character,actionRequestedByUser)); // returns object
        // var response = dndLib.responseBuilder("forest",this.attributes["sceneState"],actionRequestedByUser,skillCheckObject.roll,skillCheckObject.pass);
        var response = dndLib.responseBuilder("forest",this.attributes["sceneState"],actionRequestedByUser,skillCheckObject.roll,skillCheckObject.pass);

        this.attributes["speechOutput"] = response.description;

        // check if the game state needs to change
        if(response.state_change){
            // if combat TODO: set up combat
            if(response.state_change == "combat"){
                this.attributes["speechOutput"] = response.description;
                this.handler.state =states.COMBAT;
                this.emitWithState('CombatEntryPoint');
            }
            // if end_game, transition to endgame
            if(response.state_change == "end_game"){
                this.handler.state = states.ENDGAME;
                this.emitWithState('EndGameIntent');
            }
        } else {
            // update the scene state
            if(response.scene_state_change) {
                this.attributes["sceneState"] = response.scene_state_change;
            }

            // as long as the scene state doesn't change to lose, keep prompting
            if(response.scene_state_change != "lose") {
                this.attributes["speechOutput"] +=  scenes.scenes.forest.prompt;
            }
            this.emit(':ask',this.attributes["speechOutput"], this.attributes['repromptSpeech']);
        }
    },
    'AMAZON.YesIntent': function () {
        this.attributes['speechOutput'] = "YES: " + this.handler.state;
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "NO: " + this.handler.state;
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT_GLOBAL: " + this.handler.state; //FIXME: replace with correct messaging
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// New game logic
const startGameHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.CHAR_SELECT;

        this.attributes['speechOutput'] = 'Great! First, you\'ll need to choose the character you wish to play as. '
            + 'You can be a wizard, a rogue, or a warrior. What do you choose?';
        this.attributes['repromptSpeech'] = 'Say wizard, rogue, or warrior to choose a class, or say exit to quit';

        var cardTitle = "Character Select";
        var imageObject = { //FIXME: image not displaying
            smallImageUrl : "https://s3.amazonaws.com/oneshotimages/char_select.jpg",
            largeImageUrl : "https://s3.amazonaws.com/oneshotimages/char_select.jpg"
        };

        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'],cardTitle,"",imageObject);
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});
