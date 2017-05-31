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

    // @public {Vector2} (read only)
    this.startPosition = startPosition;

    // @public {Vector2} (read only)
    this.travelVector = travelVector;

    // @public {number} (read only)
    this.totalDuration = totalDuration;

    // @public {number} (read-write) - time that has passed since the animation was initiated
    this.timeSoFar = 0;
  }

  expressionExchange.register( 'AnimationSpec', AnimationSpec );

  return inherit( Object, AnimationSpec );
} );