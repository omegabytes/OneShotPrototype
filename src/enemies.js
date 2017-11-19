module.exports = {
	"monsters": {
		"orc": {
			"name": "orc",
			"stats": {
				"defense": 12,
				"health": 8,
				"attack": 3,
				"damageDieSides": 8,
				"perception": 0,
				"stealth": 1
			},
			"current_state": "normal",
			"state_actions": {
				"normal": {
					"attack": 100,
				},
				"injured": {
					"attack": 80,
					"flee": 20
				},
				"near_death": {
					"attack": 50,
					"flee": 50
				}
			},
			"action_descriptions": {
				"attack": [
					"",
					"swings its club at you",
					"leaps into the air, bringing its club down upon you",
					"charges forward and swings wildly",
					"grabs you by the throat and tries to punch you in the face",
					"let's out a battle cry and smashes its club down",
					"screams something unintelligible before attempting to slam its elbow into your stomach",
					"laughs as it tries to stomp on your foot"
				],
				"flee": [
					""
				]
			}
		}
	},
	"generic_action_descriptions": {
		"attack": [
			"swings wildly",
			"brings an attack down upon your head",
			"attempts to bash you viciously",
			"thrashes savagely",
			"attempts to hit you with a quick strike",
			"lunges forward",
		],
		"flee": [
			"attempts to flee in terror",
			"attempts to run away, clutching it's wounds"
		]
	}
}