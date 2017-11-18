var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var enemies = require('./enemies');

var combatInstance = {
	"enemy_list": [],
	"player_character": {},
	"combat_ended": false
};

//var combatOrder = []; // ignore combat order for now and have player always go first.

// Sets up combat instance
exports.initializeCombat = function(scene, playerCharacter) {
	combatInstance.enemy_list = createEnemyList(scene);
	combatInstance.player_character = playerCharacter;
};

exports.combatRound = function(speechInput) {
	var output = speechInput;

	output += exports.enemyTurn(combatInstance.enemy_list);

	if (enemy_list.length == 0 || player.health <= 0) {
		combatInstance.combat_ended = true;
		output += " You have taken lethal damage from the enemies' attacks.";
	}

	return output;
}

exports.createEnemyList = function(scene) {
    var enemyList = [];
    var sceneEnemies = scenes.scenes[scene].enemies;
    for (var enemyGroup in sceneEnemies) {
    	var groupSize = sceneEnemies[enemyGroup];
    	for (var i = 0; i < groupSize; i++) {
    		var enemy = {};
			Object.assign(enemy, enemies.monsters[enemyGroup]);
			enemy.name = (enemy.name + " " + (i + 1));
			enemyList.push(enemy);
    	}
    }

    return enemyList;
};

exports.enemyTurn = function(enemyList) {
	//compile enemy actions.
	var enemyActions = "";

	for (var i = 0; i < enemyList.length; i++) {
		var enemy = enemyList[i];
		var enemyState = enemy.current_state;
		var possibleActions = enemy.state_actions[enemyState];
		var actionsListLength = Object.keys(possibleActions).length;
		var randomPercentileRoll = dndLib.rollDice(1, 100);
		var percentile = 0;

		for (var action in possibleActions) {
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
};

exports.dealDamage = function(attackingCharacter, hitCharacter) {
	dndLib.dealDamage(attackingCharacter, hitCharacter);

	if (hitCharacter.health <= 0) {
		hitCharacterDead = true;
	}

	return hitCharacterDied;
};

exports.killCharacter = function() {

};
