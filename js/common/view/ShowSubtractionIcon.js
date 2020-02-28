// Copyright 2016-2020, University of Colorado Boulder

/**
 * icon used in the checkbox for showing subtraction in the expressions
 *
 * @author John Blanco
 */

import inherit from '../../../../phet-core/js/inherit.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const MATH_FONT = new MathSymbolFont( { size: 21, weight: 'bold' } );
const RECTANGLE_BACKGROUND_COLOR = 'rgba( 255, 255, 255, 0.6 )';
const RECT_CORNER_RADIUS = 6;

/**
 * @constructor
 */
function ShowSubtractionIcon() {

  // create the background
  Node.call( this );

  // add a rectangle with the first portion of the text
  const firstTextWithBackground = new TextWidthBackground( '+ ' + MathSymbols.UNARY_MINUS + 'x' );
  this.addChild( firstTextWithBackground );

  // add the arrow
  const arrow = new ArrowNode( 0, 0, 15, 0, {
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
  const textNode = new Text( text, { font: MATH_FONT } );

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

inherit( Node, ShowSubtractionIcon );
export default ShowSubtractionIcon;