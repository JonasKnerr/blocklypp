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
    if (blocks[i].getClassCall) {
      var className = blocks[i].getClassCall();
      if (className && Blockly.Names.equals(className, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};

Blockly.Class.mutateCallers = function(block) {
  callers = Blockly.Class.getCallers(block.getClassDef(), block.workspace);
  for (var i = 0; i < callers.length; i++) {
    callers[i].update();
  }
};

Blockly.Class.rename = function(name) {
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].renameClass) {
      blocks[i].renameClass(name);
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
  var usedClasses = Blockly.Class.allUsedClasses(workspace);
  for (var i = 0; i < usedClasses.length; i++) {
    var methods = Blockly.Class.getMethods(workspace, usedClasses[i]);

    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class");
    block.setAttribute("gap", 16);
    var nameField = Blockly.Xml.utils.createElement("field");
    nameField.setAttribute("name", "NAME");
    nameField.appendChild(Blockly.Xml.utils.createTextNode(usedClasses[i]));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  var instances = Blockly.Class.getInstances(workspace);
  for (var i = 0; i < usedClasses.length; i++) {
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "instance");
    block.setAttribute("gap", 16);
    if (instances.length > 0) {
      // var nameField = Blockly.Xml.utils.createElement("field");
      // nameField.setAttribute("name", "NAME");
      // nameField.appendChild(Blockly.Xml.utils.createTextNode(instances[i][0]));
      var instanceField = Blockly.Xml.utils.createElement("field");
      instanceField.setAttribute("name", "INSTANCE");
      instanceField.appendChild(Blockly.Xml.utils.createTextNode(instances[i][1]));
      block.appendChild(instanceField);
    }
    xmlList.push(block);
  }

  return xmlList;
};
