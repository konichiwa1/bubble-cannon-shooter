let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

let g = 0.5;

function Canon(x, y) {
    this.x = x;
    this.y = y;
    let r = 20;

    this.draw = () => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, -Math.PI/3-angle, Math.PI/3-angle, true);
        ctx.lineTo(this.x+3*r*Math.cos(angle)+r/2*Math.sin(angle),
            this.y-3*r*Math.sin(angle)+10*Math.cos(angle));
        ctx.lineTo(this.x+3*r*Math.cos(angle)-r/2*Math.sin(angle),
            this.y-3*r*Math.sin(angle)-r/2*Math.cos(angle));
        ctx.lineTo(this.x+r*Math.cos(Math.PI/3+angle), this.y-r*Math.sin(Math.PI/3+angle));
        ctx.strokeStyle = "black";
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x-r/2, this.y);
        ctx.lineTo(this.x+r/2, this.y);
        ctx.lineTo(this.x+r, this.y+2*r);
        ctx.lineTo(this.x-r, this.y+2*r);
        ctx.lineTo(this.x-r/2, this.y);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();
    }

    this.update = () => {
        this.draw();
    }
}

function Ball(x, y, radius, theta, vel, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.theta = theta;
    this.vel = vel;
    this.color = color;

    this.dx = this.vel*Math.cos(this.theta);
    this.dy = -this.vel*Math.sin(this.theta);

    this.draw = () => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0 , 2*Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    this.update = () => {
        
        if(this.y+this.radius+this.dy > canvas.height) {
            this.dy = -0.9*this.dy;
            console.log(this.dy);
        }else {
            this.dy += g;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

let doAnimation = false;

let balls=[];
let angle=Math.PI/4;
let cntBall=0;
let isPressed;
let score = 0;
let totalBalls = 0;
let bubbles = [];
let bubbleVelx = -0.5;
let timeBubble = 0;
let highScore = 0;
let startSound;
let firedSound;
let boomSound;
let overSound;
let centurySound;

function Bubble(x, y, radius, dx, dy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;

    this.draw = () => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.strokeStyle = "#08196E";
        ctx.stroke();
    }

    this.update = () => {

        if(getDistance(50, canvas.height-50, this.x, this.y) < 50+this.radius) {
            overSound.sound.currentTime = 0;
            overSound.play();
            handleGameOver();
        }

        if(this.x + this.radius + this.dx > canvas.width || this.x - this.radius + this.dx < 0) {
            this.dx = -this.dx;
        }
        if(this.y + this.radius + this.dy > canvas.height || this.y - this.radius - this.dy < 0) {
            this.dy = -this.dy;
        }else {
            this.dy += g-0.499;
        }

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

function init() {
    balls = [];
    bubbles = [];
    angle=Math.PI/4;
    cntBall=0;
    score = 0;
    totalBalls = 0;
    bubbles = [];
    bubbleVelx = -0.5;
    timeBubble = 0;
    isPressed=[];
    for(let i=0; i<=40; i++) {
        isPressed.push(false);
    }
    centurySound = new Sound("century.wav");
    firedSound = new Sound("fired.wav");
    boomSound = new Sound("boom.wav");
    overSound = new Sound("over.wav");
    startSound = new Sound("start.mp3");
    startSound.sound.currentTime = 0;
    startSound.play();
}

function animate() {
    if(!doAnimation)    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "40px Arial"
        ctx.fillText("Game Over", canvas.width/2-100, canvas.height/2);
        ctx.font = "20px Arial"
        ctx.fillText("Press Enter to Play Again", canvas.width/2-110, canvas.height/2+50);
        ctx=null; return;
    }
    window.requestAnimationFrame(animate);
    cntBall++;
    timeBubble++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    createBackground();

    handleInputs();
    
    handleCanon();

    handleBubbles();

    displayScores();
    
}


function getRandomInRange(l, r) {
    return l+Math.random()*(r-l);
}



window.addEventListener("keydown", (e)=>{
    isPressed[e.keyCode] = true;
});

window.addEventListener("keyup", (e)=>{
    isPressed[e.keyCode] = false;
});

function createBackground() {
    ctx.fillStyle = "#B2FFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height-50);
    ctx.fillStyle = "#A97142";
    ctx.fillRect(0, canvas.height-50, canvas.width, 50);
}

function handleInputs() {
    if(isPressed[38]) {
        if(angle < Math.PI/2) angle += 0.01;
    }
    if(isPressed[40]) {
        if(angle > 0) angle -= 0.01;
    }
    if(isPressed[32] || isPressed[39]) {
        if(cntBall>10) {
            balls.push(new Ball(50, canvas.height-50, 10, angle, 25, "red"));
            firedSound.sound.currentTime = 0;
            firedSound.play();
            totalBalls++;
            cntBall=0;
        }
    }
}

function handleCanon() {
    for(let i=0; i<balls.length; i++) {
        if(balls[i].x-balls[i].radius>canvas.width || balls[i]+balls[i].radius<0) {
            balls = balls.filter((b, index)=>{
                if(b!==balls[i]) return true;
                return false;
            });
            i=-1;
        }
    }
    for(let ball of balls) {
        ball.update();
    }
    let can = new Canon(50, canvas.height-50);
    can.update();
}

function handleBubbles() {
    console.log(bubbles.length);

    generateBubbles();

    resolveHit();
    
    for(let bubble of bubbles) {
        bubble.update();
    }
}

function generateBubbles() {
    if(timeBubble>50 && bubbles.length<10) {
        while(true) {
            let radius = getRandomInRange(25, 35);
            let x= getRandomInRange(canvas.width/3, canvas.width-radius);
            let y= getRandomInRange(canvas.height/6, canvas.height-2*radius);
            let found = true;
            for(let i=0; i<bubbles.length; i++) {
                if(getDistance(bubbles[i].x, bubbles[i].y, x, y) < bubbles[i].radius+radius) {
                    found = false;
                    break;
                }
            }
            if(found) {
                bubbles.push(new Bubble(x, y, radius, bubbleVelx, 0));
                timeBubble=0;
                break;
            }
        }
    }
}

function resolveHit() {
    for(let i=0; i<bubbles.length; i++) {
        for(let ball of balls) {
            if(getDistance(ball.x, ball.y, bubbles[i].x, bubbles[i].y)<ball.radius+bubbles[i].radius) {
                    bubbles = bubbles.filter((b)=>{
                        if(b!==bubbles[i]) return true;
                        return false; 
                    });
                    i=-1;
                    score++;
                    if(score%100 == 0) {
                        centurySound.sound.currentTime = 0;
                        centurySound.play();
                    }
                    if(score%20==0 && bubbleVelx>-4) bubbleVelx -= 0.2;
                    highScore = Math.max(score, highScore);
                    boomSound.sound.currentTime = 0;
                    boomSound.play();
                    break;
                }
        }
    }
}

function handleGameOver() {
    doAnimation = false;
}

function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

function getDistance(x1, y1, x2, y2) {
    let x = x1-x2, y = y1-y2;
    return Math.sqrt(x*x + y*y);
}

window.onload = window.onresize = function() {
    canvas.width = window.innerWidth * 0.96;
    canvas.height = window.innerHeight * 0.7;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial"
    ctx.fillText("Press Enter to Play", canvas.width/2-170, canvas.height/2);
    ctx.font = "20px Arial"
    ctx.fillText("Up/Down Key for Angle Increase/Decrease", canvas.width/2-190, canvas.height/2+30);
    ctx.font = "20px Arial"
    ctx.fillText("Right Key to Shoot", canvas.width/2-100, canvas.height/2+50);
    ctx.font = "20px Arial"
    ctx.fillStyle = "green"
    ctx.fillText("Unmute for Game Sound Effects", canvas.width/2-150, canvas.height/2+100);
}

window.addEventListener("keydown", (e)=>{
    if(e.keyCode==13 && !doAnimation) {
        ctx=canvas.getContext("2d");
        doAnimation=true;
        init();
        animate();
    }
});

function startGame() {
    doAnimation=true;
    init();
    animate();
}

function displayScores() {
    ctx.font = "20px Arial";
    ctx.strokeStyle = "green";
    ctx.strokeText("Score: "+score, canvas.width-200, 20);
    ctx.font = "20px Arial";
    ctx.strokeStyle = "green";
    ctx.strokeText("High score: "+highScore, canvas.width-200, 40);

    let hitRatio = 0;
    if(totalBalls>0) hitRatio=Math.round(score/totalBalls*100)/100;
    ctx.font = "20px Arial";
    ctx.strokeStyle = "green";
    ctx.strokeText("Hit ratio: "+hitRatio, canvas.width-200, 60);
}