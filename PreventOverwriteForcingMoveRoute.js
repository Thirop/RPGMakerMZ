//=============================================================================
// PreventOverwriteForcingMoveRoute.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc イベントコマンドによる移動ルート上書き防止
 * @author Thirop
 * @help
 * 移動ルート設定コマンドを実行中のキャラクターに対して
 * 移動ルートが終わる前に別の移動ルートを設定して上書きすることを防ぎます。
 *
 * 移動ルート実行中のキャラクターに移動ルートを上書きしようとする場合、
 * 実行中の移動ルートが完了してから次の移動ルートコマンドを実行します。
 * (実行中の移動ルートが繰り返し設定の場合は上書きされます。)
 *
 * コマンドによって上書き可否を設定可能です。
 *
 * 【MV版のコマンド】
 * □上書きを許可
 * setEnableOverwriteMoveRoute true
 * 移動ルート上書き可否変更 ON
 *
 * □上書きを防止
 * setEnableOverwriteMoveRoute false
 * 移動ルート上書き可否変更 OFF
 *
 * @command setEnableOverwriteMoveRoute
 * @text 移動ルート上書き可否変更
 * @desc 移動ルート上書き可否を変更します。
 *
 * @arg value
 * @text 上書き可能フラグ
 * @desc ON/trueにすると移動ルートを上書き可能になります。
 * @type boolean
 * @default true
 * 
 */
//============================================================================= 

(function(){
'use strict';

if(Utils.RPGMAKER_NAME==='MZ'){
	const pluginName = 'PreventOverwriteForcingMoveRoute';
	PluginManager.registerCommand(pluginName, 'setEnableOverwriteMoveRoute', function(args){;
		var flag = args.value===true || args.value==='true';
		$gameSystem.setEnableOverwriteMoveRoute(flag);
	});	



	const _Game_Interpreter_command205 = Game_Interpreter.prototype.command205;
	Game_Interpreter.prototype.command205 = function(params) {
		if($gameSystem.shouldPreventOverwriteMoveRoute()){
			const character = this.character(params[0]);
			if(character && character.isMoveRouteForcing() && !character._moveRoute.repeat){
				this._index -= 1;
				return false;
			}
		}

		return _Game_Interpreter_command205.call(this,params);
	};
}else{
	const _Game_Interpreter_command205 = Game_Interpreter.prototype.command205;
	Game_Interpreter.prototype.command205 = function() {
		if($gameSystem.shouldPreventOverwriteMoveRoute()){
			const character = this.character(this._params[0]);
			if(character && character.isMoveRouteForcing() && !character._moveRoute.repeat){
				this._index -= 1;
				return false;
			}
		}

		return _Game_Interpreter_command205.call(this);
	};
}


var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	if(command==='setEnableOverwriteMoveRoute' || command==='移動ルート上書き許可'){
		$gameSystem.setEnableOverwriteMoveRoute(args[0]==='true'||args[0]===true||args[0]==='on'||args[0]==='ON');
	}else{
		_Game_Interpreter_pluginCommand.call(this,command,args);
	}
};


var _Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);

    this._enableOverwriteMoveRoute = false;
};
Game_System.prototype.setEnableOverwriteMoveRoute = function(value){
	this._enableOverwriteMoveRoute = value;
};
Game_System.prototype.shouldPreventOverwriteMoveRoute = function(value){
	return !this._enableOverwriteMoveRoute;
};


})();