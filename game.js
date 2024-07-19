/* global Phaser */

import { createAnimations } from "./animations.js";

const config = {
  type: Phaser.AUTO, // webgl, canvas
  width: 256,
  height: 244,
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload, // se ejecuta para precargar recursos
    create, // se ejecuta cuando el juego comienza
    update, // se ejecuta en cada frame
  },
};

new Phaser.Game(config);
// this -> game -> el juego que estamos construyendo

let keyA;
let keyS;
let keyD;
let keyW;

function preload() {
  this.load.image("mountain_1", "assets/scenery/overworld/mountain1.png");

  this.load.image("sign", "assets/scenery/sign.png");

  this.load.image("cloud1", "assets/scenery/overworld/cloud1.png");

  this.load.image("floorbricks", "assets/scenery/overworld/floorbricks.png");

  this.load.image("bush_1", "assets/scenery/overworld/bush1.png");

  this.load.spritesheet(
    "mario", // <--- id
    "assets/entities/mario.png",
    { frameWidth: 18, frameHeight: 16 }
  );

  this.load.audio("gameover", "assets/sound/music/gameover.mp3");
  this.load.audio("jump", "assets/sound/effects/jump.mp3");
  this.load.audio("music_theme", "assets/sound/music/overworld/theme.mp3");
} // 1.

function create() {
  this.sound.stopAll();
  this.sound.add("music_theme", { volume: 0.4 }).play();

  this.add.image(65, 70, "sign").setOrigin(0, 0).setScale(0.7);

  this.add.image(0, 175, "mountain_1").setOrigin(0, 0).setScale(1);

  this.add.image(100, 50, "cloud1").setOrigin(0, 0).setScale(0.15);

  this.add.image(220, 190, "bush_1").setOrigin(0, 0).setScale(0.75);

  this.floor = this.physics.add.staticGroup();

  /**
   * FIRST BLOCK FLOOR
   */
  this.floor
    .create(0, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.floor
    .create(128, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.floor
    .create(255, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  /**
   * SECOND BLOCK FLOOR
   */

  this.floor
    .create(420, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.mario = this.physics.add
    .sprite(50, 100, "mario")
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300);

  this.physics.world.setBounds(0, 0, 2000, config.height);
  this.physics.world.setBoundsCollision(true, false, false, false);
  this.physics.add.collider(this.mario, this.floor);

  this.cameras.main.setBounds(0, 0, 2000, config.height);
  this.cameras.main.startFollow(this.mario);

  createAnimations(this);

  this.keys = this.input.keyboard.createCursorKeys();

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
}

function update() {
  // 3. continuamente
  if (this.mario.isDead) return;

  if (this.mario.body.touching.down) this.mario.jumping = false;

  // A
  if (this.keys.left.isDown || keyA.isDown) {
    this.mario.anims.play("mario-walk", true);
    this.mario.x -= 2;
    this.mario.flipX = true;
  }

  // D
  else if (this.keys.right.isDown || keyD.isDown) {
    this.mario.anims.play("mario-walk", true);
    this.mario.x += 2;
    this.mario.flipX = false;
  } else {
    this.mario.anims.play("mario-idle", true);
  }

  // W
  if (this.keys.up.isDown || keyW.isDown) {
    if (this.mario.body.touching.down) {
      this.mario.setVelocityY(-260);
      this.sound.add("jump", { volume: 0.1 }).play();
      this.mario.jumping = true;
    }
  }

  if (this.mario.jumping) this.mario.anims.play("mario-jump", true);

  // LOGICA MUERTE
  if (this.mario.y >= config.height) {
    setTimeout(() => {
      this.sound.stopAll();
      this.mario.isDead = true;
      this.mario.anims.play("mario-dead");
      this.mario.setVelocityY(-300);
      this.sound.add("gameover", { loop: true, volume: 0.2 }).play();
    }, 200);

    setTimeout(() => {
      this.scene.restart();
    }, 6000);
  }
}
