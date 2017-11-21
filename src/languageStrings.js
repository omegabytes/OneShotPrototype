var items  = require('./items');
var spells = require('./spells');
var scenes = require('./scenes');
//todo: add character, enemy, scene inits

module.exports = {
    "en": {
        "translation": {
            //json resources
            "ITEMS" :                                       items.ITEMS,
            "ITEM_ATTRIBUTES" :                             items.ITEM_ATTRIBUTES,
            "SPELLS":                                       spells.SPELLS,
            "SPELL_ATTRIBUTES" :                            spells.SPELL_ATTRIBUTES,
            "SLOT_LEVEL" :                                  spells.SLOT_LEVEL,
            "USER_ACTIONS":                                 scenes.scenes,
            //output strings
            "DISPLAY_CARD_TITLE":                           "%s  - Info for %s.",
            "HELP_MESSAGE":                                 "help message placeholder text",
            "HELP_REPROMPT":                                "help reprompt placeholder text",
            "INCOMPLETE_REQUEST":                           "I missed part of what you were saying, could you please repeat that?",
            "LIST_OF_ACTIONS":                              "attack\n defend\n diplomacy\n flee\n hide\n investigate\n use ability",
            "NOT_FOUND_MESSAGE":                            "I\'m sorry, I currently do not know ",
            "NOT_FOUND_WITH_OBJECT_NAME":                   "the info for %s",
            "NOT_FOUND_WITHOUT_OBJECT_NAME":                "the info for that.",
            "REPEAT_MESSAGE":                               "Try saying repeat.",            
            "REPROMPT_GLOBAL":                              "See the card in the Alexa app for a list of actions.",
            "SKILL_NAME":                                   "TableTop Pro",  //TBD           
            "STOP_MESSAGE":                                 "Goodbye!",            
            "UNHANDLED" :                                   "I'm sorry, I didn't get that. You can try repeating that command. For help on what you can ask, say 'help'",
            "WELCOME_MESSAGE":                              "Welcome to TableTop Pro. Are you ready to begin?",
            "WELCOME_REPROMPT":                             "For instructions on what you can say, please say help me."     
        }
    }
};