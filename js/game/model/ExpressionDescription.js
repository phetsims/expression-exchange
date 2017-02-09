// Copyright 2017, University of Colorado Boulder

/**
 * A description of a mathematical expression using coin term types and operations, used in the game.   This is limited
 * to handling only the expressions needed for the ExpressionExchange simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  // helper function to extract a term from the equation string and interpret it as a coin term and quantity
  function extractTerm( expressionString, index ) {

    // handle the sign in front of the coefficient, if present
    var signMultiplier = 1;
    if ( expressionString[ index ] === '-' ) {
      signMultiplier = -1;
      index++;
    }
    else if ( expressionString[ index ] === '+' ) {
      index++;
    }

    var coefficientString = '';

    // pull out any numbers, and note that this assumes only integers are used as coefficients
    while ( !isNaN( parseInt( expressionString.charAt( index ), 10 ) ) ) {
      coefficientString += expressionString.charAt( index++ );
    }

    // determine the numerical value of the coefficient
    var coefficient = ( coefficientString.length > 0 ? parseInt( coefficientString, 10 ) : 1 ) * signMultiplier;

    // determine where the term ends within the expression string
    var nextPlusSignIndex = expressionString.indexOf( '+', index );
    var nextMinusSignIndex = expressionString.indexOf( '-', index );
    var termEndIndex = Math.min(
      nextPlusSignIndex > 0 ? nextPlusSignIndex : Number.POSITIVE_INFINITY,
      nextMinusSignIndex > 0 ? nextMinusSignIndex : Number.POSITIVE_INFINITY,
      expressionString.length
    );

    // extract the string that represents the term
    var termString = expressionString.substring( index, termEndIndex ).toLowerCase();

    var coinTermTypeID = null;
    if ( termString.length === 0 ) {
      coinTermTypeID = CoinTermTypeID.CONSTANT;
    }
    else if ( termString === 'x^2*y2' ) {
      coinTermTypeID = CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED;
    }
    else if ( termString === 'x^2' ) {
      coinTermTypeID = CoinTermTypeID.X_SQUARED;
    }
    else if ( termString === 'y^2' ) {
      coinTermTypeID = CoinTermTypeID.Y_SQUARED;
    }
    else if ( termString === 'xy' ) {
      coinTermTypeID = CoinTermTypeID.X_TIMES_Y;
    }
    else if ( termString === 'x' ) {
      coinTermTypeID = CoinTermTypeID.X;
    }
    else if ( termString === 'y' ) {
      coinTermTypeID = CoinTermTypeID.Y;
    }
    else if ( termString === 'z' ) {
      coinTermTypeID = CoinTermTypeID.Z;
    }
    else {
      assert && assert( false, 'unrecognized term string, value = ' + termString );
    }

    return {
      coefficient: coefficient,
      coinTermTypeID: coinTermTypeID,
      newIndex: index + termString.length
    };
  }

  /**
   * @param {String} expressionString
   * @constructor
   */
  function ExpressionDescription( expressionString ) {

    // @public, read-only - description of the expression as an ordered set of objects that contain the coefficient and
    // the coin term ID
    this.termsArray = [];

    // remove all spaces from the expression
    var noWhitespaceExpressionString = expressionString.replace( /\s/g, '' );

    // extract the individual terms from the expression
    var index = 0;
    var termExtractionResult = null;
    while ( index < noWhitespaceExpressionString.length ) {
      termExtractionResult = extractTerm( noWhitespaceExpressionString, index );
      this.termsArray.push( {
        coefficient: termExtractionResult.coefficient,
        coinTermTypeID: termExtractionResult.coinTermTypeID
      } );
      index = termExtractionResult.newIndex;
    }
  }

  expressionExchange.register( 'ExpressionDescription', ExpressionDescription );

  return inherit( Object, ExpressionDescription, {

      /**
       * compares the content of an user-created expression with this description, returns true if they are equivalent
       * @param {Expression} expression
       * @return {boolean}
       * @public
       */
      expressionMatches: function( expression ) {

      }
    }
  );
} );