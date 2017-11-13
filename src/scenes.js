module.exports = {
	"scenes" : {
		"forest": {
			"description": "You approach a clearing in the forest where a small campfire has been constructed. There are still some burning embers."

			"prompt": "What do you do?"
			"options": {},
			"difficulty_classes": {
				"investigate": 15;
				"flee": 12;
				"diplomacy": 18;
				"hide": 15;
			}
			"card": {
			},
			"action_success": {
				"investige": "The camp fire has been recently burning, and the forest is eerily silent. You scan the edge of the trees and spot a handful of vicious looking orcs brandishing weapons as they attempt to conceal themselves behind some large shrubs.",
				"flee": "You run, letting terror take control of your legs and not looking back. You escape back to the safety of the road, gasping for breath, eyes trained on the forest. The orcs do not seem to have pursued. You carry on with your dreary life, always wondering what adventures awaited you in the forest.",
				"diplomacy": "The orcs are intrigued by your attempt to communicate. The largest orc steps forward and "
				"hide": "You vanish into the shadows of the trees. The orcs seem confused, as if they've just seen a ghost."
			},
			"action_failure": {
				"investige": "The camp fire has been recently burning, but there doesn't seem to be anyone around. The clearing seems safe to explore, so you step out of the bushes and begin searching for anything of interest. Just then, several huge orcs bellow as they leap out of the brush and attack you.",
				"flee": "You attempt to flee, but you trip on a root. The orcs close in and leap on you, continuing their assault.",
				"diplomacy": "The orcs are angered by your attempt at communication. They charge forward, weapons raised high."
				"hide": "You recede into the shadows nonchalantly, as if prepared to vanish like a ghost. The underbrush crunches and snaps loudly as you clumsily stumble around attempting to find your footing. The orcs laugh and charge forward."
			}
		}
	}
}