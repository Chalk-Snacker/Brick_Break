/*
  Library for sprite animation
*/

"use strict";
import {TPoint, TBoundRectangle} from "./lib2D.js";

//TSprite instances that is listen to events from canvas
const spriteEventInstances = {};

const ESpriteButtonStateType = {Up: 1, Down: 2};


// Constructor function for TSprite
/**
 * Represents a sprite with animation, position, and interaction capabilities.
 *
 * @class
 * @classdesc
 * The `TSprite` class is used to create animated sprites with various properties.
 *
 * @param {HTMLCanvasElement} aCanvas - The HTML canvas element to draw the sprite on.
 * @param {HTMLImageElement} aSpriteSheetImage - The image containing the sprite sheet.
 * @param {SpriteAnimation} aSpriteAnimation - The sprite animation configuration.
 * @param {TPoint} aDestination - The x-coordinate and y-coordinate of the destination point on the canvas.
 */
export function TSprite(aCanvas, aSpriteSheetImage, aSpriteAnimation, aDestination) {
  // Get the canvas context once during initialization
  const sprite = this;
  const cvs = aCanvas;
  const ctx = cvs.getContext("2d");
  const destination = new TPoint(aDestination.x, aDestination.y);
  const img = aSpriteSheetImage;

  let spa = aSpriteAnimation;
  let currentFrameIndex = 0;
  let animationCounter = 0;
  let scale = 1.0;
  let speed = 1.0;
  let alpha = 1.0;
  let scaledWidth = spa.width * scale;
  let scaledHeight = spa.height * scale;
  let boundingBox = new TBoundRectangle(destination.x, destination.y, scaledWidth, scaledHeight);
  const canvasRect = cvs.getBoundingClientRect();

  let rotRad = 0;
  let rotPoint = new TPoint(scaledWidth / 2, scaledHeight / 2);

  let mouseState = ESpriteButtonStateType.Up;
  let mouseIsOver = false;


  this.handlePointIsOver = null;

  // Event listeners
  const eventListeners = {};

  // Public method to draw the current sprite on the canvas
  /**
   * Public method to draw the current sprite on the canvas.
   *
   * @method
   * @memberof TSprite
   * @return {void}
   */
  this.draw = function () {
    // Translate to the destination point
    ctx.translate(destination.x, destination.y);

    // Translate to the pivot point
    ctx.translate(rotPoint.x, rotPoint.y);

    // Rotate the sprite
    ctx.rotate(rotRad);
    // Set the alpha value before drawing
    const globalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    const x = spa.x + currentFrameIndex * spa.width;
    const y = spa.y;

    ctx.drawImage(
      img,
      x,
      y,
      spa.width,
      spa.height,
      // Destination coordinates (after translation and rotation)
      -rotPoint.x,
      -rotPoint.y,
      // Destination dimensions (scaled)
      scaledWidth,
      scaledHeight
      
    );

    //Rotate and translate back
    ctx.rotate(-rotRad);
    ctx.translate(-destination.x, -destination.y);
    ctx.translate(-rotPoint.x, -rotPoint.y);

    // Set the alpha back before drawing the next elements
    ctx.globalAlpha = globalAlpha;
  };

  /**
   * Public method to set animation speed.
   *
   * @method
   * @memberof TSprite
   * @param {number} aNewSpeed - The new speed value.
   * @return {void}
   */
  this.setSpeed = function (aNewSpeed) {
    speed = Math.max(0, Math.min(aNewSpeed / 100, 1));
  };

  /**
   * Public method to update the destination point of the sprite.
   *
   * @method
   * @memberof TSprite
   * @param {number} aNewX - The new x-coordinate of the destination point.
   * @param {number} aNewY - The new y-coordinate of the destination point.
   * @return {void}
   */
  this.updateDestination = function (aNewX, aNewY) {
    destination.x = aNewX;
    destination.y = aNewY;
    // Update TBoundRectangle instance based on the new destination
    boundingBox.updatePosition(destination.x, destination.y);
  };

  /**
   * Public method to set the sprite's uniform scale with a percentage value
   *
   * @method
   * @memberof TSprite
   * @param {number} aScalePercentage - The scale in %, 100% is no scale.
   * @return {void}
   */
  this.setScale = function (aScalePercentage) {
    // Convert percentage value to scale factor
    const scaleFactor = aScalePercentage / 100;

    // Set the uniform scale value
    scale = scaleFactor;

    scaledWidth = spa.width * scale;
    scaledHeight = spa.height * scale;

    // Update TBoundRectangle instance based on the new scale
    boundingBox.updateSize(scaledWidth, scaledHeight);
  };

  /**
   * Public method to set the alpha (transparency) of the sprite.
   *
   * @method
   * @memberof TSprite
   * @param {number} aNewAlpha - The transparency in %, 100% is full opacity.
   * @return {void}
   */
  this.setAlpha = function (aNewAlpha) {
    // Ensure the alpha value is between 0 and 100
    alpha = Math.max(0, Math.min(aNewAlpha / 100, 1));
  };

  /**
   * Public method to animate to the next frame based on speed
   *
   * @method
   * @memberof TSprite
   * @return {void}
   */
  this.animate = function () {
    if (!spa || speed === 0.0) return;

    animationCounter += speed;
    if (animationCounter >= 1.0) {
      currentFrameIndex = (currentFrameIndex + 1) % spa.count;
      animationCounter = 0; // Reset the counter after advancing to the next frame
    }
  };

  /**
   * Public method to set rotation angle and pivot point.
   *
   * @method
   * @memberof TSprite
   * @param {number} angleInDegrees - The rotation angle in degrees.
   * @param {number} pivotX - The x-coordinate of the pivot point.
   * @param {number} pivotY - The y-coordinate of the pivot point.
   */
  this.setRotation = function (angleInDegrees, aPivotPoint) {
    if (aPivotPoint) {
      rotPoint = aPivotPoint;
    }else{
      rotPoint.x = scaledWidth / 2;
      rotPoint.y = scaledHeight / 2;
    }
    rotRad = angleInDegrees * (Math.PI / 180);
  };

  /**
   * Public method to get the center position of the sprite.
   *
   * @method
   * @memberof TSprite
   * @returns {TPoint} The center position of the sprite.
   */
  this.getCenterPos = function () {
    // Calculate the center position based on destination, width, and height
    const centerX = scaledWidth / 2;
    const centerY = scaledHeight / 2;

    return new TPoint(centerX, centerY);
  };

  /**
   * Public method to set animation index.
   * @public
   * @method
   * @memberof TSprite
   * @param {number} aIndex - The frame index.
   * @returns {void} void - Nothing to return
   */
  this.setIndex = function (aIndex, aSpriteAnimation = undefined) {
    if(aSpriteAnimation){
      spa = aSpriteAnimation
    }
    currentFrameIndex = aIndex % spa.count;
  };

  /**
   * Public method to check for collision with another `TSprite`.
   *
   * @method
   * @memberof TSprite
   * @param {TSprite} aOtherSprite - Another sprite to check for collision.
   * @returns {boolean} True if there is a collision, otherwise false.
   */
  this.areSpritesColliding = function (aOtherSprite) {
    // Use TBoundRectangle instances to check for collision
    return aOtherSprite.checkCollisionWithBoundRectangle(boundingBox);
  };

  /**
   * Public method to get distance with another `TSprite` center.
   *
   * @method
   * @memberof TSprite
   * @param {TSprite} aOtherSprite - Another sprite to check for distance.
   * @returns {number} The distance in pixels.
   */
  this.getDistanceToSpriteCenter = function (aOtherSprite) {
    // Use TBoundRectangle instances to get distance
    return aOtherSprite.getDistanceToBoundingBoxCenter(boundingBox);
  };

  // Public method to check for collision with a TBoundRectangle
  /**
   * Public method to check for collision with a `TBoundRectangle`.
   *
   * @method
   * @memberof TSprite
   * @param {TBoundRectangle} aOtherBoundingBox - The bounding rectangle to check for collision.
   * @returns {boolean} True if there is a collision, otherwise false.
   */
  this.checkCollisionWithBoundRectangle = function (aOtherBoundingBox) {
    return boundingBox.collidesWith(aOtherBoundingBox);
  };

    /**
   * Public method to get distance with another `TBoundRectangle` center.
   *
   * @method
   * @memberof TSprite
   * @param {TBoundRectangle} aOtherSprite - Another sprite to check for collision.
   * @returns {boolean} True if there is a collision, otherwise false.
   */
    this.getDistanceToBoundingBoxCenter = function (aOtherBoundingBox) {
      // Use TBoundRectangle instances to get distance
      return boundingBox.distanceTo(aOtherBoundingBox);
    };

  // Internal method to trigger event listeners for a specific event
  function triggerEventListeners(aEventName, aEvent) {
    const listeners = eventListeners[aEventName];
    if (listeners) {
      listeners.forEach((listener) => {
        listener.call(sprite, aEvent);
      });
    }
  }

  // Private method to check if a point is inside a rectangle.
  function isPointInsideRect(aPointX, aPointY){
    return ((aPointX > boundingBox.left) && (aPointX < boundingBox.right)) && ((aPointY > boundingBox.top) && (aPointY < boundingBox.bottom));
  }

  // Private method to check if a point is inside an oval.
  function isPointInsideOval(aPointX, aPointY) {
    const centerX = destination.x + scaledWidth / 2;
    const centerY = destination.y + scaledHeight / 2;

    // Consider scale factor in radius calculation
    const scaledRadiusX = scaledWidth / 2;
    const scaledRadiusY = scaledHeight / 2;

    const normalizedX = (aPointX - centerX) / scaledRadiusX;
    const normalizedY = (aPointY - centerY) / scaledRadiusY;

    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }

  // Event handlers

  /**
   * Public method to add an event listener.
   *
   * @method
   * @memberof TSprite
   * @param {string} aEventName - The event name.
   * @param {function} aEventFunc - The callback function for this event.
   * @return {void}
   */
  this.addEventListener = function (aEventName, aEventFunc) {
    let listeners = eventListeners[aEventName];
    if (!listeners) {
      listeners = [];
      eventListeners[aEventName] = listeners;
      attachCanvasEventListener(aEventName);
    }
    listeners.push(aEventFunc);
  };

  /**
   * Public method to remove an event listener.
   *
   * @method
   * @memberof TSprite
   * @param {string} aEventName - The event name.
   * @param {function} aEventFunc - The callback function for this event.
   */
  this.removeEventListener = function (aEventName, aEventFunc) {
    const listeners = eventListeners[aEventName];
    if (listeners) {
      const index = listeners.indexOf(aEventFunc);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        delete eventListeners[aEventName];
        detachCanvasEventListener(aEventName);
      }
    }
  };

  // decide witch handling function to use base on event name
  function attachCanvasEventListener(aEventName) {
    if (!spriteEventInstances[aEventName]) {
      spriteEventInstances[aEventName] = [];
    }
    spriteEventInstances[aEventName].push(sprite);
    switch (aEventName) {
      case "mousedown":
        cvs.addEventListener(aEventName, handleMouseDown, false);
        break;
      case "mouseup":
        cvs.addEventListener(aEventName, handleMouseUp, false);
        break;
      case "mousemove":
        cvs.addEventListener(aEventName, handleMouseMove, false);
        break;
    }
  }

  // Decide which handling function to remove based on the event name
  function detachCanvasEventListener(aEventName) {
    switch (aEventName) {
      case "mousedown":
        cvs.removeEventListener(aEventName, handleMouseDown, false);
        break;
      case "mouseup":
        cvs.removeEventListener(aEventName, handleMouseUp, false);
        break;
      case "mousemove":
        cvs.removeEventListener(aEventName, handleMouseMove, false);
        break;
      // ... add more cases as needed ...
    }
    if (spriteEventInstances[aEventName]) {
      delete spriteEventInstances[aEventName];
    }
  }

  // Handle mouse down event
  this.handleMouseDown = function (aEvent) {
    if (mouseIsOver) {
      mouseState = ESpriteButtonStateType.Down;
      triggerEventListeners("mousedown", aEvent);
     }
  };

  // Handle mouse up event
  this.handleMouseUp = function (aEvent) {
    if (mouseIsOver) {
      mouseState = ESpriteButtonStateType.Up;
      triggerEventListeners("mouseup", aEvent);
    }
  };

  // Handle mouse move event
  this.handleMouseMove = function (aEvent) {
    const mouseX = aEvent.clientX - canvasRect.left;
    const mouseY = aEvent.clientY - canvasRect.top;
    mouseIsOver = false;
    if(isPointInsideRect(mouseX, mouseY)){
      if(sprite.handlePointIsOver){
        mouseIsOver = sprite.handlePointIsOver(mouseX, mouseY, boundingBox);
      }else{
        if (isPointInsideOval(aEvent.clientX, aEvent.clientY)) {
          mouseIsOver = true;
        }  
      }
    }
    if(mouseIsOver){
      triggerEventListeners("mousemove", aEvent);
      return true;
    }
    if(mouseState === ESpriteButtonStateType.Down){
      triggerEventListeners("mouseup", aEvent);
    }
    return false;
  };
}

// Constructor function for TSpriteButton
/**
 * Represents a Sprite Button with animation, position, and interaction capabilities.
 *
 * @class
 * @classdesc
 * The `TSpriteButton` class is used to create animated button.
 *
 * @param {HTMLCanvasElement} aCanvas - The HTML canvas element to draw the sprite on.
 * @param {HTMLImageElement} aSpriteSheetImage - The image containing the sprite sheet.
 * @param {SpriteAnimation} aSpriteAnimation - The sprite animation configuration.
 * @param {TPoint} aDestination - The x-coordinate and x-coordinate of the destination point on the canvas.
 * @param {FunctionStringCallback} aClickCallBack - Call back function for when the button is clicked
 * @param {FunctionStringCallback} aDownCallBack - Call back function for when the button is pressed
 * @param {FunctionStringCallback} aUpCallBack - Call back function for when the button is released
 */
export function TSpriteButton(aCanvas, aSpriteSheetImage, aSpriteAnimation, aDestination, aClickCallBack = null, aDownCallBack = null, aUpCallBack = null) {
  const button = this;
  const scs = aCanvas;
  const sp = new TSprite(scs, aSpriteSheetImage, aSpriteAnimation, aDestination);
  const onClicked = aClickCallBack;
  const onDown = aDownCallBack;
  const onUp = aUpCallBack;

  this.disabled = false;
  
  sp.addEventListener("mousemove", spriteMouseMove);
  sp.addEventListener("mousedown", spriteMouseDown)
  sp.addEventListener("mouseup", spriteMouseUp);
  
  
  /**
   * Public method to draw the button.
   *
   * @method
   * @memberof TSpriteButton
   */
  this.draw = function(){
    sp.draw();
  }

  /**
   * Public method to add an event listener.
   *
   * @method
   * @memberof TSpriteButton
   * @param {string} aIndex - The sprite index to draw.
   * @return {void}
   */
  this.setIndex = function(aIndex){
    sp.setIndex(aIndex);
  }

  /**
   * @method Public method set an ovreride for the check if a point is over this sprite.
   * @memberof TSpriteButton
   * @param {function} aPointIsOverHandlerCallBack - The callback function for checking if a point is over this sprite.
   * @return {void}
   * 
   * The callback function: boolean func(pointX, pointY, TBoundRectangle)
   */
  this.setPointIsOverHandler = function(aPointIsOverHandlerCallBack){
    sp.handlePointIsOver = aPointIsOverHandlerCallBack;
  }

  function spriteMouseMove(aEvent){
    if(button.disabled){
      return;
    }
    cvs.style.cursor = "pointer";
  }

  function spriteMouseDown(aEvent){
    if(button.disabled){
      return;
    } 
    callEventFunction(onDown, aEvent); 
  }

  function spriteMouseUp(aEvent){
    if(button.disabled){
      return;
    }
    callEventFunction(onUp, aEvent);
    callEventFunction(onClicked, aEvent);
  }

  function callEventFunction(aEventFunc, aEvent){
    if(aEventFunc){
      aEventFunc(aEvent, button);
    }
  }

}

// Constructor function for TSpriteNumber
/**
 * Represents a Sprite Number with animation, position, and interaction capabilities.
 *
 * @class
 * @classdesc
 * The `TSpriteNumber` class is used to create animated numbers or picture based numbers.
 *
 * @param {HTMLCanvasElement} aCanvas - The HTML canvas element to draw the sprite on.
 * @param {HTMLImageElement} aSpriteSheetImage - The image containing the sprite sheet.
 * @param {SpriteAnimation} aSpriteAnimation - The sprite animation configuration.
 * @param {TPoint} aDestination - The x-coordinate and x-coordinate of the destination point on the canvas.
 */
export function TSpriteNumber(aCanvas, aSpriteSheetImage, aSpriteAnimation, aDestination) {
  const cvs = aCanvas;
  const imgSheet = aSpriteSheetImage;
  const spa = aSpriteAnimation;
  const pos = new TPoint (aDestination.x, aDestination.y);
  const spNumbers = [];
  let alpha = 100;
  
    /**
   * Public method to draw the number.
   *
   * @method
   * @memberof TSpriteNumber
   * @param {void}
   * @return {void}
   */
  this.draw = function () {
    for (let i = 0; i < spNumbers.length; i++) {
      spNumbers[i].draw();
    }
  };


  /**
   * Public method to set the alpha (transparency) of the sprite.
   *
   * @method
   * @memberof TSpriteNumber
   * @param {number} aNewAlpha - The transparency in %, 100% is full opacity.
   * @return {void}
   */
  this.setAlpha = function (aAlpha) {
    alpha = aAlpha;
  };

    /**
   * Public method to set the value of the number.
   *
   * @method
   * @memberof TSpriteNumber
   * @param {number} aValue - The new value to set for the number.
   * @return {void}
   */
  this.setValue = function (aValue) {
    let divider = 1;
    const digits = aValue.toString().length;
    if (digits > spNumbers.length) {
      do {
        const newPos = new TPoint(pos.x - (spa.width + 1) * spNumbers.length, pos.y);
        const newSprite = new TSprite(cvs, imgSheet, spa, newPos);
        newSprite.setAlpha(alpha);
        spNumbers.push(newSprite);
      } while (spNumbers.length < digits);
    } else if (digits < spNumbers.length) {
      do {
        spNumbers.pop();
      } while (spNumbers.length < digits);
    }
    for (let i = 0; i < spNumbers.length; i++) {
      spNumbers[i].setIndex(Math.floor(aValue / divider) % 10);
      divider *= 10;
    }
  };
} // End of class TSpriteNumber

let activeMouseHandler = null;

// Handle mouse move event globally for all instances of TSprite
function handleMouseMove(aEvent) {
  // Iterate over instances and trigger event listeners
  cvs.style.cursor = "default";
  activeMouseHandler = null;
  spriteEventInstances.mousemove.every((sprite) => {
    if(sprite.handleMouseMove(aEvent)){
      activeMouseHandler = sprite;
      return false;
    }
    return true;
  });
}

// Handle mouse move event globally for all instances of TSprite
function handleMouseDown(aEvent) {
  // Iterate over instances and trigger event listeners
  if(activeMouseHandler){
    activeMouseHandler.handleMouseDown(aEvent)
  }
}

// Handle mouse move event globally for all instances of TSprite
function handleMouseUp(aEvent) {
  // Iterate over instances and trigger event listeners
  if(activeMouseHandler){
    activeMouseHandler.handleMouseUp(aEvent)
  }
}


