var game = function() {
// Set up an instance of the Quintus engine and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus()
	.include("Sprites, Scenes, Input, Touch, UI, Anim, TMX, 2D")
	.setup({width: 320, // Set the default width to 320 pixels
			height: 480, // Set the default height to 480 pixels
			})
	// And turn on default input controls and touch input (for UI)
	.controls().touch();

Q.scene("level1",function(stage) {
	Q.stageTMX("level.tmx",stage);

	var player = stage.insert(new Q.Mario());
	var goomba = stage.insert(new Q.Goomba());
	var bloopa = stage.insert(new Q.Bloopa());
	var princess = stage.insert(new Q.Princess());

	stage.add("viewport")
		.follow(player);
	stage.viewport.offsetY = 150;
	stage.viewport.offsetX = -90;
});

Q.scene('mainTitle',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = box.insert(new Q.UI.Button({ x: 0, y: 0,
                                           asset: "mainTitle.png" }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });
  box.fit(20);
});

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
  box.fit(20);
});

Q.loadTMX("level.tmx", function() {
	Q.stageScene("mainTitle");
});

Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, mainTitle.png", function() {
	// From a .json asset that defines sprite locations
	Q.sheet("princess","princess.png", { tilew: 30, tileh: 48});
	Q.sheet("mainTitle","mainTitle.png");
	Q.compileSheets("mario_small.png","mario_small.json");
	Q.compileSheets("goomba.png","goomba.json");
	Q.compileSheets("bloopa.png","bloopa.json");
	// Finally, call stageScene to run the game
	Q.stageScene("mainTitle");
});

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
			this.p.dead = true;
			this.play("dead", 1);
		});

		this.on("deadfinish", function() {
										//console.log("deadAnimation");
										this.animate({ x: (this.p.x), vy: -300 }, 0.5, Q.Easing.Linear);
										this.animate({ x: (this.p.x), y: (this.p.y + 60) }, 1, Q.Easing.Linear, {delay: 0.5, callback: this.reset});
									});
	},
	reset: function() {
		this.destroy();
		Q.stageScene("endGame",1, { label: "You Died" });
	},
	step: function(dt) {
	//	console.log("X: "+this.p.x+ "  Y:"+this.p.y);
		if (!this.p.dead) {
			if (this.p.y > 650) {
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
		//console.log(this.p.jumping);
	}
});

Q.animations("mario_anim", {
	walk_right: { frames: [0,1,2], rate: 1/15,
	flip: false, loop: true },
	walk_left: { frames: [0,1,2], rate: 1/15,
	flip:"x", loop: true },
	jump_right: { frames: [4], rate: 1/10, flip: false },
	jump_left: { frames: [4], rate: 1/10, flip: "x" },
	stand_right: { frames:[0], rate: 1/10, flip: false },
	stand_left: { frames: [0], rate: 1/10, flip: "x" },
	dead: { frames: [12], rate: 1, loop: false, trigger: "deadfinish"}
});

Q.Sprite.extend("Goomba",{
	init: function(p) {
		this._super(p, {
			sheet: "goomba", // Setting a sprite sheet sets sprite width and height
			x: 1600, // You can also set additional properties that can
			y: 380, // be overridden on object creation
			vx: 100
		});

		this.add('2d, aiBounce');

		this.on("bump.left,bump.right,bump.bottom",function(collision) {
			if(collision.obj.isA("Mario")) {
				//collision.obj.p.vy = -300;
				//collision.obj.p.vx = 0;
				collision.obj.trigger("destroyMario");
			}
		});
		// If the enemy gets hit on the top, destroy it
		// and give the user a "hop"
		this.on("bump.top",function(collision) {
		if(collision.obj.isA("Mario")) {
			this.destroy();
			collision.obj.p.vy = -300;
		}
		});
	}
});

Q.Sprite.extend("Bloopa",{
	init: function(p) {
		this._super(p, {
			sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
			x: 1478, // You can also set additional properties that can
			y: 494, // be overridden on object creation
			y0: 494,
			t: 0
		});

		this.add('2d');

		this.on("bump.left,bump.right,bump.bottom",function(collision) {
			if(collision.obj.isA("Mario")) {
				//collision.obj.p.vy = -300;
				//collision.obj.p.vx = 0;
				collision.obj.trigger("destroyMario");
			}
		});
		// If the enemy gets hit on the top, destroy it
		// and give the user a "hop"
		this.on("bump.top",function(collision) {
			if(collision.obj.isA("Mario")) {
				this.destroy();
				collision.obj.p.vy = -300;
			}
		});
	},
	step: function(dt) {
		if (this.p.y == this.p.y0) {
			this.p.vy = -280;
		}
	}
});

Q.Sprite.extend("Princess",{
	init: function(p) {
		this._super(p, {
			sheet: "princess", // Setting a sprite sheet sets sprite width and height
			x: 2020, // You can also set additional properties that can
			y: 460, // be overridden on object creation
		});

		this.add('2d');

		this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
			if(collision.obj.isA("Mario")) {
				Q.stageScene("winGame",1, { label: "You win!" });
			}
		});
	}
});



/*Q.animations("player_anim", {
	walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15,
	flip: false, loop: true },
	walk_left: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15,
	flip:"x", loop: true },
	jump_right: { frames: [13], rate: 1/10, flip: false },
	jump_left: { frames: [13], rate: 1/10, flip: "x" },
	stand_right: { frames:[14], rate: 1/10, flip: false },
	stand_left: { frames: [14], rate: 1/10, flip:"x" },
	duck_right: { frames: [15], rate: 1/10, flip: false },
	duck_left: { frames: [15], rate: 1/10, flip: "x" },
	climb: { frames: [16, 17], rate: 1/3, flip: false }
});*/
//console.log("X: "+this.p.x+ "  Y:"+this.p.y);


};