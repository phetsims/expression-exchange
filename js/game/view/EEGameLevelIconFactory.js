// Copyright 2017-2022, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import CoinNodeFactory from '../../common/view/CoinNodeFactory.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const CARD_CORNER_ROUNDING = 4;
const NUMBER_LABEL_FONT = new PhetFont( 26 ); // size empirically determined
const CARD_STAGGER_OFFSET = 1.5; // empirically determined, same in x and y directions
const ICON_WIDTH = 40;
const CARD_ICON_HEIGHT = 40;
const COIN_RADIUS = 20; // empirically determined

/**
 * helper function for creating coin-image-based icons
 * @param {CoinTermTypeID} coinTermTypeID - type of coin image to use
 * @param {number} value - value that will appear on the face of the coin
 * @returns {Node}
 */
function createCoinIcon( coinTermTypeID, value ) {

  // create the coin image node
  const imageNode = CoinNodeFactory.createImageNode( coinTermTypeID, COIN_RADIUS, false );

  // add the label
  const label = new Text( value, {
    font: NUMBER_LABEL_FONT,
    centerX: imageNode.width / 2,
    centerY: imageNode.height / 2
  } );

  return new Node( { children: [ imageNode, label ] } );
}

/**
 * helper function for creating the icons that look like a stack of cards
 * @param {number} numberOnStack
 * @param {number} numberOfAdditionalCards
 * @returns {Node}
 */
function createCardStackIcon( numberOnStack, numberOfAdditionalCards ) {
  const rootNode = new Node();
  const cardWidth = ICON_WIDTH - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
  const cardHeight = CARD_ICON_HEIGHT - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
  const cards = [];

  // create the blank cards
  _.times( numberOfAdditionalCards + 1, cardNumber => {
    cards.push( new Rectangle( 0, 0, cardWidth, cardHeight, CARD_CORNER_ROUNDING, CARD_CORNER_ROUNDING, {
      fill: EESharedConstants.CARD_BACKGROUND_COLOR,
      stroke: 'black',
      lineWidth: 0.5,
      left: ( numberOfAdditionalCards - cardNumber ) * CARD_STAGGER_OFFSET,
      top: ( numberOfAdditionalCards - cardNumber ) * CARD_STAGGER_OFFSET
    } ) );
  } );

  // add the text to the top card
  cards[ 0 ].addChild( new Text( numberOnStack, {
    font: NUMBER_LABEL_FONT,
    centerX: cardWidth / 2,
    centerY: cardHeight / 2
  } ) );

  // add the cards to the root node
  cards.reverse().forEach( card => {
    rootNode.addChild( card );
  } );

  return rootNode;
}

/**
 * static factory object used to create nodes that represent coins
 * @public
 */
const EEGameLevelIconFactory = {

  /**
   * function to create a node for the specified game level
   * @param {number} gameLevel - zero based ID for the game level
   * @returns {Node}
   * @public
   */
  createIcon( gameLevel ) {

    let icon;

    switch( gameLevel ) {

      case 0:
        icon = createCoinIcon( CoinTermTypeID.X_TIMES_Y, 1 );
        break;

      case 1:
        icon = createCoinIcon( CoinTermTypeID.X, 2 );
        break;

      case 2:
        icon = createCoinIcon( CoinTermTypeID.Y_SQUARED, 3 );
        break;

      case 3:
        icon = createCardStackIcon( 4, 0 );
        break;

      case 4:
        icon = createCardStackIcon( 5, 1 );
        break;

      case 5:
        icon = createCardStackIcon( 6, 2 );
        break;

      case 6:
        icon = createCardStackIcon( 7, 3 );
        break;

      case 7:
        icon = createCardStackIcon( 8, 4 );
        break;

      default:
        assert && assert( false, `no icon available for game level ${gameLevel}` );
        break;
    }

    return icon;
  }
};

expressionExchange.register( 'EEGameLevelIconFactory', EEGameLevelIconFactory );

export default EEGameLevelIconFactory;