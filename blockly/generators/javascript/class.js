goog.provide("Blockly.JavaScript.class");

goog.require("Blockly.JavaScript");

Blockly.JavaScript["class_function_return"] = Blockly.JavaScript["procedures_defreturn"];

Blockly.JavaScript["class_function_noreturn"] = Blockly.JavaScript["procedures_defreturn"];

Blockly.JavaScript["control_class"] = function(block) {
 console.log(Blockly.JavaScript.statementToCode(block, "METHODS"));
  //TODO: Klassen Blöcke in Variable abspeichern
  var code = "";
  return code;
};

Blockly.JavaScript["class"] = function(block) {};
