let balls = [];
const NUM_BALLS = 10;
const BALL_RADIUS = 10;

function setup() {
    createCanvas(800, 400);
    for (let i = 0; i < NUM_BALLS; i++) {
        balls.push(new Ball(random(width), random(height), BALL_RADIUS));
    }

    // Create slider
    let slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [0],  // initial angle
        range: {
            'min': [-PI / 4],
            'max': [PI / 4]
        },
        step: 0.01,
        format: {
            to: function (value) {
                return value.toFixed(2);
            },
            from: function (value) {
                return parseFloat(value);
            }
        }
    });

    slider.noUiSlider.on('update', function (values) {
        let angle = parseFloat(values[0]);
        updateGravityDirection(angle);
    });
}

function draw() {
    background(220);

    balls.forEach(ball => {
        ball.update();
        ball.display();
    });
}

function updateGravityDirection(angle) {
    let gravityMagnitude = 0.4;
    let gravity = createVector(gravityMagnitude * sin(angle), gravityMagnitude * cos(angle));
    balls.forEach(ball => {
        ball.applyForce(gravity);
    });
}

class Ball {
    constructor(x, y, r) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-2, 2), random(-2, 2));
        this.acceleration = createVector();
        this.radius = r;
        this.mass = 1;  // For simplicity, keep this 1
    }

    applyForce(force) {
        let f = p5.Vector.div(force, this.mass);  // Force = Mass * Acceleration
        this.acceleration.add(f);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);

        // Reset acceleration for next frame
        this.acceleration.mult(0);

        // Boundary collision check
        if (this.position.x > width - this.radius || this.position.x < this.radius) {
            this.velocity.x *= -1;
        }

        if (this.position.y > height - this.radius || this.position.y < this.radius) {
            this.velocity.y *= -1;
        }
    }

    display() {
        fill(127);
        stroke(200);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}
