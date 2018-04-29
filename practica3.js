var game = function() {
// Set up an instance of the Quintus engine and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({ audioSupported: ['mp3','ogg'] })
	.include("Audio, Sprites, Scenes, Input, Touch, UI, Anim, TMX, 2D")
	.setup({width: 320, // Set the default width to 320 pixels
			height: 480, // Set the default height to 480 pixels
			})
	// And turn on default input controls and touch input (for UI)
	.controls().touch().enableSound();

/*---------------------------------LEVEL 1-----------------------------------*/
Q.scene("level1",function(stage) {
	Q.stageTMX("level.tmx",stage);

	var player = stage.insert(new Q.Mario({x:55, y:528}));
	var goomba = stage.insert(new Q.Goomba({x:281, y:528}));
	var goomba = stage.insert(new Q.Goomba({x:1600, y:380}));
	var goomba = stage.insert(new Q.Goomba({x:1094, y:528}));
	var bloopa = stage.insert(new Q.Bloopa());
	var princess = stage.insert(new Q.Princess());
	var coin = stage.insert(new Q.Coin({x:534, y:374, picked: false}));
	var coin = stage.insert(new Q.Coin({x:950, y:408, picked: false}));
	var coin = stage.insert(new Q.Coin({x:1211, y:476, picked: false}));
	var coin = stage.insert(new Q.Coin({x:1417, y:408, picked: false}));

	stage.add("viewport")
		.follow(player);
	stage.viewport.offsetY = 150;
	stage.viewport.offsetX = -90;
});

/*---------------------------------HUD-----------------------------------*/
Q.scene("HUD",function(stage) {
	var score = stage.insert(new Q.Score());
});


/*---------------------------------PANTALLA INICIO-----------------------------------*/
Q.scene('mainTitle',function(stage) {
	Q.audio.stop();
	Q.audio.play('music_main.mp3',{ loop: true });
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = box.insert(new Q.UI.Button({ x: 0, y: 0,
                                           asset: "mainTitle.png" }));

  Q.input.keyboardControls({
		ENTER: "start"
	});

  Q.input.on("start",this, function(){
  	Q.audio.stop();
	Q.audio.play('music_main.mp3',{ loop: true });
    Q.clearStages();
    Q.stageScene('HUD',1);
    Q.stageScene('level1');
  });

  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('HUD',1);
    Q.stageScene('level1');
  });
  box.fit(20);
});


/*---------------------------------FIN DEL JUEGO-----------------------------------*/
Q.scene('endGame',function(stage) {

  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play Again" }));
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('mainTitle');
  });
  box.fit(20);
});


/*---------------------------------YOU WIN-----------------------------------*/
Q.scene('winGame',function(stage) {

  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play again" }));
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('mainTitle');
  });
  Q.audio.stop();
	Q.audio.play('music_level_complete.mp3',{ loop: false });
  box.fit(20);
});


/*---------------------------------CARGA DEL NIVEL Y DE RECURSOS-----------------------------------*/
Q.loadTMX("level.tmx", function() {
	Q.stageScene("mainTitle");
});

Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, mainTitle.png, coin.png, coin.json, coin.mp3, music_die.mp3, music_level_complete.mp3, music_main.mp3, jump.mp3, mario_touch_enemy.mp3, mamma_mia.mp3", function() {
	// From a .json asset that defines sprite locations
	Q.sheet("princess","princess.png", { tilew: 30, tileh: 48});
	Q.sheet("mainTitle","mainTitle.png");
	Q.compileSheets("mario_small.png","mario_small.json");
	Q.compileSheets("goomba.png","goomba.json");
	Q.compileSheets("bloopa.png","bloopa.json");
	Q.compileSheets("coin.png", "coin.json");
	// Finally, call stageScene to run the game
	Q.stageScene("mainTitle");
});



/*---------------------------------MARIO-----------------------------------*/
Q.Sprite.extend("Mario",{
	init: function(p) {
		this._super(p, {
			sheet: "marioR", // Setting a sprite sheet sets sprite width and height
			sprite: "mario_anim",
			x: 150, // You can also set additional properties that can
			y: 450, // be overridden on object creation
			dead: false
		});

		this.add('2d, platformerControls, animation, tween');

		this.on("destroyMario", function() {
			this.del("platformerControls");
			this.p.dead = true;
			this.p.vx = 0;
			this.play("dead", 1);

		});

		this.on("deadfinish", function() {
										//console.log("deadAnimation");
										Q.audio.stop();
										Q.audio.play('music_die.mp3',{ loop: false });
										this.animate({ x: (this.p.x), vy: -300 }, 0.3, Q.Easing.Linear);
										this.animate({ x: (this.p.x), vy: 300 }, 0.5, Q.Easing.Linear, {delay: 0.5, callback: this.reset});
									});
		this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
			if(collision.obj.isA("Coin") && !collision.obj.picked) {
				Q.audio.play('coin.mp3',{ loop: false });
				collision.obj.picked = true;
				collision.obj.trigger("pickCoin");
				Q.state.inc("score",1);
			}
		});
	},
	reset: function() {
		this.destroy();
		Q.stageScene("endGame",1, { label: "You Died" });
	},
	step: function(dt) {
	//	console.log("X: "+this.p.x+ "  Y:"+this.p.y);
		if (!this.p.dead) {
			if (this.p.y > 600) {
				this.p.vy= -500;
				this.trigger("destroyMario");
			}
			if(this.p.vx > 0 && this.p.landed > 0) {
				this.play("walk_right");
			} else if(this.p.vx < 0 && this.p.landed > 0) {
				this.play("walk_left");
			} else if(this.p.landed < 0){
				this.play("jump_" + this.p.direction);
			}
			  else {
				this.play("stand_" + this.p.direction);
			}
		}
	}
});

Q.animations("mario_anim", {
	walk_right: { frames: [0,1,2], rate: 1/6,
	flip: false, loop: true },
	walk_left: { frames: [0,1,2], rate: 1/6,
	flip:"x", loop: true },
	jump_right: { frames: [4], rate: 1/10, flip: false },
	jump_left: { frames: [4], rate: 1/10, flip: "x" },
	stand_right: { frames:[0], rate: 1/10, flip: false },
	stand_left: { frames: [0], rate: 1/10, flip: "x" },
	dead: { frames: [12], rate: 1, loop: false, trigger: "deadfinish"}
});


/*---------------------------------MONEDA-----------------------------------*/
Q.Sprite.extend("Coin",{
	init: function(p) {
		this._super(p, {
			sheet: "coin", // Setting a sprite sheet sets sprite width and height
			sprite: "coin_anim"
		});

		this.add('animation, tween');

		this.on("pickCoin",function(collision) {
			this.animate({ x: (this.p.x), y: (this.p.y - 50) }, 0.5, Q.Easing.Linear, {callback: this.delete});
		});
		Q.state.inc("totalCoins",1);
	},

	delete: function(){
		this.destroy();
	},

	step:function(dt){
		this.play("change");
	}
});

Q.animations("coin_anim", {
	change: { frames: [0,1,2], rate: 1/4, flip: false, loop: true }
});


/*---------------------------------GOOMBA-----------------------------------*/
Q.Sprite.extend("Goomba",{
	init: function(p) {
		this._super(p, {
			sheet: "goomba", // Setting a sprite sheet sets sprite width and height
			sprite: "goomba_anim",
			x: 1600, // You can also set additional properties that can
			y: 380, // be overridden on object creation
			vx: 100
		});

		this.add('2d, aiBounce, animation,defaultEnemy');
	},

	step:function(dt){
		if(this.p.vx != 0){
			this.play("walk");
		}
	}
});

Q.animations("goomba_anim", {
	walk: { frames: [0,1], rate: 1/6, flip: false, loop: true },
	dead: { frames: [2], rate: 1, loop: false, trigger: "destroy"}
});


/*---------------------------------BLOOPA-----------------------------------*/
Q.Sprite.extend("Bloopa",{
	init: function(p) {
		this._super(p, {
			sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
			sprite: "bloopa_anim",
			x: 1478, // You can also set additional properties that can
			y: 494, // be overridden on object creation
			y0: 494,
			t: 0
		});

		this.add('2d, animation, defaultEnemy');
	},
	step: function(dt) {
		this.play("walk");
		if (this.p.y == this.p.y0) {
			this.p.vy = -280;
		}

	}
});

Q.animations("bloopa_anim", {
	walk: { frames: [0,1], rate: 1/4, flip: false, loop: true },
	dead: { frames: [2], rate: 1, loop: false, trigger: "destroy"}
});


/*---------------------------------PRINCESS-----------------------------------*/
Q.Sprite.extend("Princess",{
	init: function(p) {
		this._super(p, {
			sheet: "princess", // Setting a sprite sheet sets sprite width and height
			x: 2020, // You can also set additional properties that can
			y: 392, // be overridden on object creation
		});

		this.add('2d');

		this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
			if(collision.obj.isA("Mario")) {
				collision.obj.del("platformerControls");
				Q.stageScene("winGame",1, { label: "You win!" });
			}
		});
	}
});


/*---------------------------------PUNTUACIÓN Y LABEL DEL HUD-----------------------------------*/
Q.UI.Text.extend("Score",{
	init: function(p) {
		this._super({
			x:70,
			y: 0,
			score: 0,
			totalCoins: 0,
			label: "Coins: 0"
		});
		Q.state.set("score",0);
		Q.state.set("totalCoins",0);

		Q.state.on("change.score",this,"score");
		Q.state.on("change.totalCoins",this,"totalCoins");
	},
	totalCoins: function(totalCoins) {
		this.p.totalCoins = totalCoins;
		this.p.label = "Coins: " + this.p.score + "/" + this.p.totalCoins;
	},
	score: function(score) {
		this.p.score = score;
		this.p.label = "Coins: " + this.p.score + "/" + this.p.totalCoins;
		if(this.p.score==this.p.totalCoins)
			Q.audio.play('mamma_mia.mp3',{ loop: false });
	}
});


/*---------------------------------COMPONENTE DEFAULTENEMY-----------------------------------*/
Q.component("defaultEnemy",{
	added: function() {
		this.entity.on("bump.left,bump.right,bump.bottom","collisionMario");
		// If the enemy gets hit on the top, destroy it
		// and give the user a "hop"
		this.entity.on("bump.top","deadEnemy");

		this.entity.on("dead","animationDeadEnemy" );

		this.entity.on("destroy", "destroyEnemy");
	},

	extend:{
		collisionMario: function(collision) {
			if(collision.obj.isA("Mario")) {
				collision.obj.trigger("destroyMario");
			}
		},
		deadEnemy: function(collision) {
			if(collision.obj.isA("Mario")) {
				Q.audio.play('mario_touch_enemy.mp3',{ loop: false });
				this.trigger("dead");
				collision.obj.p.vy = -300;
			}
		},
		animationDeadEnemy: function() {
			this.p.vx = 0;
			this.play("dead", 1);
		},
		destroyEnemy: function() {
			this.destroy();
		}
	}

});

};