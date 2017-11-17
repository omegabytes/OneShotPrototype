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
            "card": {},
            "enemies": {
                "orc": 4
            },
            "enemy_not_seen": {
                "pass": {
                    "attack": {
                    	"description": "",
                    	"state_change": ""
                    },
                    "investigate": {
                    	"description": "The camp fire has been recently burning, and the forest is eerily silent. You scan the edge of the trees and spot a handful of vicious looking orcs brandishing weapons as they attempt to conceal themselves behind some large shrubs.",
                    	"state_change": "enemy_seen"
                    },

                    "flee": {
                    	"description": "You run, from what you do not know. You escape back to the safety of the road. You carry on with your dreary life, vowing never to take another risk again, but always wondering what adventures awaited you in the forest.",
                    	"state_change": "end_game"
                    },
                    "diplomacy": {
                    	"description": "",
                    	"state_change": ""
                    },
                    "hide": {
                    	"description": "You vanish into the shadows of the trees easily.",
                    	"state_change": ""
                    },
                },
                "fail": {
                    "attack": {
                    	"description": "",
                    	"state_change": ""
                    },
                    "investigate":{
                    	"description": "The camp fire has been recently burning, but there doesn't seem to be anyone around. The clearing seems safe to explore, so you step out of the bushes and begin searching for anything of interest. Just then, several huge orcs bellow as they leap out of the brush and attack you.",
                    	"state_change": "combat"
                    },
                    "flee": {
                    	"description": "You run, from what you do not know, but in your panic you run headlong into a tree branch. When you come to, you are surrounded by a group of vicious looking orcs who bring their weapons down on you.",
                    	"state_change": "combat"
                    },
                    "diplomacy": {
                    	"description": "",
                    	"state_change": ""
                    },
                    "hide": {
                    	"description": "You attempt to find a hiding place in the nearby brush. You hear a gutteral war cry as a group of orcs emerge from the brush and charge toward you, having seen your attempts at stealth.",
                    	"state_change": "combat"
                    },
                }
            },
            "enemy_seen": {
                "pass": {
                    "attack": {
                    	"description": "You hit one of the enemies with a surprise attack.",
                    	"state_change": "combat"
                    },
                    "investige": {
                    	"description": "The orcs are muscle bound brutes, covered in poor quality tattoos and animal trophies. They do not seem very intelligent, prefering hand to hand combat over any other sort of interaction.",
                    	"state_change": ""
                    },
                    "flee": {
                    	"description": "You do not look back as you flee, letting terror take control of your legs. You escape back to the safety of the road, gasping for breath, eyes trained on the forest. The orcs do not seem to have pursued. You carry on with your dreary life, vowing never to take another risk again, but always wondering what adventures awaited you in the forest.",
                    	"state_change": "end_game"
                    },
                    "diplomacy": {
                    	"description": "The orcs are intrigued by your attempt to communicate. The largest orc steps forward and challenges you to a physical contest. Do you accept?",
                    	"state_change": ""
                    },
                    "hide": {
                    	"description": "You vanish into the shadows of the trees. The orcs seem confused, as if they've just seen a ghost.",
                    	"state_change": "combat"
                    },
                },
                "fail": {
                    "attack": {
                    	"description": "You attempt to surprise your enemies, but miss your target.",
                    	"state_change": "combat"
                    },
                    "investige": {
                    	"description": "You can not get a good read on the orcs, they seem nice enough.",
                    	"state_change": ""
                    },
                    "flee": {
                    	"description": "You attempt to flee, but you trip on a root. The orcs close in and leap on you, continuing their assault.",
                    	"state_change": "combat"
                    },
                    "diplomacy": {
                    	"description": "The orcs are angered by your attempt at communication. They charge forward, weapons raised high.",
                    	"state_change": "combat"
                    },
                    "hide": {
                    	"description": "You recede into the shadows nonchalantly, as if prepared to vanish like a ghost. The underbrush crunches and snaps loudly as you clumsily stumble around attempting to find your footing. The orcs laugh and charge forward.",
                    	"state_change": "combat"
                    },
                }
            },
            "combat": {
                "pass": {
                    "attack": {
                    	"description":  "You hit your target.",
                    	"state_change": ""
                    },
                    "investige": {
                    	"description": "There's no time for that.",
                    	"state_change": ""
                    },
                    "flee": {
                    	"description": "You do not look back as you flee, letting terror take control of your legs. You escape back to the safety of the road, gasping for breath, eyes trained on the forest. The orcs do not seem to have pursued. You carry on with your life, vowing never to take another risk again.",
                    	"state_change": ""
                    },
                    "diplomacy": {
                    	"description": "The orcs don't seem interested in talking at this point.",
                    	"state_change": ""
                    },
                    "hide": {
                    	"description": "You vanish into the shadows of the trees. The orcs seem confused, as if they've just seen a ghost.",
                    	"state_change": ""
                    },
                },
                "fail": {
                    "attack": {
                    	"description": "You miss your target.",
                    	"state_change": ""
                    },
                    "investige": {
                    	"description": "There's no time for that.",
                    	"state_change": ""
                    },
                    "flee": {
                    	"description": "You attempt to flee, but you trip on a root. The orcs close in and leap on you, continuing their assault.",
                    	"state_change": ""
                    },
                    "diplomacy": {
                    	"description": "Your attempts at communication seem to only enrage the orcs further.",
                    	"state_change": ""
                    },
                    "hide": {
                    	"description": "You dive into some nearby bushes within full view of all your enemies. They chuckle as they surround the bushes and ruthlessly lay into you.",
                    	"state_change": ""
                    },
                }
            }
        }
    }
}