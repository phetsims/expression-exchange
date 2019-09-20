// Copyright 2017-2019, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 *
 * Note the expression description string is re-parsed in this object because the expression description is in the
 * reduced form (no parens) and we need to handle subscripts and superscripts.
 */
define( require => {
  'use strict';

  // modules
  const CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  const COIN_ICON_RADIUS = 10;
  const COIN_EXPRESSION_FONT = new PhetFont( 22 );
  const EXPRESSION_FONT_FOR_NON_VARIABLE = new PhetFont( 22 );
  const EXPRESSION_FONT_FOR_VARIABLES = new MathSymbolFont( 24 );
  const SUP_SCALE = 0.65; // empirically determined to look good on the most platforms
  const SUB_SUP_OPTIONS = { font: EXPRESSION_FONT_FOR_VARIABLES, supScale: SUP_SCALE };

  /**
   * @param {ExpressionDescription} expressionDescription
   * @param {ViewMode} viewMode
   * @param {Object} [options]
   * @constructor
   */
  function ExpressionDescriptionNode( expressionDescription, viewMode, options ) {

    HBox.call( this, { align: 'bottom' } );
    const self = this;

    if ( viewMode === ViewMode.COINS ) {

      this.setAlign( 'center' );

      expressionDescription.terms.forEach( function( expressionTerm, index ) {

        // add coefficient if needed
        if ( expressionTerm.coefficient > 1 ) {
          const coefficientNode = new Text( expressionTerm.coefficient, { font: COIN_EXPRESSION_FONT } );
          self.addChild( coefficientNode );
        }

        // add coin icon
        const coinIconNode = CoinNodeFactory.createIconNode(
          expressionTerm.coinTermTypeID,
          COIN_ICON_RADIUS
        );
        self.addChild( coinIconNode );

        // add plus symbol if not at end of expression
        if ( index < expressionDescription.terms.length - 1 ) {
          const plusSign = new Text( ' ' + MathSymbols.PLUS + ' ', { font: COIN_EXPRESSION_FONT } );
          self.addChild( plusSign );
        }

      } );
    }
    else if ( viewMode === ViewMode.VARIABLES ) {

      this.setAlign( 'bottom' );

      // Go through the expression string, turning the various pieces into nodes.  The 'terms' field of the expression
      // description can't be used here because it is the returned version of the expression.
      let expressionStringIndex = 0;

      while ( expressionStringIndex < expressionDescription.expressionString.length ) {
        const expressionFragmentInfo = createExpressionFragment(
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
    const firstChar = expressionString.charAt( startIndex );
    assert && assert( firstChar === 'x' || firstChar === 'y' || firstChar === 'z', 'unexpected first char of string' );

    let node = null;
    let charsUsed = 0;

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
    let fragmentString = '';
    let index = startIndex;
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

    let expressionFragment;
    const nextChar = expressionString.charAt( index );
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