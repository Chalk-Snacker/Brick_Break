"use strict";

/*
 * To do:
 * add sprite coordinates and replace blocks with sprites
 * ball can get "stuck" bounding horizontally "almost" forever if unlucky, check on the y position with a timer and slowly increase/ decrease y?
 * havent updated the collision check on paddle to check when the ball hits the side, so it goes through
 * move classes to seperate files
 */

import {
  ball_collision,
  calculate_normalized_vector,
  calculate_speed_vector,
} from "./calculations.js";
import lib2d_v2 from "./libs/lib2d_v2.mjs";

import lib_2d from "./libs/lib2d_v2.mjs";
import libSprite_v2 from "./libs/libSprite_v2.mjs";
import lib_sprite from "./libs/libSprite_v2.mjs";

//Sheet_data coordinates

let vector,
  started = null;

let game_over = false;
const lives = 3;
let delay = 80; // ikke double tap
let last_hit = 0;

// -----------------------------------------

const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");
const spcvs = new lib_sprite.TSpriteCanvas(cvs);
const test_pos = new lib2d_v2.TPoint(300, 300);
//let test_noe;

export const game_objects = {
  paddle: null,
  ball: null,
  brick: [],
  lives_left: [],
};
let mouse_pos = new T_Point(0, 0);
const key_press = {
  a: false,
  d: false,
};

export function main(a_canvas) {
  //cvs = a_canvas;
  //  ctx = cvs.getContext("2d");

  //spcvs = new lib_sprite.TSpriteCanvas(cvs);

  // test_noe er for å teste sprites når koordinatene bir lagt til
  //test_noe = new libSprite_v2.TSprite(spcvs, Sheet_data.Ball, test_pos);

  console.log(
    "Instruction: Drag bricks from right panel to build your own level. Control bottom paddel with A and D, press space to start",
  );
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
  document.addEventListener("keydown", function(event) {
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

function check_delay() {
  if (last_hit >= Date.now() - delay) {
    console.log("get outa here");
    return false;
  }
  last_hit = Date.now();
  return true;
}

function T_Brick(brick_color) {
  this.width = 70;
  this.height = 20;
  this.color = brick_color;

  const brick_to_build = {
    red: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 200 },
    yellow: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 100 },
    blue: { pos_x: cvs.width - 300 / 2 - this.width / 2, pos_y: 300 },
  };
  this.brick_health = null;

  switch (brick_color) {
    case "red":
      this.pos = new T_Point(
        brick_to_build[brick_color].pos_x,
        brick_to_build.red.pos_y,
      );
      this.brick_health = 2;
      break;
    case "yellow":
      this.pos = new T_Point(
        brick_to_build[brick_color].pos_x,
        brick_to_build[brick_color].pos_y,
      );
      this.brick_health = 1;
      break;
    case "blue":
      this.pos = new T_Point(
        brick_to_build[brick_color].pos_x,
        brick_to_build[brick_color].pos_y,
      );
      this.brick_health = 3;
      break;
    default:
      console.log("no color selected");
      this.pos = new T_Point(cvs.width - 300 / 2 - this.width / 2, 400);
  }

  this.draw = function() {
    if (this.color == undefined) {
      ctx.fillStyle = "pink";
    } else {
      ctx.fillStyle = this.color;
    }
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.destroy_brick = function(i) {
    switch (this.brick_health) {
      case 2:
        this.color = "yellow";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        break;
      case 3:
        this.color = "red";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        break;
    }
    this.brick_health--;

    if (this.brick_health <= 0) {
      game_objects.brick.splice(i, 1);
    }
  };

  this.move_brick_test = function() {
    if (!started || game_over) {
      this.pos = mouse_pos;
      if (this.pos.x > cvs.width - (300 + this.width)) {
        this.pos.x = brick_to_build[this.color].pos_x;
        this.pos.y = brick_to_build[this.color].pos_y;
      }
    }
  };
}

function T_Paddle() {
  this.width = 200;
  this.height = 20;
  this.pos = new T_Point(
    (cvs.width - 300) / 2 - this.width / 2,
    cvs.height - 20,
  );
  const color = "grey";
  let speed = 7;
  this.center = {
    x: this.pos.x + this.width / 2,
    y: this.pos.y,
  };

  this.draw = function() {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function() {
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
  this.speed = calculate_speed_vector(vector);

  this.move_ball = function() { };

  this.draw = function() {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function() {
    this.check_collision();
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;
    if (!game_over) {
      // asdfasdfasdf
    }
  };

  this.check_collision = function() {
    if (!game_over) {
      const paddle_right =
        game_objects.paddle.pos.x + game_objects.paddle.width;
      const paddle_left = game_objects.paddle.pos.x;
      const paddle_bottom =
        game_objects.paddle.pos.y + game_objects.paddle.height;
      const paddle_top = game_objects.paddle.pos.y - 0.2;
      const ball_right = this.pos.x + this.width;
      const ball_left = this.pos.x;
      const ball_bottom = this.pos.y + this.height;
      const ball_top = this.pos.y;
      const brick = game_objects.brick;

      // ball hits roof
      if (ball_top <= 0) {
        this.speed.y = -this.speed.y;
      }
      // ball hit paddle
      else if (
        ball_left <= paddle_right &&
        ball_right >= paddle_left &&
        ball_bottom >= paddle_top &&
        ball_top < paddle_bottom
      ) {
        if (check_delay()) {
          console.log("ball traff paddle");
          ball_collision(game_objects.paddle);
        }
      }

      // wall bounce
      else if (this.pos.x <= 0 || this.pos.x + this.width >= cvs.width - 300) {
        // mulig at delay gjør at hvis den treffer veldig mange ganger kjapt rekker den ikke å se om den skal bounce fra veggen?
        if (check_delay()) {
          this.speed.x = -this.speed.x;
        }
      }
      // game over
      else if (ball_bottom > cvs.height) {
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
          if (check_delay()) {
            console.log("ball hit brick");
            ball_collision(game_objects.brick[i]);
            game_objects.brick[i].destroy_brick(i);
          }
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

  this.draw = function() {
    ctx.fillStyle = color.toString();
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  };

  this.update = function() {
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
  //  test_noe.draw();
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
    if (
      mouse_pos.x <= brick.pos.x + brick.width &&
      mouse_pos.x >= brick.pos.x &&
      mouse_pos.y <= brick.pos.y + brick.height &&
      mouse_pos.y >= brick.pos.y
    ) {
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
  if (
    mouse_pos.x &&
    mouse_pos.y > 0 &&
    mouse_pos.x < cvs.width - 300 &&
    brick
  ) {
    game_objects.brick.push(new T_Brick(brick.color));
    if (mouse_pos.x > cvs.width - 300) {
      game_objects.brick.pop();
    }
  }
}
function mouse_move(aEvent) {
  //  kunne vel bare kjørt update_mouse_pos istedenfor denne funksjonen
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
console.log(spcvs);
spcvs.loadSpriteSheet("../media/spritesheetExp1.png", main);
