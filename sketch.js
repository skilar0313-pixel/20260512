let capture;
let faceMesh;
let faces = [];

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML video 元件
  capture.hide();

  // 初始化 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh(capture, { maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
  // 開始偵測臉部，並將結果存入 faces 變數
  faceMesh.detectStart(capture, (results) => {
    faces = results;
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
        drawEarring((pt.x - capture.width / 2) * scX, (pt.y - capture.height / 2) * scY);
      }
    });
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 繪製三個垂直排列的黃色圓圈
function drawEarring(x, y) {
  fill('yellow');
  noStroke();
  for (let i = 0; i < 3; i++) {
    circle(x, y + (i * 15), 10); // 每個圓圈間隔 15 像素
  }
}
