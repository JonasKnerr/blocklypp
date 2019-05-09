/**
 * @fileoverview Object representing a map of variables and their scopes.
 * @author Jonas Knerr
 */
"use strict";

goog.provide("Blockly.LocalVariableMap");

goog.require("Blockly.VariableMap");
goog.require("Blockly.Events.VarDelete");
goog.require("Blockly.Events.VarRename");
goog.require("Blockly.utils");

Blockly.LocalVariableMap = function(workpsace) {
  /**
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
   * @type {!Object.<string, !Array.<Blockly.VariableModel>>}
   * @private
   */
  this.variableMap_ = {};

  /**
   * The workspace this map belongs to.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;
};

goog.inherits(Blockly.LocalVariableMap, Blockly.VariableMap);

Blockly.VariableMap.createVariable = function(name, opt_type, opt_id, opt_scope) {
  var variable_ = Blockly.LocalVariableMap.superClass_.createVariable(
    name,
    opt_type,
    opt_id,
    opt_scope
  );
  //@Jonas Knerr
  if (!this.variableMap_[opt_scope]) {
    this.variableMap_[opt_scope] = [variable];
  } else {
    this.variableMap_[opt_scope].push(variable);
  }
  return variable;
};
