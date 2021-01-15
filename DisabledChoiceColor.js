//=============================================================================
// DisabledChoiceColor.js
//=============================================================================
// Copyright (c) 2021 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
/*:
 * @target MZ
 * @author Thirop
 * @plugindesc \C[8]を含む選択肢を選択不可
 * 
 * @param disabledColor
 * @text 選択不可色番号
 * @desc 選択不可とする色番号（デフォルト:8)
 * @type number
 * @default 8
 */


(()=>{
var pluginName = 'DisabledChoiceColor';
var parameters = PluginManager.parameters(pluginName)

Window_ChoiceList.prototype.makeCommandList = function() {
    const choices = $gameMessage.choices();
    for (const choice of choices) {
    	var converted = this.convertEscapeCharacters(choice);
        var enabled = !converted.contains("\C["+parameters.disabledColor+"]");

        this.addCommand(choice, "choice", enabled);
    }
};

})();
