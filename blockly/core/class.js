goog.provide("Blockly.Class");

goog.require("Blockly.Blocks");
goog.require("Blockly.constants");
goog.require("Blockly.Events.BlockChange");
goog.require("Blockly.Field");
goog.require("Blockly.Names");
goog.require("Blockly.Workspace");
goog.require("Blockly.Xml");
goog.require("Blockly.Xml.utils");

/**
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

Blockly.Class.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  while (!Blockly.Class.isLegalName_(name, block.workspace, block)) {
    // Collision with another procedure.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += "2";
    } else {
      console.log("R");
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
Blockly.Class.isLegalName_ = function(name, workspace, opt_exclude) {
  return !Blockly.Class.isNameUsed(name, workspace, opt_exclude);
};
/**
 * Return if the given name is already a procedure name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
Blockly.Class.isNameUsed = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].getClassDef) {
      var procName = blocks[i].getClassDef();
      if (Blockly.Names.equals(procName, name)) {
        return true;
      }
    }
  }
  return false;
};

Blockly.Class.renameClass = function(name) {
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  var legalName = Blockly.Class.findLegalName(name, this.sourceBlock_);
  var oldName = this.text_;
  // console.log(oldName);
  // console.log(typeof oldName);
  if (oldName != name && oldName != legalName) {
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameClass) {
        blocks[i].renameClass(oldName, legalName);
      }
    }
  }
  return legalName;
};

Blockly.Class.renameInstance = function(name) {
  var oldName = this.text_;
  ame = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  if (oldName != name) {
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameInstance) {
        blocks[i].renameInstance(oldName, name);
      }
    }
  }
};
Blockly.Class.flyoutCategory = function(workspace) {
  var xmlList = [];
  if (Blockly.Blocks["control_class"]) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "control_class");
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

  function populateClasses(classList) {
    for (var i = 0; i < classList.length; i++) {
      var name = classList[i];

      var block = Blockly.Xml.utils.createElement("block");
      block.setAttribute("type", "class");
      block.setAttribute("gap", 16);
      var mutation = Blockly.Xml.utils.createElement("mutation");
      mutation.setAttribute("name", name);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }

  function populateInstances(instanceList) {
    for (var i = 0; i < instanceList.length; i++) {
      var name = instanceList[i][1];
      var className = instanceList[i][0];
      var block = Blockly.Xml.utils.createElement("block");
      block.setAttribute("type", "instance");
      block.setAttribute("gap", 16);
      var mutation = Blockly.Xml.utils.createElement("mutation");
      mutation.setAttribute("name", name);
      mutation.setAttribute("class", className);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }

  var instances = Blockly.Class.getInstances(workspace);
  var classes = Blockly.Class.allUsedClasses(workspace);
  populateInstances(instances);
  populateClasses(classes);

  return xmlList;
};
