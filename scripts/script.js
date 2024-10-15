"use strict";
import { ball_collision, calculate_normalized_vector, calculate_speed_vector } from "./calculations.js";

let cvs,
  ctx,
  vector,
  speed,
  started = null;

let game_over = false;
const constant_speed = 5; // gjør sånn faktisk ingenting
const lives = 3;

export const game_objects = { paddle: null, ball: null, brick: [], lives_left: [] };
let mouse_pos = new T_Point(0, 0);
const key_press = {
  a: false,
  d: false,
};

export function main(a_canvas) {
  cvs = a_canvas;
  ctx = cvs.getContext("2d");

  game_objects.paddle = new T_Paddle();
  game_objects.brick.push(new T_Brick("yellow"));
  game_objects.brick.push(new T_Brick("red"));
  game_objects.brick.push(new T_Brick("blue"));
  // game_objects.brick.push(new T_Brick());
  for (let i = 0; i < lives; i++) {
    game_objects.lives_left.push(new T_Lives(i));
  }

  document.addEventListener("keydown", handle_key_down);
  document.addEventListener("keyup", handle_key_up);
  document.addEventListener("mousemove", mouse_move);
  document.addEventListener("mousedown", mouse_down);
  document.addEventListener("mouseup", mouse_up);
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      start_game();
    }
  });

  draw_game();
}

// ------- classes -------

function T_Point(x, y) {
  this.x = x;
  this.y = y;
}

function T_Brick(brick_color) {
  // OPPDATER KLASSE TIL Å ULIKE TRAIS (TRENGER FLERE TREFF FOR Å GÅ I STYKKER) UTIFRA FARGE
  this.width = 70;
  this.height = 20;
  this.color = brick_color;

  const brick_to_build = {
    red: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 200, health: 2 },
    yellow: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 100, health: 1 },
    blue: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 300, health: 3 },
  };

  switch (brick_color) {
    case "red":
      this.pos = new T_Point(brick_to_build.red.pos_x, brick_to_build.red.pos_y);
      // this.brick_health =
      break;
    case "yellow":
      this.pos = new T_Point(brick_to_build.yellow.pos_x, brick_to_build.yellow.pos_y);
      break;
    case "blue":
      this.pos = new T_Point(brick_to_build.blue.pos_x, brick_to_build.blue.pos_y);
      break;
    default:
      console.log("no color selected");
      this.pos = new T_Point(cvs.width - 300 / 2 - this.width / 2, 400);
  }

  this.draw = function () {
    if (this.color == undefined) {
      ctx.fillStyle = "pink";
    } else {
      ctx.fillStyle = this.color;
    }
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.destroy_brick = function (i) {
    game_objects.brick.splice(i, 1);
  };

  this.move_brick_test = function () {
    this.pos = mouse_pos;
    if (this.pos.x > cvs.width - 300) {
      this.pos.x = brick_to_build[this.color].pos_x;
      this.pos.y = brick_to_build[this.color].pos_y;
    }
  };
}

function T_Paddle() {
  this.width = 300;
  this.height = 20;
  this.pos = new T_Point((cvs.width - 300) / 2 - this.width / 2, cvs.height - 20);
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
    if (key_press.a && this.pos.x >= 0) {
      this.pos.x -= speed;
    }

    if (key_press.d && this.pos.x + this.width <= cvs.width - 300) {
      this.pos.x += speed;
    }
  };
}

function T_Create_ball() {
  this.width = 50;
  this.height = 50;
  this.pos = new T_Point(cvs.width / 2 - this.width / 2, 10);
  this.center = {
    x: this.pos.x + this.width / 2,
    y: this.pos.y,
  };
  const color = "white";
  vector = calculate_normalized_vector(this.center, { x: 300, y: 200 });
  speed = calculate_speed_vector(vector, constant_speed);

  this.move_ball = function () {};

  this.draw = function () {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function () {
    this.check_collision();
    this.pos.x += speed.x;
    this.pos.y += speed.y;
    if (!game_over) {
      // asdfasdfasdf
    }
  };

  this.check_collision = function () {
    if (!game_over) {
      const paddle_right = game_objects.paddle.pos.x + game_objects.paddle.width;
      const paddle_left = game_objects.paddle.pos.x;
      const paddle_bottom = game_objects.paddle.pos.y + game_objects.paddle.height;
      const paddle_top = game_objects.paddle.pos.y - 0.2;
      const ball_right = this.pos.x + this.width;
      const ball_left = this.pos.x;
      const ball_bottom = this.pos.y + this.height;
      const ball_top = this.pos.y;
      const brick = game_objects.brick;

      // ball hits roof
      if (ball_top <= 0) {
        speed.y = -speed.y;
      }
      // ball hit paddle
      else if (ball_left <= paddle_right && ball_right >= paddle_left && ball_bottom >= paddle_top && ball_top < paddle_bottom) {
        console.log("ball traff paddle");
        speed = ball_collision(game_objects.paddle, speed);
      }

      // wall bounce
      else if (this.pos.x <= 0 || this.pos.x + this.width >= cvs.width - 300) {
        speed.x = -speed.x;
      }
      // game over
      else if (ball_bottom >= cvs.height) {
        game_over = true;
        game_objects.lives_left.pop();
        return;
      }

      // ball hit brick
      for (let i = 0; i < game_objects.brick.length; i++) {
        if (
          ball_left <= brick[i].pos.x + brick[i].width &&
          ball_right >= brick[i].pos.x &&
          ball_bottom >= brick[i].pos.y &&
          ball_top < brick[i].pos.y + brick[i].height
        ) {
          console.log("ball hit brick");
          speed = ball_collision(game_objects.brick[i], speed);
          game_objects.brick[i].destroy_brick(i);
        }
      }
    }
  };
}

function T_Lives(i) {
  this.width = 30;
  this.height = 20;
  let pos_x = cvs.width - 60;
  this.pos = new T_Point(pos_x / 2 + 50 * i - this.width / 2, 20);
  const color = "red";

  this.draw = function () {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function () {
    console.log(game_objects.lives_left.length);
  };
}
// ------- end of classes -------
function draw_game() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  if (started == true) {
    game_objects.ball.draw();
    game_objects.ball.update();
  }
  for (let i = 0; i < game_objects.lives_left.length; i++) {
    game_objects.lives_left[i].draw();
  }
  game_objects.paddle.draw();
  game_objects.paddle.update();

  for (let i = 0; i < game_objects.brick.length; i++) {
    game_objects.brick[i].draw();
  }
  requestAnimationFrame(draw_game);
}

function handle_key_down(event) {
  if (event.key in key_press) {
    key_press[event.key] = true;
  }
}

function handle_key_up(event) {
  if (event.key in key_press) {
    key_press[event.key] = false;
  }
}

function mouse_down() {
  for (let i = 0; i < game_objects.brick.length; i++) {
    const brick = game_objects.brick[i];
    if (mouse_pos.x <= brick.pos.x + brick.width && mouse_pos.x >= brick.pos.x && mouse_pos.y <= brick.pos.y + brick.height && mouse_pos.y >= brick.pos.y) {
      brick.move_brick_test();
      return brick;
    }
  }
}
function mouse_up() {
  const brick = mouse_down();

  if (brick) {
    brick.pos = new T_Point(brick.pos.x, brick.pos.y);
  }
  if (mouse_pos.x && mouse_pos.y > 0 && mouse_pos.x && mouse_pos.y < cvs.width - 300) {
    game_objects.brick.push(new T_Brick(brick.color));
    if (mouse_pos.x > cvs.width - 300) {
      game_objects.brick.pop();
    }
  }
}
function mouse_move(aEvent) {
  // hvorfor ikke bare kjøre update_mouse_pos ?
  update_mouse_pos(aEvent);
}
function update_mouse_pos(aEvent) {
  mouse_pos.x = aEvent.clientX - cvs.offsetLeft;
  mouse_pos.y = aEvent.clientY - cvs.offsetTop;
}

function start_game() {
  if (game_over) {
    if (game_objects.lives_left.length > 0) {
      game_over = false;
      game_objects.ball = new T_Create_ball();
      started = true;
    } else {
      console.log("game over");
    }
  } else if (!started) {
    game_objects.ball = new T_Create_ball();
  }
  started = true;
}
