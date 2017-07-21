
function ScrGame() {
	PIXI.Container.call( this );
	this.init();
}

ScrGame.prototype = Object.create(PIXI.Container.prototype);
ScrGame.prototype.constructor = ScrGame;

var TIME_GET_RESULT = 10000;
var TIME_RESPAWN_MONEY = 500;
var TIME_RESPAWN_PROPOSAL = 1000;
var TIME_RESPAWN_MINER = 3000;
var TIME_RESPAWN_HACKER = 2000;
var C_START = "cddbe729";
var urlResult = "https://api.dao.casino/daohack/api.php?a=getreuslt&id";
var urlEtherscan = "https://api.etherscan.io/";
var urlInfura = "https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl";
var urlBalance = "";
var topicsResultLog = "0x70d816668b2732e5fb6f136b2561a576ff46b80a1ced4f5fdae6ede3c87708ab";
var betEth = 200000000000000000; //ставка эфира
var betGame = betEth/1000000000000000000; //ставка 0.2 эфира
var obj_game = {};
var _callback;
var _mouseX;
var _mouseY;
var blockNumber;
var idOraclizeGame = undefined;
var resultTxid = undefined;

	
ScrGame.prototype.init = function() {
	this.face_mc = new PIXI.Container();
	this.back_mc = new PIXI.Container();
	this.game_mc = new PIXI.Container();
	this.gfx_mc = new PIXI.Container();
	
	this.startTime = getTimer();
	this.gameTime = getTimer();
	this._arButtons = [];
	this._arObject = [];
	this._arObjectLevel = [];
	this._arText = [];
	this._arHolder = [];
	this._arPlatform = [];
	this._arTeleport = [];
	this.timeGetResult = 0;
	this.timeTotal = 0;
	this.timeCloseWnd = 0;
	this.timeMoney = 0;
	this.timeProposal = 0;
	this.timeHacker = 0;
	this.gameTxHash = undefined;
	this.clickDAO = false;
	this.startGame = false;
	this._gameOver = false;
	this._gameOverClient = false;
	this.bSendRequest = false;
	this.bWindow = false;
	this.bResult = false;
	this.bHealthDao09 = false; // 90% health
	this.damage = 20;
	this.resurrectionCur = 10;
	this.showWinEthereum = 0;
	this.showTimeEthereum = 100;
	this.resurrection = this.resurrectionCur;
	this.wndInfo;
	this.wndResult;
	this.curWindow;
	this.groundY = _H;
	this.valueLevelMax = 0;
	this.valueLevel = 0; // какое-то значение для проигрыша на уровне
	this.oldBalance = -1;
	this._speedGravity = 1;
	this.countNew = 0;
	this.countOld = 0;
	
	obj_game = {};
	idOraclizeGame = undefined;
	resultTxid = undefined;
	
	if(options_testnet){
		urlEtherscan = "https://ropsten.etherscan.io/";
		urlInfura = "https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl";
		addressContract = addressTestContract;
	} else {
		betEth = 200000000000000000; //ставка эфира
		betGame = betEth/1000000000000000000; //ставка 1 эфир
	}
	this.curLevel = Number(login_obj["level"]) || 1;
	
	if(options_debug){
		var tfDebug = addText("Debug", 20, "#FF0000", "#000000", "right", 400)
		tfDebug.x = _W-20;
		tfDebug.y = 10;
		this.face_mc.addChild(tfDebug);
	}
	
	this.arTitle = ["",
		"30.04.2016 \n The DAO is live",
		"ICO \n The DAO raised over US $100m from more than 11,000 participants",
		"Proposal",
		"16.06.2016 \n Dao get attacked, DAO price fell, ETH price fell",
		"Hard Fork 1",
		"Back to main network",
		"Hard Fork 2 \n Hard fork cafe",
		"Ethereum Classiс",
		""
	]
	this.arDescWin = ["",
		"30.06.2016 contract deployed",
		"You have collected enough",
		"All proposals submitted",
		"Hacker hacked the dao",
		"Hard Fork",
		"",
		"",
		"",
		""
	]
	this.arDescLose = ["",
		"Something went wrong try again",
		"You lost a lot of money",
		"You didn't get the proposals right",
		"Failed to hack the dao",
		"Old Chain",
		"",
		"",
		"",
		""
	]
	
	obj_game["game"] = this;
	obj_game["balance"] = 0;
	obj_game["balanceBank"] = 0;
	_callback = obj_game["game"].response;
	
	this.addChild(this.back_mc);
	this.addChild(this.game_mc);
	this.addChild(this.gfx_mc);
	this.addChild(this.face_mc);
	
	this.bgGame = addObj("bgLevel"+this.curLevel, _W/2, _H/2);
	if(this.bgGame){
	} else {
		this.bgGame = addObj("bgLevel1", _W/2, _H/2);
	}
	this.back_mc.addChild(this.bgGame);
	
	this.tfTitleLevel = addText("", 24, "#FF0000", "#000000", "center", 1000, 3)
	this.tfTitleLevel.x = _W/2;
	this.tfTitleLevel.y = 120;
	this.face_mc.addChild(this.tfTitleLevel);
	
	this.itemDao = new ItemDao();
	this.game_mc.addChild(this.itemDao);
	this._arButtons.push(this.itemDao);
	this._arObject.push(this.itemDao);
	
	var posX = 100;
	var posY = 60;
	var ofssetY = 60;
	this.btnLevels = this.createButton("btnLevels", posX, posY+ofssetY*2, "Menu", 24)
	this.btnStart = this.createButton("btnStart", _W/2, 600, "Start", 34, 24);
	this.btnStart.visible = false;
	if(!options_arcade){
		this.btnSmart = this.createButton("btnSmart", posX, ofssetY*11, "Check contract", 17, 12)
	}
	if(options_debug){
		this.btnExport = this.createButton("btnExport", posX, posY+ofssetY*3, "Export keys", 21)
		this.btnReset = this.createButton("btnReset", posX, posY+ofssetY*4, "Clear log", 26, 17)
	}
	
	this.createPrepareLevel();
	this.createGUI();
	this.createAccount();
	infura.sendRequest("getBalance", openkey, _callback);
	infura.sendRequest("getBalanceBank", addressContract, _callback);
	infura.sendRequest("getBlockNumber", undefined, _callback);
	if(options_arcade){
		if(login_obj["balance"] < 0.3){
			login_obj["balance"] = getArcadeBalance();
		}
		obj_game["balance"] = login_obj["balance"];
		obj_game["balanceBank"] = 100000000000000000000;
		this.tfBalance.setText(toFixed(login_obj["balance"], 4));
	}
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrGame.prototype.resetGame = function() {
	this.timeGetResult = 0;
	this.timeTotal = 0;
	this.timeCloseWnd = 0;
	this.clickDAO = false;
	this.startGame = false;
	this._gameOver = false;
	this.tfTotalTime.setText(Math.round(this.timeTotal/1000));
	this.itemDao.healthMax = 1000;
	this.itemDao.health = this.itemDao.healthMax;
	// this.btnStart.visible = true;
	this.itemDao.visible = false;
}

ScrGame.prototype.clearLog = function() {	
	resetData();
	this.resetGame();
	this.createAccount();
}

ScrGame.prototype.createButton = function(name, x, y, label, size, offset) {	
	if(size){}else{size=22}
	if(offset){}else{offset=17}
	
	var btn = addButton2("btnDefault", x, y);
	btn.name = name;
	btn.interactive = true;
	btn.buttonMode=true;
	if(name == "btnSmart"){
		this.addChild(btn);
	} else {
		this.face_mc.addChild(btn);
	}
	this._arButtons.push(btn);
	var tf = addText(label, size, "#FFFFFF", "#000000", "center", 350)
	tf.x = 0;
	tf.y = - offset;
	btn.addChild(tf);
	
	return btn;
}

// ALL LEVELS
ScrGame.prototype.createPrepareLevel = function() {
	switch (this.curLevel){
		case 1:
			var pr1 = addObj("programmer1", 275, 300, 1, -1);
			pr1.img.animationSpeed = 0.5;
			pr1.img.play();
			this.back_mc.addChild(pr1);
			var pr2 = addObj("programmer1", 1000, 300);
			pr2.img.animationSpeed = 0.5;
			pr2.img.play();
			this.back_mc.addChild(pr2);
			var nb1 = addObj("notebook1", 320, 340);
			nb1.img.animationSpeed = 0.5;
			nb1.img.play();
			this.back_mc.addChild(nb1);
			var nb2 = addObj("notebook1", 956, 340, 1, -1);
			nb2.img.animationSpeed = 0.5;
			nb2.img.play();
			this.back_mc.addChild(nb2);
			var nb3 = addObj("notebook2", 280, 510, 1, -1);
			nb3.img.animationSpeed = 0.5;
			nb3.img.play();
			this.back_mc.addChild(nb3);
			var nb4 = addObj("notebook2", 1000, 500);
			nb4.img.animationSpeed = 0.5;
			nb4.img.play();
			this.back_mc.addChild(nb4);
			var pr3 = addObj("programmer2", 210, 500, 1, -1);
			pr3.img.animationSpeed = 0.5;
			pr3.img.play();
			this.back_mc.addChild(pr3);
			var pr4 = addObj("programmer2", 1080, 490);
			pr4.img.animationSpeed = 0.5;
			pr4.img.play();
			this.back_mc.addChild(pr4);
			break
	}
}

ScrGame.prototype.createLevel = function() {
	this.tfLevel.setText("Level " + this.curLevel);
	this.tfTitleLevel.setText("");
	this.itemResult.tf.setText("");
	this.itemResult.tfBalance.setText("");
	if(this.hintArrow){
		this.hintArrow.visible = false;
	}
	login_obj["level"] = this.curLevel;
	this._arObjectLevel = [];
	
	this.itemDao.act = ""
	this.itemDao.skin = ""
	
	switch (this.curLevel){
		case 1:
			this.itemDao.setSkin("egg");
			this.itemDao.setAct("Stay")
			this.itemDao.dead = false;
			this.itemDao.sprite.interactive = true;
			this.itemDao.sprite.buttonMode=true;
			this.itemDao.visible = true;
			this.hintArrow.visible = true;
			this.itemDao.x = _W/2-10;
			this.itemDao.y = 360;
			this.damage = 180;
			break;
		case 2:
			this.itemDao.setSkin("dao");
			this.itemDao.setAct("RunMoney")
			this.itemDao.dead = false;
			this.itemDao.visible = true;
			this.itemDao.barDao.visible = false;
			this.itemDao.x = _W/2;
			this.itemDao.y = 500;
			this.valueLevelMax = 15000;
			this.tfTitleLevel.setText("Lost money: " + this.valueLevel + "/" + this.valueLevelMax);
			break;
		case 3:
			this.itemDao.dead = true;
			this.itemDao.visible = true;
			this.itemWall = addObj("itemWall", 660, 500);
			this.itemWall.visible = false;
			this.game_mc.addChild(this.itemWall);
			this.itemHome = addObj("itemHome", 1252, 500);
			this.gfx_mc.addChild(this.itemHome);
			this.valueLevelMax = 10;
			this.groundY = 500;
			this.tfTitleLevel.setText("Bad proposal: " + this.valueLevel + "/" + this.valueLevelMax);
			break;
		case 4:
			this.itemDao.dead = true;
			this.itemDao.visible = true;
			this.itemHome = addObj("itemHome2", 1247, 496);
			this.gfx_mc.addChild(this.itemHome);
			this.valueLevelMax = 1000000;
			this.groundY = 425;
			this.damage = 10;
			this.tfTitleLevel.setText("Stolen money: $" + this.valueLevel + "/" + this.valueLevelMax);
			break;
		case 5:
			this.groundY = 610;
			this.arListPlatform = ["40_180", "190_180", "340_180", "490_180", 
									"825_180", "975_180", "1125_180", "1275_180",
									"-115_385", "35_385", "185_385", "495_385", "645_385", 
									"795_385", "1115_385", "1265_385"];
			this.arListTeleport = ["1_70_555_2", "2_1220_317_1_1", "3_1210_555_4_1",
									"4_365_110_3", "5_460_317_3", "6_830_317_7_1", "7_810_110_6"];
			this.createLevel5();
			this.tfTitleLevel.setText("Hard Fork/Old chain");
			break;
		default:
			this.tfTitleLevel.setText("Level of development");
			break;
	}
	
	if(this.hintArrow){
		this.hintArrow.x = this.itemDao.x + 70;
		this.hintArrow.y = this.itemDao.y - 90;
	}
}

ScrGame.prototype.createLevel5 = function() {
	var i = 0;
	var _x = 0;
	var _y = 0;
	var obj;
	
	for (i = 0; i < this.arListTeleport.length; i++ ) {
		obj = this.arListTeleport[i];
		obj = obj.split("_");
		var id = Number(obj[0]);
		_x = Number(obj[1]);
		_y = Number(obj[2]) + 17;
		var teleport = Number(obj[3]);
		var inv = obj[4] || 0;
		var sc = 1;
		if(inv){
			sc = -1;
		}
		
		var item = addObj("itemTeleport", _x, _y);
		item.visible = false;
		item.scale.x = sc;
		item.teleport = teleport;
		this.game_mc.addChild(item);
		this._arTeleport.push(item);
	}
	for (i = 0; i < this.arListPlatform.length; i++ ) {
		obj = this.arListPlatform[i];
		obj = obj.split("_");
		_x = obj[0];
		_y = obj[1];
		
		var item = addObj("itemPlatform", _x, _y);
		item.visible = false;
		item.setRegY(0);
		this.game_mc.addChild(item);
		this._arPlatform.push(item);
	}
	
	this.contractNew = addObj("contractNew", 1180, 90);
	this.game_mc.addChild(this.contractNew);
	this.doorNew = addObj("doorNew", 1180+52, 100);
	this.doorNew.setRegX(1);
	this.game_mc.addChild(this.doorNew);
	this.contractOld = addObj("contractOld", 650, 530);
	this.game_mc.addChild(this.contractOld);
	this.doorOld = addObj("doorOld", 650-52, 540);
	this.doorOld.setRegX(0);
	this.game_mc.addChild(this.doorOld);
	
	this.createObj({x:60, y:280}, "itemMiner")
}

ScrGame.prototype.createAccount = function() {
	if(privkey || options_debug){
		if(openkey){}else{openkey=1, privkey=1};
		this.tfIdUser.setText(openkey);
		this.showWndStart();
	}else{
		this.showError(ERROR_KEYTHEREUM);
	}
}

ScrGame.prototype.createGUI = function() {
	this.itemResult = new PIXI.Container();
	this.itemResult.x = _W/2;
	this.itemResult.y = 190;
	this.itemResult.visible = false;
	this.face_mc.addChild(this.itemResult);
	
	var icoKey = addObj("icoKey", 40, 40);
	icoKey._selected = false;
	icoKey.interactive = true;
	icoKey.buttonMode=true;
	this.face_mc.addChild(icoKey);
	this._arButtons.push(icoKey);
	var icoEthereum = addObj("icoEthereum", 40, 80);
	this.face_mc.addChild(icoEthereum);
	var icoTime = addObj("icoTime", 40, 120);
	this.face_mc.addChild(icoTime);
	var btnFrame = addButton2("btnFrame", 294, 40);
	btnFrame.name = "btnKey";
	btnFrame.interactive = true;
	btnFrame.buttonMode=true;
	this.face_mc.addChild(btnFrame);
	this._arButtons.push(btnFrame);
	
	var tfResult = addText("time:", 50, "#FF0000", "#000000", "center", 400)
	this.itemResult.addChild(tfResult);
	this.itemResult.tf = tfResult;
	var tfBalance = addText("+0", 30, "#FF0000", "#000000", "center", 400)
	tfBalance.y = 55;
	this.itemResult.addChild(tfBalance);
	this.itemResult.tfBalance = tfBalance;
	this.tfGetEth = addText("", 40, "#FF8611", "#000000", "center", 400)
	this.tfGetEth.x = _W/2;
	this.tfGetEth.y = 120;
	this.face_mc.addChild(this.tfGetEth);
	
	this.hintArrow = new PIXI.Container();
	this.hintArrow.x = this.itemDao.x + 70;
	this.hintArrow.y = this.itemDao.y - 90;
	this.game_mc.addChild(this.hintArrow);
	var hintArrow = addObj("hintArrow");
	hintArrow.rotation = 35*Math.PI/180;
	this.hintArrow.addChild(hintArrow);
	
	var offsetY = 25;
	var strUser = 'id'
	this.tfIdUser = addText(strUser, 20, "#ffffff", "#000000", "left", 1000, 4, fontMain)
	this.tfIdUser.x = icoKey.x + 24;
	this.tfIdUser.y = icoKey.y - 12;
	this.face_mc.addChild(this.tfIdUser);
	this.tfBalance = addText("0", 20, "#ffffff", "#000000", "left", 400, 4, fontMain)
	this.tfBalance.x = icoEthereum.x + 24;
	this.tfBalance.y = icoEthereum.y - 12;
	this.face_mc.addChild(this.tfBalance);
	this.tfTotalTime = addText("0", 20, "#ffffff", "#000000", "left", 400, 4, fontMain)
	this.tfTotalTime.x = icoTime.x + 24;
	this.tfTotalTime.y = icoTime.y - 12;
	this.face_mc.addChild(this.tfTotalTime);
	this.tfLevel = addText("Level " + this.curLevel, 50, "#FFEF0B", "#000000", "center", 400, 4)
	this.tfLevel.x = _W/2;
	this.tfLevel.y = 50;
	this.face_mc.addChild(this.tfLevel);
}

ScrGame.prototype.createWndInfo = function(str, callback, addStr, callback2) {
	if(this.wndInfo == undefined){
		this.wndInfo = new WndInfo(this);
		this.wndInfo.x = _W/2;
		this.wndInfo.y = _H/2;
		this.face_mc.addChild(this.wndInfo);
	}
	
	this.bWindow = true;
	this.wndInfo.show(str, callback, addStr, callback2)
	this.wndInfo.visible = true;
	this.curWindow = this.bWindow;
}

ScrGame.prototype.closeWindow = function(wnd) {
	if(false){
		wnd.visible = false;
		obj_game["game"].curWindow = undefined;
	} else {
		obj_game["game"].curWindow = wnd;
		obj_game["game"].timeCloseWnd = 200;
	}
}

ScrGame.prototype.refillBalance = function() {
	if(openkey && options_ethereum){
		if(options_arcade){;
			login_obj["balance"] = 1;
			obj_game["balance"] = login_obj["balance"];
			this.tfBalance.setText(login_obj["balance"]);
		} else {
			var url = "https://platform.dao.casino/balance.html";
			window.open(url, "_self"); // "_blank",  "_self"
		}
	}
}

ScrGame.prototype.shareFB = function() {	
	if (typeof(FB) != 'undefined' && FB != null ) {
		var urlGame = 'https://platform.dao.casino/games/Hack-DAO-game/game_hack_dao/';
		var urlImg = "https://platform.dao.casino/games/Hack-DAO-game/game_hack_dao/images/distr/icon_1024.png";
		
		FB.ui({
		  method: 'feed',
		  picture: urlImg,
		  link: urlGame,
		  caption: 'PLAY',
		  description: 'I passed Level ' + this.curLevel,
		}, function(response){});
	} else {
		console.log("FB is not defined");
	}
}

ScrGame.prototype.showSmartContract = function() {
	var url = urlEtherscan + "address/" + addressContract
	if(options_mainet){
		url = "https://etherscan.io/" + "address/" + addressContract
	}
	window.open(url, "_blank"); 
}

ScrGame.prototype.exportKeys = function() {
	if(openkey && options_ethereum){
		var url = "https://platform.dao.casino/export/?privkey="+privkey+"&openkey="+openkey
		window.open(url, "_blank"); 
	}
}

ScrGame.prototype.showError = function(value) {
	var str = "ERR"
	switch(value){
		case ERROR_KEYTHEREUM:
			str = "OOOPS! \n The key is not created. Try a different browser."
			break;
		case ERROR_TRANSACTION:
			str = "OOOPS! \n Transaction failed."
			this.resetGame();
			break;
		case ERROR_KEY:
			str = "OOOPS! \n The key is not valid."
			break;
		case ERROR_BANK:
			str = "OOOPS! \n No money in the bank."
			break;
		case ERROR_BLOCKCHAIN:
			str = "OOOPS! \n No answer from the blockchain. Try the arcade mode."
			break;
		default:
			str = "ERR: " + value;
			break;
	}
	this.createWndInfo(str);
	
	if(this.hintArrow){
		this.hintArrow.visible = false;
	}
}

ScrGame.prototype.copyKey = function() {
	copyToClipboard(openkey);
}

ScrGame.prototype.warningBalance = function() {
	var bet = toFixed(betslevel[this.curLevel].bet, 4);
	var str = "Refill your account in the amount of " + bet + " ETH."
	var addStr = "Refill";
	var func = this.refillBalance;
	var func2 = undefined;
	if(document.location.href == "https://dao.casino/hackdao/"){
		addStr = "OK";
		func = this.copyKey;
		// func2 = this.copyKey;
	}
	this.createWndInfo(str, func, addStr, func2);
	this.btnStart.visible = true;
}

ScrGame.prototype.showWndClearLog = function() {
	var str = "Do you want to overwrite the keys?"
	var addStr = "Yes";
	this.createWndInfo(str, this.clearLog, addStr);
}

ScrGame.prototype.showTestEther = function() {
	var str = "Your 1 test ether will be available shortly (about minute)";
	this.createWndInfo(str);
}

ScrGame.prototype.showWndStart = function() {
	var bet = toFixed(betslevel[this.curLevel].bet, 4);
	var strW = "Win Odds: " + betslevel[this.curLevel].win + "%"
	var strX = "Multiplier: x" + betslevel[this.curLevel].koef;
	var str = "To play the game, send " + bet + " ETH. \n " + strW + " \n " + strX;
	var addStr = "Start";
	var func2 = function(){
		obj_game["game"].btnStart.visible = true;
	}
	this.createWndInfo(str, this.startGameF, addStr, func2);
}

ScrGame.prototype.createIcoEthereum = function(name) {
	var dX = 100
	var dY = 100
	var _x = this.itemDao.x + Math.random()*dX - dX/2
	var _y = this.itemDao.y - 50
	if(name == "eggPart"){
		dX = 150
		_x = this.itemDao.x + Math.random()*dX - dX/2
		_y = this.itemDao.y + Math.random()*dY - dY/2 - 50
	}
	var pt = {x:_x, y:_y}
	var str = "-"+String(this.damage)
	this.createObj(pt, name);
}

ScrGame.prototype.createText = function(point, str, color, t) {
	if(color){}else{color = "#FFFFFF"};
	if(t){}else{t = 1000};
	
	var mc = null;
	var newTf = true;
	
	for (var i = 0; i < this._arText.length; i++ ) {
		mc = this._arText[i];
		if (mc) {
			if (mc.dead) {
				mc.visible = true;
				mc.setText(str);
				newTf = false;
				break;
			}
		}
	}
	
	if (newTf) {
		// addText(text, size, color, glow, _align, width, px, bSc, font)
		mc = addText(str, 40, color, "0x000000");
		this.gfx_mc.addChild(mc);
		this._arText.push(mc);
	}
	
	mc.x = point.x;
	mc.y = point.y;
	mc.tLife = t;
	mc.dead = false;
}

ScrGame.prototype.createObj = function(point, name, sc) {	
	if(sc){}else{sc = 1};
	var mc = null;
	var newObj = true;
	
	for (var i = 0; i < this._arHolder.length; i++ ) {
		mc = this._arHolder[i];
		if (mc) {
			if (mc.dead && mc.name == name) {
				mc.visible = true;
				newObj = false;
				break;
			}
		}
	}
	
	if (newObj) {
		if(name == "itemProposal"){
			mc = new ItemProposal();
			this._arObjectLevel.push(mc);
		}else if(name == "itemMiner"){
			mc = new ItemMiner();
			mc.speedyMax = this._speedGravity;
			mc.speedy = mc.speedyMax;
			this._arObjectLevel.push(mc);
		}else if(name == "itemHacker"){
			mc = new ItemHacker();
			this._arObjectLevel.push(mc);
		} else {
			mc = addObj(name, 0, 0, sc);
		}
		if(name.search("cloud") > -1){
			this.back_mc.addChild(mc);
		} else if(name == "itemProposal" ||
		name == "itemHacker" ||
		name == "itemMiner"){
			this.game_mc.addChild(mc);
		} else {
			this.gfx_mc.addChild(mc);
		}
		this._arHolder.push(mc);
	}
	
	if(mc.name == "iconEthereum"){
		if(this.curLevel == 1){
			mc.speed = 10;
			mc.force = 20;
			mc.vX = 1;
			mc.tLife = 650;
			if(point.x < this.itemDao.x){
				mc.vX = -1;
			}
		} else if(this.curLevel == 2){
			mc.vX = 1;
			mc.tgX = point.x;
			mc.speed = 5;
			mc.tLife = 60000;
			if(Math.random()>0.5){
				mc.vX = -1;
			}
		}
	} else if(mc.name == "cloud1" ||
	mc.name == "cloud2"){
		mc.speed = 3;
		mc.vX = 1;
		mc.tLife = 60000;
	} else if(mc.name == "itemMoney"){
		mc.vX = 1;
		mc.tgX = point.x;
		mc.speed = 5;
		mc.tLife = 60000;
		if(Math.random()>0.5){
			mc.vX = -1;
		}
	} else if(mc.name == "itemProposal"){
		if(Math.random() > 0.5){
			mc.setAct("proposalRedRun");
			mc.color = "Red";
		} else {
			mc.setAct("proposalGreenRun");
			mc.color = "Green";
		}
		mc.setScaleX(-1);
		mc.action = "run";
		mc.state = 1;
		mc.vX = 1;
		mc.speed = 4;
		mc.tLife = 300000;
		mc.showMark = false;
		mc.setMark(1);
	} else if(mc.name == "itemMiner"){
		mc.setScaleX(-1);
		mc.vX = 1;
		mc.speed = 4;
		mc.timeHit = 0;
		mc.timeTeleport = 0;
		mc.tLife = 300000;
	} else if(mc.name == "itemHacker"){
		mc.setScale(0.6);
		mc.setScaleX(-1);
		mc.setAct("hackerRun");
		mc.vX = 1;
		mc.speedMax = 2;
		mc.speed = mc.speedMax;
		mc.timeHit = 0;
		mc.tLife = 300000;
		mc.health = mc.healthMax;
		mc.refreshHealth();
	} else if(mc.name == "tfBoom"){
		mc.tLife = 300;
		mc.scale.x = 0.5;
		mc.scale.y = mc.scale.x;
		mc.vA = 1;
	} else if(mc.name == "eggPart"){
		mc.alpha = 1;
		mc.speed = 5;
		mc.angleMove = Math.atan2(point.y-(this.itemDao.y), point.x-(this.itemDao.x));
		mc.cosAngle = Math.cos(mc.angleMove);
		mc.sinAngle = Math.sin(mc.angleMove);
		mc.vX = 1;
		mc.tLife = 650;
		mc.rotation = rad(Math.random()*360);
		mc.scale.x = (Math.random()*8+2)/10;
		mc.scale.y = mc.scale.x;
		if(Math.random() < 0.5){
			mc.vX = -1;
		}
	}
	
	if(mc.tLife == undefined){
		mc.tLife = 60000
	}
	mc.x = point.x;
	mc.y = point.y;
	mc.dead = false;
}

ScrGame.prototype.addHolderObj = function(obj){
	obj.visible = false;
	obj.dead = true;
	obj.x = _W + 150;
	obj.y = _H + 50;
}

// START
ScrGame.prototype.startGameEth = function(){
	if(openkey == undefined){
		obj_game["game"].showError(ERROR_KEY, showHome);
		return false;
	}
	
	if(options_arcade){
		var prnt = obj_game["game"];
		prnt.timeGetResult = 0;
		var bet = betslevel[this.curLevel].bet;
		login_obj["balance"] -= bet;
		obj_game["balance"] = login_obj["balance"];
		this.tfBalance.setText(toFixed(login_obj["balance"], 4));
		login_obj["startGame"] = true;
		login_obj["curLevel"] = prnt.curLevel;
		
		prnt.createLevel();
		prnt.bSendRequest = false;
		prnt.startGame = true;
	} else {
		infura.sendRequest("start", openkey, _callback);
	}
}

// RESULT
ScrGame.prototype.resultGameEth = function(val){
	if(this._gameOver){
		return false;
	}
	this._gameOver = true;
	
	// если собрали мало форка
	if(this.curLevel == 5){
		var total = this.countNew + this.countOld;
		var pN = Math.round(this.countNew/total*100);
		var pO = Math.round(this.countOld/total*100);
		if(pO >= 25){
			val = -1;
		}
	}
	this.itemDao.dead = true;
	
	if(val == 1){
		this.bResult = true;
		this.showWinEthereum = 10;
		
		if(this.curLevel < 9){
		} else {
			console.log("YOU WIN!");
		}
		addWinLevel(this.curLevel);
		// this.tfTitleLevel.setText(this.arTitle[this.curLevel]);
	} else {
		resetLevels();
	}
	login_obj["startGame"] = false;
	login_obj["curLevel"] = false;
	obj_game["time"] = this.timeTotal;
	
	infura.sendRequest("getBalance", openkey, _callback);
	if(options_arcade && val){
		login_obj["balance"] += (betslevel[this.curLevel].bet + betslevel[this.curLevel].prize);
		obj_game["balance"] = login_obj["balance"];
		this.tfBalance.setText(toFixed(login_obj["balance"], 4));
		betslevel[this.curLevel].prize;
	}
	this.itemResult.visible = true;
	this.startGame = false;
	this.timeTotal = 0;
	saveData();
	
	this.resultGame(val);
}

ScrGame.prototype.startGameF = function() {
	if(privkey || options_debug){
		var bet = betslevel[obj_game["game"].curLevel].bet;
		if(bet > obj_game["balance"] && options_ethereum &&
		options_debug == false){
			obj_game["game"].warningBalance();
		} else if(betEth*2 > obj_game["balanceBank"]){
			obj_game["game"].showError(ERROR_BANK);
		} else {
			if(options_ethereum){
				obj_game["game"].startGameEth();
			} else {
				obj_game["game"].createLevel();
				obj_game["game"].bSendRequest = false;
				obj_game["game"].startGame = true;
			}
			obj_game["game"].btnStart.visible = false;
		}
	} else {
		obj_game["game"].createAccount();
	}
}

ScrGame.prototype.resultGame = function(val) {
	if(this.wndResult == undefined){
		this.wndResult = new WndResult(this);
		this.wndResult.x = _W/2;
		this.wndResult.y = _H/2;
		this.face_mc.addChild(this.wndResult);
	}
	
	this.bWindow = true;
	
	if(val == 1){
		switch (this.curLevel){
			case 1:
				var star = addObj("starAppear", 630, 250);
				star.alpha = 0;
				this.game_mc.addChild(star);
				var dao = addObj("daoAppear", 630, 270);
				dao.img.animationSpeed = 0.5;
				dao.img.play();
				this.game_mc.addChild(dao);
				this._arHolder.push(dao);
				createjs.Tween.get(star,{loop:true}).to({rotation:rad(22)},500)
				createjs.Tween.get(star).to({alpha:1},500)
				break;
			case 2:
				this.itemDao.setAct("Appear")
				var star = addObj("starAppear", this.itemDao.x, this.itemDao.y);
				star.alpha = 0;
				this.back_mc.addChild(star);
				createjs.Tween.get(star,{loop:true}).to({rotation:rad(22)},500)
				createjs.Tween.get(star).to({alpha:1},500)
				break;
		}
	}
	
	var str = "";
	if(val == 1){
		// if(options_testnet){
			// str = "You have passed the first level. The following levels are available on MAINNET."
		// } else {
			if(this._gameOverClient){
				resetLevels();
				str = "You lose the Game, but won the money. \n Please start from the beginning."
			} else {
				str = this.arDescWin[this.curLevel];
			}
		// }
	} else {
		str = "You lose your bet, start from the beginning";
	}
	obj_game["gameOver"] = this._gameOverClient;
	this.wndResult.show(val, str, this.clickMenu, obj_game)
	this.wndResult.visible = true;
	this.curWindow = this.bWindow;
}

ScrGame.prototype.clickHeroDao = function() {
	this.itemDao.initjiggle();
	if(options_arcade){
		if(this.itemDao.health > this.damage){
			this.itemDao.health -=this.damage;
		} else {
			this.resultGameEth(true);
		}
	} else {
		if(this.itemDao.health > this.itemDao.healthMax*0.1 + this.damage){
			this.itemDao.health -=this.damage;
		} else {
			this.resurrection = this.resurrectionCur*75;
			var pt = {x:this.itemDao.x, y:this.itemDao.y - 100}
			this.createText(pt, "HA-HA-HA");
			if(this.itemDao.skin == "dao"){
				this.itemDao.setAct("Cure")
			}
		}
	}
	this.createIcoEthereum("iconEthereum");
	this.createIcoEthereum("eggPart");
	this.createIcoEthereum("eggPart");
	this.createIcoEthereum("eggPart");
}

ScrGame.prototype.healthDao = function() {
	if(this._gameOver){
		if(this.bResult){
			this.resurrection = -this.resurrectionCur*75
		} else {
			this.resurrection = this.resurrectionCur*75
		}
		this.itemDao.health += this.resurrection;
	} else {
		if(this.itemDao.health < this.itemDao.healthMax){
			if(this.itemDao.health > this.itemDao.healthMax*0.8){
				this.resurrection = this.resurrectionCur;
			} else {
				this.bHealthDao09 = true;
			}
			this.itemDao.health += this.resurrection;
		} else {
			if(this.bHealthDao09 && this.curLevel > 1){
				this._gameOverClient = true;
			}
		}
		if(this.curLevel == 1){
			if(this.itemDao.act == "Stay"){
				var fr = Math.ceil((this.itemDao.healthMax - this.itemDao.health)/(this.itemDao.healthMax/10));
				this.itemDao.sprite.img.gotoAndStop(fr);
			}
		}
	}
}

ScrGame.prototype.clickMenu = function() {
	this.removeAllListener();
	showLevels();
}

ScrGame.prototype.nextLevel = function() {
	this.removeAllListener();
	this.curLevel ++;
	login_obj["level"] = this.curLevel;
	showGame();
}

ScrGame.prototype.clickCell = function(item_mc) {
	if(item_mc.name.search("btn") != -1){
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
	}
	
	if(item_mc.name == "btnReset"){
		this.showWndClearLog();
	} else if(item_mc.name == "btnLevels"){
		this.removeAllListener();
		showLevels();
	} else if(item_mc.name == "btnExport"){
		this.exportKeys();
	} else if(item_mc.name == "btnShare"){
		this.shareFB();
	} else if(item_mc.name == "btnSmart"){
		this.showSmartContract();
	} else if(item_mc.name == "btnStart"){
		this.startGameF();
	} else if(item_mc.name == "btnTry"){
		this.removeAllListener();
		showLevels();
	} else if(item_mc.name == "btnNext"){
		this.removeAllListener();
		showLevels();
	} else if(item_mc.name == "btnKey" || item_mc.name == "icoKey"){
		copyToClipboard(openkey);
	} else if(item_mc.name == "itemDao"){
		if(this._gameOver){
			return false;
		}
		if(this.startGame &&
		(this.curLevel == 1)){
			this.hintArrow.visible = false;
			this.clickHeroDao();
		}
	}
}

ScrGame.prototype.clickObject = function(evt) {
	var mouseX = evt.data.global.x;
	var mouseY = evt.data.global.y;
	
	if(mouseX && mouseY){
		for (var i = 0; i < this._arObjectLevel.length; i++ ) {
			mc = this._arObjectLevel[i];
			if (mc) {
				var ptY = mouseY;
				if(mc.name == "itemMiner"){
					ptY = mouseY + mc.h/2
				}
				if(hit_test_rec(mc, mc.w, mc.h, mouseX, ptY)){
					if(this.curLevel == 3){
						if(mc.action == "run" && mc.sprite.scale.x == -1){
							mc.action = "climb";
							mc.showMark = true;
							mc.setMark(2);
							break;
						}
					} else if(this.curLevel == 4){
						if(!mc.dead){
							mc.health -= this.damage;
							mc.refreshHealth();
							mc.setAct("hackerHurt");
							mc.speed = mc.speedMax/2;
							if(mc.health <= 0){
								this.createObj(mc, "tfBoom");
								this.addHolderObj(mc);
							}
						}
					} else if(this.curLevel == 5){
						mc.setScaleX(mc.vX)
						mc.vX = -mc.vX;
					}
				}
			}
		}
	}
}

ScrGame.prototype.getResult = function(arLogs) {
	var objOrcl = undefined;
	var len = arLogs.length;
	var index = 0;
	if(len > 50){
		index = len-50;
	}
	
	if(idOraclizeGame == undefined){
		for (var i = index; i < len; i ++) {
			if (arLogs[i].transactionHash == obj_game["gameTxHash"]) {
				var obj = arLogs[i];
				idOraclizeGame = obj.data; //id Oraclize
				break;
			}
		}
	}
	if(idOraclizeGame && resultTxid == undefined){
		for (var j = index; j < len; j ++) {
			var objC = arLogs[j];
			if (objC.transactionHash != obj_game["gameTxHash"]
			&& objC.data == idOraclizeGame) {
				resultTxid = objC.transactionHash;
				objOrcl = objC;
				break;
			}
		}
	}
	
	if(resultTxid){
		for (var i = index; i < len; i ++) {
			var obj = arLogs[i];
			if (obj.transactionHash == resultTxid) {
				if (obj.data.match(/77696e/i)) {
					obj_game["game"].getResponseResult(1);
					return false;
				}
				if (obj.data.match(/6c6f7365/i)) {
					obj_game["game"].getResponseResult(-1);
					return false;
				}
			}
		}
	}
	
	obj_game["game"].getResponseResult(0);
}

ScrGame.prototype.sendUrlRequest = function(url, name) {
	var xhr = new XMLHttpRequest();
	var str = url;
	xhr.open("GET", str, true);
	xhr.send(null);
	xhr.onreadystatechange = function() { // (3)
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log("err:" + xhr.status + ': ' + xhr.statusText);
		} else {
			obj_game["game"].response(name, xhr.responseText) 
		}
	}
}

ScrGame.prototype.getResponseResult = function(value) {
	var prnt = obj_game["game"];
	var val = Number(value);
	if(val == 0){
		prnt.clickDAO = true
		prnt.timeGetResult = 0;
		prnt.bSendRequest = false;
	} else {
		prnt.resultGameEth(val);
	}
}

ScrGame.prototype.responseTransaction = function(name, value, obj) {
	console.log("get nonce action "+value);
	var prnt = obj_game["game"];
	var data = "";
	var price = 0;
	var nameRequest = "sendRaw";
	var gasPrice="0x737be7600";//web3.toHex('31000000000');
	var gasLimit=0x927c0; //web3.toHex('600000');
	if(name == "start"){
		data = "0x"+C_START + pad(numToHex(obj_game["game"].curLevel), 64);
		price = betEth;
		nameRequest = "gameTxHash";
	}
	
	var options = {};
	options.nonce = value;
	options.to = addressContract;
	options.data = data; // method from contact
	options.gasPrice = gasPrice;
	options.gasLimit = gasLimit;
	options.value = price;
	
	if(privkey){
		if(buf == undefined){
			prnt.showError(ERROR_BUF);
			prnt.clearBet();
			prnt.tfResult.setText("");
			prnt.bWait = false;
			prnt.showChips(true);
		} else {
			var tx = new EthereumTx(options);
			tx.sign(new buf(privkey, 'hex'));
			
			if(name == "start"){
				prnt.createLevel();
				prnt.bSendRequest = false;
				prnt.startGame = true;
			}

			var serializedTx = tx.serialize().toString('hex');
			console.log("The transaction was signed: "+serializedTx);
			
			var params = "0x"+String(serializedTx);
			infura.sendRequest(nameRequest, params, _callback);
		}
	}
}

ScrGame.prototype.response = function(command, value, obj) {
	var prnt = obj_game["game"];
	if(value == undefined){
		return false;
	}
	// console.log("response:", command, value)	
	
	if(command == "start"){
		prnt.responseTransaction(command, value, obj);
	} else if(command == "gameTxHash"){
		obj_game["gameTxHash"] = value;
		login_obj["gameTxHash"] = value;
		prnt.gameTxHash = obj_game["gameTxHash"];
		prnt.timeGetResult = 0;
		infura.sendRequest("getBalance", openkey, _callback);
		login_obj["startGame"] = true;
		login_obj["curLevel"] = prnt.curLevel;
	} else if(command == "resultGame"){
		var val = Number(value);
		if(val == 0){
			prnt.clickDAO = true
			prnt.timeGetResult = 0;
			prnt.bSendRequest = false;
			infura.sendRequest("getBalance", openkey, _callback);
		} else {
			prnt.resultGameEth(val);
		}
	} else if(command == "getEthereum"){
		var obj = JSON.parse(value);
		if(prnt.tfGetEth && obj){
			prnt.tfGetEth.setText("Your 1 test ether will be available shortly (about minute)");
		}
		infura.sendRequest("getBalance", openkey, _callback);
	} else if(command == "getBalance"){
		obj_game["balance"] = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
		login_obj["balance"] = obj_game["balance"];
		prnt.tfBalance.setText(obj_game["balance"]);
		prnt.bSendRequest = false;
		if(obj_game["balance"] > 0){
			prnt.tfGetEth.setText("");
			if(prnt.oldBalance == -1){
				prnt.oldBalance = Number(obj_game["balance"]);
				prnt.showWndStart();
			}
		}
	} else if(command == "getBalanceBank"){
		obj_game["balanceBank"] = Number(value);
	} else if(command == "getBlockNumber"){
		blockNumber = value;
	} else if(command == "getLogs"){
		prnt.getResult(value);
	}
}

ScrGame.prototype.updateColission = function(mc, array, diffTime){
	if(mc.dead){
		return false;
	}
	var hit = false;
	var mcY = mc.y;
	var stopY = -1;
	mc.x += mc.speed*mc.vX;
	
	if(mc.timeHit > 100){
		mc.timeHit = 0;
		mc.speedy = mc.speedyMax;
	}
	mc.timeHit += diffTime;
	
	if(mcY >= this.groundY){
		mc.speedy = 0;
		stopY = this.groundY;
		hit = true;
	} else if(mc.platform){
		var _w = mc.platform.w;
		var hitCur = hit_test_rec(mc.platform, _w, platformH, mc.x, mcY);
		if(hitCur == false){
			mc.timeHit = 0;
			mc.platform = null;
		}
	} else {
		for (var i = 0; i < array.length; i ++) {
			var platform = array[i];
			var platformH = platform.h*2;
			hit = hit_test_rec(platform, platform.w, platformH, mc.x, mcY);
			if(hit){
				mc.platform = platform;
				mc.speedy = 0;
				stopY = platform.y;
				break;
			}
		}
	}
	
	if(stopY > 0){
		mc.y = stopY;
	}
	
	if(hit){
	} else {
		mc.y += mc.speedy * diffTime;
	}
}

ScrGame.prototype.hitTeleport = function(mc, array, diffTime){
	if(mc.dead){
		return false;
	}
	if(mc.timeTeleport > 0){
		mc.timeTeleport -= diffTime;
		return false;
	}
	
	var mcY = mc.y - mc.h/2;
	var hit = undefined;
	for (var i = 0; i < array.length; i ++) {
		var obj = array[i];
		hit = hit_test_rec(obj, obj.w, obj.h, mc.x, mcY);
		if(hit){
			var newTeleport = this._arTeleport[obj.teleport-1];
			if(newTeleport){
				mc.timeTeleport = 500;
				mc.x = newTeleport.x;
				mc.y = newTeleport.y;
			}
			break;
		}
	}
	
	return hit;
}

ScrGame.prototype.hitContract = function(mc){
	var cN = this.contractNew;
	var cO = this.contractOld;
	var mcY = mc.y - mc.h/2;
	var hitNew = hit_test_rec(cN, cN.w, cN.h, mc.x, mcY);
	var hitOld = hit_test_rec(cO, cO.w, cO.h, mc.x, mcY);
	var openOld = hit_test_rec(cO, cO.w*3, cO.h, mc.x, mcY);
	var openNew = hit_test_rec(cN, cN.w*3.2, cN.h, mc.x, mcY);
	if(hitNew){
		mc.tLife = 0;
		this.countNew ++;
	}
	if(hitOld){
		mc.tLife = 0;
		this.countOld ++;
	}
	if(openOld && this.doorOld.bStart != true){
		this.doorOld.bOpen = true;
	}
	if(openNew && this.doorNew.bStart != true){
		this.doorNew.bOpen = true;
	}
	
	var total = this.countNew + this.countOld;
	var pN = Math.round(this.countNew/total*100);
	var pO = Math.round(this.countOld/total*100);
	if(total > 0){
		this.tfTitleLevel.setText("Hard Fork " + pN + "%/"+ pO +"% Old chain");
	}
}

ScrGame.prototype.updateText = function(diffTime){
	var mc;
	for (var i = 0; i < this._arText.length; i++ ) {
		mc = this._arText[i];
		if (mc) {
			if (mc.dead) {
				continue;
			}
			mc.y -= diffTime * 0.125;
			mc.tLife -= diffTime;
			if(mc.tLife < 0){
				this.addHolderObj(mc);
			}
		}
	}
}

ScrGame.prototype.updateHolder = function(diffTime){
	var mc;
	
	for (var i = 0; i < this._arHolder.length; i++ ) {
		mc = this._arHolder[i];
		if (mc) {
			if (mc.dead) {
				continue;
			}
			if(mc.name == "iconEthereum"){
				if(this.curLevel == 1){
					if(mc.force > 0){
						mc.force --;
						mc.y -= mc.speed*(mc.force/20)
					} else {
						mc.y += mc.speed
					}
					mc.x += mc.speed/2*mc.vX
				} else if(this.curLevel == 2){
					mc.y += mc.speed
					mc.x += mc.speed/5*mc.vX
					mc.rotation += mc.vX*(Math.PI/180)
					if(Math.abs(mc.tgX - mc.x) > 5){
						mc.vX = -mc.vX;
					}
					if(hit_test_rec(this.itemDao, 150, 70, mc.x,mc.y)){
						// this.createText(mc, "+ 100");
						mc.tLife = 0;
					}
					if(mc.y > _H + mc.h){
						this.valueLevel += 100;
						this.tfTitleLevel.setText("Lost ethereum: " + this.valueLevel + "/" + this.valueLevelMax);
						this.createText(mc, "- 100");
						if(this.valueLevel >= this.valueLevelMax){
							this._gameOverClient = true;
							this.itemDao.sprite.img.stop();
							if(options_arcade){
								this.resultGameEth(false);
							}
						}
						mc.tLife = 0;
					}
				}
			} else if(mc.name == "cloud1" ||
			mc.name == "cloud2"){
				mc.x += mc.speed*mc.vX
				if(mc.x > _W + mc.w){
					mc.tLife = 0;
					var t = Math.ceil(Math.random()*2)
					this.createObj({x:-400, y:50+Math.random()*100}, "cloud"+t)
				}
			} else if(mc.name == "eggPart"){
				if(mc.alpha > 0.05){
					mc.alpha -=0.02
				}
				mc.x += mc.speed*mc.cosAngle;
				mc.y += mc.speed*mc.sinAngle;
				mc.rotation +=rad(5)*mc.vX;
			} else if(mc.name == "daoAppear"){
				if(mc.img.currentFrame >= mc.img.totalFrames - 1){
					mc.img.stop();
				}
			} else if(mc.name == "itemHacker"){
				mc.x += mc.speed*mc.vX;
				if(mc.act == "hackerHurt"){
					if(mc.body.img.currentFrame >= mc.body.img.totalFrames - 1){
						mc.speed = mc.speedMax;
						mc.setAct("hackerRun");
					}
				}
				if(mc.x > 1220 || mc.x < -120){
					if(mc.x > 1220){
						this.valueLevel += 100000;
						this.tfTitleLevel.setText("Stolen money: " + this.valueLevel + "/" + this.valueLevelMax);
						if(this.valueLevel >= this.valueLevelMax){
							this._gameOverClient = true;
							if(options_arcade){
								this.resultGameEth(false);
							}
						}
					}
					mc.tLife = 0;
				}
			} else if(mc.name == "itemMiner"){
				mc.prevX = mc.x;
				mc.prevY = mc.y;
				this.updateColission(mc, this._arPlatform, diffTime);
				this.hitTeleport(mc, this._arTeleport, diffTime);
				this.hitContract(mc);
				if(mc.x > _W + mc.w || mc.x < -120){
					mc.tLife = 0;
				}
			} else if(mc.name == "itemProposal"){
				if(mc.state == 1){
					mc.x += mc.speed*mc.vX;
					var w = this.itemWall.w + mc.w;
					var h = this.itemWall.h + mc.h;
					if(hit_test_rec(this.itemWall, w, h, mc.x,mc.y)){
						if(mc.action == "run"){
							mc.vX = -mc.vX;
							mc.setScaleX(1);
							mc.setMark(3)
						} else if(mc.action == "climb"){
							mc.state = 2;
							mc.setAct("proposal"+mc.color+"Climb");
							mc.mark.visible = false;
							mc.hand.visible = false;
						}
					}
				} else if(mc.state == 2){
					mc.y -= mc.speed;
					if(mc.y+mc.h/2 < this.itemWall.y - this.itemWall.h/2){
						mc.state = 3;
						mc.setAct("proposal"+mc.color+"Run");
						mc.mark.visible = true;
						mc.hand.visible = true;
					}
				} else if(mc.state == 3){
					mc.x += mc.speed;
					if(mc.x-mc.w/2 > this.itemWall.x + this.itemWall.w/2){
						mc.state = 4;
					}
				} else if(mc.state == 4){
					mc.y += mc.speed*5;
					if(mc.y > this.groundY){
						mc.y = this.groundY;
						mc.state = 1;
					}
				}
				
				if(mc.x > _W + mc.w || mc.x < -mc.w*2){
					if((mc.color == "Red" && mc.x > _W + mc.w) ||
					(mc.color == "Green" && mc.x < -mc.w*2)){
						this.valueLevel += 1;
						this.tfTitleLevel.setText("Bad proposal: " + this.valueLevel + "/" + this.valueLevelMax);
						if(this.valueLevel >= this.valueLevelMax){
							this._gameOverClient = true;
							if(options_arcade){
								this.resultGameEth(false);
							}
						}
					}
					mc.tLife = 0;
				}
			} else if(mc.name == "tfBoom"){
				if(mc.scale.x < 1){
					mc.scale.x += mc.vA*0.1;
					mc.scale.y = mc.scale.x;
				}
			} else if(mc.name == "itemMoney"){
				mc.y += mc.speed
				mc.x += mc.speed/5*mc.vX
				mc.rotation += mc.vX*(Math.PI/180)
				if(Math.abs(mc.tgX - mc.x) > 5){
					mc.vX = -mc.vX;
				}
				if(hit_test_rec(this.itemDao, 150, 70, mc.x,mc.y)){
					// this.createText(mc, "+ 100");
					mc.tLife = 0;
				}
				if(mc.y > _H + mc.h){
					this.valueLevel += 100;
					this.tfTitleLevel.setText("Lost money: " + this.valueLevel + "/" + this.valueLevelMax);
					this.createText(mc, "- 100");
					if(this.valueLevel >= this.valueLevelMax){
						this._gameOverClient = true;
						this.itemDao.sprite.img.stop();
						if(options_arcade){
							this.resultGameEth(false);
						}
					}
					mc.tLife = 0;
				}
			}
			mc.tLife -= diffTime;
			if(mc.tLife < 0){
				this.addHolderObj(mc);
			}
		}
	}
}

ScrGame.prototype.resetTimer = function(){
	this.gameTime = getTimer();
}

ScrGame.prototype.update = function() {	
	var diffTime = getTimer() - this.startTime;
	
	if(this.startGame){
		this.timeTotal += diffTime;
		this.tfTotalTime.setText(Math.round(this.timeTotal/1000));
	}
	if(obj_game["balance"]==0){
		this.timeGetResult += diffTime;
		if(this.timeGetResult >= TIME_GET_RESULT &&
		this.bSendRequest == false){
			this.bSendRequest = true;
			this.timeGetResult = 0;
			infura.sendRequest("getBalance", openkey, _callback);
		}
	} else if(this.gameTxHash){
		if(login_obj["startGame"]){
			this.timeGetResult += diffTime;
			if(this.timeGetResult >= TIME_GET_RESULT){// &&
			// this.bSendRequest == false){
				// this.bSendRequest = true;
				this.timeGetResult = 0;
				if(this.timeTotal > 120*60){
					this.showError(ERROR_BLOCKCHAIN);
				} else {
					if(this.gameTxHash){
						this.clickDAO = false;
						var params = {
							"fromBlock": blockNumber,
							"toBlock": "latest",
							"address": addressContract,
						}
						infura.sendRequest("getLogs", params, _callback);
					}
				}
			}
		}
	}
	
	this.startTime = getTimer();
	
	if(this.timeCloseWnd > 0 && this.curWindow){
		this.timeCloseWnd -= diffTime;
		if(this.timeCloseWnd < 100){
			this.timeCloseWnd = 0;
			this.curWindow.visible = false;
			this.curWindow = undefined;
			this.bWindow = false;
		}
	}
		
	if(options_pause){
		return false;
	}
	
	diffTime = getTimer() - this.gameTime;
	
	
	for (var i = 0; i < this._arObject.length; i++) {
		var obj = this._arObject[i];
		obj.update(diffTime);
	}
	
	if(this.showWinEthereum > 0){
		this.showTimeEthereum -= diffTime
		if(this.showTimeEthereum < 0){
			this.showTimeEthereum = 100;
			this.showWinEthereum --;
			this.createIcoEthereum("iconEthereum");
		}
	}
	
	this.updateText(diffTime);
	this.updateHolder(diffTime);
	this.healthDao();
	
	if(this.startGame){
		if(options_arcade && this.curLevel > 1 && this.timeTotal > 30*1000){
			this.resultGameEth(true);
		} else {
			if(this.curLevel == 2){
				if(_mouseX && _mouseY){
					this.itemDao.initMove({x:_mouseX, y:_mouseY})
				}
				this.timeMoney += diffTime;
				if(this.timeMoney >= TIME_RESPAWN_MONEY){
					this.timeMoney = 0;
					var posX = Math.round(Math.random()*(_W-200))+100
					this.createObj({x:posX, y:-50}, "iconEthereum")
				}
			} else if(this.curLevel == 3){
				this.timeProposal += diffTime;
				if(this.timeProposal >= TIME_RESPAWN_PROPOSAL){
					this.timeProposal = 0;
					this.createObj({x:-60, y:500}, "itemProposal")
				}
			} else if(this.curLevel == 4){
				this.timeHacker += diffTime;
				if(this.timeHacker >= TIME_RESPAWN_HACKER){
					this.timeHacker = 0;
					var posY = 510 + Math.random()*30;
					this.createObj({x:-60, y:posY}, "itemHacker")
				}
			} else if(this.curLevel == 5){
				this.timeProposal += diffTime;
				if(this.timeProposal >= TIME_RESPAWN_MINER){
					this.timeProposal = 0;
					this.createObj({x:-30, y:280}, "itemMiner")
				}
				var cO = this.doorOld;
				if(cO){
					if(cO.bOpen){
						cO.bStart = true;
						cO.scale.x -= 0.1;
						if(cO.scale.x < -0.8){
							cO.bOpen = false;
							cO.bClose = true;
						}
					}
					if(cO.bClose){
						cO.scale.x += 0.1;
						if(cO.scale.x > 0.9){
							cO.scale.x = 1;
							cO.bOpen = false;
							cO.bClose = false;
							cO.bStart = false;
						}
					}
				}
				var cN = this.doorNew;
				if(cN){
					if(cN.bOpen){
						cN.bStart = true;
						cN.scale.x -= 0.1;
						if(cN.scale.x < -0.8){
							cN.bOpen = false;
							cN.bClose = true;
						}
					}
					if(cN.bClose){
						cN.scale.x += 0.1;
						if(cN.scale.x > 0.9){
							cN.scale.x = 1;
							cN.bOpen = false;
							cN.bClose = false;
							cN.bStart = false;
						}
					}
				}
			}
		}
	}
	
	this.gameTime = getTimer();
	this.startTime = getTimer();
}

ScrGame.prototype.checkButtons = function(evt){
	_mouseX = evt.data.global.x;
	_mouseY = evt.data.global.y;
	
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, _mouseX, _mouseY) &&
		item_mc.visible && item_mc.dead != true && 
		(!this.bWindow || item_mc.name == "btnSmart")){
			if(item_mc._selected == false){
				item_mc._selected = true;
				if(item_mc.over){
					item_mc.over.visible = true;
				}
			}
		} else {
			if(item_mc._selected){
				item_mc._selected = false;
				if(item_mc.over){
					item_mc.over.visible = false;
				}
			}
		}
	}
}

ScrGame.prototype.touchHandler = function(evt){
	var phase = evt.type;
	
	if(phase=='mousemove' || phase == 'touchmove' || phase == 'touchstart'){
		this.checkButtons(evt);
	} else if (phase == 'mousedown' || phase == 'touchend') {
		for (var i = 0; i < this._arButtons.length; i++) {
			var item_mc = this._arButtons[i];
			if(item_mc._selected){
				this.clickCell(item_mc);
				return;
			}
		}
		
		if(this.startGame){
			if(this.curLevel == 3 || 
			this.curLevel == 4 || 
			this.curLevel == 5){
				this.clickObject(evt);
			}
		}
	}
}

ScrGame.prototype.removeAllListener = function(){
	if(this.wndInfo){
		this.wndInfo.removeAllListener();
	}
	if(this.wndResult){
		this.wndResult.removeAllListener();
	}
	
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
