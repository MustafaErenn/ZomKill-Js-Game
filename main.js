const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scoreSpan = document.getElementById("scoreSpan");
canvas.width = innerWidth;
canvas.height = innerHeight;

const soldier = new Image();
const zombie = new Image();
const bullet = new Image();
const obstacle = new Image();
const danger = new Image();
const ground = new Image();

const defeat = new Audio();
const zombieKill = new Audio();
const scoreUpdate = new Audio();
const fireBullet = new Audio();
const mainMusic = new Audio();

soldier.src = "images/soldier.png";
zombie.src = "images/zombie.png";
bullet.src = "images/bullet.png";
obstacle.src = "images/obstacle.png";
danger.src = "images/danger.png";
ground.src = "images/road.png";

defeat.src = "sfx/defeat.mp3";
zombieKill.src = "sfx/zombieKill.mp3";
scoreUpdate.src = "sfx/score.mp3";
fireBullet.src = "sfx/fireBullet.mp3";
mainMusic.src = "sfx/main.mp3";

fireBullet.volume = 0.2;

const playerSizeX = 85;
const playerSizeY = 110;

const obstacleSizeX = 65;
const obstacleSizeY = 110;

const zombieSizeX = 60;
const zombieSizeY = 110;

const bulletSizeX = 25;
const bulletSizeY = 25;

const movement = playerSizeY + 20;
let zombieRun = 1;
const speed = 15;

const startX = 90;
const startY = 40;

const zombies = [];
const lanes = [];
const bullets = [];

let animationId;
let score = 0;
let spawnTimer = 3000;
let scoreKeeper;

let isDead = false;

class Player {
  constructor(x, y, movement) {
    // karakter özellikleri
    this._x = x;
    this._y = y;
    this._movement = movement;
  }

  draw() {
    context.drawImage(soldier, this._x, this._y, playerSizeX, playerSizeY); // karakteri canvasa çiziyor
  }
  update() {
    // hareket etmesi için karakterin kordinatlarını güncelliyor
    this._x = this._x;
    this._y = this._y + this._movement;
  }
}
class Zombie {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    this._zombieRun = zombieRun;
  }
  draw() {
    context.drawImage(zombie, this._x, this._y, zombieSizeX, zombieSizeY);
  }
  update() {
    this.draw();
    this._x = this._x - this._zombieRun;
    this._y = this._y;
  }
}
class Bullet {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    this._speed = speed;
  }
  draw() {
    context.drawImage(bullet, this._x, this._y, bulletSizeX, bulletSizeY);
  }
  update() {
    this.draw();
    this._x = this._x + this._speed;
    this._y = this._y;
  }
}
const player = new Player(startX, startY, movement); // player objesini oluşturma

function lanesDetect() {
  let playerYPos = player._y;

  while (playerYPos <= canvas.height - playerSizeY) {
    lanes.push(playerYPos);
    playerYPos += movement;
  }
}

function draw() {
  // devamlı çalışarak, oyunu oluşturan fonksiyon
  let pattern = context.createPattern(ground, "repeat");
  context.fillStyle = pattern;
  //context.fillStyle = "#BABDB6";
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  if (score % 2000 === 0 && score != 0 && score != scoreKeeper) {
    scoreUpdate.play();
    scoreKeeper = score;
  }

  for (let i = 0; i < canvas.height / obstacleSizeY; i++) {
    // askerin arkasındaki bariyerleri çizen for
    context.drawImage(
      obstacle,
      10,
      i * obstacleSizeY,
      obstacleSizeX,
      obstacleSizeY
    );
  }

  zombies.forEach((zombie, zombieIndex) => {
    // zombileri çizen ve zombilerin ölme durumlarını kontrol eden döngü
    zombie.update();
    bullets.forEach((bullet, bulletIndex) => {
      if (
        zombie._x - bullet._x + bulletSizeX < 1 &&
        bullet._y == zombie._y + 34
      ) {
        setTimeout(() => {
          score += 100;
          scoreSpan.innerText = score;
          bullets.splice(bulletIndex, 1);
          zombies.splice(zombieIndex, 1);
          //zombieKill.play();
        }, 0);
      }
    });
    if (zombie._x <= 40) {
      context.drawImage(danger, 30, zombie._y, 75, 75); // unlem işaretini o yere çizdir
    }

    if (
      zombie._x <= -zombieSizeX - 5 ||
      (zombie._x - player._x + playerSizeX < 1 && zombie._y == player._y)
    ) {
      defeat.play();

      setTimeout(() => {
        gameOver();
        cancelAnimationFrame(animationId);
      }, 0);
    }
  });

  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    if (bullet._x + bulletSizeX > canvas.width) {
      setTimeout(() => {
        bullets.splice(bulletIndex, 1);
      }, 0);
    }
  });

  animationId = requestAnimationFrame(draw);
}

document.addEventListener("keyup", (e) => {
  playerMovement(e.key);
});

function playerMovement(pressedKey) {
  if (pressedKey == "w" || pressedKey == "W" || pressedKey == "ArrowUp") {
    // W tuşuna basılınca karakteri yukarı doğru hareket ettiriyoruz

    if (player._y - movement >= startY) {
      player._movement = -movement;
      player.update();
    }
  } else if (
    pressedKey === "s" ||
    pressedKey === "S" ||
    pressedKey === "ArrowDown"
  ) {
    // S tuşuna basılınca karakteri aşağı doğru hareket ettiriyoruz.
    if (player._y + movement <= lanes[lanes.length - 1]) {
      player._movement = movement;
      player.update();
    }
  }
}

document.addEventListener("click", (e) => {
  bullets.push(new Bullet(player._x + playerSizeX, player._y + 34));
  fireBullet.play();
  mainMusic.volume = 0.05;
  mainMusic.play();
});

function spawnZombies() {
  setInterval(() => {
    zombies.push(
      new Zombie(
        canvas.width + zombieSizeX,
        lanes[Math.floor(Math.random() * lanes.length)]
      )
    );

    zombieRun >= 15
      ? (zombieRun = 10)
      : (zombieRun = zombieRun + Math.random() / 2);
  }, 350);
}

function gameOver() {
  var gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0.0", "pink");
  context.fillStyle = gradient;
  context.fillRect(canvas.width / 2 - 250, canvas.height / 2 - 35, 500, 100);
  gradient.addColorStop("0.0", "red");
  context.fillStyle = gradient;
  context.font = "32px Verdana";
  context.fillText(
    "Your Score: " + score,
    canvas.width / 2 - 250 + 110,
    canvas.height / 2
  );
  context.fillText(
    " Click on Screen to Play Again",
    canvas.width / 2 - 250,
    canvas.height / 2 + 50
  );
  document.addEventListener("click", function (e) {
    location.reload();
  });
}

draw();
lanesDetect();
spawnZombies();
