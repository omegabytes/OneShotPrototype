module.exports = {
    "scenes" : {
        "forest": {
            "description": "You approach a clearing in the forest where a small campfire has been constructed. There are still some burning embers.",

            "prompt": "What do you do?",
            "options": {},
            "difficulty_classes": {
                "attack": 14,
                "investigate": 15,
                "flee": 12,
                "diplomacy": 18,
                "hide": 15
            },
            "card": {
            },
            "enemies": {
                "orc": 4
            },
            "enemy_not_seen": {
                "action_success": {
                    "attack": "",
                    "investigate": {
                        "description": "The camp fire has been recently burning, and the forest is eerily silent. You scan the edge of the trees and spot a handful of vicious looking orcs brandishing weapons as they attempt to conceal themselves behind some large shrubs.",
                        "state_change": "enemy_seen"
                    },
                    "flee": "You run, from what you do not know. You escape back to the safety of the road. You carry on with your dreary life, vowing never to take another risk again, but always wondering what adventures awaited you in the forest.",
                    "diplomacy": "",
                    "hide": "You vanish into the shadows of the trees easily."
                },
                "action_failure": {
                    "attack": "",
                    "investigate": {
                        "description": "The camp fire has been recently burning, but there doesn't seem to be anyone around. The clearing seems safe to explore, so you step out of the bushes and begin searching for anything of interest. Just then, several huge orcs bellow as they leap out of the brush and attack you.",
                        "state_change": "combat"
                    },
                    "flee": "You run, from what you do not know, but in your panic you run headlong into a tree branch. When you come to, you are surrounded by a group of vicious looking orcs who bring their weapons down on you.",
                    "diplomacy": "",
                    "hide": "You attempt to find a hiding place in the nearby brush. You hear a gutteral war cry as a group of orcs emerge from the brush and charge toward you, having seen your attempts at stealth."
                }
            },
            "enemy_seen": {
                "action_success": {
                    "attack": "You charge up to engage, and land a blow on one of the enemies.",
                    "investige": "The orcs are muscle bound brutes, covered in poor quality tattoos and animal trophies. They do not seem very intelligent, prefering hand to hand combat over any other sort of interaction.",
                    "flee": "You do not look back as you flee, letting terror take control of your legs. You escape back to the safety of the road, gasping for breath, eyes trained on the forest. The orcs do not seem to have pursued. You carry on with your dreary life, vowing never to take another risk again, but always wondering what adventures awaited you in the forest.",
                    "diplomacy": "The orcs are intrigued by your attempt to communicate. The largest orc steps forward and challenges you to a physical contest. Do you accept?",
                    "hide": "You vanish into the shadows of the trees. The orcs seem confused, as if they've just seen a ghost."
                },
                "action_failure": {
                    "attack": "You charge up to engage, but miss your target.",
                    "investige": "You can not get a good read on the orcs, they seem nice enough.",
                    "flee": "You attempt to flee, but you trip on a root. The orcs close in and leap on you, continuing their assault.",
                    "diplomacy": "The orcs are angered by your attempt at communication. They charge forward, weapons raised high.",
                    "hide": "You recede into the shadows nonchalantly, as if prepared to vanish like a ghost. The underbrush crunches and snaps loudly as you clumsily stumble around attempting to find your footing. The orcs laugh and charge forward."
                }
            },
            "combat": {
                "action_success": {
                    "attack": "You hit your target.",
                    "investige": "There's no time for that.",
                    "flee": "You do not look back as you flee, letting terror take control of your legs. You escape back to the safety of the road, gasping for breath, eyes trained on the forest. The orcs do not seem to have pursued. You carry on with your dreary life, vowing never to take another risk again, but always wondering what adventures awaited you in the forest.",
                    "diplomacy": "The orcs seem to be too enraged to talk.",
                    "hide": "You vanish into the shadows of the trees. The orcs seem confused, as if they've just seen a ghost."
                },
                "action_failure": {
                    "attack": "You miss your target.",
                    "investige": "There's no time for that.",
                    "flee": "You attempt to flee, but you trip on a root. The orcs close in and leap on you, continuing their assault.",
                    "diplomacy": "Your attempts at communication seem to only enrage the orcs further.",
                    "hide": "You dive into some nearby bushes within full view of all your enemies. They chuckle as they surround you and continue their assault."
                }
            }
        }
    }
}