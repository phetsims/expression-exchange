// Copyright 2016, University of Colorado Boulder

/**
 * icon used in the checkbox for showing subtraction in the expressions
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var MATH_FONT = new MathSymbolFont( { size: 22, weight: 'bold' } );
  var RECTANGLE_BACKGROUND_COLOR = 'rgba( 255, 255, 255, 0.6 )';
  var RECT_CORNER_RADIUS = 8;

  /**
   * @constructor
   */
  function ShowSubtractionIcon() {

    // create the background
    Node.call( this );

    // add a rectangle with the first portion of the text
    var firstTextPortion = new Text( '+ -x', { font: MATH_FONT } );
    var firstTextBackground = new Rectangle(
      0,
      0,
      firstTextPortion.width * 1.4,
      firstTextPortion.height * 1.1,
      RECT_CORNER_RADIUS,
      RECT_CORNER_RADIUS,
      { fill: RECTANGLE_BACKGROUND_COLOR }
    );
    firstTextPortion.centerX = firstTextBackground.width / 2;
    firstTextPortion.centerY = firstTextBackground.height / 2;
    firstTextBackground.addChild( firstTextPortion );
    this.addChild( firstTextBackground );

    // add the arrow
    var arrow = new ArrowNode( 0, 0, 15, 0, {
      left: firstTextBackground.right + 5,
      centerY: firstTextBackground.height / 2,
      stroke: null,
      fill: 'rgb( 150, 0, 0 )',
      tailWidth: 3,
      headHeight: 7
    } );
    this.addChild( arrow );
    
    // add a rectangle containing the 2nd text portion
    var secondTextPortion = new Text( '\u2212 x', { font: MATH_FONT } );
    var secondTextBackground = new Rectangle(
      0,
      0,
      secondTextPortion.width * 1.4,
      secondTextPortion.height * 1.1,
      RECT_CORNER_RADIUS,
      RECT_CORNER_RADIUS,
      { fill: RECTANGLE_BACKGROUND_COLOR, left: arrow.right + 5 }
    );
    secondTextPortion.centerX = secondTextBackground.width / 2;
    secondTextPortion.centerY = secondTextBackground.height / 2;
    secondTextBackground.addChild( secondTextPortion );
    this.addChild( secondTextBackground );
  }

  expressionExchange.register( 'ShowSubtractionIcon', ShowSubtractionIcon );

  return inherit( Node, ShowSubtractionIcon );
} );