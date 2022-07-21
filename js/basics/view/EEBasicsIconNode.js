// Copyright 2016-2022, University of Colorado Boulder

/**
 * icon node for 'Basics' screen
 *
 * @author John Blanco
 */

import Screen from '../../../../joist/js/Screen.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Rectangle, Text } from '../../../../scenery/js/imports.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import CoinNodeFactory from '../../common/view/CoinNodeFactory.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
const BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
const TEXT_FONT = new PhetFont( 84 );

class EEBasicsIconNode extends Rectangle {

  /**
   */
  constructor() {

    // create the background
    super( 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // add the nodes
    const coin1 = CoinNodeFactory.createImageNode( CoinTermTypeID.X, ICON_SIZE.height * 0.15, true );
    coin1.centerX = ICON_SIZE.width * 0.35;
    coin1.centerY = ICON_SIZE.height / 2;
    this.addChild( coin1 );

    this.addChild( new Text( '2', {
      font: TEXT_FONT,
      right: coin1.left - 3,
      centerY: coin1.centerY
    } ) );

    const coin2 = CoinNodeFactory.createImageNode( CoinTermTypeID.Y, ICON_SIZE.height * 0.15, true );
    coin2.centerX = ICON_SIZE.width * 0.75;
    coin2.centerY = ICON_SIZE.height / 2;
    this.addChild( coin2 );

    this.addChild( new Text( MathSymbols.PLUS, {
      font: TEXT_FONT,
      centerX: ( coin1.centerX + coin2.centerX ) / 2,
      centerY: coin1.centerY
    } ) );
  }
}

expressionExchange.register( 'EEBasicsIconNode', EEBasicsIconNode );

export default EEBasicsIconNode;