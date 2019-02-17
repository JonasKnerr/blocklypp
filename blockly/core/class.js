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

//TODO: Methoden für spezifische Klassen zurückgeben
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
          methods.push([currentBlock.getFieldValue("NAME"), "FUNCTION_" + currentBlock.getFieldValue("NAME")]);
          console.log(currentBlock);
          while (currentBlock.getNextBlock()) {
            nextBlock = currentBlock.getNextBlock();
            methods.push([nextBlock.getFieldValue("NAME"), "FUNCTION_" + nextBlock.getFieldValue("NAME")]);
            currentBlock = nextBlock;
          }
        }
      }
    }
    break;
  }
  return methods;
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
    var block = Blockly.Xml.utils.createElement("block");
    block.setAttribute("type", "class");
    block.setAttribute("gap", 16);
    var nameField = Blockly.Xml.utils.createElement("field");
    nameField.setAttribute("name", "NAME");
    /**TODO: Blockly Message einfügen*/
    console.log(usedClasses[i]);
    nameField.appendChild(Blockly.Xml.utils.createTextNode(usedClasses[i]));
    block.appendChild(nameField);
    xmlList.push(block);
    // var methods = Blockly.Xml.utils.createElement("statement");
    // for (var i = 0; i < methods.length; i++) {
    //   methods.appendChild(Blockly.Xml.utils.createTextNode(methods[i]));
    // }
    // block.appendChild(methods);
    // console.log(block);
  }
  return xmlList;
};
