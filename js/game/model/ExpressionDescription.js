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

  // helper function to extract a coefficient that precedes a term, if none is found it assumes a value of 1
  function extractCoefficient( expressionString, currentIndex ) {
    var coefficientString = '';

    // pull out any numbers, and note that this assumes only integers are used as coefficients
    while ( !isNaN( expressionString.charAt( currentIndex ) ) ) {
      coefficientString += expressionString.charAt( currentIndex++ );
    }

    // return an object with the updated index and the coefficient value, assuming 1 if no numbers are found
    return {
      newIndex: currentIndex,
      coefficient: coefficientString.length > 0 ? parseInt( coefficientString, 10 ) : 1
    };
  }

  // helper function to extract a term from the equation and interpret it as a coin term
  function extractTerm( expressionString, currentIndex ) {

    var nextPlusSignIndex = expressionString.indexOf( '+', currentIndex );
    var nextMinusSignIndex = expressionString.indexOf( '-', currentIndex );
    var termEndIndex = Math.min(
      nextPlusSignIndex > 0 ? nextPlusSignIndex : Number.POSITIVE_INFINITY,
      nextMinusSignIndex > 0 ? nextMinusSignIndex : Number.POSITIVE_INFINITY,
      expressionString.length
    );
    var termString = expressionString.substring( currentIndex, termEndIndex ).toLowerCase();

    var coinTermType = null;
    if ( termString === 'x^2*y2' ) {
      coinTermType = CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED;
    }
    else if ( termString === 'x^2' ) {
      coinTermType = CoinTermTypeID.X_SQUARED;
    }
    else if ( termString === 'y^2' ) {
      coinTermType = CoinTermTypeID.Y_SQUARED;
    }
    else if ( termString === 'x*y' ) {
      coinTermType = CoinTermTypeID.X_TIMES_Y;
    }
    else if ( termString === 'x' ) {
      coinTermType = CoinTermTypeID.X;
    }
    else if ( termString === 'y' ) {
      coinTermType = CoinTermTypeID.Y;
    }
    else if ( termString === 'z' ) {
      coinTermType = CoinTermTypeID.Z;
    }
    else {
      assert && assert( false, 'unrecognized term string, value = ' + termString );
    }

    return {
      coinTermType: coinTermType,
      newIndex: currentIndex + termString.length
    };
  }

  /**
   * @param {String} expressionString
   * @constructor
   */
  function ExpressionDescription( expressionString ) {

    // @public, read-only - description of the express, ordered set of coefficient, coin term type, operator
    this.expressionDescriptionArray = [];

    // remove all spaces from the expression
    var noWhitespaceExpressionString = expressionString.replace( /\s/g, '' );

    // parse the string - this is limited to only what is needed by the Expression Exchange simulation
    var index = 0;
    var expectedNext = 'term'; // valid values are 'term' and 'operation'
    var coefficientExtractionResult = null;
    var termExtractionResult = null;
    while ( index < noWhitespaceExpressionString.length ) {
      if ( expectedNext === 'term' ) {
        coefficientExtractionResult = extractCoefficient( noWhitespaceExpressionString, index );
        this.expressionDescriptionArray.push( coefficientExtractionResult.coefficient );
        index = coefficientExtractionResult.newIndex;
        if ( noWhitespaceExpressionString[ index ] === '+' ||
             noWhitespaceExpressionString[ index ] === '-' ||
             index === noWhitespaceExpressionString.length ) {

          // the extracted value was a constant
          this.expressionDescriptionArray.push( CoinTermTypeID.CONSTANT );
        }
        else {
          termExtractionResult = extractTerm( noWhitespaceExpressionString, index );
          this.expressionDescriptionArray.push( termExtractionResult.coinTermType );
          index = termExtractionResult.newIndex;
        }
        expectedNext = 'operator';
      }
      else if ( expectedNext === 'operator' ) {
        var operator = noWhitespaceExpressionString[ index++ ];
        assert && assert( operator === '+' || operator === '-' );
        this.expressionDescriptionArray.push( operator );
        expectedNext = 'term';
      }
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