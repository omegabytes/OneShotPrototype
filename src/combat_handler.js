var dndLib = require('./dndLib.js');
var scenes = require('./scenes');
var enemies = require('./enemies');
var classes = require('./classes');

//var combatOrder = []; // ignore combat order for now and have player always go first.

// this handler creates and updates a combatInstance which contains all the information about the combat
var combatInstance = {
	"enemy_list": [],
	"player_character": {},
	"enemy_defeated": false,
	"player_defeated": false
};

exports.getCombatInstance = function() {
	return combatInstance;
}

// Sets up combat instance
exports.initializeCombat = function(scene, playerCharacter) {
	combatInstance.enemy_list = createEnemyList(scene);
	combatInstance.player_character = playerCharacter;
};

exports.combatRound = function(speechInput) {
	var output = speechInput + ' It is now the enemy turn. ';

	output += enemyTurn(combatInstance.enemy_list);

	// check for end combat scenarios.
	if (combatInstance.player_character.stats.health <= 0) {
		combatInstance.player_defeated = true;
		output += ' You have taken lethal damage from the enemy. You have died.'
	} else if (combatInstance.enemy_list.length == 0) {
		combatInstance.enemy_defeated = true;
		output += ' You have defeated the enemy successfully.'
	}

	return output;
}

function createEnemyList(scene) {
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

function enemyTurn(enemyList) {
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
				enemyActions += enemyActionHandler(action, enemy, combatInstance.player_character) + ' ';
				break;
			}
		}
	}

	return enemyActions;
};

function enemyActionHandler(action, enemy, playerCharacter) {
	var success = false;
	var description = '';
	var damage = 0;

	switch (action) {
		case 'attack':
			success = dndLib.skillCheck(playerCharacter.stats.defense, enemy.attack).pass;
			if (success) {
				damage = dndLib.dealDamage(enemy, playerCharacter);
			}
			break;
		case 'flee':
			var fleeDC = dndLib.rollDice(1, 20) + playerCharacter.stats.investigate;
			success = dndLib.skillCheck(fleeDC, enemy.attack).pass;

			// remove enemy from list if it escaped
			if (success) {
				var indexOfEnemy = combatInstance.enemyList.indexOf(enemy);
				if (indexOfEnemy > -1) {
					combatInstance.enemyList.splice(indexOfEnemy, 1);
				}
			}
			break;
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

	description = (enemy.name + ' ' + enemyActionDescription);

	if (success) {
		var attackSuccessString = ', it hits, dealing ' + damage + ' damage.';
		actionResult = action == 'attack' ? attackSuccessString : ' and it succeeds.';
	} else {
		actionResult = action == 'attack' ? ' but it misses.' : ' but it fails.'
	}

	description += actionResult;
	return description;
};

function combatTest() {
	var playerCharacter = {};
	Object.assign(playerCharacter, classes.classes.wizard);

	exports.initializeCombat('forest', playerCharacter);
	console.log(exports.combatRound('Player action.'));
};
