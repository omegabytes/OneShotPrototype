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

exports.skillCheck = function(skill, scene, state){
    var DC = scenes[scene].difficulty_classes[skill];
    var check = dndLib.rolldice(1, 20);
    var bonus = dndLib.getStat(this.attributes['character'], skill);
    var total = check + bonus;
    var result = dndLib.skillCheck(check, bonus, DC);
    var description = "";
    var output = "";

    if (result) {
        description = scenes[scene][state].action_success.invesitgate;
    } else {
        description = scenes[scene][state].action_failure.invesitgate;
    }

    if (description != "") {
       if (result) {
            var outcome = 'passed';
        } else {
            var outcome = 'failed';
        }

        output = "You " + outcome + " your " + skill + " check with a" + total + description;
    } else {
        // If no description, action is useless
        output = "You try to use the " + skill + " action, but it doesn't seem very effective at this moment.";
    }

    return output;
};
