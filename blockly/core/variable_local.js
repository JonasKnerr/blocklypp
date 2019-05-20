/*
 * Class to handle local/private variables
 *@Jonas Knerr
 */
"use strict";

goog.provide("Blockly.VariablesLocal");

Blockly.VariablesLocal.flyoutCategory = function(workspace) {
  var xmlList = [];
  var button = document.createElement("button");
  button.setAttribute("text", "%{BKY_NEW_VARIABLE}");
  button.setAttribute("callbackKey", "CREATE_VARIABLE");

  workspace.registerButtonCallback("CREATE_VARIABLE", function(button) {
    Blockly.Variables.createVariableButtonHandler(
      button.getTargetWorkspace(),
      false,
      "local",
      "local"
    );
  });
  xmlList.push(button);

  // var blockList = Blockly.Variables.flyoutCategoryBlocks(workspace);
  // xmlList = xmlList.concat(blockList);
  return xmlList;
};
