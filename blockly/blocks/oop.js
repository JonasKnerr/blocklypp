goog.provide("Blockly.Constants.Oop");

goog.require("Blockly.Blocks");
goog.require("Blockly");

Blockly.Blocks["control_class"] = {
  init: function() {
    this.appendDummyInput()
      .appendField("class")
      .appendField(new Blockly.FieldTextInput("Name der Klasse"), "class_name");
    this.appendStatementInput("Constructor")
      .setCheck("Methode")
      .appendField("Constructor");
    this.appendValueInput("Attribute")
      .setCheck(null)
      .appendField("Attribute");
    this.appendStatementInput("Methode")
      .setCheck("Methode")
      .appendField("Methoden");
    //this.setInputsInline(false);
    this.setColour(230);
    this.attributeCount = 0;
    this.methodCount = 0;
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
