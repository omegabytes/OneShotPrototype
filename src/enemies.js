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
					"swings its club at you and hits.",
					"leaps into the air, bringing its club down upon your head.",
					"charges forward and swings wildly, bashing you with its club.",
					"grabs you by the throat and punches you in the face.",
					"let's out a battle cry before landing a blow with its heavy club.",
					"screams something unintelligible before slamming its elbow into your stomach."
					"stomps on your foot and laughs."
				],
				"flee": [
					""
				]
			}
		}
	},
	"generic_action_descriptions": {
		"attack": [
			"swings wildly and hits you.",
			"brings an attack down upon your head.",
			"bashes you viciously.",
			"thrashes savagely and hits you.",
			"hits you with a rapid blow.",
			"lunges forward and lands an attack on you.",
		],
		"flee": [
			"runs away in terror",
			"flees from combat clutching it's wounds"
		]
	}
}