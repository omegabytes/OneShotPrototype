'use strict';

var Alexa = require('alexa-sdk');
var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var dndLib = require('./dndLib.js');
var scenes = require('./scenes');

exports.handler = function(event,context,callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.cc5fc00c-2a42-4e91-afa9-f0a640147e25";
    alexa.dynamoDBTableName = "OneShotPrototypeTable"; // FIXME: add db error handling and encapsulation
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, charSelectHandlers, combatBeginHandlers, combatEndHandlers, endGameHandlers, forestSceneHandlers, startGameHandlers, userSeesEnemyHandlers);
    alexa.execute();
};

//FIXME: not all of these states will be used. Any state listed here must have a matching handler and include all the required Amazon intents (causes compile-time errors)
const states = {
    CHAR_SELECT:        '_CHARSELECT',         // Prompts user to select a character, and gives info on character
    COMBAT:             '_COMBAT',             // User enters combat
    COMBAT_END:         '_COMBATEND',          // User exits combat with either a success or failure attribute
    ENDGAME:            '_ENDGAME',            // Resolution message, resets game state to new game
    ENEMY_SEES_USER:    '_ENEMYSEESUSER',      // Messaging and options if user fails perception/stealth checks, user attacks second
    FOREST_SCENE:       '_FORESTSCENE',        // The first encounter, where the user is described a situation and asked what to do
    // NEW_GAME:           '_NEWGAME',            // no current game in progress
    START_MODE:         '_STARTMODE',          // Beginning of game with menu, start, and help prompts
    USER_SEES_ENEMY:    '_USERSEESENEMY'       // User passes perception/stealth checks, attacks first
};

// user opens the skill, either for the first time or is returning
const newSessionHandlers = {
    'LaunchRequest': function () {
        // if the user hasn't opened the application before, or had completed the game
        if(!this.attributes["gameInProgress"]){
            this.handler.state = states.START_MODE;
            // game initialization
            // FIXME: encapsulate into function
            this.attributes['userDidSeeEnemy'] = false;
            this.attributes['userDidPassPerceptionCheck'] = false;
            this.attributes['userDidPassPerceptionCheck'] = false;

            this.attributes['speechOutput'] =  langEN.WELCOME_MESSAGE;
            this.attributes['repromptSpeech'] = langEN.WELCOME_REPROMPT;
        } else {
            // if the user is returning to an in-progress game
            // ask if they want to continue where they left off or start a new game
            this.attributes["speechOutput"] = "Welcome back! Would you like to continue from where you left off, or start a new game?";
            this.attributes['repromptSpeech'] = "Say continue to pick up where you left off, or say new to start over. Say exit to quit.";
        }
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'NewSession': function () {
        this.emit('LaunchRequest');
    },
    'NewGameIntent': function () {
        this.emit('AMAZON.NoIntent');
    },
    'ContinueGameIntent': function () {
        this.handler.state = this.attributes['gameState'];
        this.emit();
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.YesIntent': function () {
        this.emit('ContinueGameIntent');
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.START_MODE;
        this.attributes['speechOutput'] = "Okay, I\'ve reset your progress. Let\'s start again.";
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

// Character selection logic
const charSelectHandlers = Alexa.CreateStateHandler(states.CHAR_SELECT, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
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
        this.handler.state = states.FOREST_SCENE;
        this.attributes['userHealth'] = dndLib.getStat(this.attributes['character'], 'health'); // sets the health of the user

        this.attributes['speechOutput'] = "You chose the " + this.attributes['character'] + ". Your adventure begins!";

        this.attributes['speechOutput'] += scenes.scenes.forest.description;//FIXME: add description for the next scene
        this.emit(':ask', this.attributes['speechOutput']);
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

    // Combat entry point
    // 'CombatEntry' : function () {
    //
    // },

    // User says attack
    'AttackIntent': function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('attack', 'forest', 'combat');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says investigate
    'InvestigateIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('investigate', 'forest', 'combat');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says flee
    'FleeIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('flee', 'forest', 'combat');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says diplomacy
    'DiplomacyIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('diplomacy', 'forest', 'combat');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says hide
    'HideIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('hide', 'forest', 'combat');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User defeats enemy
    'PassIntent': function () { //FIXME: remove temporary state-linking intents
        this.attributes['didUserDefeatEnemy'] = true;
        this.handler.state = states.COMBAT_END;
        this.attributes['speechOutput'] = "Transitioning to COMBAT END. You can search the area, or continue your journey. What would you like to do?"; // add intents in combatEndHandlers to handle investigation. Transition back to forestscene, add 'enemyDefeated' session attrib?
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User hp hits 0
    'FailIntent': function () {//FIXME: remove temporary state-linking intents
        this.attributes['didUserDefeatEnemy'] = false;
        this.handler.state = states.COMBAT_END;
        this.attributes['speechOutput'] = "Transitioning to COMBAT END. Would you like to play again?";
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // Handles user actions
    'UserActionIntent' : function () {
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var action;
        var roll_success = true; //FIXME: temporary variable to represent roll of dice

        if (roll_success) {
            action = langEN.USER_ACTIONS[this.attributes["scene"]]["combat"]["action_success"][actionRequestedByUser]; // check the requested action against the actions in scene
        } else {
            action = langEN.USER_ACTIONS[this.attributes["scene"]]["combat"]["action_failure"][actionRequestedByUser];
        }

        this.attributes["speechOutput"] = action;
        this.emit(this.attributes["speechOutput"]); //FIXME: implement correct emit statement

    },

    'AMAZON.YesIntent': function () {
        this.attributes['speechOutput'] = "YES: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "NO: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
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
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.ENDGAME;
        this.attributes["gameInProgress"] = false;
        this.attributes['speechOutput'] = "NO: " + this.handler.state + ". Okay, thanks for playing!"; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },

    // After combat, user opts to skip searching the area and continues on, or user finishes searching the area
    'ContinueJourney': function () {
        this.handler.state = states.ENDGAME;
        this.emitWithState('EndGameIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
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
        // this.handler.state = states.START_MODE; //FIXME: what state should this be? Users opening the skill for the first time won't have any state stored. Can it be null?
        this.handler.state = '';

        if (this.attributes['didUserDefeatEnemy']){
            this.attributes['speechOutput'] = 'You won. Goodbye';
        } else {
            this.attributes['speechOutput'] = 'You lost. Goodbye.';
        }

        this.emit('NewSession');
    },
    'AMAZON.YesIntent': function () {
        this.attributes['speechOutput'] = "YES: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "NO: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
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

    // Handles all user actions
    // get the action from scenes conditionally based on user request
    'UserActionIntent': function () {
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var action;
        var roll_success = true; //FIXME: temporary variable to represent roll of dice

        if (this.attributes["userDidSeeEnemy"]) {
            if (roll_success) {
                action = langEN.USER_ACTIONS[this.attributes["scene"]]["enemy_seen"]["action_success"][actionRequestedByUser]; // check the requested action against the actions in scen
            } else {
                action = langEN.USER_ACTIONS[this.attributes["scene"]]["enemy_seen"]["action_failure"][actionRequestedByUser];
            }
        } else {
            if (roll_success) {
                action = langEN.USER_ACTIONS[this.attributes["scene"]]["enemy_not_seen"]["action_success"][actionRequestedByUser];
            } else {
                action = langEN.USER_ACTIONS[this.attributes["scene"]]["enemy_not_seen"]["action_failure"][actionRequestedByUser];
            }
        }

        this.attributes["speechOutput"] = action;
        this.emit(this.attributes["speechOutput"]); //FIXME: implement correct emit statement
    },

    // User says attack
    'AttackIntent': function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('attack', 'forest', 'enemy_not_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says investigate
    'InvestigateIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('investigate', 'forest', 'enemy_not_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says flee
    'FleeIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('flee', 'forest', 'enemy_not_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says diplomacy
    'DiplomacyIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('diplomacy', 'forest', 'enemy_not_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says hide
    'HideIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('hide', 'forest', 'enemy_not_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    'PassIntent': function () { //FIXME: remove temporary state linking intents
        this.handler.state = states.USER_SEES_ENEMY;
        this.attributes['speechOutput'] = "Transition to USER SEES ENEMY has not been implemented";
        this.emit(':tell', this.attributes['speechOutput']);
    },

    // User fails perception check
    'FailIntent': function () { //FIXME: remove temporary state linking intents
        this.handler.state = states.COMBAT;
        this.attributes['speechOutput'] = "Transitioning to COMBAT. Say pass to defeat the enemy or fail to lose.";
        this.emit(':ask', this.attributes['speechOutput']);
    },

    'AMAZON.YesIntent': function () {
        this.attributes['speechOutput'] = "YES: " + this.handler.state + ". Say pass to transition to USER SEES ENEMY or fail to transition to COMBAT"; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "NO: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
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

    // User says attack
    'AttackIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('attack', 'forest', 'enemy_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says investigate
    'InvestigateIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('investigate', 'forest', 'enemy_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    // User says flee
    'FleeIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('flee', 'forest', 'enemy_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says diplomacy
    'DiplomacyIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('diplomacy', 'forest', 'enemy_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },
    // User says hide
    'HideIntent' : function () {
        this.attributes['speechOutput'] = dndLib.skillCheck('hide', 'forest', 'enemy_seen');
        this.emit(':ask', this.attributes['speechOutput']);
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.CHAR_SELECT;
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
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// The user passes the perception check and (conditionally) stealth checks prior to combat
const userSeesEnemyHandlers = Alexa.CreateStateHandler(states.USER_SEES_ENEMY, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },

    'AMAZON.YesIntent': function () {
        this.attributes['speechOutput'] = "YES: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "NO: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
        this.emit(':tell', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "HELP: " + this.handler.state; //FIXME: replace with correct messaging
        this.attributes['repromptSpeech'] = "REPROMPT: " + this.handler.state; //FIXME: replace with correct messaging
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
