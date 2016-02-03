// Copyright 2016, University of Colorado Boulder

/**
 * type that represents a hint that is show to the user when a new expression can be created
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * TODO: document parameters thoroughly once finalized.
   * @constructor
   */
  function ExpressionHint( anchorCoinTerm, movingCoinTerm ) {

    // @public, read only
    this.anchorCoinTerm = anchorCoinTerm;
    this.movingCoinTerm = movingCoinTerm;
  }

  return inherit( Object, ExpressionHint, {

    /**
     * returns true if this expression hint includes the provided coin term
     * @param {CoinTerm} coinTerm
     * @public
     */
    containsCoinTerm: function( coinTerm ){
      return ( coinTerm === this.anchorCoinTerm || coinTerm === this.movingCoinTerm );
    },

    // @public
    equals: function( expressionHint ){
      return ( expressionHint.anchorCoinTerm === this.anchorCoinTerm && expressionHint.movingCoinTerm === this.movingCoinTerm );
    }
  } );
} );