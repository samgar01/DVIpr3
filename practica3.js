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

	stage.add("viewport")
		.follow(player);
	stage.viewport.offsetY = 150;
	stage.viewport.offsetX = -90;
});

Q.loadTMX("level.tmx", function() {
	Q.stageScene("level1");
});

Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json", function() {
	// From a .json asset that defines sprite locations
	Q.compileSheets("mario_small.png","mario_small.json");
	Q.compileSheets("goomba.png","goomba.json");
	// Finally, call stageScene to run the game
	Q.stageScene("level1");
});

Q.Sprite.extend("Mario",{
	init: function(p) {
		this._super(p, {
			sheet: "marioR", // Setting a sprite sheet sets sprite width and height
			x: 150, // You can also set additional properties that can
			y: 380 // be overridden on object creation
		});

		this.add('2d, platformerControls');
	},
	step: function(dt) {
		if (this.p.y > 650) {
			this.p.y = 380;
			this.p.x = 150;
		}
	}
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
				/*Q.stageScene("endGame",1, { label: "You Died" });
				collision.obj.destroy();*/
				collision.obj.p.y = 380;
				collision.obj.p.x = 150;
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


};