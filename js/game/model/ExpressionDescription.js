// Copyright 2017, University of Colorado Boulder

/**
 * A description of a mathematical expression using coin term types and operations, used in the game.   This is limited
 * to handling only the expressions needed for the ExpressionExchange simulation.  In other words, it isn't a general
 * expression parser, though it could probably be generalized with some effort.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {String} expressionString
   * @constructor
   */
  function ExpressionDescription( expressionString ) {

    // @public, read-only - the string that describes this expression
    this.expressionString = expressionString;

    // remove all spaces from the expression
    var noWhitespaceExpressionString = expressionString.replace( /\s/g, '' );

    // @public, read-only - description of the expression as an ordered set of objects that contain the coefficient and
    // the coin term ID, e.g. { coefficient: 2, coinTermTypeID: CoinTermTypeID.X }
    this.termsArray = interpretExpression( noWhitespaceExpressionString, 0 ).termsArray;
  }

  // helper function to identify one of the supported operators
  function isOperator( char ) {
    return char === '+' || char === '-';
  }

  // helper function to multiply two terms together
  function multiplyTerms( term1, term2 ) {
    var result = {
      coefficient: term1.coefficient * term2.coefficient,
      coinTermTypeID: null
    };
    if ( term1.coinTermTypeID === CoinTermTypeID.CONSTANT ) {
      result.coinTermTypeID = term2.coinTermTypeID;
    }
    else if ( term2.coinTermTypeID === CoinTermTypeID.CONSTANT ) {
      result.coinTermTypeID = term1.coinTermTypeID;
    }
    else if ( term1.coinTermTypeID === CoinTermTypeID.X && term2.coinTermTypeID === CoinTermTypeID.X ) {
      result.coinTermTypeID = CoinTermTypeID.X_SQUARED;
    }
    else if ( term1.coinTermTypeID === CoinTermTypeID.X && term2.coinTermTypeID === CoinTermTypeID.Y ||
              term1.coinTermTypeID === CoinTermTypeID.Y && term2.coinTermTypeID === CoinTermTypeID.X ) {
      result.coinTermTypeID = CoinTermTypeID.X_TIMES_Y;
    }
    else if ( term1.coinTermTypeID === CoinTermTypeID.Y && term2.coinTermTypeID === CoinTermTypeID.Y ) {
      result.coinTermTypeID = CoinTermTypeID.Y_SQUARED;
    }
    else if ( term1.coinTermTypeID === CoinTermTypeID.X_SQUARED && term2.coinTermTypeID === CoinTermTypeID.Y_SQUARED ||
              term1.coinTermTypeID === CoinTermTypeID.Y_SQUARED && term2.coinTermTypeID === CoinTermTypeID.X_SQUARED ) {
      result.coinTermTypeID = CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED;
    }
    else {
      assert && assert( false, 'unhandled term type combination for multiplication operation' );
    }

    return result;
  }

  /**
   * helper function that takes an expression string and an index and returns the terms, used recursively to handle
   * parentheses
   * @param {String} expressionString - description of string with no white space or multiplication symbols, e.g.
   * 2x-1 or x(y+2)
   * @param {number}currentIndex
   */
  function interpretExpression( expressionString, currentIndex ) {
    var termsArray = [];
    var termExtractionResult = null;
    var subExpressionInterpretationResult = null;
    while ( currentIndex < expressionString.length ) {
      termExtractionResult = extractTerm( expressionString, currentIndex );
      currentIndex = termExtractionResult.newIndex;
      if ( currentIndex >= expressionString.length ) {

        // the end of the expression or sub-expression has been reached, add this term
        termsArray.push( {
          coefficient: termExtractionResult.coefficient,
          coinTermTypeID: termExtractionResult.coinTermTypeID
        } );
      }
      else if ( expressionString.charAt( currentIndex ) === ')' ) {

        // the end of the sub-expression has been reached, add this term
        termsArray.push( {
          coefficient: termExtractionResult.coefficient,
          coinTermTypeID: termExtractionResult.coinTermTypeID
        } );
        currentIndex++;

        // force exit of the loop
        break;
      }
      else if ( isOperator( expressionString.charAt( currentIndex ) ) ) {

        // this is a standalone term (not a multiplier for a sub-expression) so add it to the array and bump the index
        termsArray.push( {
          coefficient: termExtractionResult.coefficient,
          coinTermTypeID: termExtractionResult.coinTermTypeID
        } );
      }
      else if ( expressionString.charAt( currentIndex ) === '(' ) {

        // this is the beginning of a sub-expression, so recursively invoke this function to extract it
        currentIndex++;
        subExpressionInterpretationResult = interpretExpression( expressionString, currentIndex );

        // the previously extracted term is now used to multiply the extracted expression (distributive property)
        var multipliedSubExpression = _.map( subExpressionInterpretationResult.termsArray, function( term ) {
          return multiplyTerms( termExtractionResult, term );
        } );

        // add the new terms to the terms array or consolidate it with existing therms, and then update the index
        multipliedSubExpression.forEach( function( termWithIndex ) {

          // extract terms from the term array that match this one - there should be zero or one, no more
          var matchingTermsArray = _.filter( termsArray, function( term ) {
            return term.coinTermTypeID === termWithIndex.coinTermTypeID;
          } );

          // test that the terms array was properly reduced before reaching this point
          assert && assert( matchingTermsArray.length <= 1, 'error - terms array was not properly reduced' );

          if ( matchingTermsArray.length === 1 ) {
            var matchingTerm = matchingTermsArray[ 0 ];

            matchingTerm.coefficient += termWithIndex.coefficient;
            if ( matchingTerm.coefficient === 0 ) {
              // this term has cancelled, so remove it from the array
              termsArray = _.without( termsArray, matchingTerm );
            }
          }
          else {

            // this is a new term, so simply add it to the array of terms
            termsArray.push( {
              coefficient: termWithIndex.coefficient,
              coinTermTypeID: termWithIndex.coinTermTypeID
            } );
          }
        } );
        currentIndex = subExpressionInterpretationResult.newIndex;
      }
      else {
        assert && assert( false, 'error occurred while interpreting expression string, string = ' + expressionString );
      }
    }

    return {
      termsArray: termsArray,
      newIndex: currentIndex
    };
  }

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
    var nextOpenParenIndex = expressionString.indexOf( '(', index );
    var nextCloseParenIndex = expressionString.indexOf( ')', index );
    var termEndIndex = Math.min(
      nextPlusSignIndex > 0 ? nextPlusSignIndex : Number.POSITIVE_INFINITY,
      nextMinusSignIndex > 0 ? nextMinusSignIndex : Number.POSITIVE_INFINITY,
      nextOpenParenIndex > 0 ? nextOpenParenIndex : Number.POSITIVE_INFINITY,
      nextCloseParenIndex > 0 ? nextCloseParenIndex : Number.POSITIVE_INFINITY,
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

  expressionExchange.register( 'ExpressionDescription', ExpressionDescription );

  return inherit( Object, ExpressionDescription, {

      /**
       * compares the content of a user-created expression with this description, returns true if they are equivalent
       * @param {Expression} expression
       * @returns {boolean}
       * @public
       */
      expressionMatches: function( expression ) {

        // count the totals of the coin term types in the provided expression
        var expressionCoinTermCounts = {};
        expression.coinTerms.forEach( function( coinTerm ) {
          if ( expressionCoinTermCounts[ coinTerm.typeID ] ) {
            expressionCoinTermCounts[ coinTerm.typeID ] += coinTerm.totalCountProperty.get();
          }
          else {
            expressionCoinTermCounts[ coinTerm.typeID ] = coinTerm.totalCountProperty.get();
          }
        } );

        // remove any terms that were present in the equation but were ultimately cancelled out
        _.keys( expressionCoinTermCounts ).forEach( function( key ) {
          if ( expressionCoinTermCounts[ key ] === 0 ) {
            delete expressionCoinTermCounts[ key ];
          }
        } );

        var expressionCoinTermCountKeys = Object.keys( expressionCoinTermCounts );

        // Does the expression have the same number of coin term types as the description?
        if ( this.termsArray.length !== expressionCoinTermCountKeys.length ) {
          return false;
        }

        // Do the counts match?  Note that this assumes the expression description is reduced.
        for ( var i = 0; i < this.termsArray.length; i++ ) {
          var termDescriptor = this.termsArray[ i ];
          var expressionCount = expressionCoinTermCounts[ termDescriptor.coinTermTypeID ];
          if ( !expressionCount || expressionCount !== termDescriptor.coefficient ) {
            return false;
          }
        }

        // if we made it to here, the expression matches the description
        return true;
      },

      /**
       * compares a coin term with this description, returns true if they are equivalent
       * @param {CoinTerm} coinTerm
       * @returns {boolean}
       * @public
       */
      coinTermMatches: function( coinTerm ) {

        // there must be only a single coin term in the the description for this to be a match
        if ( this.termsArray.length !== 1 ) {
          return false;
        }

        return this.termsArray[ 0 ].coinTermTypeID === coinTerm.typeID &&
               this.termsArray[ 0 ].coefficient === coinTerm.totalCountProperty.get();
      }
    }
  );
} );