let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringStyle = 0; // 目前耳環樣式
let lastHandX = 0;    // 紀錄上次手部 X 位置
let lastSwitchTime = 0; // 紀錄上次切換樣式的時間

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML video 元件
  capture.hide();

  // 初始化 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh(capture, { maxFaces: 1, refineLandmarks: false, flipHorizontal: false }, () => {
    // 確保模型載入完成後才開始偵測
    faceMesh.detectStart(capture, (results) => {
      faces = results;
    });
  });

  // 初始化 ml5 handPose 模型
  handPose = ml5.handPose(capture, { flipHorizontal: false }, () => {
    // 確保手部模型載入完成後才開始偵測
    handPose.detectStart(capture, (results) => {
      hands = results;
    });
  });
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  // 計算顯示寬高 (50%)
  let videoW = width * 0.5;
  let videoH = height * 0.5;

  // 在影像上方顯示文字
  fill(0); // 設定文字顏色為黑色
  textSize(24);
  textAlign(CENTER, BOTTOM);
  text("414730092許詠鈐", width / 2, height / 2 - videoH / 2 - 10);

  // 偵測揮手動作切換樣式
  if (hands.length > 0) {
    let hand = hands[0].keypoints[9]; // 使用掌心關鍵點
    let dx = abs(hand.x - lastHandX); // 計算水平位移
    // 如果移動速度夠快 (dx > 30) 且距離上次切換超過 500 毫秒
    if (dx > 30 && millis() - lastSwitchTime > 500) {
      earringStyle = (earringStyle + 1) % 3; // 在 3 種樣式間切換
      lastSwitchTime = millis();
    }
    lastHandX = hand.x;
  }

  push();
  translate(width / 2, height / 2); // 移動到中心
  scale(-1, 1);                    // 左右顛倒處理
  imageMode(CENTER);
  image(capture, 0, 0, videoW, videoH);

  // 繪製耳垂位置的黃色圓圈 (耳環效果)
  if (faces.length > 0 && capture.width > 0) {
    let face = faces[0];
    // MediaPipe FaceMesh 中，172 與 397 大約位於左、右耳垂位置
    let leftLobe = face.keypoints[172];
    let rightLobe = face.keypoints[397];

    let scX = videoW / capture.width;
    let scY = videoH / capture.height;

    // 繪製左右兩邊的耳環
    [leftLobe, rightLobe].forEach(pt => {
      if (pt) {
        drawEarring((pt.x - capture.width / 2) * scX, (pt.y - capture.height / 2) * scY, earringStyle);
      }
    });
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 繪製不同樣式的耳環
function drawEarring(x, y, style) {
  noStroke();
  if (style === 0) {
    // 樣式 0: 三個黃色圓圈 (經典款)
    fill('yellow');
    for (let i = 0; i < 3; i++) {
      circle(x, y + (i * 15), 10);
    }
  } else if (style === 1) {
    // 樣式 1: 桃紅色大圓珠 (簡約款)
    fill('#ff00ff');
    circle(x, y + 15, 20);
    fill(255, 150);
    circle(x - 4, y + 10, 6); // 增加一點反光感
  } else if (style === 2) {
    // 樣式 2: 青色三角形 (幾何款)
    fill('#00ffff');
    triangle(x, y, x - 10, y + 25, x + 10, y + 25);
  }
}
