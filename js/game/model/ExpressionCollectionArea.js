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
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var WIDTH = 220; // empirically determined
  var HEIGHT = 90; // empirically determined
  var REJECTED_EXPRESSION_DISTANCE = 20; // empirically determined

  /**
   * @param {number} x
   * @param {number} y
   * @param {ViewMode} viewMode
   * @constructor
   */
  function ExpressionCollectionArea( x, y, viewMode ) {

    // @public, read-only - expression that has been collected, null if no expression has been collected
    this.collectedExpressionProperty = new Property( null );

    // @public, read-write - description of the expression that this capture area can hold
    this.expressionDescriptionProperty = new Property( null );

    // @public, read-only - bounds in model space of this capture area
    this.bounds = new Bounds2( x, y, x + WIDTH, y + HEIGHT );

    // @public, read-only - view mode (coins or variables)
    this.viewMode = viewMode;
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

      // test that this collection area is in the correct state
      assert && assert( this.expressionDescriptionProperty.get(), 'no expression description for collection area' );
      assert && assert( this.collectedExpressionProperty.get() === null, 'expression collection area already full' );

      // get bounds for positioning of the expression
      var expressionBounds = expression.getBounds();

      // If in coin mode, the expression must be reduced, but in variable mode it doesn't.  This was just a design
      // decision, not some fundamental axiom of coin expressions.
      var reductionStateCorrect = this.viewMode === ViewMode.VARIABLES ? true : expression.isReduced();

      // test whether the provided expression matches the expression spec for this collection area
      if ( reductionStateCorrect && this.expressionDescriptionProperty.get().expressionMatches( expression ) ) {

        // collect this expression
        expression.travelToDestination( new Vector2(
          this.bounds.getCenterX() - expressionBounds.width / 2,
          this.bounds.getCenterY() - expressionBounds.height / 2 )
        );
        this.collectedExpressionProperty.set( expression );
      }
      else {

        // reject this expression
        expression.travelToDestination( new Vector2(
          this.bounds.minX - expressionBounds.width - REJECTED_EXPRESSION_DISTANCE,
          this.bounds.getCenterY() - expressionBounds.height / 2 )
        );
      }

      // TODO: this is stubbed for now to always collect

    },

    /**
     * eject the currently collected expression, no-op if no expression is currently collected
     * @public
     */
    ejectExpression: function() {
      var collectedExpression = this.collectedExpressionProperty.get();
      var expressionBounds = collectedExpression.getBounds();
      collectedExpression.travelToDestination( new Vector2(
        this.bounds.minX - expressionBounds.width - REJECTED_EXPRESSION_DISTANCE,
        this.bounds.getCenterY() - expressionBounds.height / 2 )
      );
      this.collectedExpressionProperty.set( null );
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