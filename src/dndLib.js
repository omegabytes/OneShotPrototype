var languageStrings = require('./languageStrings');
var langEN = languageStrings.en.translation;
var characterClasses = require('./classes');

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

// Skill check function
// exports.skillCheck = function(check, bonus, DC) {
// 	check += bonus;
// 	let result = false;
//
//     if (check >= DC) {
//         result = true;
//     }
//
//     return result;
// };

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

exports.skillCheck = function(DC, bonus){
    var result = {
        "roll": 0,
        "pass": false
    };
    var dieRoll = dndLib.rollDice(1, 20);
    var total = dieRoll + bonus;
    if (total <= 0) {
        total = 1;
    }

    result.roll = total;

    if (total >= DC) {
        result.pass = true;
    }

    return result;
};

/**
* Constructs a response object based on scene, state, skill, and skill check result.
* @param scene current scene.
* @param state custom state within a scene such as enemy_seen.
* @param skill the skill that was checked.
* @param roll skill check roll.
* @param pass boolean, result of skill check.
* @return an object containing the die roll + bonus and pass or fail boolean.
*/
exports.responseBuilder = function (scene, state, skill, roll, pass) {
    var output = {
        "description": "",
        "state_change": ""
    };

    var successFail = pass ? "pass" : "fail";
    resultObject = scenes[scene][state][successFail][skill];

    if (resultObject.description != "") {
        output.description = "You " + successFail "ed your " + skill + " check, you rolled a " + roll + ". " + resultObject.description;
    } else {
        // If no description, action is useless
        output.description = "You try to use the " + skill + " action, but it doesn't seem very effective at this moment.";
    }

    return output
};
