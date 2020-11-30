//=============================================================================
// SpeakerCommonLauncher.js
//=============================================================================
// Copyright (c) 2020 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
/*:
 * @author Thirop
 * @plugindesc 発言キャラに対応したコモンイベント起動
 * @help
 * 文章表示の発言キャラに応じてコモンイベントを呼び出すプラグイン。
 * プラグイン管理にて、なるべく下に配置してください。
 *
 * 文章表示コマンドが呼ばれると、対応するキャラのコモンイベントの
 * 呼び出し処理を挿入します。
 *
 * □注意点
 * ・コモンイベント内で文章の表示は行わないでください。
 * ・わりかしお行儀が悪い処理をするプラグインなので、
 * 　よく動作テストを行って問題がないことをご確認のうえ
 * 　各自の判断、責任のもとご利用をお願いします。
 * 
 * 
 * 【更新履歴】
 * 1.0.0 2020/11/30 初版
 *
 * @param list
 * @text 設定リスト
 * @desc 名前と呼び出すコモンイベントIDをセットで１つずつ登録
 * @type struct<Map>[]
 * @default []
 * 
 * 
 */
//============================================================================= 

/*~struct~Map:
 * @param name
 * @text 名前
 * @desc 文章表示の名前（_OTHERSとすると登録してない名前全て。設定無しも可）
 * @type text
 *
 * @param commonEventId
 * @text コモンイベントID
 * @desc 呼び出すコモンイベントID
 * @type common_event
 * @default 0
 *
 * @param timing
 * @text 呼び出しタイミング
 * @desc コモンイベントを呼び出すタイミング
 * @default 0
 * @type select
 * @option 文章表示の前 
 * @value 0
 * @option 文章表示の後
 * @value 1 
 */


(function(){
'use strict';
var pluginName ='SpeakerCommonLauncher';

var spekaerData = {};
var parameters = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), function(key, value) {
	try {
		return JSON.parse(value);
	} catch (e) {
		try {
			if(value[0]==='['||value[0]==='{'){
				if(value.contains(' ')){
					return value;
				}
				return eval(value);
			}else if(value===''){
				return value;
			}else if(!isNaN(value)){
				return Number(value);
			}else if(value==='true'){
				return true;
			}else if(value==='false'){
				return false;
			}else{
				return value;
			}
		} catch (e) {
			return value;
		}
	}
}));


var _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
Game_Interpreter.prototype.clear = function() {
	_Game_Interpreter_clear.apply(this,arguments);

	//SCL(SpeakerCommonLauncher)
    this._sclProcessedIdx = -1;
    this._sclInsertedCommonNum = 0;
};

var _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
Game_Interpreter.prototype.command101 = function(params) {
	if(this._sclProcessedIdx!==this._index){
		this._sclProcessedIdx = this._index;
		if(this._processSCL(params[4])){
			this._index -= 1;
			return true;
		}
	}

	return _Game_Interpreter_command101.apply(this,arguments);
};

var _Game_Interpreter_command117 = Game_Interpreter.prototype.command117;
Game_Interpreter.prototype.command117 = function(params) {
	var result = _Game_Interpreter_command117.apply(this,arguments);
	
	if(this._sclInsertedCommonNum>0){
		this._sclInsertedCommonNum -= 1;
		this._list.splice(this._index,1);
		if(result){
			this._index -= 1;
		}
	}

	return result;
};


//return quit message flag
Game_Interpreter.prototype._processSCL = function(speakerName){
	var list = parameters.list;
	var match = false;
	var hasWild = false;
	var length = list.length;

	var wildName = '_OTHERS';
	var currentCommand = this.currentCommand();

	var messageIdx = this._index;
    for(var i = 0; i<length; i=(i+1)|0){
        var data = list[i];
        if(data.name === speakerName){
        	match = true;
        	messageIdx = this._insertCommonEventCommandBySCL(data.commonEventId,data.timing,messageIdx);
        }else if(data.name===wildName){
        	hasWild = true;
        }
    }

    if(!match && speakerName && hasWild){
        //others
	    for(var i = 0; i<length; i=(i+1)|0){
	        var data = list[i];
	        if(data.name === wildName){
	        	messageIdx = this._insertCommonEventCommandBySCL(data.commonEventId,data.timing,messageIdx);
	        }
	    }
    }

    var insertedAhead = currentCommand!==this.currentCommand();
    return insertedAhead;
};

Game_Interpreter.prototype._insertCommonEventCommandBySCL = function(commonEventId,timing,messageIdx){
	var insertIdx = messageIdx;
	if(timing===1){
		var length = this._list.length;
		for(
			insertIdx=messageIdx+1;
			insertIdx<length;
			insertIdx=(insertIdx+1)|0
		){
			var command = this._list[insertIdx];
			switch(command.code){
			case 401:
			case 102:
			case 103:
			case 104:
				continue;
			default:
				break;
			}

			break;
		}
	};

	
	var command = {
		code:117,
		indent:this._indent,
		parameters:[commonEventId]
	};
	this._list.splice(insertIdx,0,command);
	this._sclInsertedCommonNum += 1;

	if(timing === 0){
		messageIdx += 1;
	}

	return messageIdx;
};


})();
