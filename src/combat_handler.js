var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var enemies = require('./enemies');

var combatOrder = [];

exports.startCombat = function(enemies, player, scene) {
	// determine combat order.
	// return combatOrder array
}

exports.runCombat = function() {
	// Player action?
	// Check if enemies dead.
	// Enemy actions?
	// Check if player dead.
}

exports.runEnemies = function(enemyGroup) {
	//compile enemy actions.
	var enemyActions = "";

	for(var i = 0; i < enemyGroup.length; i++) {
		var enemy = enemyGroup[i];
		var enemyState = enemy.current_state;
		var possibleActions = enemy.state_actions[enemyState];
		var actionsListLength = Object.keys(possibleActions).length;
		var randomPercentileRoll = dndLib.rollDice(1, 100);
		var percentile = 0;

		for(var action in possibleActions) {
			percentile += possibleActions[action];
			if (randomPercentileRoll <= percentile) {
				var randomAction = dndLib.rollDice(1, enemy.action_descriptions[action].length - 1);
				var enemyAction = enemy.action_descriptions[action][randomAction];

				// generate a generic action description if there is no description.
				if (!enemyAction) {
					var randomAction = dndLib.rollDice(1, enemies.generic_action_descriptions[action].length);
					var enemyAction = enemies.generic_action_descriptions[action][randomAction];
				}

				enemyActions += (enemy.name + ' ' + enemyAction + ' ');
				break;
			}
		}
	}

	return enemyActions;
}

exports.dealDamage = function(attackingCharacter, hitCharacter) {
	dndLib.dealDamage(attackingCharacter, hitCharacter);

	if (hitCharacter.health <= 0) {
		hitCharacterDead = true;
	}

	return hitCharacterDied;
}

exports.killCharacter = function() {

}
