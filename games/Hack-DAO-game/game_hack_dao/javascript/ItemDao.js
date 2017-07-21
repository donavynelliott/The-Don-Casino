function ItemDao() {
	PIXI.Container.call( this );
	this.init();
}

ItemDao.prototype = Object.create(PIXI.Container.prototype);
ItemDao.prototype.constructor = ItemDao;

var TIME_JIGGLE = 1500;

ItemDao.prototype.init = function() {
	this.name = "itemDao";
	this.skin = "";
	this.act = "";
	this.item = new PIXI.Container();
	this.addChild(this.item);
	this._selected = false;
	this.dead = false;
	this.init = false;
	this.healthMax = 10000;
	this.health = this.healthMax;
	this.speed = 15;
	this.rr = 50*50;
	this._move = false;
	this._weary = false;
	this.timeRun = 0;
	this._ptMove;
	this._angleMove = 0;
	
	var w = 100
	var h = 10
	this.barDao = new PIXI.Container();
	this.barDao.x = - w/2
	this.barDao.y = - 150
    this.addChild(this.barDao);
	var bg = new PIXI.Graphics();
    bg.beginFill(0x0000000).drawRect(-2, -2, w+4, h+4).endFill();
    this.barDao.addChild(bg);
	var life = new PIXI.Graphics();
    life.beginFill(0xff00000).drawRect(0, 0, w, h).endFill();
    this.barDao.addChild(life);
	this.barDao.life = life;
	this.barDao.w = w;
	this.barDao.h = h;
}

ItemDao.prototype.setSkin = function(skin) {
	this.skin = skin;
}

ItemDao.prototype.setAct = function(act) {
	if(this.skin+this.act == this.skin+act){
		return false;
	}
	this.act = act;
	if(this.sprite){
		this.item.removeChild(this.sprite);
	}
	
	var _x = 0;
	var _y = 0;
	
	this.sprite = addObj(this.skin+this.act, _x, _y);
	this.item.addChild(this.sprite);
	this.w = this.sprite.w;
	this.h = this.sprite.h;
	
	if(this.act == "Stay"){
	} else {
		this.sprite.img.play();
		this.sprite.img.animationSpeed = 0.5;
	}
}

ItemDao.prototype.initjiggle = function() {
	this.init = true
	if(this.act == "Stay" && this.skin != "egg"){
		if(Math.random() > 0.75){
			this.setAct("Damage")
		}
	}
	if(this.act != "Cure"){
		initjiggle(this.item, 1.1, 1, 0.4, 0.7)
	}
}

ItemDao.prototype.initMove = function(point){
	if(this.dead){
		return false;
	}
	if(this.sprite){}else{
		return false;
	}
	if (Math.abs(this.x - point.x) < this.speed*5 || this._weary){
		return false;
	}
	this.setAct("RunMoney");
	this._move = true;
	this._ptMove = point;
	this._angleMove = Math.atan2(this._ptMove.y-(this.y), this._ptMove.x-(this.x));
	
	if(this._ptMove.x < this.x){
		this.sprite.scale.x = 1*Math.abs(this.sprite.scale.x);
	} else {
		this.sprite.scale.x = -1*Math.abs(this.sprite.scale.x);
	}
}

ItemDao.prototype.move = function(){
	this._angleMove = Math.atan2(this._ptMove.y-(this.y), this._ptMove.x-(this.x));
	var cosAngle = Math.cos(this._angleMove);
	var sinAngle = Math.sin(this._angleMove);
	var speed = Math.max(this.speed, 1);
	var xMov = speed*cosAngle;
	var yMov = speed*sinAngle;
	this.x += Math.round(xMov);
	// this.y += Math.round(yMov);
	if (Math.abs(this.x - this._ptMove.x) < this.speed) {
		this._move = false;
		if(this.sprite){
			if(this.act == "RunMoney"){
				this.setAct("Stay2");
			}
		}
	}
}

ItemDao.prototype.update = function(diffTime) {	
	if(this.skin == "dao"){
		if(this.act == "Cure" || this.act == "Damage"){
			if(this.sprite.img.currentFrame >= this.sprite.img.totalFrames - 1){
				this.setAct("Stay")
			}
		} else if(this.act == "Appear"){
			if(this.sprite.img.currentFrame >= this.sprite.img.totalFrames - 1){
				this.sprite.img.stop();
			}
		}
	}
	
	if(this.barDao.visible){
		var curSc = this.health/this.healthMax;
		curSc = Math.max(curSc, 0.01);
		this.barDao.life.scale.x = Math.min(curSc, 1);
	}
	
	if(this.dead){
		return false;
	}
	
	if (this.init) {
		jiggle(this.item)
	}
	
	if(this._move){
		this.timeRun += diffTime;
		this.move();
		if(this.timeRun > 10000){
			this._move = false;
			this._weary = true;
			this.setAct("Stay3");
			this.timeRun = 2000;
		}
	} else {
		if(this.timeRun > 0){
			this.timeRun -= diffTime;
		} else {
			this._weary = false;
		}
	}
}