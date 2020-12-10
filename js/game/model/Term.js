// Copyright 2017-2020, University of Colorado Boulder

/**
 * type that specifies a 'term' used in expressions, and consists of a coefficient and a coin term type ID
 *
 * @author John Blanco
 */

import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import expressionExchange from '../../expressionExchange.js';

class Term {

  /**
   * @param {number} coefficient
   * @param {CoinTermTypeID} coinTermTypeID
   */
  constructor( coefficient, coinTermTypeID ) {

    // @public (read-only) {number}
    this.coefficient = coefficient;

    // @public (read-only) {CoinTermTypeID}
    this.coinTermTypeID = coinTermTypeID;
  }

  /**
   * multiply this term by the provide term
   * @param {Term} term
   * @returns {Term}
   * @public
   */
  times( term ) {
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
  }

  /**
   * returns true if the provided coin term matches this term
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @public
   */
  matchesCoinTerm( coinTerm ) {
    return this.coinTermTypeID === coinTerm.typeID && this.coefficient === coinTerm.totalCountProperty.get();
  }
}

expressionExchange.register( 'Term', Term );

export default Term;