// Copyright 2016-2019, University of Colorado Boulder

/**
 * icon node for 'Negatives' screen
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Screen = require( 'JOIST/Screen' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
  const BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
  const FONT_SIZE = 100;
  const MATH_FONT = new MathSymbolFont( FONT_SIZE );
  const TEXT_FONT = new PhetFont( FONT_SIZE );

  /**
   * @constructor
   */
  function EENegativesIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // create and add the equation node
    const equationNode = new HBox( {
      children: [
        new Text( '3', { font: TEXT_FONT } ),
        new RichText( 'x<sup>2</sup>', { font: MATH_FONT, supScale: 0.5 } ),
        new Text( ' ' + MathSymbols.MINUS + ' ', { font: TEXT_FONT } ),
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