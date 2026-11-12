// 宣告全域變數，用於儲存各種動作的精靈圖與動畫設定
let stopSheet;        // 待機動作（stop.png）
let jumpSheet;        // 移動/跳躍動作（jump.png）
let magicSheet;       // 施法動作（magic.png）
let magicEffectSheet; // 魔法特效（magic-effect.png）

let stopFrames = [];        // 待機 8 張圖片陣列
let jumpFrames = [];        // 移動 6 張圖片陣列
let magicFrames = [];       // 施法 8 張圖片陣列
let magicEffectFrames = []; // 特效 6 張圖片陣列

// 各精靈圖的規格設定
const stopArgu = { total: 8, w: 1019, h: 195 };
const jumpArgu = { total: 6, w: 973, h: 225 };
const magicArgu = { total: 8, w: 1315, h: 189 };
const magicEffectArgu = { total: 6, w: 1393, h: 151 };

// 角色狀態與控制變數
let currentState = 'stop';    // 'stop'（待機）, 'jump'（移動）, 'magic'（施法）
let currentFrame = 0;         // 動畫播放的影格索引值
let charX;                    // 角色在畫布上的 X 軸中心座標
let facingDirection = 1;      // 角色面向：1 代表朝右，-1 代表朝左
let moveSpeed = 6;            // 角色移動速度

// 魔法特效的管理變數（支援多個特效同時存在或獨立運作）
let activeEffects = [];       // 儲存畫面中所有正在飛行的魔法特效物件陣列

// preload 函式會在 setup 之前執行，載入所有圖片資源
function preload() {
  stopSheet = loadImage('1/stop/stop.png');
  jumpSheet = loadImage('1/jump/jump.png');
  magicSheet = loadImage('1/magic/magic.png');
  magicEffectSheet = loadImage('1/magic-effect/magic-effect.png');
}

// setup 函式初始化畫布與裁切精靈圖
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. 裁切待機（stop）精靈圖
  let stopW = stopArgu.w / stopArgu.total;
  for (let i = 0; i < stopArgu.total; i++) {
    stopFrames.push(stopSheet.get(i * stopW, 0, stopW, stopArgu.h));
  }
  
  // 2. 裁切移動（jump）精靈圖
  let jumpW = jumpArgu.w / jumpArgu.total;
  for (let i = 0; i < jumpArgu.total; i++) {
    jumpFrames.push(jumpSheet.get(i * jumpW, 0, jumpW, jumpArgu.h));
  }
  
  // 3. 裁切施法（magic）精靈圖
  let magicW = magicArgu.w / magicArgu.total;
  for (let i = 0; i < magicArgu.total; i++) {
    magicFrames.push(magicSheet.get(i * magicW, 0, magicW, magicArgu.h));
  }
  
  // 4. 裁切魔法特效（magic-effect）精靈圖
  let effectW = magicEffectArgu.w / magicEffectArgu.total;
  for (let i = 0; i < magicEffectArgu.total; i++) {
    magicEffectFrames.push(magicEffectSheet.get(i * effectW, 0, effectW, magicEffectArgu.h));
  }
  
  // 初始化角色位置在畫布 2/3 處
  charX = width * (2 / 3);
  
  // 設定影格播放速率為每秒 12 幀
  frameRate(12);
}

// draw 函式重複執行，負責更新邏輯與繪製畫面
function draw() {
  // 設定天空色背景 (RGB: 135, 206, 235)
  background(135, 206, 235);
  
  // 檢查按鍵狀態
  let isMovingRight = keyIsDown(RIGHT_ARROW);
  let isMovingLeft = keyIsDown(LEFT_ARROW);
  
  // 狀態切換邏輯：若目前正在施法，必須等施法動畫播完一次才能切換其他動作
  if (currentState === 'magic') {
    // 施法動畫播放中，不接受移動或待機覆蓋，直到播完 8 張圖
    // currentFrame 在每次播放完一輪時會在下方判斷重置
  } else {
    // 一般狀態下的動作判斷
    if (isMovingRight) {
      if (currentState !== 'jump') {
        currentState = 'jump';
        currentFrame = 0;
      }
      facingDirection = 1;
    } else if (isMovingLeft) {
      if (currentState !== 'jump') {
        currentState = 'jump';
        currentFrame = 0;
      }
      facingDirection = -1;
    } else {
      if (currentState !== 'stop') {
        currentState = 'stop';
        currentFrame = 0;
      }
    }
  }
  
  // 根據目前狀態選取對應的圖片陣列與尺寸參數
  let activeFrames, originalW, originalH;
  if (currentState === 'stop') {
    activeFrames = stopFrames;
    originalW = stopArgu.w / stopArgu.total;
    originalH = stopArgu.h;
  } else if (currentState === 'jump') {
    activeFrames = jumpFrames;
    originalW = jumpArgu.w / jumpArgu.total;
    originalH = jumpArgu.h;
  } else if (currentState === 'magic') {
    activeFrames = magicFrames;
    originalW = magicArgu.w / magicArgu.total;
    originalH = magicArgu.h;
  }
  
  // 計算角色顯示大小與邊界
  let displayHeight = height / 3;
  let scaleRatio = displayHeight / originalH;
  let displayWidth = originalW * scaleRatio;
  let halfWidth = displayWidth / 2;
  
  // 如果處於移動狀態，更新位置與邊界限制
  if (currentState === 'jump') {
    if (facingDirection === 1) {
      charX += moveSpeed;
      if (charX + halfWidth >= width) charX = width - halfWidth;
    } else {
      charX -= moveSpeed;
      if (charX - halfWidth <= 0) charX = halfWidth;
    }
  }
  
  // 計算角色 Y 軸底部對齊座標
  let posY = height - (displayHeight / 2);
  
  // 繪製角色
  push();
  translate(charX, posY);
  scale(facingDirection, 1);
  imageMode(CENTER);
  
  let frameIndex = currentFrame % activeFrames.length;
  image(activeFrames[frameIndex], 0, 0, displayWidth, displayHeight);
  pop();
  
  // 動畫影格與施法結束條件處理
  if (currentState === 'magic') {
    // 檢查施法動畫是否已經播完一輪（滿 8 張）
    if (currentFrame >= activeFrames.length - 1) {
      // 施法完成！產生特效物件
      spawnMagicEffect();
      
      // 結束施法狀態，回到 stop 待機
      currentState = 'stop';
      currentFrame = 0;
    } else {
      currentFrame++;
    }
  } else {
    // 非施法狀態下的循環播放
    currentFrame = (currentFrame + 1) % activeFrames.length;
  }
  
  // ----------------------------------------------------
  // 處理與繪製畫面上的所有「魔法特效」
  // ----------------------------------------------------
  updateAndDrawEffects();
}

// 當按下鍵盤按鍵時觸發
function keyPressed() {
  // 檢查是否按下空白鍵 (Spacebar)，且當前不在施法中
  if (key === ' ' && currentState !== 'magic') {
    currentState = 'magic';
    currentFrame = 0; // 重設影格，確保施法動畫從第 1 張開始播放一次
  }
}

// 產生特效的函式：根據角色當前位置與面向方向建立特效物件
function spawnMagicEffect() {
  let effectH = height / 4; // 特效顯示高度可適度調整（例如畫布的 1/4）
  let effectScale = effectH / magicEffectArgu.h;
  let effectW = (magicEffectArgu.w / magicEffectArgu.total) * effectScale;
  
  let newEffect = {
    x: charX,                     // 從角色目前位置發射
    y: height - (effectH / 2),    // 垂直位置貼齊底部或配合角色
    dir: facingDirection,         // 1 代表往右，-1 代表往左
    speed: 12,                    // 特效飛行的速度
    animFrame: 0,                 // 特效自身的動畫播放影格
    w: effectW,
    h: effectH
  };
  
  activeEffects.push(newEffect);
}

// 更新並繪製所有特效的迴圈
function updateAndDrawEffects() {
  // 從後往前跑迴圈，方便在特效抵達邊界時安全從陣列中移除
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    let eff = activeEffects[i];
    
    // 特效依據面向方向移動
    eff.x += eff.speed * eff.dir;
    
    // 繪製特效圖片
    push();
    translate(eff.x, eff.y);
    scale(eff.dir, 1); // 讓特效圖片也跟著前進方向翻轉
    imageMode(CENTER);
    
    // 循環播放特效本身的 6 張精靈圖動畫
    let effFrameIdx = Math.floor(eff.animFrame) % magicEffectFrames.length;
    image(magicEffectFrames[effFrameIdx], 0, 0, eff.w, eff.h);
    pop();
    
    // 特效動畫影格遞增
    eff.animFrame += 0.5; // 數值可調整特效動畫播放快慢
    
    // 檢查邊界：若特效往右移出畫布右端，或往左移出畫布左端，則從陣列中刪除（消失）
    let effHalfW = eff.w / 2;
    if (eff.dir === 1 && eff.x - effHalfW >= width) {
      activeEffects.splice(i, 1);
    } else if (eff.dir === -1 && eff.x + effHalfW <= 0) {
      activeEffects.splice(i, 1);
    }
  }
}

// 視窗大小改變時重新適應畫布
function windowResized() {
  let ratioX = charX / width;
  resizeCanvas(windowWidth, windowHeight);
  charX = width * ratioX;
}