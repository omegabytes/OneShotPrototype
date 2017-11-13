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
exports.skillCheck = function(check, bonus, DC) {
	check += bonus;
	let result = false;

    if (check >= DC) {
        result = true;
    }

    return result;
}

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
