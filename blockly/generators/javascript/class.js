goog.provide("Blockly.JavaScript.class");

goog.require("Blockly.JavaScript");
goog.require("Blockly.Class");

Blockly.JavaScript["class_function_return"] = function(block) {
  //Blockly.JavaScript["procedures_defreturn"];
};
Blockly.JavaScript["class_function_noreturn"] = function(block) {
  //Blockly.JavaScript["procedures_defreturn"];
};
/* Generates code for a class */
Blockly.JavaScript["class_class"] = function(block) {
  var className = Blockly.JavaScript.variableDB_.getName(
    block.getClassDef(),
    Blockly.Procedures.NAME_TYPE
  );
  var constr = block.getConstructor();
  if (constr) {
    var constructor_vars = constr.getVars();
    var branch = Blockly.JavaScript.statementToCode(constr, "STACK");

    //generate code for the constructor
    var code =
      "class " +
      className +
      "{\n constructor (" +
      constructor_vars.join(", ") +
      "){\n" +
      branch +
      " }\n\n";
  } else {
    /*TODO: Was passiert wenn kein Konstruktor existiert???*/
  }

  //generates code for all methods
  var methods = Blockly.Class.getMethods(block.workspace, className);
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].getProcedureDef()[0];
    var branch = Blockly.JavaScript.statementToCode(methods[i], "STACK");
    var vars = methods[i].getVars();

    code += " " + name + "(" + vars.join(", ") + "){\n" + branch + " }\n\n";
  }
  code += "}\n";
  return code;
};

Blockly.JavaScript["class_get_instance"] = function(block) {
  var instanceName = block.getInstanceDef()[1];
  var className = block.getInstanceDef()[0];
  var args = [];
  for (var i = 0; i < block.arguments; i++) {
    console.log(Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA));
    args[i] =
      Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
  }
  var code = "var " + instanceName + " = new " + className + "(" + args.join(", ") + "); \n";
  return code;
};

Blockly.JavaScript["class_instance"] = function(block) {
  console.log(Blockly.Xml.workspaceToDom(block.workspace));
  var instanceName = Blockly.JavaScript.variableDB_.getName(
    block.getInstanceName(),
    Blockly.Procedures.NAME_TYPE
  );
  var methodName = block.getCurrentMethod();
  var blocks = block.workspace.getAllBlocks(false);
  var methodBlock;

  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getProcedureDef) {
      if (blocks[i].getProcedureDef()[0] == methodName) {
        methodBlock = blocks[i];
      }
    }
  }
  var args = [];
  for (var i = 0; i < block.arguments; i++) {
    args[i] =
      Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
  }
  var code = instanceName + "." + methodName + "(" + args.join(", ") + ")\n";
  return code;
};
