// Copyright 2016, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BACKGROUND_COLOR = EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR;
  var ICON_SIZE = Screen.HOME_SCREEN_ICON_SIZE;
  var COIN_SPACING = ICON_SIZE.width * 0.02; // empirically determined
  var TEXT_FONT = new PhetFont( 50 );

  /**
   * @constructor
   */
  function EEGameIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // created a rounded rectangle that looks like a card
    var cardBackground = new Rectangle( 0, 0, ICON_SIZE.width / 2, ICON_SIZE.height / 2, 20, 20, {
      x: ICON_SIZE.width * 0.1,
      y: ICON_SIZE.height * 0.1,
      fill: 'white',
      stroke: 'black',
      lineWidth: 2
    } );

    this.addChild( cardBackground );

    // create a "coin equation" that includes coins and numbers
    var coinEquation = new Node();
    coinEquation.addChild( new Text( '2', { font: TEXT_FONT } ) );
    var coinRadius = ICON_SIZE.width * 0.04; // empirically determined
    coinEquation.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius, {
      left: coinEquation.width,
      centerY: coinEquation.centerY
    } ) );
    coinEquation.addChild( new Text( '+', {
      font: TEXT_FONT,
      left: coinEquation.width + 10
    } ) );
    coinEquation.addChild( new Text( '3', {
      font: TEXT_FONT,
      left: coinEquation.width + 10
    } ) );
    coinEquation.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: coinEquation.width,
      centerY: coinEquation.centerY
    } ) );

    // add the coin equation to the card
    coinEquation.centerX = cardBackground.width / 2;
    coinEquation.centerY = cardBackground.height / 2;
    cardBackground.addChild( coinEquation );

    // create and add coins next to the card
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius, {
      left: cardBackground.right + COIN_SPACING,
      centerY: cardBackground.top + cardBackground.height * 0.3
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius, {
      left: cardBackground.right + coinRadius * 2 + COIN_SPACING * 2,
      centerY: cardBackground.top + cardBackground.height * 0.3
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + COIN_SPACING,
      centerY: cardBackground.top + cardBackground.height * 0.7
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + coinRadius * 2 + COIN_SPACING * 2,
      centerY: cardBackground.top + cardBackground.height * 0.7
    } ) );
    this.addChild( CoinNodeFactory.createIconNode( CoinTermTypeID.Y, coinRadius, {
      left: cardBackground.right + coinRadius * 4 + COIN_SPACING * 3,
      centerY: cardBackground.top + cardBackground.height * 0.7
    } ) );

    this.addChild( new FaceNode( ICON_SIZE.width * 0.35, {
      centerX: ICON_SIZE.width * 0.6,
      centerY: ICON_SIZE.height * 0.67
    } ) );
  }

  expressionExchange.register( 'EEGameIconNode', EEGameIconNode );

  return inherit( Rectangle, EEGameIconNode );
} );