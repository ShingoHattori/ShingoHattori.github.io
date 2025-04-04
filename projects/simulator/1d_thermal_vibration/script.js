let balls = [];
let velocityMultiplier = 1.0; // デフォルトの速度倍率
let originalVelocities = []; // 元の速度を保存する配列
let NUM_BALLS = 6;
let BALL_RADIUS = 5;
let slopeAngle = 0; // Angle of the slope
let isPlaying = true; // 再生中かどうかのフラグ


function setup() {
    createCanvas(800, 800);
    for (let i = 0; i < NUM_BALLS; i++) {
        balls.push(new Ball(random(BALL_RADIUS, width - BALL_RADIUS), height / 2, BALL_RADIUS));
    }

    // Create slider for simulation speed
    let slider_gradient = document.getElementById('slider_gradient');
    noUiSlider.create(slider_gradient, {
      start: [0],      // 0 radians at start
      range: {
          'min': [0],   // 0 radians
          'max': [1.57] // pi/2 radians
      },
      step: 0.01       // increase by 0.01 radians
  });

  slider_gradient.noUiSlider.on('update', function(values) {
    slopeAngle = parseFloat(values[0]);
  });


  // Create slider for simulation speed
  let slider_gravity = document.getElementById('slider_gravity');
  noUiSlider.create(slider_gravity, {
    start: [0],      // 0 radians at start
    range: {
        'min': [0],   // 0 radians
        'max': [1] // pi/2 radians
    },
    step: 0.01       // increase by 0.01 radians
  });

  slider_gravity.noUiSlider.on('update', function(values) {
  gravity = parseFloat(values[0]);
  document.getElementById('gravity-value').innerText = `現在の重力: ${gravity.toFixed(2)}`;
  });

// 速度調整用スライダーの作成
let slider_velocity = document.getElementById('slider_velocity');
noUiSlider.create(slider_velocity, {
  start: [0],       // デフォルトは0（中央）で10^0 = 1倍
  range: {
      'min': [-1],  // 最小-1で10^-1 = 0.1倍
      'max': [1]    // 最大1で10^1 = 10倍
  },
  connect: true,    // レンジバーを表示
  step: 0.01,
  orientation: 'horizontal'
});

// 元の速度を保存
for (let ball of balls) {
  originalVelocities.push(createVector(ball.velocity.x, ball.velocity.y));
}

slider_velocity.noUiSlider.on('update', function(values) {
  let sliderValue = parseFloat(values[0]);
  
  // 10の冪乗で計算（10^sliderValue）
  velocityMultiplier = Math.pow(10, sliderValue);
  
  document.getElementById('velocity-value').innerText = `現在の速度倍率: ${velocityMultiplier.toFixed(2)}`;
  
  // 全てのボールの速度を更新
  for (let i = 0; i < balls.length; i++) {
    balls[i].velocity.x = originalVelocities[i].x * velocityMultiplier;
  }
});

// ボール数変更イベントリスナー
document.getElementById('ball-count').addEventListener('change', function() {
    let newCount = int(this.value);
    NUM_BALLS = newCount; // NUM_BALLSを更新
    
    // ボールを増やす場合
    while (balls.length < newCount) {
      let newBall = new Ball(random(BALL_RADIUS, width - BALL_RADIUS), height / 2, BALL_RADIUS);
      balls.push(newBall);
      originalVelocities.push(createVector(newBall.velocity.x, newBall.velocity.y));
    }
    
    // ボールを減らす場合
    while (balls.length > newCount) {
      balls.pop();
      originalVelocities.pop();
    }
  });

// ボール半径変更イベントリスナー
document.getElementById('ball-radius').addEventListener('change', function() {
    BALL_RADIUS = int(this.value);
    let currentBallCount = balls.length; // 現在のボール数を保存
    
    balls = [];
    originalVelocities = []; // 元の速度配列もクリア
    
    // 現在のボール数を使用して新しいボールを作成
    for (let i = 0; i < currentBallCount; i++) {
      let newBall = new Ball(random(BALL_RADIUS, width - BALL_RADIUS), height / 2, BALL_RADIUS);
      balls.push(newBall);
      originalVelocities.push(createVector(newBall.velocity.x, newBall.velocity.y));
    }
    
    // NUM_BALLSも更新して一貫性を保つ
    NUM_BALLS = currentBallCount;
    
    // ボール数入力フィールドも更新
    document.getElementById('ball-count').value = currentBallCount;
  });


    let playPauseButton = select('#playPauseButton');
    playPauseButton.mousePressed(togglePlayPause);
}

function draw() {
  background(220);
  translate(width / 2, height / 2); // Move to center of canvas
  rotate(slopeAngle); // Rotate by 45 degrees

  // Draw boundary lines along which the balls move
  stroke(0); // Set line color to black
  line(-width/2, 0, width/2, 0); // Top boundary

  translate(-width / 2, -height / 2); // Move back

  if (isPlaying) {
      balls.forEach(ball => {
          ball.checkCollision(balls);
          ball.update();
      });
  }
  balls.forEach(ball => ball.display());

  // 平均速度の計算と表示
  let totalVelocity = 0;
  for (let ball of balls) {
    totalVelocity += abs(ball.velocity.x); // x方向の速度の絶対値
  }
  let avgVelocity = totalVelocity / balls.length;
  document.getElementById('average-velocity').innerText = `平均速度: ${avgVelocity.toFixed(2)}`;
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  if (isPlaying) {
      document.getElementById('playPauseButton').innerText = "停止";
  } else {
      document.getElementById('playPauseButton').innerText = "再生";
  }
}

class Ball {
    constructor(x, y, r) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-2, 2), 0);
        this.originalVelocity = createVector(this.velocity.x, this.velocity.y); // 元の速度を保存
        this.acceleration = createVector();
        this.radius = r;
    }

    applyForce(force) {
        let f = p5.Vector.div(force, this.radius);
        this.acceleration.add(f);
    }

    checkCollision(otherBalls) {
        for (let other of otherBalls) {
            if (other === this) continue;

            let distance = abs(this.position.x - other.position.x);

            if (distance < this.radius * 2) {

                let overlap = (this.radius * 2) - distance;
                let correction = overlap / 2;

                if (this.position.x > other.position.x) {
                    this.position.x += correction;
                    other.position.x -= correction;
                } else {
                    this.position.x -= correction;
                    other.position.x += correction;
                }

                // Swap velocities
                let tempVel = this.velocity.x;
                this.velocity.x = other.velocity.x;
                other.velocity.x = tempVel;
            }
        }
    }

    update() {
      let accelerationDueToSlope = 0;

      if (slopeAngle === 3.14 / 2) {
        accelerationDueToSlope = gravity;
    } else {
        accelerationDueToSlope = gravity * sin(slopeAngle);
    }
      this.acceleration.x += accelerationDueToSlope;

      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.mult(0);

      let boundary = sqrt((width * width) + (height * height));
      if (this.position.x > boundary - this.radius) {
          this.velocity.x *= -1;
          this.position.x = boundary - this.radius;
      } else if (this.position.x < this.radius) {
          this.velocity.x *= -1;
          this.position.x = this.radius;
      }
      
      if (this.position.x > width - this.radius) {
        this.velocity.x *= -1;
        this.position.x = width - this.radius;
    } else if (this.position.x < this.radius) {
        this.velocity.x *= -1;
        this.position.x = this.radius;
    }

  }


    display() {
        fill(127);
        stroke(200);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}
