const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let score = 0;
let health = 100;

// Resize canvas on mobile or screen change
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// Starfield Background
class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speed = this.size;
  }
  update() {
    this.y += this.speed;
    if (this.y > height) this.reset();
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

let stars = [];
for (let i = 0; i < 300; i++) {
  stars.push(new Star());
}

// Player (Vimarśa) Class
class Player {
  constructor() {
    this.radius = 20;
    this.x = width / 2;
    this.y = height - 100;
    this.speed = 5;
    this.color = "#00f0ff";
    this.bullets = [];
    this.cooldown = 0;
  }
  move(dir) {
    this.x += dir * this.speed;
    if (this.x < this.radius) this.x = this.radius;
    if (this.x > width - this.radius) this.x = width - this.radius;
  }
  shoot() {
    if (this.cooldown <= 0) {
      this.bullets.push(new Bullet(this.x, this.y - this.radius));
      this.cooldown = 10;
    }
  }
  update() {
    if (this.cooldown > 0) this.cooldown--;
    for (let b of this.bullets) b.update();
    this.bullets = this.bullets.filter(b => b.y > -10);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    for (let b of this.bullets) b.draw();
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 5;
    this.speed = 8;
  }
  update() {
    this.y -= this.speed;
  }
  draw() {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let player = new Player();

// Enemies (Kleśas) – will evolve later
class Enemy {
  constructor() {
    this.x = Math.random() * (width - 40) + 20;
    this.y = -20;
    this.radius = 15;
    this.speed = 2 + Math.random() * 1.5;
    this.color = "#ff0033";
  }
  update() {
    this.y += this.speed;
    if (this.y > height + this.radius) {
      this.reset();
      health -= 5;
      updateUI();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  reset() {
    this.x = Math.random() * (width - 40) + 20;
    this.y = -20;
  }
}

let enemies = [];
for (let i = 0; i < 10; i++) {
  enemies.push(new Enemy());
}

// Collision Detection
function isColliding(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

// UI
function updateUI() {
  document.getElementById("score").textContent = score;
  document.getElementById("health").textContent = health;
}

// Input Handling
let leftPressed = false;
let rightPressed = false;
let firePressed = false;

window.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft") leftPressed = true;
  if (e.code === "ArrowRight") rightPressed = true;
  if (e.code === "Space") firePressed = true;
});

window.addEventListener("keyup", e => {
  if (e.code === "ArrowLeft") leftPressed = false;
  if (e.code === "ArrowRight") rightPressed = false;
  if (e.code === "Space") firePressed = false;
});

// Touch Controls
canvas.addEventListener("touchstart", e => {
  let touch = e.touches[0];
  if (touch.clientX < width / 2) leftPressed = true;
  else rightPressed = true;
  firePressed = true;
});

canvas.addEventListener("touchend", e => {
  leftPressed = rightPressed = firePressed = false;
});
// Game Over Handling
function checkGameOver() {
  if (health <= 0) {
    alert("🕉️ You have exhausted your prāṇa. Game Over!\nFinal Score: " + score);
    location.reload(); // Simple restart
  }
}

// Main Game Loop
function update() {
  // Move player
  if (leftPressed) player.move(-1);
  if (rightPressed) player.move(1);
  if (firePressed) player.shoot();

  // Update entities
  player.update();
  for (let star of stars) star.update();
  for (let enemy of enemies) enemy.update();

  // Check collisions
  for (let bullet of player.bullets) {
    for (let enemy of enemies) {
      if (isColliding(bullet, enemy)) {
        enemy.reset();
        bullet.y = -100; // Remove bullet
        score += 10;
        updateUI();
      }
    }
  }

  checkGameOver();
}

function draw() {
  // Clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Draw background
  for (let star of stars) star.draw();

  // Draw entities
  player.draw();
  for (let enemy of enemies) enemy.draw();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

updateUI();
gameLoop();
// =====================
// 💥 EXPLOSION EFFECTS
// =====================
class Explosion {
  constructor(x, y, color = '#ff8800') {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.maxRadius = 25;
    this.color = color;
    this.alpha = 1;
  }
  update() {
    this.radius += 1.5;
    this.alpha -= 0.04;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  isDone() {
    return this.alpha <= 0;
  }
}

let explosions = [];

// =====================
// 🧿 BINDU POWERUP
// =====================
class PowerUp {
  constructor() {
    this.x = Math.random() * (width - 20) + 10;
    this.y = -20;
    this.size = 12;
    this.speed = 2;
    this.active = true;
    this.type = "bindu";
    this.color = "#00ffcc";
  }
  update() {
    this.y += this.speed;
    if (this.y > height) this.active = false;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let powerUps = [];
let binduCharge = 0;

// =====================
// 🌀 SPANDA WAVE ULTIMATE
// =====================
let spandaReady = false;

function useSpandaWave() {
  if (spandaReady) {
    for (let e of enemies) {
      score += 5;
      explosions.push(new Explosion(e.x, e.y, '#ff00ff'));
      e.reset();
    }
    spandaReady = false;
    binduCharge = 0;
    updateUI();
  }
}

// Trigger ultimate with "S" key
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyS") useSpandaWave();
});

// =====================
// ADVANCED ENEMIES
// =====================
const enemyTypes = [
  { name: "Rāga", color: "#ff5555", speed: 2 },
  { name: "Dveṣa", color: "#55aaff", speed: 2.5 },
  { name: "Moha", color: "#aa55ff", speed: 1.8 },
];

class AdvancedEnemy extends Enemy {
  constructor() {
    super();
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.color = type.color;
    this.speed = type.speed + Math.random();
    this.typeName = type.name;
  }
  draw() {
    super.draw();
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px sans-serif";
    ctx.fillText(this.typeName, this.x - 10, this.y + 4);
  }
}

function spawnAdvancedEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new AdvancedEnemy());
  }
}

// Replace previous enemies
enemies = [];
spawnAdvancedEnemies(8);
function update() {
  // Move player
  if (leftPressed) player.move(-1);
  if (rightPressed) player.move(1);
  if (firePressed) player.shoot();

  // Update player
  player.update();

  // Update stars
  for (let star of stars) star.update();

  // Update bullets and check collisions
  for (let bullet of player.bullets) {
    for (let enemy of enemies) {
      if (isColliding(bullet, enemy)) {
        explosions.push(new Explosion(enemy.x, enemy.y, enemy.color));
        enemy.reset();
        bullet.y = -100;
        score += 10;
        binduCharge++;
        if (binduCharge >= 20) {
          spandaReady = true;
        }
        updateUI();
      }
    }
  }

  // Update enemies and check collision with player
  for (let enemy of enemies) {
    enemy.update();
    if (isColliding(player, enemy)) {
      explosions.push(new Explosion(player.x, player.y, "#ff0000"));
      enemy.reset();
      health -= 1;
      updateUI();
    }
  }

  // Update explosions
  explosions = explosions.filter(e => {
    e.update();
    return !e.isDone();
  });

  // PowerUps
  if (Math.random() < 0.005) {
    powerUps.push(new PowerUp());
  }

  powerUps = powerUps.filter(p => p.active);
  for (let pu of powerUps) {
    pu.update();
    if (isColliding(pu, player)) {
      binduCharge += 5;
      pu.active = false;
      if (binduCharge >= 20) {
        spandaReady = true;
      }
      updateUI();
    }
  }

  checkGameOver();
}
function draw() {
  // Clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Stars
  for (let star of stars) star.draw();

  // PowerUps
  for (let pu of powerUps) pu.draw();

  // Player and bullets
  player.draw();

  // Enemies
  for (let enemy of enemies) enemy.draw();

  // Explosions
  for (let exp of explosions) exp.draw();

  // UI
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.fillText("🧘 Score: " + score, 10, 20);
  ctx.fillText("❤️ Health: " + health, 10, 40);
  ctx.fillText("🔮 Bindu: " + binduCharge + "/20", 10, 60);
  if (spandaReady) {
    ctx.fillStyle = "#ffcc00";
    ctx.fillText("🌟 Spanda Ready! Press 'S'", width - 160, 20);
  }
}
