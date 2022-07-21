// Copyright 2016-2022, University of Colorado Boulder

/**
 * icon node for 'Game' screen
 *
 * @author John Blanco
 */

import Screen from '../../../../joist/js/Screen.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Rectangle, Text } from '../../../../scenery/js/imports.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import CoinNodeFactory from '../../common/view/CoinNodeFactory.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const BACKGROUND_COLOR = EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR;
const ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
const COIN_SPACING = ICON_SIZE.width * 0.02; // empirically determined
const TEXT_FONT = new PhetFont( 50 );
const PLUS_SIGN_X_MARGIN = 10;

class EEGameIconNode extends Rectangle {

  /**
   */
  constructor() {

    // create the background
    super( 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // created a rounded rectangle that looks like a card
    const cardBackground = new Rectangle( 0, 0, ICON_SIZE.width / 2, ICON_SIZE.height / 2, {
      x: ICON_SIZE.width * 0.1,
      y: ICON_SIZE.height * 0.1,
      fill: 'white',
      stroke: 'black',
      lineWidth: 2,
      cornerRadius: 20
    } );

    this.addChild( cardBackground );

    // create a "coin equation" that includes coins and numbers
    const coinRadius = ICON_SIZE.width * 0.04; // empirically determined
    const coinEquation = new HBox( {
      children: [
        new Text( '2', { font: TEXT_FONT } ),
        CoinNodeFactory.createIconNode( CoinTermTypeID.X, coinRadius ),
        new HStrut( PLUS_SIGN_X_MARGIN ),
        new Text( MathSymbols.PLUS, { font: TEXT_FONT } ),
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
    const topCoinRowCenterY = cardBackground.top + cardBackground.height * 0.3;
    const secondCoinRowCenterY = cardBackground.top + cardBackground.height * 0.7;
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
}

expressionExchange.register( 'EEGameIconNode', EEGameIconNode );

export default EEGameIconNode;