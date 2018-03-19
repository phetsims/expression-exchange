// Copyright 2016-2017, University of Colorado Boulder

/**
 * icon node for 'Basics' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
  var BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
  var TEXT_FONT = new PhetFont( 84 );

  /**
   * @constructor
   */
  function EEBasicsIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // add the nodes
    var coin1 = CoinNodeFactory.createImageNode( CoinTermTypeID.X, ICON_SIZE.height * 0.15, true );
    coin1.centerX = ICON_SIZE.width * 0.35;
    coin1.centerY = ICON_SIZE.height / 2;
    this.addChild( coin1 );

    this.addChild( new Text( '2', {
      font: TEXT_FONT,
      right: coin1.left - 3,
      centerY: coin1.centerY
    } ) );

    var coin2 = CoinNodeFactory.createImageNode( CoinTermTypeID.Y, ICON_SIZE.height * 0.15, true );
    coin2.centerX = ICON_SIZE.width * 0.75;
    coin2.centerY = ICON_SIZE.height / 2;
    this.addChild( coin2 );

    this.addChild( new Text( MathSymbols.PLUS, {
      font: TEXT_FONT,
      centerX: ( coin1.centerX + coin2.centerX ) / 2,
      centerY: coin1.centerY
    } ) );
  }

  expressionExchange.register( 'EEBasicsIconNode', EEBasicsIconNode );

  return inherit( Rectangle, EEBasicsIconNode );
} );