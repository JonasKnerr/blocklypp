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
 * @fileoverview Object representing a map of variables and their types.
 * @author marisaleung@google.com (Marisa Leung)
 */
"use strict";

goog.provide("Blockly.VariableMap");

goog.require("Blockly.Events.VarDelete");
goog.require("Blockly.Events.VarRename");
goog.require("Blockly.utils");

/**
 * Class for a variable map.  This contains a dictionary data structure with
 * variable types as keys and lists of variables as values.  The list of
 * variables are the type indicated by the key.
 * @param {!Blockly.Workspace} workspace The workspace this map belongs to.
 * @constructor
 */
Blockly.VariableMap = function(workspace) {
  /**
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
   * @type {!Object.<string, !Array.<Blockly.VariableModel>>}
   * @private
   */
  this.variableMap_ = {};
  /**
   *@ Jonas Knerr
   *adds another map for local variables
   */
  this.scopeMap_ = {};
  /**
   * The workspace this map belongs to.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;
};

/**
 * Clear the variable map.
 */
Blockly.VariableMap.prototype.clear = function() {
  this.variableMap_ = new Object(null);
};

/* Begin functions for renaming variables. */

/**
 * Rename the given variable by updating its name in the variable map.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @package
 */
Blockly.VariableMap.prototype.renameVariable = function(variable, newName) {
  var type = variable.type;
  var conflictVar = this.getVariable(newName, type);
  var blocks = this.workspace.getAllBlocks(false);
  Blockly.Events.setGroup(true);
  try {
    // The IDs may match if the rename is a simple case change (name1 -> Name1).
    if (!conflictVar || conflictVar.getId() == variable.getId()) {
      this.renameVariableAndUses_(variable, newName, blocks);
    } else {
      this.renameVariableWithConflict_(variable, newName, conflictVar, blocks);
    }
  } finally {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Rename a variable by updating its name in the variable map. Identify the
 * variable to rename with the given ID.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.VariableMap.prototype.renameVariableById = function(id, newName) {
  var variable = this.getVariableById(id);
  if (!variable) {
    throw Error("Tried to rename a variable that didn't exist. ID: " + id);
  }

  this.renameVariable(variable, newName);
};

/**
 * Update the name of the given variable and refresh all references to it.
 * The new name must not conflict with any existing variable names.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Array.<!Blockly.Block>} blocks The list of all blocks in the
 *     workspace.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableAndUses_ = function(variable, newName, blocks) {
  Blockly.Events.fire(new Blockly.Events.VarRename(variable, newName));
  variable.name = newName;
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].updateVarName(variable);
  }
};

/**
 * Update the name of the given variable to the same name as an existing
 * variable.  The two variables are coalesced into a single variable with the ID
 * of the existing variable that was already using newName.
 * Refresh all references to the variable.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Blockly.VariableModel} conflictVar The variable that was already
 *     using newName.
 * @param {!Array.<!Blockly.Block>} blocks The list of all blocks in the
 *     workspace.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableWithConflict_ = function(
  variable,
  newName,
  conflictVar,
  blocks
) {
  var type = variable.type;
  var oldCase = conflictVar.name;

  if (newName != oldCase) {
    // Simple rename to change the case and update references.
    this.renameVariableAndUses_(conflictVar, newName, blocks);
  }

  // These blocks now refer to a different variable.
  // These will fire change events.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameVarById(variable.getId(), conflictVar.getId());
  }

  // Finally delete the original variable, which is now unreferenced.
  Blockly.Events.fire(new Blockly.Events.VarDelete(variable));
  // And remove it from the list.
  var variableList = this.getVariablesOfType(type);
  var variableIndex = variableList.indexOf(variable);
  this.variableMap_[type].splice(variableIndex, 1);
};

/* End functions for renaming variabless. */

/**
 * Create a variable with a given name, optional type, and optional ID.
 * @param {string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {Blockly.VariableModel} The newly created variable.
 */
Blockly.VariableMap.prototype.createVariable = function(name, opt_type, opt_id, opt_scope) {
  var variable = this.getVariable(name, opt_type);
  var scope = opt_scope || "global";
  if (variable) {
    if (opt_id && variable.getId() != opt_id) {
      throw Error(
        'Variable "' +
          name +
          '" is already in use and its id is "' +
          variable.getId() +
          '" which conflicts with the passed in ' +
          'id, "' +
          opt_id +
          '".'
      );
    }
    // The variable already exists and has the same ID.
    return variable;
  }
  if (opt_id && this.getVariableById(opt_id)) {
    throw Error('Variable id, "' + opt_id + '", is already in use.');
  }
  opt_id = opt_id || Blockly.utils.genUid();
  opt_type = opt_type || "";
  variable = new Blockly.VariableModel(this.workspace, name, opt_type, opt_id, scope);

  // If opt_type is not a key, create a new list.
  if (!this.variableMap_[opt_type]) {
    this.variableMap_[opt_type] = [variable];
  } else {
    // Else append the variable to the preexisting list.
    this.variableMap_[opt_type].push(variable);
  }

  if (!opt_scope) {
    this.addVariableToScope(name, "global", opt_type);
  } else {
    this.addVariableToScope(name, scope, opt_type);
  }
  return variable;
};

/**
 * @Jonas Knerr
 * renames the scope of the map if a className changes
 */

Blockly.VariableMap.prototype.renameScope = function(oldName, newName) {
  if (this.scopeMap_) {
    if (this.scopeMap_[oldName]) {
      var variables = this.scopeMap_[oldName];
      delete this.scopeMap_[oldName];
      this.scopeMap_[newName] = variables;
    }
  }
};

/**
 *@Jonas Knerr
 *changes the scope of a variable
 */
Blockly.VariableMap.prototype.changeVariableScope = function(name, oldScope, newScope) {
  var variable = this.getVariable(name);

  this.deleteVariableFromScope(variable, variable.getScope());
  variable.setScope(newScope);
  var variables = new Set();
  if (this.scopeMap_[oldScope]) {
    var variables = this.scopeMap_[oldScope];
    delete this.scopeMap_[oldScope];
    this.scopeMap_[newScope] = variables;
  }
  if (this.scopeMap_[newScope]) {
    this.scopeMap_[newScope].add(variable);
  } else {
    variables.add(variable);
    this.scopeMap_[newScope] = variables;
  }
  return this.scopeMap_;
};
/*
 *@Jonas Knerr
 */
Blockly.VariableMap.prototype.deleteVariableFromScope = function(variable, scope) {
  if (this.scopeMap_[scope]) {
    this.scopeMap_[scope].delete(variable);
  }
};

/**
 *@Jonas Knerr
 * add global variables to scope later maybe more
 */
Blockly.VariableMap.prototype.addVariableToScope = function(name, scope, opt_type) {
  var variable = this.getVariable(name, opt_type);
  var variables = new Set();
  if (variable) {
    if (this.scopeMap_[scope]) {
      this.scopeMap_[scope].add(variable);
    } else {
      variables.add(variable);
      this.scopeMap_[scope] = variables;
    }
  }
};

/** Return all variable getVariableScopes
 * @ Jonas Knerr
 */
Blockly.VariableMap.prototype.getVariableScopes = function() {
  var scopes = Object.keys(this.scopeMap_);
  return scopes;
};
/**
 *@Jonas Knerr
 */
Blockly.VariableMap.prototype.getVariableOfScope = function(scope) {
  if (this.scopeMap_[scope]) return Array.from(this.scopeMap_[scope]);
  return [];
};
/* Begin functions for variable deletion. */

/**
 * Delete a variable.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 */
Blockly.VariableMap.prototype.deleteVariable = function(variable) {
  var variableList = this.variableMap_[variable.type];
  for (var i = 0, tempVar; (tempVar = variableList[i]); i++) {
    if (tempVar.getId() == variable.getId()) {
      variableList.splice(i, 1);
      Blockly.Events.fire(new Blockly.Events.VarDelete(variable));
      return;
    }
  }
};

/**
 * Delete a variables by the passed in ID and all of its uses from this
 * workspace. May prompt the user for confirmation.
 * @param {string} id ID of variable to delete.
 */
Blockly.VariableMap.prototype.deleteVariableById = function(id) {
  var variable = this.getVariableById(id);
  if (variable) {
    // Check whether this variable is a function parameter before deleting.
    var variableName = variable.name;
    var uses = this.getVariableUsesById(id);
    for (var i = 0, block; (block = uses[i]); i++) {
      if (block.type == "procedures_defnoreturn" || block.type == "procedures_defreturn") {
        var procedureName = block.getFieldValue("NAME");
        var deleteText = Blockly.Msg["CANNOT_DELETE_VARIABLE_PROCEDURE"]
          .replace("%1", variableName)
          .replace("%2", procedureName);
        Blockly.alert(deleteText);
        return;
      }
    }

    var map = this;
    if (uses.length > 1) {
      // Confirm before deleting multiple blocks.
      var confirmText = Blockly.Msg["DELETE_VARIABLE_CONFIRMATION"]
        .replace("%1", String(uses.length))
        .replace("%2", variableName);
      Blockly.confirm(confirmText, function(ok) {
        if (ok) {
          map.deleteVariableInternal_(variable, uses);
        }
      });
    } else {
      // No confirmation necessary for a single block.
      map.deleteVariableInternal_(variable, uses);
    }
  } else {
    console.warn("Can't delete non-existent variable: " + id);
  }
};

/**
 * Deletes a variable and all of its uses from this workspace without asking the
 * user for confirmation.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 * @param {!Array.<!Blockly.Block>} uses An array of uses of the variable.
 * @private
 */
Blockly.VariableMap.prototype.deleteVariableInternal_ = function(variable, uses) {
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    for (var i = 0; i < uses.length; i++) {
      uses[i].dispose(true, false);
    }
    this.deleteVariable(variable);
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/* End functions for variable deletion. */

/**
 * Find the variable by the given name and type and return it.  Return null if
 *     it is not found.
 * @param {string} name The name to check for.
 * @param {string=} opt_type The type of the variable.  If not provided it
 *     defaults to the empty string, which is a specific type.
 * @return {Blockly.VariableModel} The variable with the given name, or null if
 *     it was not found.
 */
Blockly.VariableMap.prototype.getVariable = function(name, opt_type) {
  var type = opt_type || "";
  var list = this.variableMap_[type];
  if (list) {
    for (var j = 0, variable; (variable = list[j]); j++) {
      if (Blockly.Names.equals(variable.name, name)) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Find the variable by the given ID and return it. Return null if it is not
 *     found.
 * @param {string} id The ID to check for.
 * @return {Blockly.VariableModel} The variable with the given ID.
 */
Blockly.VariableMap.prototype.getVariableById = function(id) {
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    for (var j = 0, variable; (variable = this.variableMap_[key][j]); j++) {
      if (variable.getId() == id) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Get a list containing all of the variables of a specified type. If type is
 *     null, return list of variables with empty string type.
 * @param {?string} type Type of the variables to find.
 * @return {!Array.<!Blockly.VariableModel>} The sought after variables of the
 *     passed in type. An empty array if none are found.
 */
Blockly.VariableMap.prototype.getVariablesOfType = function(type) {
  type = type || "";
  var variable_list = this.variableMap_[type];
  if (variable_list) {
    return variable_list.slice();
  }
  return [];
};

/**
 * Return all variable types.  This list always contains the empty string.
 * @return {!Array.<string>} List of variable types.
 * @package
 */
Blockly.VariableMap.prototype.getVariableTypes = function() {
  var types = Object.keys(this.variableMap_);
  var hasEmpty = false;
  for (var i = 0; i < types.length; i++) {
    if (types[i] == "") {
      hasEmpty = true;
    }
  }
  if (!hasEmpty) {
    types.push("");
  }
  return types;
};

/**
 * Return all variables of all types.
 * @return {!Array.<!Blockly.VariableModel>} List of variable models.
 */
Blockly.VariableMap.prototype.getAllVariables = function() {
  var all_variables = [];
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++) {
    all_variables = all_variables.concat(this.variableMap_[keys[i]]);
  }
  return all_variables;
};

/**
 * Find all the uses of a named variable.
 * @param {string} id ID of the variable to find.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
Blockly.VariableMap.prototype.getVariableUsesById = function(id) {
  var uses = [];
  var blocks = this.workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var blockVariables = blocks[i].getVarModels();
    if (blockVariables) {
      for (var j = 0; j < blockVariables.length; j++) {
        if (blockVariables[j].getId() == id) {
          uses.push(blocks[i]);
        }
      }
    }
  }
  return uses;
};
