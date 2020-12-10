// Copyright 2016-2020, University of Colorado Boulder

/**
 * type that represents a hint that is show to the user when a new expression can be created
 *
 * @author John Blanco
 */

import expressionExchange from '../../expressionExchange.js';

class ExpressionHint {

  /**
   * @param {CoinTerm} anchorCoinTerm - the coin term that is staying put as this expression is being formed
   * @param {CoinTerm} movingCoinTerm - the coin term that is being moved by the user to join this expression
   */
  constructor( anchorCoinTerm, movingCoinTerm ) {

    // @public (read-only) {CoinTerm}
    this.anchorCoinTerm = anchorCoinTerm;
    this.movingCoinTerm = movingCoinTerm;

    // @public {boolean}
    this.anchorOnLeft = anchorCoinTerm.positionProperty.get().x < movingCoinTerm.positionProperty.get().x;

    // set the flag indicating that breaking apart is suppressed
    anchorCoinTerm.breakApartAllowedProperty.set( false );
    movingCoinTerm.breakApartAllowedProperty.set( false );
  }

  /**
   * returns true if this expression hint includes the provided coin term
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @public
   */
  containsCoinTerm( coinTerm ) {
    return ( coinTerm === this.anchorCoinTerm || coinTerm === this.movingCoinTerm );
  }

  /**
   * @param {ExpressionHint} otherExpressionHint
   * @returns {boolean}
   * @public
   */
  equals( otherExpressionHint ) {
    return ( otherExpressionHint.anchorCoinTerm === this.anchorCoinTerm &&
             otherExpressionHint.movingCoinTerm === this.movingCoinTerm &&
             otherExpressionHint.anchorOnLeft === this.anchorOnLeft
    );
  }

  /**
   * Clear this expression hint, generally done just before removing it from the model.  This updated the state of
   * any coin terms that were affected by the existence of the hint.
   * @public
   */
  clear() {
    this.anchorCoinTerm.breakApartAllowedProperty.set( true );
    this.movingCoinTerm.breakApartAllowedProperty.set( true );
  }
}

expressionExchange.register( 'ExpressionHint', ExpressionHint );

export default ExpressionHint;