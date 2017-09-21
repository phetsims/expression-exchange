// Copyright 2016-2017, University of Colorado Boulder

/**
 * icon node for 'Game' screen
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
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BACKGROUND_COLOR = EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR;
  var ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
  var COIN_SPACING = ICON_SIZE.width * 0.02; // empirically determined
  var TEXT_FONT = new PhetFont( 50 );
  var PLUS_SIGN_X_MARGIN = 10;

  /**
   * @constructor
   */
  function EEGameIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // created a rounded rectangle that looks like a card
    var cardBackground = new Rectangle( 0, 0, ICON_SIZE.width / 2, ICON_SIZE.height / 2, {
      x: ICON_SIZE.width * 0.1,
      y: ICON_SIZE.height * 0.1,
      fill: 'white',
      stroke: 'black',
      lineWidth: 2,
      cornerRadius: 20
    } );

    this.addChild( cardBackground );

    // create a "coin equation" that includes coins and numbers
    var coinRadius = ICON_SIZE.width * 0.04; // empirically determined
    var coinEquation = new HBox( {
      children: [
        new Text( '2', { font: TEXT_FONT } ),
        CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius ),
        new HStrut( PLUS_SIGN_X_MARGIN ),
        new Text( '+', { font: TEXT_FONT } ),
        new HStrut( PLUS_SIGN_X_MARGIN ),
        new Text( '3', { font: TEXT_FONT } ),
        CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius )
      ]
    } );

    // add the coin equation to the card
    coinEquation.centerX = cardBackground.width / 2;
    coinEquation.centerY = cardBackground.height / 2;
    cardBackground.addChild( coinEquation );

    // create and add coins next to the card
    var topCoinRowCenterY = cardBackground.top + cardBackground.height * 0.3;
    var secondCoinRowCenterY = cardBackground.top + cardBackground.height * 0.7;
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius, {
      left: cardBackground.right + COIN_SPACING,
      centerY: topCoinRowCenterY
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius, {
      left: cardBackground.right + coinRadius * 2 + COIN_SPACING * 2,
      centerY: topCoinRowCenterY
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + COIN_SPACING,
      centerY: secondCoinRowCenterY
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + coinRadius * 2 + COIN_SPACING * 2,
      centerY: secondCoinRowCenterY
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + coinRadius * 4 + COIN_SPACING * 3,
      centerY: secondCoinRowCenterY
    } ) );

    this.addChild( new FaceNode( ICON_SIZE.width * 0.35, {
      centerX: ICON_SIZE.width * 0.6,
      centerY: ICON_SIZE.height * 0.67
    } ) );
  }

  expressionExchange.register( 'EEGameIconNode', EEGameIconNode );

  return inherit( Rectangle, EEGameIconNode );
} );