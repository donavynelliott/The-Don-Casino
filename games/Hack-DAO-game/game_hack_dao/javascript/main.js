var _W = 1280;
var _H = 720;
var version = "v. 1.1.15"
var login_obj = {};
var dataAnima = [];
var dataMovie = [];
var betslevel = [];
var openkey, privkey, mainet;
var currentScreen, scrContainer;
var ScreenMenu, ScreenGame, ScreenLevels, ScreenTest;
var LoadPercent = null;
var renderer, stage, preloader; // pixi;
var sprites_loaded = false;
var fontMain = "Luckiest Guy";
var fontImpact = "Impact";
var fontTahoma = "Tahoma";
var fontGothic = "Century Gothic";
var stats; //для вывода статистики справа

var addressContract = "0x5c430fa24f782cf8156ca97208c42127b17b0494";
var	addressTestContract = "0xb22cd5f9e5f0d62d47e52110d9eec3a45be54498";

var options_debug = false;
var options_test = false;
var options_unlock = false;
var options_ethereum = true;
var options_mainet = false;
var options_testnet = false;
var options_rpc = false;
var options_music = true;
var options_sound = true;
var options_mobile = true;
var options_arcade = false;
var options_pause = false;
var options_txt_offset = 0;

var ERROR_KEYTHEREUM = 1;
var ERROR_TRANSACTION = 2;
var ERROR_KEY = 3;
var ERROR_BANK = 4;
var ERROR_BLOCKCHAIN = 5;

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) { return window.setTimeout(callback, 1000 / 60); };
	
function initGame() {
	if(window.orientation == undefined){
		options_mobile = false;
	} else {
		options_mobile = true;
		options_orientation = window.orientation;
	}
	
    var ua = navigator.userAgent;
    if (ua.search(/Safari/) > -1) {
        options_browser = "safari";
    }
	
	if(typeof console === "undefined"){ console = {}; }
	
    //initialize the stage
    renderer = PIXI.autoDetectRenderer(_W, _H);
    stage = new PIXI.Container();
    document.body.appendChild(renderer.view);
    preloader = new PIXI.loaders.Loader();

    window.addEventListener("resize", onResize, false);
	
	startTime = getTimer();
    onResize();
    update();
	
	var font1 = addText("font1", 16, "#000000")
	font1.x = _W/2;
	font1.y = -100;
	stage.addChild(font1);
	var font2 = addText("font2", 16, "#000000", undefined, "center", 200, 2, fontTahoma)
	font2.x = _W/2;
	font2.y = -120;
	stage.addChild(font2);
	
	// eth = 1
	// betslevel[1] = {win:90, koef:1.09, bet:1};
	// betslevel[2] = {win:80, koef:1.22, bet:1.09};
	// betslevel[3] = {win:70, koef:1.40, bet:1.3298};
	// betslevel[4] = {win:60, koef:1.63, bet:1.86172};
	// betslevel[5] = {win:50, koef:1.96, bet:3.0346036};
	// betslevel[6] = {win:40, koef:2.45, bet:5.947823056};
	// betslevel[7] = {win:30, koef:3.26, bet:14.5721664872};
	// betslevel[8] = {win:20, koef:4.9, bet:47.505262748272};
	// betslevel[9] = {win:10, koef:9.8, bet:232.7757874665328};
	
	// eth = 0.2
	betslevel[1] = {win:90, koef:1.09, bet:0.2, prize:0.018};
	betslevel[2] = {win:80, koef:1.22, bet:0.214, prize:0.04708};
	betslevel[3] = {win:70, koef:1.40, bet:0.25708, prize:0.102832};
	betslevel[4] = {win:60, koef:1.63, bet:0.355912, prize:0.22422456};
	betslevel[5] = {win:50, koef:1.96, bet:0.57613656, prize:0.5530910976};
	
	// soundManager = new SoundManager();
	// soundManager.currentMusic = "none";
	infura = new Infura();
	
	LoadBack = new PIXI.Container();
	stage.addChild(LoadBack);
	scrContainer = new PIXI.Container();
	stage.addChild(scrContainer);
	
	var preload_image = document.createElement("img");
	preload_image.src = "images/bg/bgMenu.jpg";
	preload_image.onload = function() {
		var bgLoading = new PIXI.Sprite.fromImage(preload_image.src);
		bgLoading.texture.baseTexture.on('loaded', 
				function(){
					bgLoading.x = _W/2 - bgLoading.width/2;
					bgLoading.y = _H/2 - bgLoading.height/2;
				});
		LoadBack.addChild(bgLoading);
		var w = 270;
		LoadPercent = addText("Game loading", 30, "#FFFFFF", "#000000", "center", w, 2.5);
		LoadPercent.x = _W/2;
		LoadPercent.y = _H/2 + 120;
		LoadBack.addChild(LoadPercent);
		var tfVersion = addText(version, 16, "#000000", undefined, "right", 400)
		tfVersion.x = _W-20;
		tfVersion.y = _H-24;
		LoadBack.addChild(tfVersion);
	};
	
	loadManifest();
}

function loadManifest(){
	preloader = new PIXI.loaders.Loader();
	
	preloader.add("bgMenu", "images/bg/bgMenu.jpg");
	preloader.add("bgLevels", "images/bg/bgLevels.jpg");
	preloader.add("bgLevel1", "images/bg/bgLevel1.jpg");
	preloader.add("bgLevel2", "images/bg/bgLevel2.jpg");
	preloader.add("bgLevel3", "images/bg/bgLevel3.jpg");
	preloader.add("bgLevel4", "images/bg/bgLevel4.jpg");
	preloader.add("bgLevel5", "images/bg/bgLevel5.jpg");
	preloader.add("wndInfo", "images/bg/wndInfo.png");
	preloader.add("wndWin", "images/bg/wndWin.png");
	preloader.add("wndLose", "images/bg/wndLose.png");
	
	preloader.add("btnClose", "images/buttons/btnClose.png");
	preloader.add("btnCloseOver", "images/buttons/btnCloseOver.png");
	preloader.add("btnCloseDown", "images/buttons/btnCloseDown.png");
	preloader.add("btnDefault", "images/buttons/btnDefault.png");
	preloader.add("btnDefaultOver", "images/buttons/btnDefaultOver.png");
	preloader.add("btnDefaultDown", "images/buttons/btnDefaultDown.png");
	preloader.add("btnDao", "images/buttons/btnDao.png");
	preloader.add("btnDaoOver", "images/buttons/btnDaoOver.png");
	preloader.add("btnFacebookShare", "images/buttons/btnFacebookShare.png");
	preloader.add("btnTweetShare", "images/buttons/btnTweetShare.png");
	preloader.add("btnOrange", "images/buttons/btnOrange.png");
	preloader.add("btnOrangeOver", "images/buttons/btnOrangeOver.png");
	preloader.add("btnOrangeDown", "images/buttons/btnOrangeDown.png");
	preloader.add("btnGreen", "images/buttons/btnGreen.png");
	preloader.add("btnGreenOver", "images/buttons/btnGreenOver.png");
	preloader.add("btnGreenDown", "images/buttons/btnGreenDown.png");
	preloader.add("btnFrame", "images/buttons/btnFrame.png");
	preloader.add("btnFrameOver", "images/buttons/btnFrameOver.png");
	
	preloader.add("itemDao", "images/items/itemDao.png");
	preloader.add("eggPart", "images/items/eggPart.png");
	preloader.add("iconEthereum", "images/items/iconEthereum.png");
	preloader.add("hintArrow", "images/items/hintArrow.png");
	preloader.add("itemWall", "images/items/itemWall.png");
	preloader.add("itemHome", "images/items/itemHome.png");
	preloader.add("itemHome2", "images/items/itemHome2.png");
	preloader.add("itemLevel", "images/items/itemLevel.png");
	preloader.add("itemLock", "images/items/itemLock.png");
	preloader.add("itemHandProposal", "images/items/itemHandProposal.png");
	preloader.add("itemBodyGreen", "images/items/itemBodyGreen.png");
	preloader.add("itemBodyRed", "images/items/itemBodyRed.png");
	preloader.add("itemBodyBlack", "images/items/itemBodyBlack.png");
	preloader.add("itemPlatform", "images/items/itemPlatform.png");
	preloader.add("itemTeleport", "images/items/itemTeleport.png");
	preloader.add("contractNew", "images/items/contractNew.png");
	preloader.add("contractOld", "images/items/contractOld.png");
	preloader.add("doorOld", "images/items/doorOld.png");
	preloader.add("doorNew", "images/items/doorNew.png");
	preloader.add("itemHeadMiner", "images/items/itemHeadMiner.png");
	preloader.add("icoKey", "images/items/icoKey.png");
	preloader.add("icoEthereum", "images/items/icoEthereum.png");
	preloader.add("icoTime", "images/items/icoTime.png");
	preloader.add("starAppear", "images/items/starAppear.png");
	preloader.add("itemBlank1", "images/items/itemBlank1.png");
	preloader.add("itemBlank2", "images/items/itemBlank2.png");
	preloader.add("itemBlank3", "images/items/itemBlank3.png");
	preloader.add("tfBoom", "images/items/tfBoom.png");
	
	preloader.add("images/texture/AnimaTexture.json");
	preloader.add("images/texture/Anima2Texture.json");
	
	//сохраняем счетчик кол-ва файлов для загрузки
	preloader.on("progress", handleProgress);
	preloader.load(handleComplete);
}

function spritesLoad() {
	if(sprites_loaded){
		return true;
	}
	sprites_loaded = true;
	
	var img, data;
	
	// var base = PIXI.utils.TextureCache["images/icons.png"];
	// var texture0 = new PIXI.Texture(base);
	// texture0.frame = new PIXI.Rectangle(0, 0, 100, 100);
	// var texture1 = new PIXI.Texture(base);
	// texture1.frame = new PIXI.Rectangle(100, 0, 100, 100);
	// var texture2 = new PIXI.Texture(base);
	// texture2.frame = new PIXI.Rectangle(200, 0, 100, 100);
	// data = [texture0, texture1, texture2];
	// dataMovie["icons"] = data;
}

function textureLoad() {
	if(!options_test){
		iniSet("images/texture/AnimaTexture.json");
		iniSet("images/texture/Anima2Texture.json");
		// iniSetArt("images/buttons/ButtonsTexture.json");
	}
}

function iniSet(set_name) {
	var json = preloader.resources[set_name]
	if(json){}else{
		console.log("ERROR: " + set_name + " is undefined");
		return;
	}
	json = json.data;
	
	var jFrames = json.frames;
	var data = preloader.resources[set_name].textures; 
	var dataTexture = [];
	var animOld = "";
	// console.log("set_name:", set_name);
	
	if(data && jFrames){
		for (var namePng in jFrames) {
			var index = namePng.indexOf(".png");
			var nameFrame = namePng;
			if (index > 1) {
				nameFrame = namePng.slice(0, index);
			}
			// console.log("nameFrame:", nameFrame, index2);
			
			var index2 = nameFrame.indexOf("/");
			if (index2 > 1) {
				var type = nameFrame.slice(0, index2); // тип анимации
				var anim = type; // имя сета
				if(anim != animOld){
					animOld = anim;
					dataTexture[anim] = [];
				}
				dataTexture[anim].push(PIXI.Texture.fromFrame(namePng));
				// console.log(nameFrame + ": ", anim, namePng);
			}
		}
		
		for (var name in dataTexture) {
			var arrayFrames = dataTexture[name]; // какие кадры используются в сети
			dataMovie[name] = arrayFrames;
			// console.log(name + ": ", arrayFrames);
			// console.log(name);
		}
	}
}

function iniSetArt(set_name) {	
	var json = preloader.resources[set_name]
	if(json){}else{
		console.log("ERROR: " + set_name + " is undefined");
		return;
	}
	json = json.data;
	
	var frames = json.frames;
	var data = preloader.resources[set_name].textures; 
	// console.log("set_name:", set_name);
	
	if(data && frames){
		for (var namePng in frames) {
			var index = namePng.indexOf(".png");
			var nameFrame = namePng;
			if (index > 1) {
				nameFrame = namePng.slice(0, index);
			}
			dataAnima[nameFrame] = data[namePng];
			// console.log("nameFrame:", nameFrame);
		}
	}
}

function handleProgress(){
	var percent = Math.ceil(preloader.progress)
	if(LoadPercent){
		LoadPercent.setText("Game loading: " + percent + "%");
	}
}

function handleComplete(evt) {
	loadData();
	spritesLoad();
	textureLoad();
    onResize();
	if(document.location.hash == "#testnet"){
		options_testnet = true;
	}
	if(mainet){
		if(mainet == "on"){
			options_mainet = true;
		} else {
			options_mainet = false;
		}
	} else {
		options_mainet = false;
	}
	options_testnet = !options_mainet;
	if(options_testnet){
		version = version + " testnet"
	}
	
	start();
}

function getTimer(){
	var d = new Date();
	var n = d.getTime();
	return n;
}

function refreshTime(){
	startTime = getTimer();
	if(currentScreen){
		if(ScreenGame){
			ScreenGame.resetTimer();
		}
	}
}

function get_normal_time(ms){
	if (ms<0) {
		return "00:00";
	}
	var s = Math.round(ms/1000);
	var m = Math.floor(s / 60);
	s = s - m * 60;
	var tS = String(s);
	var tM = String(m);
	
	if (s<10 && s>=0) {
		tS = "0" + String(s);
	}
	if (m<10 && m>=0) {
		tM = "0" + String(m);
	}
	return tM + ":" + tS;
}

/*
* value - Дробное число.
* precision - Количество знаков после запятой.
*/
function toFixed(value, precision){
	precision = Math.pow(10, precision);
	return Math.ceil(value * precision) / precision;
}

function numToHex(num) {
	return num.toString(16);
}
function hexToNum(str) {
	return parseInt(str, 16);
}
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function copyToClipboard(value) {
  window.prompt("Copy to clipboard: Ctrl+C", value);
}

function removeAllScreens() {
	if(ScreenGame){
		scrContainer.removeChild(ScreenGame);
		ScreenGame = null;
	}
	if(ScreenLevels){
		scrContainer.removeChild(ScreenLevels);
		ScreenLevels = null;
	}
	if(ScreenMenu){
		scrContainer.removeChild(ScreenMenu);
		ScreenMenu = null;
	}
	if(currentScreen){
		scrContainer.removeChild(currentScreen);
		currentScreen = null;
	}
}

function update() {
	if(ScreenGame){
		ScreenGame.update();
	}
	
	requestAnimationFrame(update);
	renderer.render(stage);
}

function saveData() {
	if(isLocalStorageAvailable()){
		var login_str = JSON.stringify(login_obj);
		localStorage.setItem('daocasino_hack', login_str);
		localStorage.setItem('options_music', options_music);
		localStorage.setItem('options_sound', options_sound);
		localStorage.setItem('openkey', openkey);
		localStorage.setItem('privkey', privkey);
		// console.log("Saving: ok!");
	}
}

function loadData() {
	if(isLocalStorageAvailable()){
		mainet = localStorage.getItem('mainnet')
		openkey = localStorage.getItem('openkey')
		privkey = localStorage.getItem('privkey')
		if (localStorage.getItem('daocasino_hack')){
			var login_str = localStorage.getItem('daocasino_hack')
			login_obj = JSON.parse(login_str);
			options_music = localStorage.getItem('options_music')=='true';
			options_sound = localStorage.getItem('options_sound')=='true';
			checkData();
			// console.log("Loading: ok!");
		} else {
			checkData();
			// console.log("Loading: fail!");
		}
	}
}

function checkData() {
	
}

function resetData() {
	login_obj = {};
	saveData();
}

function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
		console.log("localStorage_failed:",e);
        return false;
    }
}

function getArTh(objData, thId) {
    var array = [];
	if(objData.result == undefined){
		return undefined;
	}
    var mainObj = objData.result;
    for (var i = 0; i < objData.result.length; i++){
        var obj = objData.result[i];
        if(thId == obj.transactionHash){
			console.log(i, obj)
            array.push(obj.transactionHash);
        }
    }
    
    return array;
}

function parseData(objData) {
    var arGame = [];
    var thId = ""
	var len = objData.result.length;
	var index = 0;
	if(len > 5){
		index = len-5;
	}
    for (var i = index; i < len; i++){
        var obj = objData.result[i];
        if(thId != obj.transactionHash){
            thId = obj.transactionHash;
            var ar = getArTh(objData, thId);
			if(ar){
				arGame[thId] = ar;
			}
        }
    }
}

function getLogs() {
	var objOrcl = undefined;
	$.get("https://testnet.etherscan.io/" + 
		"api?module=logs"+
		"&action=getLogs"+
		"&fromBlock=379224"+
		"&toBlock=latest"+
		"&address="+"0xb22cd5f9e5f0d62d47e52110d9eec3a45be54498"+
		"&apikey=YourApiKeyToken", function (d) {
			var objData = d;
			parseData(objData);
		}, 
	"json");
}

function removeSelf(obj) {
	if (obj) {
		if (obj.parent.contains(obj)) {
			obj.parent.removeChild(obj);
		}
	}
}

function start() {
	if(LoadBack){
		stage.removeChild(LoadBack);
	}
	if(options_test){
		addScreen("test");
	} else {
		addScreen("menu");
	}
}

function showMenu() {
	addScreen("menu");
}
function showGame() {
	addScreen("game");
}
function showLevels() {
	addScreen("levels");
}
function showTest() {
	addScreen("test");
}
function showHome() {
	var url = "/";
	window.open(url, "_self"); // "_blank",  "_self"
}

function addScreen(name) {
	removeAllScreens();
	
	if(name == "game"){
		ScreenGame = new ScrGame();
		scrContainer.addChild(ScreenGame);
		currentScreen = ScreenGame;
	} else if(name == "menu"){
		ScreenMenu = new ScrMenu();
		scrContainer.addChild(ScreenMenu);
		currentScreen = ScreenMenu;
	} else if(name == "levels"){
		ScreenLevels = new ScrLevels();
		scrContainer.addChild(ScreenLevels);
		currentScreen = ScreenLevels;
	} else if(name == "test"){
		ScreenTest = new ScrTest();
		scrContainer.addChild(ScreenTest);
		currentScreen = ScreenTest;
	}
	currentScreen.name = name;
}

function addButton(name, _x, _y, _scGr) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	var obj = new PIXI.Container();
	
	var objImg = null;
	obj.setImg = function(name){
		objImg = addObj(name, 0, 0, _scGr);
		obj.addChild(objImg);
		obj.over = addObj(name + "Over", 0, 0, _scGr);
		if(obj.over){
			obj.over.visible = false;
			obj.addChild(obj.over);
		} else {
			obj.over = null;
		}
		obj.lock = addObj(name + "Lock", 0, 0, _scGr);
		if(obj.lock){
			obj.lock.visible = false;
			obj.addChild(obj.lock);
		} else {
			obj.lock = null;
		}
		
		obj.vX = 1;
		obj.vY = 1;
		obj.x = _x*_scGr;
		obj.y = _y*_scGr;
		obj.w = objImg.w;
		obj.h = objImg.h;
		obj.r = obj.w/2;
		obj.rr = obj.r*obj.r;
		obj.name = name;
		obj._selected = false;
		if(obj.w < 50){
			obj.w = 50;
		}
		if(obj.h < 50){
			obj.h = 50;
		}
	}
	
	obj.setImg(name);
	
	return obj;
}

function addButton2(name, _x, _y, _scGr, _scaleX, _scaleY) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	if(_scaleX){}else{_scaleX = 1};
	if(_scaleY){}else{_scaleY = 1};
	var obj = new PIXI.Container();
	
	var data = preloader.resources[name];
	var objImg = null;
	if(data){
		objImg = new PIXI.Sprite(data.texture);
		objImg.anchor.x = 0.5;
		objImg.anchor.y = 0.5;
		obj.addChild(objImg);
	} else {
		return null;
	}
	
	data = preloader.resources[name + "Over"];
	if(data){
		obj.over = new PIXI.Sprite(data.texture);
		obj.over.anchor.x = 0.5;
		obj.over.anchor.y = 0.5;
		obj.over.visible = false;
		obj.addChild(obj.over);
	} else {
		obj.over = null;
	}
	
	data = preloader.resources[name + "Lock"];
	if(data){
		obj.lock = new PIXI.Sprite(data.texture);
		obj.lock.anchor.x = 0.5;
		obj.lock.anchor.y = 0.5;
		obj.lock.visible = false;
		obj.addChild(obj.lock);
	} else {
		obj.lock = null;
	}
	obj.scale.x = _scGr*_scaleX;
	obj.scale.y = _scGr*_scaleY;
	obj.vX = _scaleX;
	obj.vY = _scaleY;
	obj.x = _x;
	obj.y = _y;
	obj.w = objImg.width*_scGr;
	obj.h = objImg.height*_scGr;
	obj.r = obj.w/2;
	obj.rr = obj.r*obj.r;
	obj.name = name;
	obj._selected = false;
	if(obj.w < 50){
		obj.w = 50;
	}
	if(obj.h < 50){
		obj.h = 50;
	}
	
	return obj;
}

function addObj(name, _x, _y, _scGr, _scaleX, _scaleY, _anchor) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	if(_scaleX){}else{_scaleX = 1};
	if(_scaleY){}else{_scaleY = 1};
	if(_anchor){}else{_anchor = 0.5};
	var obj = new PIXI.Container();
	obj.scale.x = _scGr*_scaleX;
	obj.scale.y = _scGr*_scaleY;
	
	var objImg = null;
	if(dataAnima[name]){
		objImg = new PIXI.Sprite(dataAnima[name]);
	} else if(dataMovie[name]){
		objImg = new PIXI.extras.MovieClip(dataMovie[name]);
		objImg.stop();
	}else{
		var data = preloader.resources[name];
		if(data){
			objImg = new PIXI.Sprite(data.texture);
		} else {
			return null;
		}
	}
	objImg.anchor.x = _anchor;
	objImg.anchor.y = _anchor;
	obj.w = objImg.width*obj.scale.x;
	obj.h = objImg.height*obj.scale.y;
	obj.addChild(objImg);
	obj.x = _x*_scGr;
	obj.y = _y*_scGr;
	obj.name = name;
	obj.img = objImg;
	obj.r = obj.w/2;
	obj.rr = obj.r*obj.r;
    //установим точку регистрации в 0 0
    obj.setReg0 = function () {
        objImg.anchor.x = 0;
        objImg.anchor.y = 0;
    }
    obj.setRegX = function (procx) {
        objImg.anchor.x = procx;
    }
    obj.setRegY = function (procy) {
        objImg.anchor.y = procy;
    }
	
	return obj;
}

function addText(text, size, color, glow, _align, width, px, font){
	if(size){}else{size = 24};
	if(color){}else{color = "#FFFFFF"};
	if(glow){}else{glow = undefined};
	if(_align){}else{_align = "center"};
	if(width){}else{width = 600};
	if(px){}else{px = 2};
	if(font){}else{font = fontMain};
	
	var style;
	
	if(glow){
		style = {
			font : size + "px " + font,
			fill : color,
			align : _align,
			stroke : glow,
			strokeThickness : px,
			wordWrap : true,
			wordWrapWidth : width
		};
	} else {
		style = {
			font : size + "px " + font,
			fill : color,
			align : _align,
			wordWrap : true,
			wordWrapWidth : width
		};
	}
	
	var obj = new PIXI.Container();
	
	var tfMain = new PIXI.Text(text, style);
	tfMain.y = options_txt_offset;
	obj.addChild(tfMain);
	if(_align == "left"){
		tfMain.x = 0;
	} else if(_align == "right"){
		tfMain.x = -tfMain.width;
	} else {
		tfMain.x = - tfMain.width/2;
	}
	
	obj.width = Math.ceil(tfMain.width);
	obj.height = Math.ceil(tfMain.height);
	
	obj.setText = function(value){
		tfMain.text = value;
		if(_align == "left"){
			tfMain.x = 0;
		} else if(_align == "right"){
			tfMain.x = -tfMain.width;
		} else {
			tfMain.x = - tfMain.width/2;
		}
	}
	
	obj.getText = function(){
		return tfMain.text;
	}
	
	return obj;
}

function addWinLevel(id){
	var levels = getLevels();
	levels[id] = true;
}

function resetLevels(){
	login_obj["levels"] = {};
}

function getLevels(){
	if(login_obj["levels"]){}else{
		login_obj["levels"] = {};
	}
	
	return login_obj["levels"];
}

function getArcadeBalance(){
	if(login_obj["balanceArcade"]){}else{
		login_obj["balanceArcade"] = 1;
	}
	
	return login_obj["balanceArcade"];
}

function initjiggle(t, startvalue, finishvalue, div, step){
	if(startvalue){}else{startvalue = 2};
	if(finishvalue){}else{finishvalue = 1};
	if(div){}else{div =  0.7};
	if(step){}else{step =  0.5};
	
	t.scale.x = startvalue
	t.scale.y = t.scale.x
	t.jska = finishvalue
	t.jdx = 0
	t.jdv = div
	t.jdvstep = step
}

function jiggle(t){
	t.jdx = t.jdx * t.jdvstep + (t.jska - t.scale.x) * t.jdv
	t.scale.x = Math.max(0.1, t.scale.x + t.jdx)
	t.scale.y = t.scale.x
}

function rad(qdeg){
	return qdeg * (Math.PI / 180);
}
function deg(qrad){
	return qrad * (180 / Math.PI);
}
function get_dd(p1, p2) {
	var dx=p2.x-p1.x;
	var dy=p2.y-p1.y;
	return dx*dx+dy*dy;
}
function getDD(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	return dx*dx+dy*dy;
}
function hit_test(mc,rr,tx,ty) {
	var dx = mc.x - tx;
	var dy = mc.y - ty;
	var dd = dx*dx+dy*dy;
	if(dd<rr){
		return true
	}
	return false
}
function hit_test_rec(mc, w, h, tx, ty) {
	if(tx>mc.x-w/2 && tx<mc.x+w/2){
		if(ty>mc.y-h/2 && ty<mc.y+h/2){
			return true;
		}
	}
	return false;
}
function hitTestObject(mc1, mc2) {
	if (mc1.x < mc2.x + mc2.w &&
	   mc1.x + mc1.w > mc2.x &&
	   mc1.y < mc2.y + mc2.h &&
	   mc1.h + mc1.y > mc2.y) {
		return true;
	}
	return false;
}
function intersects(a, b) {
  return ( a.y1 < b.y2 || a.y2 > b.y1 || a.x2 < b.x1 || a.x1 > b.x2 );
}


function visGame() {
	//play
	options_pause = false;
	refreshTime();
}

function hideGame() {
	//pause
	options_pause = true;
	// music_stop();
	refreshTime();
}

visibly.onVisible(visGame)
visibly.onHidden(hideGame)
