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
  var Term = require( 'EXPRESSION_EXCHANGE/game/model/Term' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {string} expressionString
   * @constructor
   */
  function ExpressionDescription( expressionString ) {

    // @public {string}, read-only - the string that describes this expression
    this.expressionString = expressionString;

    // remove all spaces from the expression
    var noWhitespaceExpressionString = expressionString.replace( /\s/g, '' );

    // @public {Array.<Term>}, read-only - Description of the expression as an ordered set of terms that contain the
    // coefficient and the coin term ID
    this.terms = interpretExpression( noWhitespaceExpressionString, 0 ).terms;
  }

  // helper function to identify one of the supported operators
  function isOperator( char ) {
    return char === '+' || char === '-';
  }

  /**
   * A helper function that takes an expression string and an index and returns the terms, used recursively to handle
   * parentheses.  This is not a perfectly general expression interpreter - it only handles the specific cases needed
   * by the Expression Exchange simulation.
   * @param {String} expressionString - description of string with no white space or multiplication symbols, e.g.
   * 2x-1 or x(y+2)
   * @param {number} currentIndex
   * @returns {Array.<Term>}
   */
  function interpretExpression( expressionString, currentIndex ) {
    var terms = [];
    var termExtractionResult = null;
    var subExpressionInterpretationResult = null;
    while ( currentIndex < expressionString.length ) {
      termExtractionResult = extractTerm( expressionString, currentIndex );
      currentIndex = termExtractionResult.newIndex;

      // the logic below was left unsimplified to make it explicit and clear what cases are being handled
      if ( currentIndex >= expressionString.length ) {

        // the end of the expression or sub-expression has been reached, add this term
        terms.push( termExtractionResult.term );
      }
      else if ( expressionString.charAt( currentIndex ) === ')' ) {

        // the end of the sub-expression has been reached, add this term
        terms.push( termExtractionResult.term );
        currentIndex++;

        // force exit of the loop
        break;
      }
      else if ( isOperator( expressionString.charAt( currentIndex ) ) ) {

        // this is a standalone term (not a multiplier for a sub-expression) so add it to the array and bump the index
        terms.push( termExtractionResult.term );
      }
      else if ( expressionString.charAt( currentIndex ) === '(' ) {

        // this is the beginning of a sub-expression, so recursively invoke this function to extract it
        currentIndex++;
        subExpressionInterpretationResult = interpretExpression( expressionString, currentIndex );

        // the previously extracted term is now used to multiply the extracted expression (distributive property)
        var multipliedSubExpression = _.map( subExpressionInterpretationResult.terms, function( term ) {
          return term.times( termExtractionResult.term );
        } );

        // add the new terms to the terms array or consolidate it with existing therms, and then update the index
        multipliedSubExpression.forEach( function( multipliedSubExpressionTerm ) {

          // extract terms from the term array that match this one - there should be zero or one, no more
          var matchingTermsArray = _.filter( terms, function( term ) {
            return term.coinTermTypeID === multipliedSubExpressionTerm.coinTermTypeID;
          } );

          // test that the terms array was properly reduced before reaching this point
          assert && assert( matchingTermsArray.length <= 1, 'error - terms array was not properly reduced' );

          if ( matchingTermsArray.length === 1 ) {
            var matchingTerm = matchingTermsArray[ 0 ];

            matchingTerm.coefficient += multipliedSubExpressionTerm.coefficient;
            if ( matchingTerm.coefficient === 0 ) {
              // this term has cancelled, so remove it from the array
              terms = _.without( terms, matchingTerm );
            }
          }
          else {

            // this is a new term, so simply add it to the array of terms
            terms.push( multipliedSubExpressionTerm );
          }
        } );
        currentIndex = subExpressionInterpretationResult.newIndex;
      }
      else {
        assert && assert( false, 'error occurred while interpreting expression string, string = ' + expressionString );
      }
    }

    return {
      terms: terms,
      newIndex: currentIndex
    };
  }

  var stringToTermTypeMap = new Map();
  stringToTermTypeMap.set( '', CoinTermTypeID.CONSTANT );
  stringToTermTypeMap.set( 'x^2*y2', CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED );
  stringToTermTypeMap.set( 'x^2', CoinTermTypeID.X_SQUARED );
  stringToTermTypeMap.set( 'y^2', CoinTermTypeID.Y_SQUARED );
  stringToTermTypeMap.set( 'xy', CoinTermTypeID.X_TIMES_Y );
  stringToTermTypeMap.set( 'x', CoinTermTypeID.X );
  stringToTermTypeMap.set( 'y', CoinTermTypeID.Y );
  stringToTermTypeMap.set( 'z', CoinTermTypeID.Z );

  /**
   * helper function to extract a term from the equation string and also increase the index to the next token in the
   * string
   * @param {string} expressionString
   * @param {number} index
   * @returns {{term: {Term}, newIndex: {number}}}
   */
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

    // get the coin term type
    var coinTermTypeID = stringToTermTypeMap.get( termString );

    return {
      term: new Term( coefficient, coinTermTypeID ),
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

        var expressionCoinTermCounts = {}; // maps coin term types (CoinTermTypeID) to numbers of each in the expression
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
        if ( this.terms.length !== expressionCoinTermCountKeys.length ) {
          return false;
        }

        // Do the counts match?  Note that this assumes the expression description is reduced.
        for ( var i = 0; i < this.terms.length; i++ ) {
          var termDescriptor = this.terms[ i ];
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
        return this.terms.length === 1 && this.terms[ 0 ].matchesCoinTerm( coinTerm );
      }
    }
  );
} );