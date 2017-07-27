// Copyright 2017, University of Colorado Boulder

/**
 * type that specifies the attributes of an animation
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vector2} startPosition - the location from which the animation should begin
   * @param {Vector2} travelVector - the path from the start to the destination
   * @param {number} totalDuration - in seconds, amount of time that the animation should take
   * @constructor
   */
  function AnimationSpec( startPosition, travelVector, totalDuration ) {

    // @public (read-only) {Vector2}
    this.startPosition = startPosition;

    // @public (read-only) {Vector2}
    this.travelVector = travelVector;

    // @public (read-only) {number}
    this.totalDuration = totalDuration;

    // @public (read-only) {number} - time that has passed since the animation was initiated
    this.timeSoFar = 0;
  }

  expressionExchange.register( 'AnimationSpec', AnimationSpec );

  return inherit( Object, AnimationSpec );
} );