/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Variable blocks for Blockly.

 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author duzc2dtw@gmail.com (Du Tian Wei)
 */
"use strict";

goog.provide("Blockly.Constants.VariablesDynamic");

goog.require("Blockly.Blocks");
goog.require("Blockly");

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['VARIABLES_DYNAMIC_HUE']. (2018 April 5)
 */
Blockly.Constants.VariablesDynamic.HUE = 310;

var variable_get_dynamic_json = {
  message0: "%1",
  args0: [
    {
      type: "field_variable",
      name: "VAR",
      variable: "%{BKY_VARIABLES_DEFAULT_NAME}"
    }
  ],
  output: null,
  colour: "%{BKY_VARIABLES_DYNAMIC_HUE}",
  helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
  tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
  extensions: ["contextMenu_variableDynamicSetterGetter"]
};
// Block for variable setter.
var variables_set_dynamic_json = {
  type: "variables_set_dynamic",
  message0: "%{BKY_VARIABLES_SET}",
  args0: [
    {
      type: "field_variable",
      name: "VAR",
      variable: "%{BKY_VARIABLES_DEFAULT_NAME}"
    },
    {
      type: "input_value",
      name: "VALUE"
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: "%{BKY_VARIABLES_DYNAMIC_HUE}",
  tooltip: "%{BKY_VARIABLES_SET_TOOLTIP}",
  helpUrl: "%{BKY_VARIABLES_SET_HELPURL}",
  extensions: ["contextMenu_variableDynamicSetterGetter"]
}; // END JSON EXTRACT (Do not delete this comment.)

Blockly.Blocks["variables_get_dynamic"] = {
  init: function() {
    this.jsonInit(variable_get_dynamic_json);
    this.varType = "";
    this.varTypeIsSet = false;
    this.methods = [];
    this.classVariables = [];
    this.args = 0;
    this.curValue;
  },
  onchange: function() {
    console.log("variable_get_dynamic");
    if (!this.isInFlyout) {
      if (!this.varTypeIsSet) {
        var id = this.getFieldValue("VAR");
        var variableModel = this.workspace.getVariableById(id);
        var varType = variableModel.type;
        this.varType = varType;
        var classBlock = Blockly.Class.getClassByName(this.workspace, varType);
        if (classBlock) {
          this.setColour(classBlock.getColour());
        }
        if (variableModel.typeSet) this.varTypeIsSet = true;
        console.log(varType);
      }
    }
    if (this.varType != "" && this.varTypeIsSet) {
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
  },
  setType: function(isReturn) {
    if (this.varType != "" && this.varTypeIsSet) {
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
    }
  },
  getInstanceName: function() {
    if (this.varType != "" && this.varTypeIsSet) {
      return this.name;
    }
  },
  getClassName: function() {
    if (this.varType != "" && this.varTypeIsSet) {
      return this.varType;
    }
  },
  getCurrentMethod: function() {
    if (this.varType != "" && this.varTypeIsSet) {
      return this.curValue;
    }
  },
  renameClass: function(oldName, newName) {
    if (this.varType != "" && this.varTypeIsSet) {
      if (Blockly.Names.equals(oldName, this.varType)) {
        this.varType = newName;
      }
    }
  },
  update: function(oldName, legalName) {
    if (this.varType != "" && this.varTypeIsSet) {
      this.getDropDown(oldName, legalName);
    }
  },
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
          // console.log("oldName:    " + oldName);
          // console.log("newName       " + newName);
          // console.log("this.curValue:   " + this.curValue);

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
  }
};
/**
 * Mixin to add context menu items to create getter/setter blocks for this
 * setter/getter.
 * Used by blocks 'variables_set_dynamic' and 'variables_get_dynamic'.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN = {
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Getter blocks have the option to create a setter block, and vice versa.
    if (!this.isInFlyout) {
      var opposite_type;
      var contextMenuMsg;
      var id = this.getFieldValue("VAR");
      var variableModel = this.workspace.getVariableById(id);
      var varType = variableModel.type;
      if (this.type == "variables_get_dynamic") {
        opposite_type = "variables_set_dynamic";
        contextMenuMsg = Blockly.Msg["VARIABLES_GET_CREATE_SET"];
      } else {
        opposite_type = "variables_get_dynamic";
        contextMenuMsg = Blockly.Msg["VARIABLES_SET_CREATE_GET"];
      }

      var option = { enabled: this.workspace.remainingCapacity() > 0 };
      var name = this.getField("VAR").getText();
      option.text = contextMenuMsg.replace("%1", name);
      var xmlField = document.createElement("field");
      xmlField.setAttribute("name", "VAR");
      xmlField.setAttribute("variabletype", varType);
      xmlField.appendChild(document.createTextNode(name));
      var xmlBlock = document.createElement("block");
      xmlBlock.setAttribute("type", opposite_type);
      xmlBlock.appendChild(xmlField);
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    } else {
      if (this.type == "variables_get_dynamic" || this.type == "variables_get_reporter_dynamic") {
        var renameOption = {
          text: Blockly.Msg.RENAME_VARIABLE,
          enabled: true,
          callback: Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this)
        };
        var name = this.getField("VAR").getText();
        var deleteOption = {
          text: Blockly.Msg.DELETE_VARIABLE.replace("%1", name),
          enabled: true,
          callback: Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this)
        };
        options.unshift(renameOption);
        options.unshift(deleteOption);
      }
    }
  },
  onchange: function() {
    var id = this.getFieldValue("VAR");
    var variableModel = this.workspace.getVariableById(id);
    if (this.type == "variables_get_dynamic") {
      this.outputConnection.setCheck(variableModel.type);
    } else {
      this.getInput("VALUE").connection.setCheck(variableModel.type);
    }
  }
};

/**
 * Callback for rename variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to rename.
 * @return {!function()} A function that renames the variable.
 */
Blockly.Constants.VariablesDynamic.RENAME_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField("VAR").getVariable();
    Blockly.Variables.renameVariable(workspace, variable);
  };
};

/**
 * Callback for delete variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to delete.
 * @return {!function()} A function that deletes the variable.
 */
Blockly.Constants.VariablesDynamic.DELETE_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField("VAR").getVariable();
    workspace.deleteVariableById(variable.getId());
    workspace.refreshToolboxSelection();
  };
};

Blockly.Extensions.registerMixin(
  "contextMenu_variableDynamicSetterGetter",
  Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN
);
