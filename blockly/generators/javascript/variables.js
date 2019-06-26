/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";

goog.provide("Blockly.JavaScript.variables");

goog.require("Blockly.JavaScript");

Blockly.JavaScript["variables_get"] = function(block) {
  // Variable getter.
  //@Jonas Knerr
  var code = "";

  var name = Blockly.JavaScript.variableDB_.getName(
    block.getFieldValue("VAR"),
    Blockly.Variables.NAME_TYPE
  );
  console.log(block.varType);
  var opt_type = block.varType || "";
  var varBlock = block.workspace.getVariable(name, opt_type);
  console.log(block);
  console.log(name);
  console.log(varBlock);
  if (varBlock.getScope() != "global") {
    code = "this." + name;
  } else {
    code = name;
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["variables_set"] = function(block) {
  // Variable setter.#  var code = "";
  var opt_type = block.varType || "";
  var name = Blockly.JavaScript.variableDB_.getName(
    block.getFieldValue("VAR"),
    Blockly.Variables.NAME_TYPE
  );
  var varBlock = block.workspace.getVariable(name, opt_type);

  console.log(varBlock);
  var argument0 =
    Blockly.JavaScript.valueToCode(block, "VALUE", Blockly.JavaScript.ORDER_ASSIGNMENT) || "0";

  if (varBlock.getScope() != "global") {
    return "this." + name + " = " + argument0 + ";\n";
  } else {
    return name + " = " + argument0 + ";\n";
  }
};

//@Jonas Knerr

Blockly.JavaScript["object_variables_get"] = function(block) {
  var opt_type = block.varType || "";
  var instanceName = Blockly.JavaScript.variableDB_.getName(
    block.getFieldValue("VAR"),
    Blockly.Variables.NAME_TYPE
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
  console.log(block);
  if (block.typeOfValue == "method") {
    var args = [];
    for (var i = 0; i < block.args; i++) {
      args[i] =
        Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
    }
    var code = instanceName + "." + methodName + "(" + args.join(", ") + ")";
  } else {
    var code = instanceName + "." + methodName;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  }
  if (block.isReturn) {
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  } else {
    code += ";\n"
    return code;
  }
};
