// Copyright 2017, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 *
 * Note the the expression description string is re-parsed in this object because the expression description is in the
 * reduced form (no parens) and we need to handle subscripts and superscripts.
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COIN_ICON_RADIUS = 10;
  var COIN_EXPRESSION_FONT = new PhetFont( 22 );
  var EXPRESSION_FONT_FOR_NON_VARIABLE = new PhetFont( 22 );
  var EXPRESSION_FONT_FOR_VARIABLES = new MathSymbolFont( 24 );
  var SUP_SCALE = 0.65; // empirically determined to look good on the most platforms
  var SUB_SUP_OPTIONS = { font: EXPRESSION_FONT_FOR_VARIABLES, supScale: SUP_SCALE };

  /**
   * @param {ExpressionDescription} expressionDescription
   * @param {ViewMode} viewMode
   * @param {Object} [options]
   * @constructor
   */
  function ExpressionDescriptionNode( expressionDescription, viewMode, options ) {

    HBox.call( this, { align: 'bottom' } );
    var self = this;

    if ( viewMode === ViewMode.COINS ) {

      this.setAlign( 'center' );

      expressionDescription.terms.forEach( function( expressionTerm, index ) {

        // add coefficient if needed
        if ( expressionTerm.coefficient > 1 ) {
          var coefficientNode = new Text( expressionTerm.coefficient, { font: COIN_EXPRESSION_FONT } );
          self.addChild( coefficientNode );
        }

        // add coin icon
        var coinIconNode = CoinNodeFactory.createIconNode(
          expressionTerm.coinTermTypeID,
          COIN_ICON_RADIUS
        );
        self.addChild( coinIconNode );

        // add plus symbol if not at end of expression
        if ( index < expressionDescription.terms.length - 1 ) {
          var plusSign = new Text( ' ' + MathSymbols.PLUS + ' ', { font: COIN_EXPRESSION_FONT } );
          self.addChild( plusSign );
        }

      } );
    }
    else if ( viewMode === ViewMode.VARIABLES ) {

      this.setAlign( 'bottom' );

      // Go through the expression string, turning the various pieces into nodes.  The 'terms' field of the expression
      // description can't be used here because it is the returned version of the expression.
      var expressionStringIndex = 0;

      while ( expressionStringIndex < expressionDescription.expressionString.length ) {
        var expressionFragmentInfo = createExpressionFragment(
          expressionDescription.expressionString,
          expressionStringIndex
        );
        self.addChild( expressionFragmentInfo.node );
        expressionStringIndex += expressionFragmentInfo.charsUsed;
      }
    }
    else {
      assert && assert( false, 'unrecognized representation type' );
    }

    this.mutate( options );
  }

  /*
   * helper function that creates an object that consists of a node that represents a variable and the number of
   * characters from the expression string that the node represents
   */
  function createVariableExpressionFragment( expressionString, startIndex ) {

    // error checking
    var firstChar = expressionString.charAt( startIndex );
    assert && assert( firstChar === 'x' || firstChar === 'y' || firstChar === 'z', 'unexpected first char of string' );

    var node = null;
    var charsUsed = 0;

    // identify the expression to be created based on a finite set of those supported
    if ( expressionString.indexOf( 'x^2', startIndex ) === startIndex ) {
      node = new RichText( 'x' + '<sup>2</sup>', SUB_SUP_OPTIONS );
      charsUsed = 3;
    }
    else if ( expressionString.indexOf( 'y^2', startIndex ) === startIndex ) {
      node = new RichText( 'y<sup>2</sup>', SUB_SUP_OPTIONS );
      charsUsed = 3;
    }
    else if ( expressionString.indexOf( 'xy', startIndex ) === startIndex ) {
      node = new Text( 'xy', {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      charsUsed = 2;
    }
    else if ( expressionString.indexOf( 'x', startIndex ) === startIndex ) {
      node = new Text( 'x', {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      charsUsed = 1;
    }
    else if ( expressionString.indexOf( 'y', startIndex ) === startIndex ) {
      node = new Text( 'y', {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      charsUsed = 1;
    }
    else if ( expressionString.indexOf( 'z', startIndex ) === startIndex ) {
      node = new Text( 'z', {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      charsUsed = 1;
    }
    else {
      assert && assert( false, 'unsupported expression' );
    }

    return {
      node: node,
      charsUsed: charsUsed
    };
  }

  function createNonVariableExpressionFragment( expressionString, startIndex ) {
    var fragmentString = '';
    var index = startIndex;
    while ( expressionString.charAt( index ) !== 'x' &&
            expressionString.charAt( index ) !== 'y' &&
            expressionString.charAt( index ) !== 'z' &&
            index < expressionString.length ) {
      fragmentString += expressionString.charAt( index );
      index++;
    }

    assert && assert( fragmentString.length, 'no expression fragment found, method should not have been called' );

    // replace the minus sign used in subtraction operations with the unicode character
    fragmentString = fragmentString.replace( / - /g, ' ' + MathSymbols.MINUS + ' ' );

    return {
      node: new Text( fragmentString, { font: EXPRESSION_FONT_FOR_NON_VARIABLE } ),
      charsUsed: index - startIndex
    };
  }

  /*
   * helper function for creating nodes to represent pieces of the expression spec - this is limited to the format
   * expected for expression descriptions in this sim, and is not very general
   */
  function createExpressionFragment( expressionString, index ) {

    var expressionFragment;
    var nextChar = expressionString.charAt( index );
    if ( nextChar === 'x' || nextChar === 'y' || nextChar === 'z' ) {
      expressionFragment = createVariableExpressionFragment( expressionString, index );
    }
    else {
      expressionFragment = createNonVariableExpressionFragment( expressionString, index );
    }
    return expressionFragment;
  }

  expressionExchange.register( 'ExpressionDescriptionNode', ExpressionDescriptionNode );

  return inherit( HBox, ExpressionDescriptionNode );
} );