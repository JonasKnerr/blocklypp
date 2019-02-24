goog.provide("Blockly.Constants.Class");

goog.require("Blockly.Blocks");
goog.require("Blockly");

Blockly.Blocks["control_class"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.rename);
    this.appendDummyInput()
      .appendField("class")
      .appendField(nameField, "NAME");
    this.appendValueInput("Attribute")
      .setCheck(null)
      .appendField("Attribute");
    this.appendStatementInput("Constructor")
      .setCheck("Methode")
      .appendField("Constructor");
    this.appendStatementInput("METHODS")
      .setCheck(["class_function_noreturn", "class_function_return"])
      .appendField("Methoden");
    this.setColour(230);
    this.attributeCount = 0;
    this.methodCount = 0;
    this.setTooltip("");
    this.setHelpUrl("");
  },
  getClassDef: function() {
    return this.getFieldValue("NAME");
  },
  getStatement: function() {
    return this.getInputTargetBlock("METHODS");
  },
  onchange: function() {
    Blockly.Class.mutateCallers(this);
  }
};

Blockly.Blocks["class"] = {
  init: function() {
    this.appendDummyInput().appendField("new");
    this.appendDummyInput().appendField("", "NAME");
    this.appendDummyInput().appendField(new Blockly.FieldTextInput("Name der Instanz"), "INSTANCE");
    this.name = "Klasse";
    this.setInputsInline(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
  //TODO: get procedure_callreturn
  getInstanceDef: function() {
    console.log(this.name);
    console.log(this.getFieldValue("INSTANCE"));
    return [this.name, this.getFieldValue("INSTANCE")];
  },
  renameClass: function(newName) {
    console.log(this.name);
    this.name = newName;
    this.setFieldValue(newName, "NAME");
  }
};
Blockly.Blocks["instance"] = {
  init: function() {
    // this.appendDummyInput().appendField("", "NAME");
    this.appendDummyInput().appendField("", "INSTANCE");
    this.name = "Klasse";
    this.methods = [];
    this.getDropDown();
    this.setInputsInline(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  getClassCall: function() {
    return this.name;
  },
  //TODO: get procedure_callreturn
  renameClass: function(newName) {
    console.log(this.name);
    this.name = newName;
    this.setFieldValue(newName, "NAME");
  },
  update: function() {
    this.getDropDown();
  },
  /**
   * Intialize a dropdown with all methods for a class
   */
  getDropDown: function() {
    var methods = Blockly.Class.getMethods(Blockly.getMainWorkspace(), this.name);
    if (this.methods.length != methods.length) {
      //remove previous Dropdown
      if (this.getInput("Data")) {
        this.removeInput("Data");
      }
      this.methods = methods;
      if (!(this.methods.length == 0)) {
        var options = [];
        for (var i = 0; i < this.methods.length; i++) {
          options.push([this.methods[i].getFieldValue("NAME"), "FUNCTION_" + this.methods[i].getFieldValue("NAME")]);
        }
        var dropdown = new Blockly.FieldDropdown(options);
        this.appendValueInput("Data").appendField(dropdown, "METHODS");
      }
    }
  }
};
Blockly.Blocks["class_function_return"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Blockly.Msg["PROCEDURES_DEFRETURN_TITLE"])
      .appendField(nameField, "NAME")
      .appendField("", "PARAMS");
    this.appendValueInput("RETURN")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(Blockly.Msg["PROCEDURES_DEFRETURN_RETURN"]);
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFRETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFRETURN_COMMENT"]);
    }
    this.setNextStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setPreviousStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setColour(Blockly.Msg["PROCEDURES_HUE"]);
    this.setTooltip(Blockly.Msg["PROCEDURES_DEFRETURN_TOOLTIP"]);
    this.setHelpUrl(Blockly.Msg["PROCEDURES_DEFRETURN_HELPURL"]);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks["procedures_defnoreturn"].setStatements_,
  updateParams_: Blockly.Blocks["procedures_defnoreturn"].updateParams_,
  mutationToDom: Blockly.Blocks["procedures_defnoreturn"].mutationToDom,
  domToMutation: Blockly.Blocks["procedures_defnoreturn"].domToMutation,
  decompose: Blockly.Blocks["procedures_defnoreturn"].decompose,
  compose: Blockly.Blocks["procedures_defnoreturn"].compose,
  getVars: Blockly.Blocks["procedures_defnoreturn"].getVars,
  getProcedureDef: function() {
    return [this.getFieldValue("NAME"), this.arguments_, true];
  },
  getVarModels: Blockly.Blocks["procedures_defnoreturn"].getVarModels,
  renameVarById: Blockly.Blocks["procedures_defnoreturn"].renameVarById,
  updateVarName: Blockly.Blocks["procedures_defnoreturn"].updateVarName,
  displayRenamedVar_: Blockly.Blocks["procedures_defnoreturn"].displayRenamedVar_,
  customContextMenu: Blockly.Blocks["procedures_defnoreturn"].customContextMenu,
  callType_: "procedures_callreturn"
};

Blockly.Blocks["class_function_noreturn"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Blockly.Msg["PROCEDURES_DEFNORETURN_TITLE"])
      .appendField(nameField, "NAME")
      .appendField("", "PARAMS");
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]);
    }
    this.setNextStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setPreviousStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setColour(Blockly.Msg["PROCEDURES_HUE"]);
    this.setTooltip(Blockly.Msg["PROCEDURES_DEFNORETURN_TOOLTIP"]);
    this.setHelpUrl(Blockly.Msg["PROCEDURES_DEFNORETURN_HELPURL"]);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks["procedures_defnoreturn"].setStatements_,
  updateParams_: Blockly.Blocks["procedures_defnoreturn"].updateParams_,
  mutationToDom: Blockly.Blocks["procedures_defnoreturn"].mutationToDom,
  domToMutation: Blockly.Blocks["procedures_defnoreturn"].domToMutation,
  decompose: Blockly.Blocks["procedures_defnoreturn"].decompose,
  compose: Blockly.Blocks["procedures_defnoreturn"].compose,
  getVars: Blockly.Blocks["procedures_defnoreturn"].getVars,
  getProcedureDef: function() {
    return [this.getFieldValue("NAME"), this.arguments_, false];
  },
  getVarModels: Blockly.Blocks["procedures_defnoreturn"].getVarModels,
  renameVarById: Blockly.Blocks["procedures_defnoreturn"].renameVarById,
  updateVarName: Blockly.Blocks["procedures_defnoreturn"].updateVarName,
  displayRenamedVar_: Blockly.Blocks["procedures_defnoreturn"].displayRenamedVar_,
  customContextMenu: Blockly.Blocks["procedures_defnoreturn"].customContextMenu,
  callType_: "procedures_callreturn"
};
