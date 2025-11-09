// --- 圓的設定 ---
let circles = [];
// 加入目標顏色 '#ffca3a' 讓部分氣球成為加分氣球
const COLORS = ['#ec9093ff', '#e5ce8fff', '#c6e09cff', '#a0c6ddff', '#cdb9e9ff', '#ffca3a'];
const NUM_CIRCLES = 20;

// 新增：爆破粒子陣列
let explosions = [];

// 新增：分數與目標顏色
let score = 0;
const targetColor = '#ffca3a';

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    let colHex = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      color: color(colHex),
      hex: colHex,               // 存原始十六進位字串以便比較
      alpha: random(80, 255),
      speed: random(1, 5)
    });
  }
} // 建立一個與瀏覽器視窗大小相同的畫布

function draw() {
  background('#fcf6bd');

  // 更新並繪製爆破粒子（由新到舊遍歷以利移除）
  noStroke();
  for (let i = explosions.length - 1; i >= 0; i--) {
    let ex = explosions[i];
    for (let p = ex.particles.length - 1; p >= 0; p--) {
      let part = ex.particles[p];
      // 更新位置與速度（簡單重力）
      part.vy += 0.12; // 重力
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 1;
      part.alpha -= part.decay;

      fill(part.r, part.g, part.b, max(0, part.alpha));
      ellipse(part.x, part.y, part.size);

      if (part.life <= 0 || part.alpha <= 0) {
        ex.particles.splice(p, 1);
      }
    }

    // 若爆破已無粒子，移除整個 explosion
    if (ex.particles.length === 0) {
      explosions.splice(i, 1);
    }
  }

  noStroke();
  for (let c of circles) {
    c.y -= c.speed;
    if (c.y + c.r / 2 < 0) { // 如果圓完全移出畫面頂端
      c.y = height + c.r / 2;  // 從底部重新出現
      c.x = random(width);
      c.r = random(50, 200);
      let colHex = random(COLORS);
      c.color = color(colHex);
      c.hex = colHex;
      c.alpha = random(80, 255);
      c.speed = random(1, 5);
    }
    c.color.setAlpha(c.alpha); // 設定透明度
    fill(c.color); // 使用設定的顏色
    circle(c.x, c.y, c.r); // 畫圓

    // 在圓的右上方 1/4 圓的中間產生方形（取相對距離）
    let sqSize = c.r / 6; // 方形邊長（較大一點）
    let angle = -PI / 4; // 右上方向
    let distance = (c.r / 2) * 0.65;
    let sqCenterX = c.x + cos(angle) * distance;
    let sqCenterY = c.y + sin(angle) * distance;

    // 畫白色半透明的方形（置中）
    push();
    noStroke();
    fill(255, 255, 255, 180);
    rectMode(CENTER);
    square(sqCenterX, sqCenterY, sqSize);
    pop();
  } // end for

  // 左上角顯示學號，右上角顯示分數（顏色 #eb6424，大小 32px）
  push();
  noStroke();
  fill('#eb6424');
  textSize(32);
  textAlign(LEFT, TOP);
  text('412730078', 10, 8);
  pop();

  push();
  noStroke();
  fill('#eb6424');
  textSize(32);
  textAlign(RIGHT, TOP);
  text('Score: ' + score, width - 10, 8);
  pop();
} // end draw

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新分布圓的位置
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}

// 新增：點擊氣球產生爆破（只在被點到的氣球產生）
function mousePressed() {
  // 只處理滑鼠左鍵
  if (mouseButton !== LEFT) return;

  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let r = c.r / 2; // circle() 的 r 為直徑，半徑為 c.r / 2
    if (dist(mouseX, mouseY, c.x, c.y) <= r) {
      // 播放爆破粒子
      let cr = red(c.color), cg = green(c.color), cb = blue(c.color);
      spawnExplosion(c.x, c.y, cr, cg, cb, floor(random(12, 28)));

      // 判斷顏色是否為目標顏色（比較 hex，忽略大小寫）
      if ((c.hex || '').toLowerCase() === targetColor.toLowerCase()) {
        score += 1;
      } else {
        score -= 1;
      }

      // 氣球重生（從底部重新出現）
      c.y = height + c.r / 2;
      c.x = random(width);
      c.r = random(50, 200);
      let newHex = random(COLORS);
      c.color = color(newHex);
      c.hex = newHex;
      c.alpha = random(80, 255);
      c.speed = random(1, 5);

      break; // 一次只處理一個氣球
    }
  }
}

// 新增：產生爆破（粒子）
function spawnExplosion(x, y, cr, cg, cb, count = 20) {
  let ex = { particles: [] };
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let speed = random(1.5, 6);
    let vx = cos(angle) * speed;
    let vy = sin(angle) * speed * 0.9;
    ex.particles.push({
      x: x + random(-4, 4),
      y: y + random(-4, 4),
      vx: vx,
      vy: vy,
      life: floor(random(25, 60)),
      alpha: random(180, 255),
      decay: random(3, 6),
      size: random(2, 6),
      r: cr + random(-20, 20),
      g: cg + random(-20, 20),
      b: cb + random(-20, 20)
    });
  }
  explosions.push(ex);
}

// star drawing helper
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
  let rot = -PI / 2;
  let step = PI / spikes;
  beginShape();
  for (let i = 0; i < spikes; i++) {
    let x = cx + cos(rot) * outerRadius;
    let y = cy + sin(rot) * outerRadius;
    vertex(x, y);
    rot += step;

    x = cx + cos(rot) * innerRadius;
    y = cy + sin(rot) * innerRadius;
    vertex(x, y);
    rot += step;
  }
  endShape(CLOSE);
}