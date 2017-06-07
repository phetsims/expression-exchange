// Copyright 2017, University of Colorado Boulder

/**
 * type that specifies a 'term' used in expressions, and consists of a coefficient and a coin term type ID
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} coefficient
   * @param {CoinTermTypeID} coinTermTypeID
   * @constructor
   */
  function Term( coefficient, coinTermTypeID ) {

    if ( typeof( coefficient ) === 'undefined' || typeof( coinTermTypeID ) === 'undefined' ) {
      debugger;
    }

    // @public {number} (read only)
    this.coefficient = coefficient;

    // @public {CoinTermTypeID} (read only)
    this.coinTermTypeID = coinTermTypeID;
  }

  expressionExchange.register( 'Term', Term );

  return inherit( Object, Term );
} );