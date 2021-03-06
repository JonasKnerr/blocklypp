goog.provide("Blockly.Constants.Class");

goog.require("Blockly.Blocks");
goog.require("Blockly");

Blockly.Blocks["class_get_instance"] = {
  init: function() {
    this.appendDummyInput()
      .appendField("new")
      .appendField(this.id, "NAME");
    this.args = 0;
    this.argBlocks = [];
    this.setOutput(true, this.getFieldValue("NAME"));
    this.setTooltip("");
    this.setHelpUrl("");
  },
  initColour: function() {
    if (!this.isInFlyout) {
      var classBlock = Blockly.Class.getClassByName(this.workspace, this.getFieldValue("NAME"));
      console.log(this.getFieldValue("NAME"));
      console.log(classBlock);
      this.setColour(classBlock.getColour());
    }
  },
  changeOutput: function(newName) {
    this.setOutput(true, newName);
  },
  getClassName: function() {
    return this.getFieldValue("NAME");
  },

  getInstanceDef: function() {
    return [this.getClassName(), this.getFieldValue("INSTANCE")];
  },
  getConstructor: function() {
    return this.constr;
  },
  onchange: function() {
    this.changeOutput(this.getFieldValue("NAME"));
  },
  /*
   * Upates constructor attributes if control_class gets changed
   */
  update: function() {
    var constr = Blockly.Class.getConstructor(this.workspace, this.getClassName());
    this.constr = constr;
    if (constr) {
      var args = constr.getVars();
      if (this.args != args.length) {
        if (this.args > args.length) {
          while (this.args > args.length) {
            this.args--;
            this.removeInput("ARG" + this.args);
          }
        } else {
          this.appendValueInput("ARG" + this.args);
          this.args++;
        }
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
    this.initColour();
  },
  defType_: "class"
};

/**
 *TODO Block for a instance of a specific class
 */
Blockly.Blocks["class_instance"] = {
  init: function() {
    this.appendDummyInput().appendField("Klasse", "CLASS");
    this.appendDummyInput()
      .appendField("", "INSTANCE")
      .appendField(".", "POINT");
    this.methods = [];
    this.classVariables = [];
    this.args = 0;
    this.setInputsInline(true);
    this.setColour(20);
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
  update: function(oldName, legalName) {
    this.getDropDown(oldName, legalName);
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
  getDropDown: function(oldName, newName) {
    if (!this.isInFlyout) {
      var methods = Blockly.Class.getMethods(Blockly.getMainWorkspace(), this.getClassName());
      var classVariables =
        Blockly.Class.getClassVariables(Blockly.getMainWorkspace(), this.getClassName()) || [];
      if (
        this.methods.length != methods.length ||
        oldName ||
        this.classVariables.length != classVariables.length
      ) {
        //remove previous Dropdown
        if (this.getInput("Data")) {
          this.removeInput("Data");
        }
        this.methods = methods;
        this.classVariables = classVariables;

        if (this.methods.length != 0 || this.classVariables.length != 0) {
          var options = [];
          //make array of method names, if a mehtod gets renamed we need to
          // store the new Value newName
          var methodNames = methods.map(method => {
            if (method.getFieldValue("NAME") == oldName) return newName;
            return method.getFieldValue("NAME");
          });
          if (this.curValue == oldName) {
            this.curValue = newName;
          }

          //remove current value if block is not in the class anymore
          if (
            !methodNames.includes(this.curValue) &&
            !this.classVariables.includes(this.curValue)
          ) {
            this.curValue = "";
            this.typeOfValue = "";
          }
          if (this.curValue) {
            if (this.classVariables.includes(this.curValue)) {
              this.typeOfValue = "attribute";
              options.push([this.curValue, this.curValue]);
            } else {
              this.typeOfValue = "method";
              options.push([this.curValue + "()", this.curValue]);
            }
          }
          for (var i = 0; i < this.classVariables.length; i++) {
            if (classVariables[i] == this.curValue && this.typeOfValue == "attribute") continue;
            options.push([classVariables[i], classVariables[i]]);
          }
          for (var i = 0; i < methodNames.length; i++) {
            if (methodNames[i] == this.curValue && this.typeOfValue == "method") continue;
            options.push([
              this.methods[i].getFieldValue("NAME") + "()",
              this.methods[i].getFieldValue("NAME")
            ]);
          }
          var dropdown = new Blockly.FieldDropdown(options);
          this.appendDummyInput("Data").appendField(dropdown, "METHODS");
        }
      }
    }
  },
  //returns the actual method
  getCurrentMethod: function() {
    return this.curValue;
  },
  setType: function(isReturn) {
    if (isReturn) {
      //remove Previous and Next Connections before removing the Statement
      if (this.nextConnection) {
        if (this.nextConnection.isConnected()) {
          this.nextConnection.disconnect();
        }
      }
      if (this.previousConnection) {
        if (this.previousConnection.isConnected()) {
          this.previousConnection.disconnect();
        }
      }
      this.setNextStatement(false);
      this.setPreviousStatement(false);
      this.setOutput(true);
    } else {
      this.setOutput(false);
      this.setNextStatement(true);
      this.setPreviousStatement(true);
    }
  },
  onchange: function() {
    var isVar;
    if (this.classVariables) {
      isVar = this.classVariables.includes(this.getFieldValue("METHODS"));
    }
    if (this.getFieldValue("METHODS") && !this.isInFlyout && !isVar) {
      this.typeOfValue = "method";
      var method = this.getFieldValue("METHODS");
      //check if Method has return value and adjust block
      var blocks = this.workspace.getAllBlocks();
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].getProcedureDef) {
          if (blocks[i].getProcedureDef()[0] == method) {
            var methodBlock = blocks[i];
          }
        }
      }
      var isReturn;
      if (methodBlock) {
        if (methodBlock.type == "class_function_return") {
          isReturn = true;
        } else if (methodBlock.type == "class_function_noreturn") {
          isReturn = false;
        }
        this.setType(isReturn);
      }
      this.curValue = method;
      var args = Blockly.Class.getMethodAttributes(this.workspace, method);
      if (this.args != args.length) {
        if (this.args > args.length) {
          while (this.args > args.length) {
            this.args--;
            this.removeInput("ARG" + this.args);
          }
        } else {
          while (this.args < args.length) {
            this.appendValueInput("ARG" + this.args);
            //appned Inpute at the end of the Block
            this.moveInputBefore("ARG" + this.args, null);
            this.args++;
          }
        }
      }
    } else {
      this.typeOfValue = "attribute";
      this.setType(true);

      var variable_ = this.getFieldValue("METHODS");
      this.curValue = variable_;
      while (this.args > 0) {
        this.args--;
        this.removeInput("ARG" + this.args);
      }
    }
  }
};

/**
 * Class to create a new Class with instances
 * add atrributes with decompose and compose functions
 */

Blockly.Blocks["class_class"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameClass);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Klasse")
      .appendField(nameField, "NAME");
    this.appendStatementInput("METHODS")
      .setCheck(["class_function_noreturn", "class_function_return"])
      .appendField("Methoden");
    this.setColour(Blockly.Class.colour());
    this.setConstructor(true);
    this.setMutator(new Blockly.Mutator(["class_attribute"], this));
    this.attributeCount = 0;
    this.methodCount = 0;
    this.attributeInputs = [];
    this.oldName = "";
    this.hasConstr = true;
    this.statementConnection_ = null;
    this.setTooltip("");
    this.setHelpUrl("");
  },
  changeScope: function() {
    var attributeCount = 0;
    var attributeInputs = [];
    while (attributeCount <= this.attributeCount) {
      attributeCount++;
      if (this.getInputTargetBlock("attribute" + attributeCount)) {
        var name = this.getInputTargetBlock("attribute" + attributeCount).inputList[0].fieldRow[0]
          .variable_.name;
        this.workspace.changeVariableScope(name, this.oldName, this.getClassDef());
        attributeInputs.push(name);
      }
    }
    // set variables to global that are not in the class anymore
    if (this.attributeInputs.length > attributeInputs.length) {
      var changedInput = this.attributeInputs.filter(x => !attributeInputs.includes(x));
      this.workspace.changeVariableScope(changedInput[0], this.oldName, "global");
    }
    this.attributeInputs = attributeInputs;
  },
  setOldName(oldName) {
    this.oldName = oldName;
  },
  decompose: function(workspace) {
    var topBlock = workspace.newBlock("class_mutator", false, this);
    topBlock.initSvg();

    //set field according to constructor
    console.log(topBlock);
    topBlock.setFieldValue(this.hasConstr ? "TRUE" : "FALSE", "CONSTR");

    var connection = topBlock.getInput("STACK").connection;
    for (var j = 1; j <= this.attributeCount; j++) {
      var attributeBlock = workspace.newBlock("class_attribute", false, this);
      attributeBlock.initSvg();
      connection.connect(attributeBlock.previousConnection);
      connection = attributeBlock.nextConnection;
    }
    return topBlock;
  },
  compose: function(containerBlock) {
    var inputBlocks = [];
    for (var i = this.attributeCount; i > 0; i--) {
      inputBlocks.push(this.getInputTargetBlock("attribute" + i));
      this.removeInput("attribute" + i);
    }
    this.attributeCount = 0;
    var inputLength = inputBlocks.length;
    var itemBlock = containerBlock.getInputTargetBlock("STACK");
    while (itemBlock) {
      if (itemBlock.type == "class_attribute") {
        var inputBlock = inputBlocks[inputLength - 1];
        inputLength--;
        this.attributeCount++;
        var attributeInput = this.appendValueInput("attribute" + this.attributeCount)
          .setCheck(null)
          .appendField("Attribut");
        if (inputBlock) {
          attributeInput.connection.connect(inputBlock.outputConnection);
        }
        if (this.hasConstr) {
          this.moveInputBefore("attribute" + this.attributeCount, "CONSTRUCTOR");
        } else {
          this.moveInputBefore("attribute" + this.attributeCount, "METHODS");
        }
      }
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    var hasConstr = containerBlock.getFieldValue("CONSTR");

    if (hasConstr !== null) {
      hasConstr = hasConstr == "TRUE";

      if (this.hasConstr != hasConstr) {
        if (hasConstr) {
          this.setConstructor(true);

          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, "CONSTRUCTOR");
          this.statementConnection_ = null;
        } else {
          //Save the stack, then disconnect it.
          var stackConnection = this.getInput("CONSTRUCTOR").connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setConstructor(false);
          //this.removeInput("CONSTRUCTOR");
        }
        this.hasConstr = hasConstr;
      }
    }
  },
  setConstructor: function(hasCons) {
    if (hasCons) {
      this.appendStatementInput("CONSTRUCTOR")
        .appendField("Konstruktor")
        .setCheck(["class_constructor"]);
      this.moveInputBefore("CONSTRUCTOR", "METHODS");
    } else {
      this.removeInput("CONSTRUCTOR");
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
  getAttributeInputs: function() {
    return this.attributeInputs;
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
    this.changeScope();
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
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]);
    }
    this.setNextStatement(true);
    this.setPreviousStatement(true);
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
    return ["Constructor", this.arguments_, false];
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
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
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
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
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
    this.initColour();
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  },
  initColour: function() {
    console.log(this);
    if (this.mutatorParentBlock) {
      var currentBlock = this.mutatorParentBlock;
      var className = currentBlock.getClassDef();
      var classBlock = Blockly.Class.getClassByName(currentBlock.workspace, className);
      this.setColour(classBlock.getColour());
    } else {
      this.setColour(20);
    }
  }
};
Blockly.Blocks["class_mutator"] = {
  init: function() {
    this.appendDummyInput().appendField("class");
    this.appendStatementInput("STACK");
    this.appendDummyInput("CONSTR_INPUT")
      .appendField("Konstruktor")
      .appendField(new Blockly.FieldCheckbox("FALSE"), "CONSTR");
    this.initColour();
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  },
  initColour: function() {
    console.log(this);
    var currentBlock = this.mutatorParentBlock;
    var className = currentBlock.getClassDef();
    var classBlock = Blockly.Class.getClassByName(currentBlock.workspace, className);
    this.setColour(classBlock.getColour());
  }
};
