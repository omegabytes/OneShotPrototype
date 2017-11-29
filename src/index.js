'use strict';

var Alexa = require('alexa-sdk');
var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var classes = require('./classes');
var combatHandler = require('./combat_handler');
var enemies = require('./enemies');
const APPID = require('./appID');

exports.handler = function(event,context,callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APPID;
    alexa.dynamoDBTableName = "OneShotPrototypeTable"; // FIXME: add db error handling and encapsulation (CRUD)
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, charSelectHandlers, continueHandlers, combatBeginHandlers, endGameHandlers, forestSceneHandlers, startGameHandlers);
    alexa.execute();
};

//FIXME: not all of these states will be used. Any state listed here must have a matching handler and include all the required Amazon intents (causes compile-time errors)
const states = {
    CHAR_SELECT:        '_CHARSELECT',         // Prompts user to select a character, and gives info on character
    COMBAT:             '_COMBAT',             // User enters combat
    CONTINUE_GAME:      '_CONTINUE',           // asks user if they want to continue on ongoing game, or start a new one
    ENDGAME:            '_ENDGAME',            // Resolution message, resets game state to new game
    FOREST_SCENE:       '_FORESTSCENE',        // The first encounter, where the user is described a situation and asked what to do
    START_MODE:         '_STARTMODE'           // Beginning of game with menu, start, and help prompts
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

            this.attributes['speechOutput'] =  langEN.WELCOME_MESSAGE;
            this.attributes['repromptSpeech'] = langEN.WELCOME_REPROMPT;

            if(this.attributes['priorState'] === 'continueGame'){
                this.attributes['speechOutput'] = "Okay, I\'ve reset your progress. Let\'s start again. Are you ready to begin?";
                this.attributes['repromptSpeech'] = langEN.WELCOME_REPROMPT;
            }

            this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
        } else {
            // if the user is returning to an in-progress game
            // ask if they want to continue where they left off or start a new game
            this.attributes['priorState'] = this.attributes['STATE']; // store the prior state so we can jump to continue game handlers
            this.handler.state = states.CONTINUE_GAME;
            this.emitWithState('EntryPoint');
        }

    },
    'NewSession': function () {
        this.emit('LaunchRequest');
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = langEN.UNHANDLED;
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
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

const continueHandlers = Alexa.CreateStateHandler(states.CONTINUE_GAME, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    'ContinueGameIntent': function () {
        this.handler.state = this.attributes['priorState'];
        this.emitWithState('EntryPoint');
    },
    'EntryPoint': function () {
        this.attributes["speechOutput"] = "Welcome back! Would you like to continue from where you left off, or start a new game?";
        this.attributes['repromptSpeech'] = "Say continue to pick up where you left off, or say new to start over. Say exit to quit.";

        var cardTitle = "Welcome back, " + this.attributes['character'] + "!";
        var cardOutput = this.attributes["speechOutput"] + "\n" + this.attributes['repromptSpeech'];
        var imageObject = dndLib.getClassImages(this.attributes['character']);

        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },
    'AMAZON.YesIntent': function () {
        this.emit('ContinueGameIntent');
    },
    'AMAZON.NoIntent': function () {
        this.handler.state = states.START_MODE;
        this.emitWithState('EntryPoint');
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
    // 'UserClassIntent' : function () {
    //     var requestedCharacter = dndLib.validateAndSetSlot(this.event.request.intent.slots.Class); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
    //     var characterList = Object.keys(classes.classes); // array of class names: ['wizard','warrior',...]
    //     var character;
    //     var cardTitle;
    //     var cardOutput;
    //     var imageObject;
    //
    //     if (characterList.indexOf(requestedCharacter) === -1) { // if the requested character doesn't exist in the array, it will return -1
    //         this.attributes['speechOutput'] = "I'm sorry, you can't play as a " + requestedCharacter + " at this time. Please say wizard, warrior, or rogue.";
    //         cardTitle = "Character Select";
    //         cardOutput = "You can select:\nwizard \nwarrior \nrogue";
    //         imageObject = {
    //             smallImageUrl: "https://s3.amazonaws.com/oneshotimages/char_select_sheet.jpg",
    //             largeImageUrl: "https://s3.amazonaws.com/oneshotimages/char_select_sheet.jpg"
    //         };
    //     } else {
    //         character = classes.classes[requestedCharacter];
    //         this.attributes['character'] = character;
    //         this.attributes['speechOutput'] = dndLib.getClassDescription(requestedCharacter) + ' Say yes to confirm, or say warrior, wizard, or rogue to hear about each class. Say more info for detailed stats.';
    //
    //         cardTitle = this.attributes['character'];
    //         cardOutput = dndLib.getClassDescription(this.attributes['character']);
    //         imageObject = dndLib.getClassImages(this.attributes['character']);
    //     }
    //
    //     this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    //
    //     // this.emit(':tell', character);
    // },

    'UserClassIntent' : function () {
        this.attributes['character'] = dndLib.validateAndSetSlot(this.event.request.intent.slots.Class); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null

        if(!this.attributes['character']) {
            this.attributes['speechOutput'] = "That's not something you can play as right now. Please say wizard, warrior, or rogue.";
            this.emit(':elicitSlot','UserClassIntent',this.attributes['speechOutput']);
        }

        this.attributes['speechOutput'] = dndLib.getClassDescription(this.attributes['character']) + ' Say yes to confirm, or say warrior, wizard, or rogue to hear about each class. Say more info for detailed stats.';
        var cardTitle = this.attributes['character'];
        var cardOutput = dndLib.getClassDescription(this.attributes['character']);
        var imageObject = dndLib.getClassImages(this.attributes['character']);
        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    // user wants more information about a character
    'MoreInfoIntent' : function () {

        if(!this.attributes['character']) { //FIXME: this is causing incorrect character requests to drop into here
            this.attributes['speechOutput'] = "Sorry, I don't know that one, please say wizard, warrior, or rogue";
            this.emit(':elicitSlot','UserClassIntent');
        }

        var cardTitle = "Info: " + this.attributes['character'];
        var imageObject = dndLib.getClassImages(this.attributes['character']);

        var cardOutput = "The " + this.attributes['character'] + " has the following attributes: " +"\n\n"
            + "Health:       " + dndLib.getStat(this.attributes['character'], 'health') + "\n"
            + "Attack bonus: " + dndLib.getStat(this.attributes['character'], 'attack') + "\n"
            + "Damage:       " + dndLib.getStat(this.attributes['character'], 'damageDieSides') + "\n"
            + "Investigate:  " + dndLib.getStat(this.attributes['character'], 'investigate') + "\n"
            + "Hide:         " + dndLib.getStat(this.attributes['character'], 'hide') + "\n"
            + "Diplomacy:    " + dndLib.getStat(this.attributes['character'], 'diplomacy');

        var spokenInfo = "The " + this.attributes['character'] + " has the following attributes: "
            + dndLib.getStat(this.attributes['character'], 'health') + " health, "
            + dndLib.getStat(this.attributes['character'], 'attack') + " attack bonus, "
            + dndLib.getStat(this.attributes['character'], 'damageDieSides') + " damage, "
            + dndLib.getStat(this.attributes['character'], 'investigate') + " investigate, "
            + dndLib.getStat(this.attributes['character'], 'hide') + " hide, "
            + dndLib.getStat(this.attributes['character'], 'diplomacy') + " diplomacy.";

        spokenInfo += " Would you like to play as the " + this.attributes['character'] + "?";

        this.attributes['speechOutput'] = spokenInfo;
        this.attributes['repromptSpeech'] = "Say yes to select this character, or say another character to hear more about it. Say exit to quit.";
        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.FOREST_SCENE; // we can introduce an intent that asks the user where they want to begin later
        this.attributes['userHealth'] = dndLib.getStat(this.attributes['character'], 'health'); // sets the health of the user
        this.attributes['priorState'] = 'charSelect';
        this.attributes['gameInProgress'] = true;

        this.emitWithState('EntryPoint');
    },
    'AMAZON.NoIntent': function () {
        this.attributes['speechOutput'] = "Okay, which character would you like to play as?";
        this.emit(':ask', this.attributes['speechOutput']);
    },
    'AMAZON.HelpIntent': function () {
        // use char select specific help messages here
        this.attributes['speechOutput'] = "Say the name of the class, or say more info.";
        this.attributes['repromptSpeech'] = "See the card in the Alexa skill for what you can say.";

        var cardTitle = "Character Select: Help";
        var cardOutput = "Say:\nwizard\nwarrior\nrogue\nmore info";

        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'],cardTitle,cardOutput);
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
    'CombatEntryPoint': function () {
        this.attributes['sceneState'] = 'combat';
        var playerCharacter = {};
        Object.assign(playerCharacter, classes.classes[this.attributes['character']]);
        combatHandler.initializeCombat(this.attributes['scene'], playerCharacter);
        this.attributes['speechOutput'] += ' You have entered combat. What would you like to do?';
        this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },

    // Handles user actions
    'UserActionIntent' : function () {
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var cardTitle = 'Combat'
        var cardOutput = actionRequestedByUser;
        var imageObject = dndLib.getClassImages(this.attributes['character']);
        var currentScene = this.attributes['scene'];
        var output = {};

        if (actionRequestedByUser === 'attack') {
            var DC = enemies.monsters[combatHandler.getCombatInstance().enemy_list[0].type].stats.defense;
        } else {
            var DC = scenes.scenes[currentScene].difficulty_classes[actionRequestedByUser];
        }
        var skillCheckObject = dndLib.skillCheck(DC, dndLib.getStat(this.attributes['character'], actionRequestedByUser)); // returns object
        output = dndLib.responseBuilder(currentScene, this.attributes["sceneState"], actionRequestedByUser, skillCheckObject.roll, skillCheckObject.pass);

        this.attributes["speechOutput"] = combatHandler.combatRound('attack', skillCheckObject, output.description);

        // check for end game conditions
        var endGame = false;
        var combatInstance = combatHandler.getCombatInstance();
        if (combatInstance.enemy_defeated) {
            this.attributes['userDidDefeatEnemy'] = true;
            endGame = true;
        } else if (combatInstance.player_defeated) {
            this.attributes['userDidDefeatEnemy'] = false;
            endGame = true;
        }

        if (endGame) {
            this.handler.state = states.ENDGAME;
            this.emitWithState('EndGameIntent');
        } else {
            this.attributes["speechOutput"] += " What do you do?";
            this.attributes['repromptSpeech']  = langEN.HELP_REPROMPT;
            this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'], cardTitle, cardOutput, imageObject);
        }
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

// User exits combat either by winning, losing, or runs away
const endGameHandlers = Alexa.CreateStateHandler(states.ENDGAME, {
    'NewSession': function () {
        this.emit('LaunchRequest'); // uses the handler in newSessionHandlers
    },
    'EndGameIntent' : function () { //FIXME: ask the user if they want to play again
        this.attributes["gameInProgress"] = false;
        if (this.attributes['userDidDefeatEnemy']){
            this.attributes['speechOutput'] += ' You won. Thanks for playing!';
        } else {
            this.attributes['speechOutput'] += ' You lost. Thanks for playing!';
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
        this.attributes['scene'] = 'forest';
        var cardTitle = "You find yourself in a forest";
        var cardOutput = langEN.LIST_OF_ACTIONS;
        var imageObject = { //FIXME: image not displaying
            "imageSmall": "https://s3.amazonaws.com/oneshotimages/forest3.jpg",
            "imageLarge": "https://s3.amazonaws.com/oneshotimages/forest3.jpg"
        };

        this.attributes['speechOutput'] = scenes.scenes.forest.description + " " + scenes.scenes.forest.prompt;

        if (this.attributes['priorState'] === "charSelect"){
            this.attributes['speechOutput'] = "You chose the " + this.attributes['character'] + ". Your adventure begins! " + scenes.scenes.forest.description + " " + scenes.scenes.forest.prompt;
        }

        this.emit(':askWithCard', this.attributes['speechOutput'],this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },

    // Handles all user actions
    // get the action from scenes conditionally based on user request
    'UserActionIntent': function () {
        this.attributes['repromptSpeech'] = langEN.REPROMPT_GLOBAL;
        var character = this.attributes["character"];
        var actionRequestedByUser = dndLib.validateAndSetSlot(this.event.request.intent.slots.Action); // slots.Action comes from intentSchema.json - check "UserActionIntent". Returns null
        var skillCheckObject = dndLib.skillCheck(scenes.scenes.forest.difficulty_classes[actionRequestedByUser],dndLib.getStat(character,actionRequestedByUser)); // returns object
        var response = dndLib.responseBuilder("forest",this.attributes["sceneState"],actionRequestedByUser,skillCheckObject.roll,skillCheckObject.pass);
        var cardTitle;
        var cardOutput;

        this.attributes["speechOutput"] = response.description;
        console.log(response);

        // check if the game state needs to change
        if(response.state_change){
            if(response.state_change === "combat"){
                this.handler.state = states.COMBAT;
                this.emitWithState('CombatEntryPoint');
            }
            // if end_game, transition to endgame
            if(response.state_change === "end_game"){
                this.handler.state = states.ENDGAME;
                this.emitWithState('EndGameIntent');
            }
        } else {
            // update the scene state
            if(response.scene_state_change) {
                this.attributes["sceneState"] = response.scene_state_change;
            }

            // as long as the scene state doesn't change to lose, keep prompting
            if(response.scene_state_change !== "lose") {
                this.attributes["speechOutput"] = " " + response.description + " " + scenes.scenes.forest.prompt;
            }

            cardTitle = "You used " + actionRequestedByUser;
            cardOutput = this.attributes["speechOutput"];
            this.emit(':askWithCard',this.attributes["speechOutput"], this.attributes['repromptSpeech'],cardTitle,cardOutput);
        }
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = "Say an action to advance the game. See the card in the Alexa app for a list of actions.";
        this.attributes['repromptSpeech'] = "See the card in the Alexa app for a list of actions. Say exit to quit";
        var cardTitle = "Forest: Help";
        var cardOutput = langEN.LIST_OF_ACTIONS;
        this.emit(':askWithcard', this.attributes['speechOutput'], this.attributes['repromptSpeech'],cardTitle,cardOutput);
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
    'EntryPoint': function () { //only entry point for continued games at this time. Needs to be refactored to accept all states.
        this.attributes['gameInProgress'] = false;
        this.attributes['priorState'] = 'continueGame';
        this.emit(':ask', "okay, I've reset the game. Are you ready to begin?");
    },
    'AMAZON.YesIntent': function () {
        this.handler.state = states.CHAR_SELECT;

        // game initialization
        // FIXME: encapsulate into function
        // FIXME: you can't PUT an empty string to Dynamo, so we either need to implement DB handlers or rework the logic to handle non-empty string values
        this.attributes['character'] = undefined; // this used to be '' but I've changed it to "none" to sidestep DB PUT issues
        this.attributes['userDidDefeatEnemy'] = false;
        this.attributes['userHealth'] = undefined;
        this.attributes['sceneState'] = "enemy_not_seen";
        this.attributes['scene'] = "character_select";

        this.attributes['speechOutput'] = 'Great! First, you\'ll need to choose the character you wish to play as. '
            + 'You can be a wizard, a rogue, or a warrior. What do you choose?';
        this.attributes['repromptSpeech'] = 'Say wizard, rogue, or warrior to choose a class, or say exit to quit';

        var cardTitle = "Character Select";
        var cardOutput = this.attributes['repromptSpeech'];
        var imageObject = {
            smallImageUrl : "https://s3.amazonaws.com/oneshotimages/char_select_sheet.jpg",
            largeImageUrl : "https://s3.amazonaws.com/oneshotimages/char_select_sheet.jpg"
        };

        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'],cardTitle,cardOutput,imageObject);
    },
    'AMAZON.NoIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.HelpIntent': function () {
        var cardTitle = "New Game: Help";
        this.attributes['speechOutput'] = "This game is prototype adventure game platform. You will choose a character and then make a series of choices that will advance the game until you win or lose. If you get stuck at any point, ask for help. Check the Alexa app on your phone for a list of actions you can take. Say yes when you are ready to begin";
        var cardOutput = this.attributes['speechOutput'];
        this.attributes['repromptSpeech'] = "Say yes to begin.";
        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'],cardTitle,cardOutput);
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
