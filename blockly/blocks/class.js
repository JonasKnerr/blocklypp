goog.provide("Blockly.Constants.Class");

goog.require("Blockly.Blocks");
goog.require("Blockly");

/**
 *Block to create instances for each class
 */

Blockly.Blocks["class"] = {
  init: function() {
    this.appendDummyInput().appendField("new");
    this.appendDummyInput().appendField(this.id, "NAME");
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameInstance);
    this.appendDummyInput()
      .appendField("Instance")
      .appendField(nameField, "INSTANCE");
    this.setInputsInline(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
  getClassName() {
    return this.getFieldValue("NAME");
  },
  //TODO: get procedure_callreturn
  getInstanceDef: function() {
    return [this.getClassName(), this.getFieldValue("INSTANCE")];
  },
  /*
   *TODO: Upates if control_class gets changed
   */
  update: function() {
    var constr = Blockly.Class.getConstructor(this.workspace, this.getClassName());
    if (constr) {
      var attributes = constr.getVars();
      while (this.getInput("ATTRIBUTES")) {
        this.removeInput("ATTRIBUTES");
      }
      for (var i = 0; i < attributes.length; i++) {
        this.appendValueInput("ATTRIBUTES");
      }
    }
  },
  /**
   * renames the class, checks the oldName to only rename
   * classes with the same name
   */
  renameClass: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getClassName())) {
      this.setFieldValue(newName, "NAME");
    }
  },
  mutationToDom: function() {
    var container = document.createElement("mutation");
    container.setAttribute("name", this.getClassName());
    return container;
  },
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute("name");
    this.renameClass(this.getClassName(), name);
  },
  defType_: "class"
};

/**
 *TODO Block for a instance of a specific class, an object of the class????
 */
Blockly.Blocks["instance"] = {
  init: function() {
    this.appendDummyInput().appendField("Klasse", "CLASS");
    this.appendDummyInput().appendField("Instanz", "INSTANCE");
    this.methods = [];
    this.getDropDown();
    this.setInputsInline(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
  getInstanceName: function() {
    return this.getFieldValue("INSTANCE");
  },
  getClassName: function() {
    return this.getFieldValue("CLASS");
  },
  /**
   * Renames the classname of the instance
   */
  renameClass: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getClassName())) {
      this.setFieldValue(newName, "CLASS");
    }
  },
  /**
   * Renames the instancename of the instance
   */
  renameInstance: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getInstanceName())) {
      this.setFieldValue(newName, "INSTANCE");
    }
  },
  update: function() {
    this.getDropDown();
  },
  /**
   * Create XML to represent the argumens and names
   */
  mutationToDom: function() {
    var container = document.createElement("mutation");
    container.setAttribute("name", this.getInstanceName());
    container.setAttribute("class", this.getClassName());
    return container;
  },
  /**
   *Parse XML to restore the arguments and names
   */
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute("name");
    this.renameInstance(this.getInstanceName(), name);
    var className = xmlElement.getAttribute("class");
    this.renameClass(this.getClassName(), className);
  },
  /**
   * Intialize a dropdown with all methods for a class
   */
  getDropDown: function() {
    var methods = Blockly.Class.getMethods(Blockly.getMainWorkspace(), this.getClassName());
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
/**
 * Class to create a new Class with instances
 * add atrributes with decompose and compose functions
 */

Blockly.Blocks["control_class"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameClass);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Klasse")
      .appendField(nameField, "NAME");
    this.setMutator(new Blockly.Mutator(["class_attribute"]));
    this.appendStatementInput("CONSTRUCTOR")
      .setCheck(["class_constructor"])
      .appendField("Konstruktoren");
    this.appendStatementInput("METHODS")
      .setCheck(["class_function_noreturn", "class_function_return"])
      .appendField("Methoden");
    this.setColour(230);
    this.attributeCount = 0;
    this.methodCount = 0;
    this.setTooltip("");
    this.setHelpUrl("");
  },
  decompose: function(workspace) {
    var topBlock = workspace.newBlock("class_mutator");
    topBlock.initSvg();
    var connection = topBlock.getInput("STACK").connection;
    for (var j = 1; j <= this.attributeCount; j++) {
      var attributeBlock = workspace.newBlock("class_attribute");
      attributeBlock.initSvg();
      connection.connect(attributeBlock.previousConnection);
      connection = attributeBlock.nextConnection;
    }
    return topBlock;
  },
  compose: function(containerBlock) {
    for (var i = this.attributeCount; i > 0; i--) {
      this.removeInput("attribute" + i);
    }
    this.attributeCount = 0;
    var itemBlock = containerBlock.getInputTargetBlock("STACK");
    while (itemBlock) {
      if (itemBlock.type == "class_attribute") {
        this.attributeCount++;
        var attributeInput = this.appendValueInput("attribute" + this.attributeCount)
          .setCheck(null)
          .appendField("Attribute");
        if (itemBlock.valueConnection_) attributeInput.connection.connect(itemBlock.valueConnection_);
      }
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  mutationToDom: function() {
    if (!this.atrributeCount && !this.methodCount) {
      return null;
    }
    var container = document.createElement("mutation");
    if (this.attributeCount) {
      container.setAttribute("attribute", this.attributeCount);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.atrributeCount = parseInt(xmlElement.getAttribute("attribute"), 10) || 0;
    for (var i = 1; i < this.attributeCount; i++) {
      this.appendValueInput("attribute" + i)
        .setCheck(null)
        .appendField("Attribute");
    }
  },
  getClassDef: function() {
    return this.getFieldValue("NAME");
  },
  getStatement: function() {
    return this.getInputTargetBlock("METHODS");
  },
  getConstructor: function() {
    return this.getInputTargetBlock("CONSTRUCTOR");
  },
  onchange: function() {
    Blockly.Class.mutateCallers(this);
  },
  callType_: "class"
};

Blockly.Blocks["class_constructor"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Konstruktor")
      .appendField("", "PARAMS");
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]);
    }
    this.setNextStatement(true, ["class_constructor"]);
    this.setPreviousStatement(true, ["class_constructor"]);
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

Blockly.Blocks["class_function_return"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Methode")
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
      .appendField("Methode")
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
Blockly.Blocks["class_attribute"] = {
  init: function() {
    this.appendValueInput("NAME")
      .setCheck(null)
      .appendField("attribute");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  }
};
Blockly.Blocks["class_mutator"] = {
  init: function() {
    this.appendDummyInput().appendField("class");
    this.appendStatementInput("STACK");
    //  this.appendStatementInput("STACK");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  }
};
