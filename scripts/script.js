"use strict";
let cvs,
  ctx,
  speed,
  vector,
  offset,
  wasOffsetNegative,
  reflectionAngle = null;

let gameOver = false;
const constantSpeed = 5;

const gameObjects = { paddle: null, ball: null, brick: [] };
let mousePos = new TPoint(0, 0);
const keyPress = {
  a: false,
  d: false,
};

export function main(aCanvas) {
  cvs = aCanvas;
  ctx = cvs.getContext("2d");
  gameObjects.ball = new TCreateBall();
  gameObjects.paddle = new TPaddle();
  gameObjects.brick.push(new TBrick());
  gameObjects.ball.moveBall();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mousedown", mouseDown);
  document.addEventListener("mouseup", mouseUp);
  drawGame();
}

// ------- classes -------

function TPoint(x, y) {
  this.x = x;
  this.y = y;
}

function TBrick() {
  this.width = 70;
  this.height = 20;
  this.pos = new TPoint(cvs.width / 2 - this.width / 2, cvs.height / 2 - this.height / 2);
  const color = "red";

  this.draw = function () {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.destroyBrick = function () {
    gameObjects.brick.pop();
  };

  this.moveBrickTest = function () {
    this.pos = mousePos;
  };
}

function TPaddle() {
  this.width = 300;
  this.height = 20;
  this.pos = new TPoint(cvs.width / 2 - this.width / 2, cvs.height - 20);
  const color = "grey";
  let speed = 5;
  this.center = {
    x: this.pos.x + this.width / 2,
    y: this.pos.y,
  };

  this.draw = function () {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function () {
    if (keyPress.a && this.pos.x >= 0) {
      this.pos.x -= speed;
    }
    if (keyPress.d && this.pos.x + this.width <= cvs.width) {
      this.pos.x += speed;
    }
  };
}

function TCreateBall() {
  this.width = 50;
  this.height = 50;
  this.pos = new TPoint(cvs.width / 2 - this.width / 2, 10);
  this.center = {
    x: this.pos.x + this.width / 2,
    y: this.pos.y,
  };
  const color = "white";
  vector = calculateNormalizedVector(this.center, { x: 300, y: 200 });
  speed = calculateSpeedVector(vector, constantSpeed);

  this.moveBall = function () {};

  this.draw = function () {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function () {
    this.checkCollision();
    this.pos.x += speed.x;
    this.pos.y += speed.y;
    if (!gameOver) {
      // asdfasdfasdf
    }
  };

  this.checkCollision = function () {
    const paddleRight = gameObjects.paddle.pos.x + gameObjects.paddle.width;
    const paddleLeft = gameObjects.paddle.pos.x;
    const paddleBottom = gameObjects.paddle.pos.y + gameObjects.paddle.height;
    const paddleTop = gameObjects.paddle.pos.y;
    const ballRight = this.pos.x + this.width;
    const ballLeft = this.pos.x;
    const ballBottom = this.pos.y + this.height;
    const ballTop = this.pos.y;
    const brick = gameObjects.brick;

    // ball hits roof
    if (ballTop <= 0) {
      speed.y = -speed.y;
    }
    // ball hit paddle
    else if (ballLeft <= paddleRight && ballRight >= paddleLeft && ballBottom >= paddleTop && ballTop < paddleBottom) {
      ballCollision(gameObjects.paddle);
    }

    // wall bounce
    else if (this.pos.x <= 0 || this.pos.x + this.width >= cvs.width) {
      speed.x = -speed.x;
    }
    // game over
    else if (ballBottom >= cvs.height) {
      gameOver = true;
    }

    // ball hit brick
    for (let i = 0; i < gameObjects.brick.length; i++) {
      if (
        ballLeft <= brick[i].pos.x + brick[i].width &&
        ballRight >= brick[i].pos.x &&
        ballBottom >= brick[i].pos.y &&
        ballTop < brick[i].pos.y + brick[i].height
      ) {
        console.log("ball hit brick");
        ballCollision(gameObjects.brick[i]);
        gameObjects.brick[i].destroyBrick();
      }
    }
  };
}
// ------- end of classes -------

function drawGame() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  gameObjects.ball.draw();
  gameObjects.ball.update();
  gameObjects.paddle.draw();
  gameObjects.paddle.update();

  for (let i = 0; i < gameObjects.brick.length; i++) {
    gameObjects.brick[i].draw();
  }
  requestAnimationFrame(drawGame);
}

function handleKeyDown(event) {
  if (event.key in keyPress) {
    keyPress[event.key] = true;
  }
}

function handleKeyUp(event) {
  if (event.key in keyPress) {
    keyPress[event.key] = false;
  }
}

function mouseDown() {
  for (let i = 0; i < gameObjects.brick.length; i++) {
    const brick = gameObjects.brick[i];
    if (mousePos.x <= brick.pos.x + brick.width && mousePos.x >= brick.pos.x && mousePos.y <= brick.pos.y + brick.height && mousePos.y >= brick.pos.y) {
      brick.moveBrickTest();
    }
    return brick;
  }
}
function mouseUp() {
  const brick = mouseDown();
  if (brick) {
    brick.pos = new TPoint(brick.pos.x, brick.pos.y);
  }
}
function mouseMove(aEvent) {
  updateMousePos(aEvent);
}
function updateMousePos(aEvent) {
  mousePos.x = aEvent.clientX - cvs.offsetLeft;
  mousePos.y = aEvent.clientY - cvs.offsetTop;
}

// ------------------------- PHYSICS -------------------------

function calculateNormalizedVector(startingPoint, tartgetPoint) {
  vector = {
    x: tartgetPoint.x - startingPoint.x,
    y: tartgetPoint.y - startingPoint.y,
  };

  let magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

  let normalizedVector = {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
  return normalizedVector;
}

function calculateSpeedVector(normalizedVector, speed) {
  // regner ut hastighet utifra vektoren og en gitt speed den skaleres med
  var speedVector = {
    x: normalizedVector.x * speed,
    y: normalizedVector.y * speed,
  };

  // regner ut størrelsen på vektoren (speed vector)
  let speedMagnitude = Math.sqrt(speedVector.x ** 2 + speedVector.y ** 2);

  // sjekker om hastigheten går over konstant hastighetsgrense
  if (speedMagnitude > constantSpeed || speedMagnitude < constantSpeed) {
    speedVector.x = (speedVector.x / speedMagnitude) * constantSpeed;
    speedVector.y = (speedVector.y / speedMagnitude) * constantSpeed;
  }
  return speedVector;
}

function ballCollision(object) {
  object.center = {
    x: object.pos.x + object.width / 2,
    // y: gameObjects.brick.pos.y,
  };

  offset = gameObjects.ball.pos.x + gameObjects.ball.width / 2 - object.center.x;

  // wasOffsetNegative blir true om offset er negativt
  wasOffsetNegative = offset < 0;

  if (offset < 0) {
    offset *= -1;
  }

  if (offset <= 30) {
    console.log("midten?");
    speed.y = -speed.y;
    speed.x = -speed.x;
  } else {
    // Regner ut vinkel for refleksjon med atan2
    reflectionAngle = Math.atan2(speed.y, speed.x);

    // Oppdaterer vinkel iforhold til offset
    reflectionAngle += (Math.PI / 4) * (offset / object.width);

    // Oppdaterer vektor basert på den justerte vinkelen
    vector.x = Math.cos(reflectionAngle);
    vector.y = -Math.sin(reflectionAngle); // inverter y vektor for å sende den oppover igjen

    // Oppdaterer speed med de ny oppdaterte vektorene
    speed = calculateSpeedVector(vector, constantSpeed);

    // Sjekk om x skal reverseres basert på om ballen traff høyre eller venstre side av paddle
    if (wasOffsetNegative) {
      speed.x = -Math.abs(speed.x);
    } else {
      console.log("høyre halvdel", wasOffsetNegative);
      speed.x = Math.abs(speed.x);
    }
  }
}

/*  ---------------- TO DO ----------------
  - brick snapper feil når du flytter brick, trenger offset fra brick og mousepos
  - bytt ut pop i destroy brick, fjerner feil brick hvis man har flere i array'et
    Bruk splice, og splice med i (fjerner hvilken som kolliderte)

*/
