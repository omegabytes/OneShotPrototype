var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var characterClasses = require('./classes');
var scenes = require('./scenes');

// const states = {
//     CHAR_SELECT:        '_CHARSELECT',         // Prompts user to select a character, and gives info on character
//     COMBAT:             '_COMBAT',             // User enters combat
//     COMBAT_END:         '_COMBATEND',          // User exits combat with either a success or failure attribute
//     ENDGAME:            '_ENDGAME',            // Resolution message, resets game state to new game
//     FOREST_SCENE:       '_FORESTSCENE',        // The first encounter, where the user is described a situation and asked what to do
//     START_MODE:         '_STARTMODE',          // Beginning of game with menu, start, and help prompts
// };

// not found message handler
exports.notFoundMessage = function(slotName, userInput) {
	var speechOutput = langEN.NOT_FOUND_MESSAGE;
    
    if(userInput) {
    	speechOutput += "the " + slotName + " info for " + userInput + ".";
    }else {
    	speechOutput += langEN.NOT_FOUND_WITHOUT_OBJECT_NAME;
    }
    return speechOutput;
};

// roll dice function
exports.rollDice = function(quantity,sides) {
    var facevalue;
    var output = 0;

    for (var i=0;i<quantity;i++) {
        facevalue = Math.floor(Math.random()*sides) + 1;
        output += facevalue;
    }
    return output;
};

// validates the slot, matches the value, and sets it
exports.validateAndSetSlot = function(slot) {
	if (slot && slot.value) {
		return slot.value.toLowerCase();
	}else {
		return null;
	}
};

// Character class functions
// Getters
exports.getClassList = function() {
	return characterClasses.classes;
};

exports.getClassStats = function(className) {
	return characterClasses.classes[className];
};

exports.getStat = function(className, stat) {
	return characterClasses.classes[className].stats[stat];
};

exports.getClassAbilities = function(className) {
	return characterClasses.classes[className].abilities;
};

exports.getClassAbility = function(className, ability) {
	return characterClasses.classes[className].abilities[ability];
};

exports.getClassDescription = function (className) {
	return characterClasses.classes[className].description;
};

exports.getClassImages = function (className) {
    return {
        smallImageUrl : characterClasses.classes[className].imageSmall,
        largeImageUrl : characterClasses.classes[className].imageLarge
    }
};

/**
* Checks d20 roll with bonus vs. DC.
* @param DC difficulty class of the check.
* @param bonus bonus to be added to die roll.
* @return an object containing the die roll + bonus and pass or fail boolean.
*/

exports.skillCheck = function(DC, bonus) {
    DC = DC || 0;
    bonus = bonus || 0;
    var resultObject = {
        "roll": 0,
        "pass": false
    };
    var dieRoll = exports.rollDice(1, 20);
    var total = dieRoll + bonus;
    if (total <= 0) {
        total = 1;
    }

    resultObject.roll = total;
    // result["roll"] = total;

    if (total >= DC) {
        resultObject.pass = true;
        // result["pass"] = true;
    }

    return resultObject;
};

// deals damage to character, and returns the damage dealt if needed for output purposes
exports.dealDamage = function(attackingCharacter, hitCharacter) {
    var damage = exports.rollDice(1, attackingCharacter.stats.damageDieSides);

    hitCharacter.stats.health -= damage;

    return damage;
};

/**
* Constructs a response object based on scene, state, skill, and skill check result.
* @param scene current scene.
* @param sceneState custom state within a scene such as enemy_seen.
* @param skill the skill that was checked.
* @param roll skill check roll.
* @param pass boolean, result of skill check.
* @return object containing response description and state change
*/

exports.responseBuilder = function (scene, sceneState, skill, roll, pass) {
    var successFail = pass ? "pass" : "fail";
    var outputObject = Object.assign({}, scenes.scenes[scene][sceneState][successFail][skill]);

    if (outputObject.description) {
        outputObject.description = "You rolled a " + roll + ". " + outputObject.description;
    } else {
        // If no description, action is useless
        outputObject.description = "You try to use the " + skill + " action, but it doesn't seem very effective at this moment.";
    }

    return outputObject;
};

// exports.stateChangeHandler = function (nextState) {
//     var game_state = this.handler.state; //store the existing state in case the argument is a scene state
//
//     switch(nextState){
//         case "combat":
//             game_state = states.COMBAT;
//             break;
//         case "combat_end":
//             game_state = states.COMBAT_END;
//             break;
//         case "end_game":
//             game_state = states.ENDGAME;
//             break;
//         case "forest_scene":
//             game_state = states.FOREST_SCENE;
//             break;
//         case "start_mode":
//             game_state = state.START_MODE;
//             break;
//         default:
//             break;
//
//     }
// };
