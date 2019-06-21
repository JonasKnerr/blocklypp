/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";

/**
 * @name Blockly.Variables
 * @namespace
 */
goog.provide("Blockly.Variables");

goog.require("Blockly.Blocks");
goog.require("Blockly.constants");
goog.require("Blockly.VariableModel");
goog.require("Blockly.Workspace");
goog.require("Blockly.Xml");
goog.require("Blockly.Class");
//goog.require("Blockly.Constants");

goog.require("goog.string");

/**
 * Constant to separate variable names from procedures and generated functions
 * when running generators.
 * @deprecated Use Blockly.VARIABLE_CATEGORY_NAME
 */
Blockly.Variables.NAME_TYPE = Blockly.VARIABLE_CATEGORY_NAME;

/**
 * Find all user-created variables that are in use in the workspace.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 * @param {!Blockly.Workspace} ws The workspace to search for variables.
 * @return {!Array.<!Blockly.VariableModel>} Array of variable models.
 */
Blockly.Variables.allUsedVarModels = function(ws) {
  var blocks = ws.getAllBlocks(false);
  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var blockVariables = blocks[x].getVarModels();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var variable = blockVariables[y];
        if (variable.getId()) {
          variableHash[variable.getId()] = variable;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var id in variableHash) {
    variableList.push(variableHash[id]);
  }
  return variableList;
};

/**
 * Find all user-created variables that are in use in the workspace and return
 * only their names.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 * @deprecated January 2018
 */
Blockly.Variables.allUsedVariables = function() {
  console.warn(
    "Deprecated call to Blockly.Variables.allUsedVariables. " +
      "Use Blockly.Variables.allUsedVarModels instead.\nIf this is a major " +
      "issue please file a bug on GitHub."
  );
};

/**
 * @private
 * @type {Object<string,boolean>}
 */
Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_ = {};

/**
 * Find all developer variables used by blocks in the workspace.
 * Developer variables are never shown to the user, but are declared as global
 * variables in the generated code.
 * To declare developer variables, define the getDeveloperVariables function on
 * your block and return a list of variable names.
 * For use by generators.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {!Array.<string>} A list of non-duplicated variable names.
 */
Blockly.Variables.allDeveloperVariables = function(workspace) {
  var blocks = workspace.getAllBlocks(false);
  var hash = {};
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var getDeveloperVariables = block.getDeveloperVariables;
    if (!getDeveloperVariables && block.getDeveloperVars) {
      // August 2018: getDeveloperVars() was deprecated and renamed
      // getDeveloperVariables().
      getDeveloperVariables = block.getDeveloperVars;
      if (!Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_[block.type]) {
        console.warn(
          "Function getDeveloperVars() deprecated. Use " +
            "getDeveloperVariables() (block type '" +
            block.type +
            "')"
        );
        Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_[block.type] = true;
      }
    }
    if (getDeveloperVariables) {
      var devVars = getDeveloperVariables();
      for (var j = 0; j < devVars.length; j++) {
        hash[devVars[j]] = devVars[j];
      }
    }
  }

  // Flatten the hash into a list.
  var list = [];
  for (var name in hash) {
    list.push(hash[name]);
  }
  return list;
};

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  var blocks = workspace.getAllBlocks();
  var classList = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getClassDef) classList.push(blocks[i].getClassDef());
  }

  var classes = Blockly.Class.allUsedClasses(workspace);

  var xmlList = [];
  var button = document.createElement("button");
  button.setAttribute("text", "%{BKY_NEW_VARIABLE}");
  button.setAttribute("callbackKey", "CREATE_VARIABLE");

  workspace.registerButtonCallback("CREATE_VARIABLE", function(button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
  });
  xmlList.push(button);

  for (var i = 0; i < classes.length; i++) {
    var objectButton = document.createElement("button");
    var buttonString = "create " + classes[i] + " Variable ...";
    objectButton.setAttribute("text", buttonString);
    objectButton.setAttribute("callbackKey", classes[i]);
    var className = classes[i];
    workspace.registerButtonCallback(classes[i], function(objectButton) {
      Blockly.Variables.createVariableButtonHandler(
        objectButton.getTargetWorkspace(),
        false,
        false,
        false,
        className
      );
    });

    xmlList.push(objectButton);
  }
  var blockList = Blockly.Variables.flyoutCategoryBlocks(workspace);
  //blockList.slice(0, 3);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategoryBlocks = function(workspace) {
  var variableModelList = workspace.getVariablesOfType("");
  variableModelList.sort(Blockly.VariableModel.compareByName);
  var varTypes = workspace.getVariableTypes();

  var xmlList = [];
  if (variableModelList.length > 0) {
    var firstVariable = variableModelList[0];
    if (Blockly.Blocks["variables_set"]) {
      var gap = Blockly.Blocks["math_change"] ? 8 : 24;
      var blockText =
        "<xml>" +
        '<block type="variables_set" gap="' +
        gap +
        '">' +
        Blockly.Variables.generateVariableFieldXmlString(firstVariable) +
        "</block>" +
        "</xml>";
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }
    if (Blockly.Blocks["math_change"]) {
      var gap = Blockly.Blocks["variables_get"] ? 20 : 8;
      var blockText =
        "<xml>" +
        '<block type="math_change" gap="' +
        gap +
        '">' +
        Blockly.Variables.generateVariableFieldXmlString(firstVariable) +
        '<value name="DELTA">' +
        '<shadow type="math_number">' +
        '<field name="NUM">1</field>' +
        "</shadow>" +
        "</value>" +
        "</block>" +
        "</xml>";
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }

    for (var i = 0, variable; (variable = variableModelList[i]); i++) {
      if (Blockly.Blocks["variables_get"]) {
        var blockText =
          "<xml>" +
          '<block type="variables_get" gap="8">' +
          Blockly.Variables.generateVariableFieldXmlString(variable) +
          "</block>" +
          "</xml>";
        var block = Blockly.Xml.textToDom(blockText).firstChild;
        xmlList.push(block);
      }
    }
  }
  for (var i = 0; i < varTypes.length; i++) {
    if (varTypes[i] == "") continue;
    var colour = Blockly.Class.getClassByName(workspace, varTypes[i]).getColour();
    var variableList = workspace.getVariablesOfType(varTypes[i]);
    if (variableList.length > 0) {
      //TODO: Add label or something between different blocks
      //  var labelText = "<label text = " + varTypes[i] + "></label>";
      var firstVariable = variableList[0];

      if (Blockly.Blocks["variables_set"]) {
        var blockText =
          "<xml>" +
          '<block type="variables_set" gap="' +
          20 +
          '">' +
          Blockly.Variables.generateVariableFieldXmlString(firstVariable) +
          "</block>" +
          "</xml>";
        var block = Blockly.Xml.textToDom(blockText).firstChild;
        xmlList.push(block);
      }

      for (var j = 0, variable; (variable = variableList[j]); j++) {
        if (Blockly.Blocks["variables_get"]) {
          var blockText =
            "<xml>" +
            '<block type="variables_get" gap="8">' +
            Blockly.Variables.generateVariableFieldXmlString(variable) +
            "</block>" +
            "</xml>";
          var block = Blockly.Xml.textToDom(blockText).firstChild;
          xmlList.push(block);
        }

        if (Blockly.Blocks["object_variables_get"]) {
          var blockText =
            "<xml>" +
            '<block type="object_variables_get" gap="8">' +
            Blockly.Variables.generateVariableFieldXmlString(variable) +
            "</block>" +
            "</xml>";
          var block = Blockly.Xml.textToDom(blockText).firstChild;
          xmlList.push(block);
        }
      }
    }
  }
  return xmlList;
};

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
 * @return {string} New variable name.
 */
Blockly.Variables.generateUniqueName = function(workspace) {
  var variableList = workspace.getAllVariables();
  var newName = "";
  if (variableList.length) {
    var nameSuffix = 1;
    var letters = "ijkmnopqrstuvwxyzabcdefgh"; // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < variableList.length; i++) {
        if (variableList[i].name.toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = "i";
  }
  return newName;
};

/**
 * Handles "Create Variable" button in the default variables toolbox category.
 * It will prompt the user for a varibale name, including re-prompts if a name
 * is already in use among the workspace's variables.
 *
 * Custom button handlers can delegate to this function, allowing variables
 * types and after-creation processing. More complex customization (e.g.,
 * prompting for variable type) is beyond the scope of this function.
 *
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will be passed an
 *     acceptable new variable name, or null if change is to be aborted (cancel
 *     button), or undefined if an existing variable was chosen.
 * @param {string=} opt_type The type of the variable like 'int', 'string', or
 *     ''. This will default to '', which is a specific type.
 */
Blockly.Variables.createVariableButtonHandler = function(
  workspace,
  opt_callback,
  opt_type,
  opt_scope,
  opt_obj
) {
  var type = opt_type || "";
  if (!opt_obj) {
    var opt_obj = false;
  }
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg["NEW_VARIABLE_TITLE"], defaultName, opt_obj, function(
      text
    ) {
      var varName = text.varName;
      var className = text.className || "";
      if (varName) {
        var existing = Blockly.Variables.nameUsedWithAnyType_(varName, workspace);
        if (existing) {
          var lowerCase = varName.toLowerCase();
          if (existing.type == type || existing.type == className) {
            var msg = Blockly.Msg["VARIABLE_ALREADY_EXISTS"].replace("%1", lowerCase);
          } else {
            var msg = Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE"];
            msg = msg.replace("%1", lowerCase).replace("%2", existing.type);
          }
          Blockly.alert(msg, function() {
            promptAndCheckWithAlert(varName); // Recurse
          });
        } else {
          // No conflict
          //needs to be adjustet for dynamic typing
          workspace.createVariable(varName, className, false, opt_scope);
          if (opt_callback) {
            opt_callback(text);
          }
        }
      } else {
        // User canceled prompt.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    });
  };
  promptAndCheckWithAlert("");
};
goog.exportSymbol(
  "Blockly.Variables.createVariableButtonHandler",
  Blockly.Variables.createVariableButtonHandler
);

/**
 * Original name of Blockly.Variables.createVariableButtonHandler(..).
 * @deprecated Use Blockly.Variables.createVariableButtonHandler(..).
 *
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will be passed an
 *     acceptable new variable name, or null if change is to be aborted (cancel
 *     button), or undefined if an existing variable was chosen.
 * @param {string=} opt_type The type of the variable like 'int', 'string', or
 *     ''. This will default to '', which is a specific type.
 */
Blockly.Variables.createVariable = Blockly.Variables.createVariableButtonHandler;
goog.exportSymbol("Blockly.Variables.createVariable", Blockly.Variables.createVariable);

/**
 * Rename a variable with the given workspace, variableType, and oldName.
 * @param {!Blockly.Workspace} workspace The workspace on which to rename the
 *     variable.
 * @param {Blockly.VariableModel} variable Variable to rename.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
Blockly.Variables.renameVariable = function(
  workspace,
  variable,
  opt_class,
  opt_change,
  opt_callback
) {
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    var promptText = Blockly.Msg["RENAME_VARIABLE_TITLE"].replace("%1", variable.name);
    Blockly.Variables.promptName(promptText, defaultName, opt_class, function(newName) {
      if (newName.varName) {
        var existing = Blockly.Variables.nameUsedWithOtherType_(
          newName.varName,
          variable.type,
          workspace
        );
        if (existing) {
          var msg = Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE"]
            .replace("%1", newName.varName.toLowerCase())
            .replace("%2", existing.type);
          Blockly.alert(msg, function() {
            promptAndCheckWithAlert(newName.varName); // Recurse
          });
        } else {
          workspace.renameVariableById(variable.getId(), newName.varName);
          if (opt_callback) {
            opt_callback(newName.varName);
          }
        }
      } else {
        // User canceled prompt.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    });
  };
  promptAndCheckWithAlert("");
};

/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will return the new
 *     variable name, or null if the user picked something illegal.
 */
Blockly.Variables.promptName = function(promptText, defaultText, opt_obj, callback) {
  Blockly.prompt(promptText, defaultText, opt_obj, function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar[0]) {
      newVar[0] = newVar[0].replace(/[\s\xa0]+/g, " ").replace(/^ | $/g, "");
      if (newVar[0] == Blockly.Msg["RENAME_VARIABLE"] || newVar[0] == Blockly.Msg["NEW_VARIABLE"]) {
        // Ok, not ALL names are legal...
        newVar[0] = null;
      }
    }
    if (newVar[1]) {
      newVar[1] = newVar[1].replace(/[\s\xa0]+/g, " ").replace(/^ | $/g, "");
    }
    callback(newVar);
  });
};

/**
 * Check whether there exists a variable with the given name but a different
 * type.
 * @param {string} name The name to search for.
 * @param {string} type The type to exclude from the search.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.
 * @return {?Blockly.VariableModel} The variable with the given name and a
 *     different type, or null if none was found.
 * @private
 */
Blockly.Variables.nameUsedWithOtherType_ = function(name, type, workspace) {
  var allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (var i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() == name && variable.type != type) {
      return variable;
    }
  }
  return null;
};

/**
 * Check whether there exists a variable with the given name of any type.
 * @param {string} name The name to search for.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.
 * @return {?Blockly.VariableModel} The variable with the given name,
 *     or null if none was found.
 * @private
 */
Blockly.Variables.nameUsedWithAnyType_ = function(name, workspace) {
  var allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (var i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() == name) {
      return variable;
    }
  }
  return null;
};

/**
 * Generate XML string for variable field.
 * @param {!Blockly.VariableModel} variableModel The variable model to generate
 *     an XML string from.
 * @return {string} The generated XML.
 * @package
 */
Blockly.Variables.generateVariableFieldXmlString = function(variableModel) {
  // The variable name may be user input, so it may contain characters that
  // need to be escaped to create valid XML.
  var typeString = variableModel.type;

  if (typeString == "") {
    typeString = "''";
  }
  var text =
    '<field name="VAR" id="' +
    variableModel.getId() +
    '" variabletype="' +
    goog.string.htmlEscape(typeString) +
    '">' +
    goog.string.htmlEscape(variableModel.name) +
    "</field>";
  return text;
};

/**
 * Generate DOM objects representing a variable field.
 * @param {!Blockly.VariableModel} variableModel The variable model to
 *     represent.
 * @return {Element} The generated DOM.
 * @public
 */
Blockly.Variables.generateVariableFieldDom = function(variableModel) {
  var xmlFieldString = Blockly.Variables.generateVariableFieldXmlString(variableModel);
  var text = "<xml>" + xmlFieldString + "</xml>";
  var dom = Blockly.Xml.textToDom(text);
  var fieldDom = dom.firstChild;
  return fieldDom;
};

/**
 * Helper function to look up or create a variable on the given workspace.
 * If no variable exists, creates and returns it.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up or create the variable, or null.
 * @param {string=} opt_name The string to use to look up or create the
 *     variable.
 * @param {string=} opt_type The type to use to look up or create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 */
Blockly.Variables.getOrCreateVariablePackage = function(workspace, id, opt_name, opt_type) {
  var variable = Blockly.Variables.getVariable(workspace, id, opt_name, opt_type);
  if (!variable) {
    variable = Blockly.Variables.createVariable_(workspace, id, opt_name, opt_type);
  }
  return variable;
};

/**
 * Look up  a variable on the given workspace.
 * Always looks in the main workspace before looking in the flyout workspace.
 * Always prefers lookup by ID to lookup by name + type.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up the variable, or null.
 * @param {string=} opt_name The string to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @param {string=} opt_type The type to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @return {?Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination, or null if not found.
 * @package
 */
Blockly.Variables.getVariable = function(workspace, id, opt_name, opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Try to just get the variable, by ID if possible.
  if (id) {
    // Look in the real variable map before checking the potential variable map.
    var variable = workspace.getVariableById(id);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariableById(id);
    }
    if (variable) {
      return variable;
    }
  }
  // If there was no ID, or there was an ID but it didn't match any variables,
  // look up by name and type.
  if (opt_name) {
    if (opt_type == undefined) {
      throw Error("Tried to look up a variable by name without a type");
    }
    // Otherwise look up by name and type.
    var variable = workspace.getVariable(opt_name, opt_type);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariable(opt_name, opt_type);
    }
  }
  return variable;
};

/**
 * Helper function to create a variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the
 * variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to create the variable, or null.
 * @param {string=} opt_name The string to use to create the variable.
 * @param {string=} opt_type The type to use to create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 * @private
 */
Blockly.Variables.createVariable_ = function(workspace, id, opt_name, opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Variables without names get uniquely named for this workspace.
  if (!opt_name) {
    var ws = workspace.isFlyout ? workspace.targetWorkspace : workspace;
    opt_name = Blockly.Variables.generateUniqueName(ws);
  }

  // Create a potential variable if in the flyout.
  if (potentialVariableMap) {
    var variable = potentialVariableMap.createVariable(opt_name, opt_type, id);
  } else {
    // In the main workspace, create a real variable.
    var variable = workspace.createVariable(opt_name, opt_type, id);
  }
  return variable;
};

/**
 * Helper function to get the list of variables that have been added to the
 * workspace after adding a new block, using the given list of variables that
 * were in the workspace before the new block was added.
 * @param {!Blockly.Workspace} workspace The workspace to inspect.
 * @param {!Array.<!Blockly.VariableModel>} originalVariables The array of
 *     variables that existed in the workspace before adding the new block.
 * @return {!Array.<!Blockly.VariableModel>} The new array of variables that
 *     were freshly added to the workspace after creating the new block,
 *     or [] if no new variables were added to the workspace.
 * @package
 */
Blockly.Variables.getAddedVariables = function(workspace, originalVariables) {
  var allCurrentVariables = workspace.getAllVariables();
  var addedVariables = [];
  if (originalVariables.length != allCurrentVariables.length) {
    for (var i = 0; i < allCurrentVariables.length; i++) {
      var variable = allCurrentVariables[i];
      // For any variable that is present in allCurrentVariables but not
      // present in originalVariables, add the variable to addedVariables.
      if (originalVariables.indexOf(variable) == -1) {
        addedVariables.push(variable);
      }
    }
  }
  return addedVariables;
};

/**
 *@Jonas Knerr
 */
Blockly.Variables.changeVariableScope = function(workspace, variable, oldScope, newScope) {
  workspace.changeVariableScope(variable, oldScope, newScope);
};
Blockly.Variables.renameScope = function(workspace, oldScope, newScope) {
  workspace.renameScope(oldScope, newScope);
};
