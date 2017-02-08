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

  // constants
  var WIDTH = 200;
  var HEIGHT = 90;

  /**
   * @param {number} x
   * @param {number} y
   * @param {ViewMode} viewMode
   * @constructor
   */
  function ExpressionCollectionArea( x, y, viewMode ) {

    // @public, read-only - bounds in model space of this capture area
    this.bounds = new Bounds2( x, y, x + WIDTH, y + HEIGHT );

    // @public, read-only - view mode (coins or variables)
    this.viewMode = viewMode;

    // @public, read-write - description of the expression that this capture area can hold
    this.expressionDescriptionProperty = new Property( null );
  }

  expressionExchange.register( 'ExpressionCollectionArea', ExpressionCollectionArea );

  return inherit( Object, ExpressionCollectionArea );
} );