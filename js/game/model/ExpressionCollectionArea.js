// Copyright 2017, University of Colorado Boulder

/**
 * model element used in the game that represents the area where an expression can be collected if it matches the
 * expression specification
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var WIDTH = 220; // empirically determined
  var HEIGHT = 90; // empirically determined

  /**
   * @param {number} x
   * @param {number} y
   * @param {ViewMode} viewMode
   * @constructor
   */
  function ExpressionCollectionArea( x, y, viewMode ) {

    // @public, read-only - expression that has been collected, null if no expression has been collected
    this.collectedExpressionProperty = new Property( null );

    // @public, read-only - bounds in model space of this capture area
    this.bounds = new Bounds2( x, y, x + WIDTH, y + HEIGHT );

    // @public, read-only - view mode (coins or variables)
    this.viewMode = viewMode;

    // @public, read-write - description of the expression that this capture area can hold
    this.expressionDescriptionProperty = new Property( null );
  }

  expressionExchange.register( 'ExpressionCollectionArea', ExpressionCollectionArea );

  return inherit( Object, ExpressionCollectionArea, {

    /**
     * Test the provided expression and, if it matches the spec, capture it by moving it into the center of this
     * collection area and, if it doesn't match, push it away.
     * @param {Expression} expression
     * @public
     */
    collectOrRejectExpression: function( expression ) {

      var expressionBounds = expression.getBounds();

      // TODO: this is stubbed for now to always collect

      expression.travelToDestination( new Vector2(
        this.bounds.getCenterX() - expressionBounds.width / 2,
        this.bounds.getCenterY() - expressionBounds.height / 2 )
      );
      this.collectedExpressionProperty.set( expression );
    },

    /**
     * eject the currently collected expression, no-op if no expression is currently collected
     * @public
     */
    ejectExpression: function() {
      // TODO: implement
    },

    /**
     * get a reference to this collection area's model bounds, the results should not be changed
     * @returns {Bounds2}
     * @public
     */
    getBounds: function() {
      return this.bounds;
    }

  } );
} );