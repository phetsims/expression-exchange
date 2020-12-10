// Copyright 2017-2020, University of Colorado Boulder

/**
 * type that specifies the attributes of an animation
 *
 * @author John Blanco
 */

import expressionExchange from '../../expressionExchange.js';

class AnimationSpec {

  /**
   * @param {Vector2} startPosition - the position from which the animation should begin
   * @param {Vector2} travelVector - the path from the start to the destination
   * @param {number} totalDuration - in seconds, amount of time that the animation should take
   */
  constructor( startPosition, travelVector, totalDuration ) {

    // @public (read-only) {Vector2}
    this.startPosition = startPosition;

    // @public (read-only) {Vector2}
    this.travelVector = travelVector;

    // @public (read-only) {number}
    this.totalDuration = totalDuration;

    // @public (read-only) {number} - time that has passed since the animation was initiated
    this.timeSoFar = 0;
  }
}

expressionExchange.register( 'AnimationSpec', AnimationSpec );

export default AnimationSpec;
