let balls = [];
const NUM_BALLS = 10;
const BALL_RADIUS = 10;
let slopeAngle = 0; // Angle of the slope

function setup() {
    createCanvas(800, 100);
    for (let i = 0; i < NUM_BALLS; i++) {
        balls.push(new Ball(random(BALL_RADIUS, width - BALL_RADIUS), height / 2, BALL_RADIUS));
    }

    // Create slider for simulation speed
    let slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [1],
        range: {
            'min': [0.1],
            'max': [3]
        },
        step: 0.1
    });

    slider.noUiSlider.on('update', function (values) {
        simulationSpeed = parseFloat(values[0]);
        frameRate(60 * simulationSpeed);
    });
}

function draw() {
    background(220);
    balls.forEach(ball => {
        ball.checkCollision(balls);
        ball.update();
        ball.display();
    });
}

class Ball {
    constructor(x, y, r) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-2, 2), 0);
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
                console.log('collide');

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
        const a = 0.1;  // You can change this value to set the strength of the force
        let accelerationDueToSlope = a / tan(0.5);
        this.acceleration.x += accelerationDueToSlope;

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);

        if (this.position.x > width - this.radius || this.position.x < this.radius) {
            this.velocity.x *= -1;
        }
    }

    display() {
        fill(127);
        stroke(200);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}
