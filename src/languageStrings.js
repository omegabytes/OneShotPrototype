var items           = require('./items');
var spells          = require('./spells');
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
            //output strings
            "DISPLAY_CARD_TITLE":                           "%s  - Info for %s.",
            "HELP_MESSAGE":                                 "help message placeholder text",
            "HELP_REPROMPT":                                "help reprompt placeholder text",
            "INCOMPLETE_REQUEST":                           "I missed part of what you were saying, could you please repeat that?",
            "NOT_FOUND_MESSAGE":                            "I\'m sorry, I currently do not know ",
            "NOT_FOUND_WITH_OBJECT_NAME":                   "the info for %s",
            "NOT_FOUND_WITHOUT_OBJECT_NAME":                "the info for that.",
            "REPEAT_MESSAGE":                               "Try saying repeat.",            
            "REPROMPT":                                     "What else can I help with?",
            "SKILL_NAME":                                   "TableTop Pro",  //TBD           
            "STOP_MESSAGE":                                 "Goodbye!",            
            "UNHANDLED" :                                   "I'm sorry, I didn't get that. You can try repeating that command. For help on what you can ask, say 'help'",
            "WELCOME_MESSAGE":                              "Welcome to TableTop Pro",
            "WELCOME_REPROMPT":                             "For instructions on what you can say, please say help me."     
        }
    }
};