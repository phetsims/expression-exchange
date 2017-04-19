// Copyright 2017, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY_PHET/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COIN_EXPRESSION_COEFFICIENT_FONT = new PhetFont( 22 );
  var COIN_EXPRESSION_PLUS_SIGN_FONT = new PhetFont( 26 );
  var COEFFICIENT_TO_COIN_SPACING = 1;
  var COIN_TO_PLUS_SIGN_SPACING = 5;
  var EXPRESSION_FONT_FOR_NON_VARIABLE = new PhetFont( 22 );
  var EXPRESSION_FONT_FOR_VARIABLES = new MathSymbolFont( 24 );
  var ADDITIONAL_EXPRESSION_FRAGMENT_SPACING = 2; // empirically determined to look good on the most platforms
  var SUP_SCALE = 0.65; // empirically determined to look good on the most platforms
  var SUB_SUP_OPTIONS = { font: EXPRESSION_FONT_FOR_VARIABLES, supScale: SUP_SCALE };

  /**
   * @param {ExpressionDescription} expressionDescription
   * @param {ViewMode} viewMode
   * @param {Object} options
   * @constructor
   */
  function ExpressionDescriptionNode( expressionDescription, viewMode, options ) {
    var self = this;
    Node.call( this );

    var nextXPos = 0;

    if ( viewMode === ViewMode.COINS ) {
      expressionDescription.termsArray.forEach( function( expressionTerm, index ) {

        // add coefficient if needed
        if ( expressionTerm.coefficient > 1 ) {
          var coefficientNode = new Text( expressionTerm.coefficient, {
            font: COIN_EXPRESSION_COEFFICIENT_FONT,
            left: nextXPos,
            centerY: 0
          } );
          self.addChild( coefficientNode );
          nextXPos += coefficientNode.width + COEFFICIENT_TO_COIN_SPACING;
        }

        // add coin icon
        var coinIconNode = CoinNodeFactory.createIconNode( expressionTerm.coinTermTypeID, 10, { left: nextXPos } );
        self.addChild( coinIconNode );
        nextXPos += coinIconNode.width + COIN_TO_PLUS_SIGN_SPACING;

        // add plus symbol if not at end of expression
        if ( index < expressionDescription.termsArray.length - 1 ) {
          var plusSign = new Text( '+', {
            font: COIN_EXPRESSION_PLUS_SIGN_FONT,
            left: nextXPos,
            centerY: 0
          } );
          self.addChild( plusSign );
          nextXPos += plusSign.width + COIN_TO_PLUS_SIGN_SPACING;
        }

      } );
    }
    else if ( viewMode === ViewMode.VARIABLES ) {

      // go through the expression string, turning the various pieces into nodes
      var expressionStringIndex = 0;
      while ( expressionStringIndex < expressionDescription.expressionString.length ) {
        var expressionFragmentInfo = createExpressionFragment(
          expressionDescription.expressionString,
          expressionStringIndex
        );
        expressionFragmentInfo.node.left = nextXPos;
        this.addChild( expressionFragmentInfo.node );
        nextXPos += expressionFragmentInfo.node.width + ADDITIONAL_EXPRESSION_FRAGMENT_SPACING;
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

    // create the object that will be populated and returned
    var nodeInfo = {
      node: null,
      charsUsed: 0
    };

    // identify the expression to be created based on a finite set of those supported
    if ( expressionString.indexOf( 'x^2', startIndex ) === startIndex ) {
      nodeInfo.node = new RichText( EESharedConstants.X_VARIABLE_CHAR + '<sup>2</sup>', SUB_SUP_OPTIONS );
      nodeInfo.charsUsed = 3;
    }
    else if ( expressionString.indexOf( 'y^2', startIndex ) === startIndex ) {
      nodeInfo.node = new RichText( EESharedConstants.Y_VARIABLE_CHAR + '<sup>2</sup>', SUB_SUP_OPTIONS );
      nodeInfo.charsUsed = 3;
    }
    else if ( expressionString.indexOf( 'xy', startIndex ) === startIndex ) {
      nodeInfo.node = new Text( EESharedConstants.X_VARIABLE_CHAR + EESharedConstants.Y_VARIABLE_CHAR, {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      nodeInfo.charsUsed = 2;
    }
    else if ( expressionString.indexOf( 'x', startIndex ) === startIndex ) {
      nodeInfo.node = new Text( EESharedConstants.X_VARIABLE_CHAR, {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      nodeInfo.charsUsed = 1;
    }
    else if ( expressionString.indexOf( 'y', startIndex ) === startIndex ) {
      nodeInfo.node = new Text( EESharedConstants.Y_VARIABLE_CHAR, {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      nodeInfo.charsUsed = 1;
    }
    else if ( expressionString.indexOf( 'z', startIndex ) === startIndex ) {
      nodeInfo.node = new Text( EESharedConstants.Z_VARIABLE_CHAR, {
        font: EXPRESSION_FONT_FOR_VARIABLES
      } );
      nodeInfo.charsUsed = 1;
    }
    else {
      assert && assert( false, 'unsupported expression' );
    }

    return nodeInfo;
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
    fragmentString = fragmentString.replace( / - /g, ' ' + EESharedConstants.MINUS_SIGN_UNICODE + ' ' );

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

  return inherit( Node, ExpressionDescriptionNode );
} );