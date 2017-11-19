var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var enemies = require('./enemies');

var combatInstance = {
	"enemy_list": [],
	"player_character": {},
	"enemy_defeated": false,
	"player_defeated": false
};

//var combatOrder = []; // ignore combat order for now and have player always go first.

// Sets up combat instance
exports.initializeCombat = function(scene, playerCharacter) {
	combatInstance.enemy_list = createEnemyList(scene);
	combatInstance.player_character = playerCharacter;
};

exports.combatRound = function(speechInput) {
	var output = speechInput;

	output += enemyTurn(combatInstance.enemy_list);

	if (combatInstance.player_character.health <= 0) {
		combatInstance.player_defeated = true;
	} else if (combatInstance.enemy_list.length == 0) {
		combatInstance.enemy_defeated = true;
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

function enemyTurn = function(enemyList) {
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
				enemyActions += enemyActionHandler(action, enemy, combatInstance.player);
				break;
			}
		}
	}

	return enemyActions;
};

function enemyActionHandler(action, enemy, player) {
	var success = false;
	var description = '';
	var damage = 0;

	switch (action) {
		case 'attack':
			success = dndLib.skillCheck(player.skills.defense, enemy.attack).pass;
			if (success) {
				dndLib.dealDamage(enemy, player);
			}
			break;
		case 'flee':
			var fleeDC = dndLib.rollDice(1, 20) + player.skills.investigate;
			success = dndLib.skillCheck(fleeDC, enemy.attack).pass;

			// remove enemy from list if it escaped
			if (success) {
				var indexOfEnemy = combatInstance.enemyList.indexOf(enemy);
				if (indexOfEnemy > -1) {
					combatInstance.enemyList.splice(indexOfEnemy, 1);
				}
			}
		}
	}

	return buildEnemyActionDescription(enemy, action, damage, success);
};

// creates a description of the action, then appends a message such as hit or missed, passed or failed
function buildEnemyActionDescription(enemy, action, damage, success) {
	var description = '';
	var actionResult = '';

	// choose a random description
	var randomActionDescriptionIndex = dndLib.rollDice(1, enemy.action_descriptions[action].length - 1);
	var enemyActionDescription = enemy.action_descriptions[action][randomActionDescriptionIndex];

	// generate a generic action description if there is no description from above
	if (!enemyActionDescription) {
		randomActionDescriptionIndex = dndLib.rollDice(1, enemies.generic_action_descriptions[action].length);
		enemyActionDescription  = enemies.generic_action_descriptions[action][randomAction];
	}

	description = (enemy.name + ' ' + enemyActionDescription + ' ');

	if (success) {
		var attackSuccessString = 'and it hit you, dealing' + damage + 'damage.';
		actionResult = action == 'attack' ? attackSuccessString : 'and it succeeded.';
	} else {
		actionResult = action == 'attack' ? 'but it missed.' : 'but it failed.'
	}

	description += actionResult;
	return description;
}
