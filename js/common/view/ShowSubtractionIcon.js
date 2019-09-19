// Copyright 2016-2018, University of Colorado Boulder

/**
 * icon used in the checkbox for showing subtraction in the expressions
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  var MATH_FONT = new MathSymbolFont( { size: 21, weight: 'bold' } );
  var RECTANGLE_BACKGROUND_COLOR = 'rgba( 255, 255, 255, 0.6 )';
  var RECT_CORNER_RADIUS = 6;

  /**
   * @constructor
   */
  function ShowSubtractionIcon() {

    // create the background
    Node.call( this );

    // add a rectangle with the first portion of the text
    var firstTextWithBackground = new TextWidthBackground( '+ ' + MathSymbols.UNARY_MINUS + 'x' );
    this.addChild( firstTextWithBackground );

    // add the arrow
    var arrow = new ArrowNode( 0, 0, 15, 0, {
      left: firstTextWithBackground.right + 5,
      centerY: firstTextWithBackground.height / 2,
      stroke: null,
      fill: 'rgb( 150, 0, 0 )',
      tailWidth: 3,
      headHeight: 7
    } );
    this.addChild( arrow );

    // add the 2nd enclosed text portion
    this.addChild( new TextWidthBackground( MathSymbols.MINUS + ' x', { left: arrow.right + 5 } ) );
  }

  /**
   * inner class for the background box used for the textual portions of the icon
   * @param {string} text
   * @param {Object} [options]
   * @constructor
   */
  function TextWidthBackground( text, options ) {

    // create the textual node
    var textNode = new Text( text, { font: MATH_FONT } );

    // create the background, which is a rounded rectangle (the width and height multipliers were empirically determined)
    Rectangle.call( this, 0, 0, textNode.width * 1.4, textNode.height * 1.1, {
      fill: RECTANGLE_BACKGROUND_COLOR,
      cornerRadius: RECT_CORNER_RADIUS
    } );

    // position and add the text node
    textNode.center = this.center;
    this.addChild( textNode );

    // pass through any options to the parent type
    this.mutate( options );
  }

  inherit( Rectangle, TextWidthBackground );

  expressionExchange.register( 'ShowSubtractionIcon', ShowSubtractionIcon );

  return inherit( Node, ShowSubtractionIcon );
} );