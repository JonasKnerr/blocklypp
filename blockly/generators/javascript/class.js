goog.provide("Blockly.JavaScript.class");

goog.require("Blockly.JavaScript");
//goog.require("Blockly.Class");

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
  var code = "class " + className + "{\n";
  var attributes = [];
  for (var i = 1; i < block.attributeCount + 1; i++) {
    attributes[i - 1] =
      Blockly.JavaScript.valueToCode(block, "attribute" + i, Blockly.JavaScript.ORDER_COMMA) ||
      "null";
  }

  var constr = block.getConstructor();
  if (constr) {
    var constructor_vars = constr.getVars();
    var branch = Blockly.JavaScript.statementToCode(constr, "STACK");

    //generate code for the constructor
    code += " constructor (" + constructor_vars.join(", ") + "){\n";
    for (var i = 0; i < attributes.length; i++) {
      code += "  " + attributes[i] + ";\n";
    }
    code += branch + " }\n\n";
  } else {
    /*TODO: Was passiert wenn kein Konstruktor existiert???*/
    code += " /*default Constructor */\n constructor(){\n";
    for (var i = 0; i < attributes.length; i++) {
      code += "  " + attributes[i] + ";\n";
    }
    code += "}\n\n";
  }

  //generates code for all methods
  var methods = Blockly.Class.getMethods(block.workspace, className);
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].getProcedureDef()[0];
    var branch = Blockly.JavaScript.statementToCode(methods[i], "STACK");
    var vars = methods[i].getVars();

    var returnValue =
      Blockly.JavaScript.valueToCode(methods[i], "RETURN", Blockly.JavaScript.ORDER_NONE) || "";
    if (returnValue) {
      returnValue = Blockly.JavaScript.INDENT + "return " + returnValue + ";\n";
    }

    code += " " + name + "(" + vars.join(", ") + "){\n" + branch + returnValue + "}\n\n";
  }
  code += "}\n";
  Blockly.JavaScript.definitions_["%" + name] = code;
  return null;
};

Blockly.JavaScript["class_get_instance"] = function(block) {
  var instanceName = block.getInstanceDef()[1];
  var className = block.getInstanceDef()[0];
  var args = [];
  for (var i = 0; i < block.args; i++) {
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
  if (block.typeOfValue == "method") {
    var args = [];
    for (var i = 0; i < block.args; i++) {
      args[i] =
        Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
    }
    var code = instanceName + "." + methodName + "(" + args.join(", ") + ");\n";
  } else {
    var code = instanceName + "." + methodName + ";\n";
  }
  return code;
};

Blockly.JavaScript["class_instance_output"] = function(block) {
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
  if (block.typeOfValue == "method") {
    var args = [];
    for (var i = 0; i < block.args; i++) {
      args[i] =
        Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
    }
    var code = instanceName + "." + methodName + "(" + args.join(", ") + ")";
  } else {
    var code = instanceName + "." + methodName;
  }
  return [code, Blockly.JavaScript.ORDER_NONE];
};
