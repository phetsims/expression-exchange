// Copyright 2017-2019, University of Colorado Boulder

/**
 * type that specifies a 'term' used in expressions, and consists of a coefficient and a coin term type ID
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} coefficient
   * @param {CoinTermTypeID} coinTermTypeID
   * @constructor
   */
  function Term( coefficient, coinTermTypeID ) {

    // @public (read-only) {number}
    this.coefficient = coefficient;

    // @public (read-only) {CoinTermTypeID}
    this.coinTermTypeID = coinTermTypeID;
  }

  expressionExchange.register( 'Term', Term );

  return inherit( Object, Term, {

    /**
     * multiply this term by the provide term
     * @param {Term} term
     * @returns {Term}
     * @public
     */
    times: function( term ) {
      const result = new Term( this.coefficient * term.coefficient, null );
      if ( this.coinTermTypeID === CoinTermTypeID.CONSTANT ) {
        result.coinTermTypeID = term.coinTermTypeID;
      }
      else if ( term.coinTermTypeID === CoinTermTypeID.CONSTANT ) {
        result.coinTermTypeID = this.coinTermTypeID;
      }
      else if ( this.coinTermTypeID === CoinTermTypeID.X && term.coinTermTypeID === CoinTermTypeID.X ) {
        result.coinTermTypeID = CoinTermTypeID.X_SQUARED;
      }
      else if ( this.coinTermTypeID === CoinTermTypeID.X && term.coinTermTypeID === CoinTermTypeID.Y ||
                this.coinTermTypeID === CoinTermTypeID.Y && term.coinTermTypeID === CoinTermTypeID.X ) {
        result.coinTermTypeID = CoinTermTypeID.X_TIMES_Y;
      }
      else if ( this.coinTermTypeID === CoinTermTypeID.Y && term.coinTermTypeID === CoinTermTypeID.Y ) {
        result.coinTermTypeID = CoinTermTypeID.Y_SQUARED;
      }
      else if ( this.coinTermTypeID === CoinTermTypeID.X_SQUARED && term.coinTermTypeID === CoinTermTypeID.Y_SQUARED ||
                this.coinTermTypeID === CoinTermTypeID.Y_SQUARED && term.coinTermTypeID === CoinTermTypeID.X_SQUARED ) {
        result.coinTermTypeID = CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED;
      }
      else {
        throw new Error( 'unhandled term type combination for multiplication operation' );
      }

      return result;
    },

    /**
     * returns true if the provided coin term matches this term
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
     */
    matchesCoinTerm: function( coinTerm ) {
      return this.coinTermTypeID === coinTerm.typeID && this.coefficient === coinTerm.totalCountProperty.get();
    }
  } );
} );