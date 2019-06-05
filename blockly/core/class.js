/*
 *@Jonas Knerr
 */
goog.provide("Blockly.Class");

goog.require("Blockly.VariableMap");
goog.require("Blockly.Blocks");
goog.require("Blockly.constants");
goog.require("Blockly.Events.BlockChange");
goog.require("Blockly.Field");
goog.require("Blockly.Names");
goog.require("Blockly.Workspace");
goog.require("Blockly.Xml");
goog.require("Blockly.Xml.utils");

/*
 * Find all user created classes in a workspace
 *@param workspace root workspace
 *@return classes a list of all classes
 */
Blockly.Class.allUsedClasses = function(workspace) {
  var blocks = workspace.getAllBlocks(false);
  var classes = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getClassDef) {
      classes.push(blocks[i].getClassDef());
    }
  }
  return classes;
};

Blockly.Class.getInstances = function(workspace) {
  var blocks = workspace.getAllBlocks(false);
  var instances = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getInstanceDef) {
      instances.push(blocks[i].getInstanceDef());
    }
  }
  return instances;
};
/**
 *   Returns an two dimensional array with the name of all Methods form a specific classname
 *   first part fo the array is the function name, second part is "FUNCTION_" + functionname
 *   to get the dropdown menus going
 *   @param {BLOCKLY.Workspace} workspace  workspace to search for usedClasses
 *   @param {string} classname name of the class to search for
 *   @return {array} 2-dim array
 *
 */
Blockly.Class.getMethods = function(workspace, classname) {
  var methods = [];
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getStatement) {
      if (classname == blocks[i].getClassDef()) {
        var currentBlock;
        var nextBlock;
        currentBlock = blocks[i].getStatement();
        if (currentBlock) {
          //methods.push([currentBlock.getFieldValue("NAME"), "FUNCTION_" + currentBlock.getFieldValue("NAME")]);
          methods.push(currentBlock);
          while (currentBlock.getNextBlock()) {
            nextBlock = currentBlock.getNextBlock();
            //methods.push([nextBlock.getFieldValue("NAME"), "FUNCTION_" + nextBlock.getFieldValue("NAME")]);
            methods.push(nextBlock);
            currentBlock = nextBlock;
          }
        }
      }
    }
    break;
  }
  return methods;
};
/**
 * Returns all class variables of a class
 */
Blockly.Class.getClassVariables = function(workspace, classname) {
  var variables_ = [];
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getStatement) {
      if (classname == blocks[i].getClassDef()) {
        variables_ = blocks[i].getAttributeInputs();
      }
    }
  }
  return variables_;
};
/**
 * Returns all calling functions of a class
 */
Blockly.Class.getCallers = function(name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getClassName) {
      var className = blocks[i].getClassName();
      if (className && Blockly.Names.equals(className, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};
/*
 * Mutates all calling blocks if something changes in a control_class block
 */
Blockly.Class.mutateCallers = function(block) {
  callers = Blockly.Class.getCallers(block.getClassDef(), block.workspace);
  for (var i = 0; i < callers.length; i++) {
    callers[i].update();
  }
};

/**
 * Ensure two identically-named classes don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */

Blockly.Class.findLegalName = function(name, block, type) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  while (!Blockly.Class.isLegalName_(name, block.workspace, block, type)) {
    // Collision with another procedure.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += "2";
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this class have a legal name?  Illegal names include names of
 * classes already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 * @private
 */
Blockly.Class.isLegalName_ = function(name, workspace, opt_exclude, type) {
  return !Blockly.Class.isNameUsed(name, workspace, opt_exclude, type);
};
/**
 * Return if the given name is already a procedure name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
Blockly.Class.isNameUsed = function(name, workspace, opt_exclude, type) {
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (type == "class") {
      if (blocks[i].getClassDef) {
        var procName = blocks[i].getClassDef();
        if (Blockly.Names.equals(procName, name)) {
          return true;
        }
      }
    }
    if (type == "instance") {
      if (blocks[i].getInstanceDef) {
        var procName = blocks[i].getInstanceDef()[1];
        if (Blockly.Names.equals(procName, name)) {
          return true;
        }
      }
    }
  }
  return false;
};

/*
 *Function to rename classes, checks for duplicatet classes and renames
 *all attached classes
 *@param {string} name The class name
 *@return {string} legalName
 */
Blockly.Class.renameClass = function(name) {
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  var legalName = Blockly.Class.findLegalName(name, this.sourceBlock_, "class");
  var oldName = this.text_;
  if (oldName != name && oldName != legalName) {
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameClass) {
        blocks[i].renameClass(oldName, legalName);
      }
      if (blocks[i].setOldName) {
        blocks[i].setOldName(oldName);
      }
    }
  }
  Blockly.Variables.renameScope(this.sourceBlock_.workspace, oldName, legalName);
  return legalName;
};

Blockly.Class.renameInstance = function(name) {
  var oldName = this.text_;
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  var legalName = Blockly.Class.findLegalName(name, this.sourceBlock_, "instance");
  if (oldName != name && oldName != legalName) {
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameInstance) {
        console.log("rename");
        blocks[i].renameInstance(oldName, legalName);
      }
    }
  }
  return legalName;
};

Blockly.Class.getConstructor = function(workspace, className) {
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getConstructor) {
      if (blocks[i].getClassDef() == className) {
        return blocks[i].getConstructor();
      }
    }
  }
  return false;
};

Blockly.Class.getMethodAttributes = function(workspace, methodName) {
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getProcedureDef) {
      if (blocks[i].getProcedureDef()[0] == methodName) {
        //getProcedureDef()[1] is a array with all arguments_
        return blocks[i].getProcedureDef()[1];
      }
    }
  }
  return false;
};

Blockly.Class.flyoutCategory = function(workspace) {
  var xmlList = [];
  if (Blockly.Blocks["class_class"]) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class_class");
    block.setAttribute("gap", 16);
    var nameField = Blockly.Xml.utils.createElement("field");
    nameField.setAttribute("name", "NAME");
    /**TODO: Blockly Message einfügen*/
    nameField.appendChild(Blockly.Xml.utils.createTextNode("Klasse"));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks["class_function_return"]) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class_function_return");
    block.setAttribute("gap", 16);
    var nameField = Blockly.Xml.utils.createElement("field");
    nameField.setAttribute("name", "NAME");
    /**TODO: Blockly Message einfügen*/
    nameField.appendChild(Blockly.Xml.utils.createTextNode("Funktion"));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks["class_function_noreturn"]) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class_function_noreturn");
    block.setAttribute("gap", 16);
    var nameField = Blockly.Xml.utils.createElement("field");
    nameField.setAttribute("name", "NAME");
    /**TODO: Blockly Message einfügen*/
    nameField.appendChild(Blockly.Xml.utils.createTextNode("Funktion"));
    block.appendChild(nameField);
    xmlList.push(block);
  }

  if (Blockly.Blocks["class_constructor"]) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class_constructor");
    block.setAttribute("gap", 16);
    xmlList.push(block);
  }

  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute("gap", 24);
  }

  function populateClasses(classList) {
    for (var i = 0; i < classList.length; i++) {
      var name = classList[i];

      var block = Blockly.Xml.utils.createElement("block");
      block.setAttribute("type", "class_get_instance");
      block.setAttribute("gap", 16);
      var mutation = Blockly.Xml.utils.createElement("mutation");
      mutation.setAttribute("name", name);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }

  function populateInstances(instanceList) {
    for (var i = 0; i < instanceList.length; i++) {
      //block for next and prev instances
      var name = instanceList[i][1];
      var className = instanceList[i][0];
      var block = Blockly.Xml.utils.createElement("block");
      block.setAttribute("type", "class_instance");
      block.setAttribute("gap", 16);
      var mutation = Blockly.Xml.utils.createElement("mutation");
      mutation.setAttribute("name", name);
      mutation.setAttribute("class", className);
      block.appendChild(mutation);
      xmlList.push(block);
      //Block for output instances
      // var outName = instanceList[i][1];
      // var outClassName = instanceList[i][0];
      // var outBlock = Blockly.Xml.utils.createElement("block");
      // outBlock.setAttribute("type", "class_instance_output");
      // outBlock.setAttribute("gap", 16);
      // var outMutation = Blockly.Xml.utils.createElement("mutation");
      // outMutation.setAttribute("name", outName);
      // outMutation.setAttribute("class", outClassName);
      // outBlock.appendChild(outMutation);
      // xmlList.push(outBlock);
    }
  }

  var instances = Blockly.Class.getInstances(workspace);
  var classes = Blockly.Class.allUsedClasses(workspace);
  populateInstances(instances);
  populateClasses(classes);

  return xmlList;
};
