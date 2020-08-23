//=============================================================================
// PluginCommandMVInScriptArea.js
//=============================================================================
// Copyright (c) 2020 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
/*:
 * @target MZ
 * @author Thirop
 * @plugindesc スクリプト欄でMV形式プラグインコマンドを実行
 * 
 * @param commands
 * @text コマンド登録
 * @desc 登録したコマンドはcmdを省略して記述できます。
 * @type String[]
 * @default []
 *
 * @help
 * スクリプトコマンドでMV形式のプラグインコマンドが実行できます。
 * たとえば「command1 arg1」というプラグインコマンドを実行するには
 * cmdを頭につけてスクリプトに
 *
 * cmd command1 arg1
 * 
 * と記述します。
 * 複数行入力することも可能ですが、ウェイトが無視されたり
 * 意図しない動作となる場合があるのでスクリプトコマンド１つにつき
 * プラグインコマンド１つを実行することを推奨します。
 *
 * また、プラグイン設定にコマンド名を登録することで先頭の「cmd」が
 * 省略できるようになります。
 * 
 *
 * 【更新履歴】
 * 1.0.0 2020/8/23  初版
 * 
 */
//============================================================================= 

(() =>{
'use strict';

let cmdRegExp;
function setupPluginParameters(){
	const parameters = PluginManager.parameters('PluginCommandMVInScriptArea'.toLowerCase());
	let expStr = '^(?:cmd'
	if(parameters.commands){
		const commands = JSON.parse(parameters.commands)
		for(let command of commands){
			expStr += '|'+command;
		}
	}
	expStr += ')';
	cmdRegExp = new RegExp(expStr);
};

const _Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function(){
	_Scene_Boot_start.call(this);
	setupPluginParameters();
};

const Game_Interpreter_command355 = Game_Interpreter.prototype.command355;
Game_Interpreter.prototype.command355 = function() {
	if(cmdRegExp.test(this.currentCommand().parameters[0])){
		this.processMVPluginCommandByScript();
		return true;
	}else{
		return Game_Interpreter_command355.call(this);
	}
};

Game_Interpreter.prototype.processMVPluginCommandByScript = function(){
	let script = this.currentCommand().parameters[0];
	this._processMvPluginCommandByScript(script);

	while(this.nextEventCode() === 655){
		this._index++;
		let script = this.currentCommand().parameters[0];
		this._processMvPluginCommandByScript(script);
	}
};

Game_Interpreter.prototype._processMvPluginCommandByScript = function(script){
	if(!cmdRegExp.test(script)){
		return;
	}
	script = script.replace(/^cmd /,'');

	let args = script.split(' ');
	if(args.length>0){
		let command = args.shift();
		this.pluginCommand(command,args);
	}
};


})();