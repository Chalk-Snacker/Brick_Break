"use strict";
import { game_objects } from "./script.js";

let vector = null;
const constant_speed = 10;

export function calculate_normalized_vector(starting_point, tartget_point) {
  // hvis du skal starte med ballen på paddle, må du kalkulere target_point utifra hvor du er og sende den rett opp
  vector = {
    x: tartget_point.x - starting_point.x,
    y: tartget_point.y - starting_point.y,
  };

  let magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

  let normalized_vector = {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
  return normalized_vector;
}

export function calculate_speed_vector(normalized_vector, speed) {
  // regner ut hastighet utifra vektoren og en gitt speed den skaleres med
  var speed_vector = {
    x: normalized_vector.x * speed,
    y: normalized_vector.y * speed,
  };

  // regner ut størrelsen på vektoren (speed vector) (hypothenus = lengden på vektoren = hastigheten)
  let speed_magnitude = Math.sqrt(speed_vector.x ** 2 + speed_vector.y ** 2);

  // sjekker om hastigheten går over konstant hastighetsgrense
  if (speed_magnitude > constant_speed || speed_magnitude < constant_speed) {
    speed_vector.x = (speed_vector.x / speed_magnitude) * constant_speed;
    speed_vector.y = (speed_vector.y / speed_magnitude) * constant_speed;
  }
  return speed_vector;
}

export function ball_collision(object, speed) {
  // må kanskje legge inn en cd for kalkulering, så den ikke gjør 1000000 hvis man treffer litt rart og paddle og ball ligger inntil hverandre i 1 sekund.
  object.center = {
    x: object.pos.x + object.width / 2,
  };

  let offset = game_objects.ball.pos.x + game_objects.ball.width / 2 - object.center.x;

  // was_offset_negative blir true om offset er negativt
  let was_offset_negative = offset < 0;

  if (offset < 0) {
    offset *= -1;
  }

  if (offset <= 30) {
    console.log("midten?");
    speed.y = -speed.y;
    speed.x = -speed.x;
  } else {
    // Regner ut vinkel for refleksjon med atan2
    let reflection_angle = Math.atan2(speed.y, speed.x);

    // Oppdaterer vinkel iforhold til offset
    reflection_angle += (Math.PI / 4) * (offset / object.width);

    // Oppdaterer vektor basert på den justerte vinkelen
    vector.x = Math.cos(reflection_angle);
    vector.y = -Math.sin(reflection_angle); // inverter y vektor for å sende den oppover igjen

    // Oppdaterer speed med de ny oppdaterte vektorene
    speed = calculate_speed_vector(vector, constant_speed);

    // Sjekk om x skal reverseres basert på om ballen traff høyre eller venstre side av paddle
    if (was_offset_negative) {
      speed.x = -Math.abs(speed.x);
    } else {
      console.log("høyre halvdel", was_offset_negative);
      speed.x = Math.abs(speed.x);
    }
  }
  return speed;
}
