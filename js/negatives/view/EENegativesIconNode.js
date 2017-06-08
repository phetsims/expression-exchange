// Copyright 2016, University of Colorado Boulder

/**
 * icon node for 'Negatives' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var RichText = require( 'SCENERY_PHET/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
  var BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
  var FONT_SIZE = 100;
  var MATH_FONT = new MathSymbolFont( FONT_SIZE );
  var TEXT_FONT = new PhetFont( FONT_SIZE );

  /**
   * @constructor
   */
  function EENegativesIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // create and add the equation node
    var equationNode = new HBox( {
      children: [
        new Text( '3', { font: TEXT_FONT } ),
        new RichText( 'x<sup>2</sup>', { font: MATH_FONT, supScale: 0.5 } ),
        new Text( ' \u2212 ', { font: TEXT_FONT } ),
        new RichText( 'x<sup>2</sup>', { font: MATH_FONT, supScale: 0.5 } )
      ],
      align: 'bottom'
    } );
    equationNode.centerX = ICON_SIZE.width / 2;
    equationNode.centerY = ICON_SIZE.height * 0.45;
    this.addChild( equationNode );
  }

  expressionExchange.register( 'EENegativesIconNode', EENegativesIconNode );

  return inherit( Rectangle, EENegativesIconNode );
} );