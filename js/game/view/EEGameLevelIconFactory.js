// Copyright 2017, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-back.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-back.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared-back.png' );

  // constants
  var CARD_CORNER_ROUNDING = 4;
  var NUMBER_LABEL_FONT = new PhetFont( 26 ); // size empirically determined
  var CARD_STAGGER_OFFSET = 1.5; // empirically determined, same in x and y directions
  var ICON_WIDTH = 40;
  var CARD_ICON_HEIGHT = 40;

  // helper function for creating coin-image-based icons
  function createCoinIcon( coinTermTypeID, value ) {

    var rootNode = new Node();
    var imageNode;

    // create the coin image node
    switch( coinTermTypeID ) {
      case CoinTermTypeID.X:
        imageNode = new Image( coinXFrontImage );
        break;

      case CoinTermTypeID.Y:
        imageNode = new Image( coinYFrontImage );
        break;

      case CoinTermTypeID.Z:
        imageNode = new Image( coinZFrontImage );
        break;

      default:
        assert && assert( false, 'handling does not exist for coin term type: ' + coinTermTypeID );
        break;
    }

    imageNode.setScaleMagnitude( ICON_WIDTH / imageNode.width );
    rootNode.addChild( imageNode );

    // add the label
    rootNode.addChild( new Text( value, {
      font: NUMBER_LABEL_FONT,
      centerX: imageNode.width / 2,
      centerY: imageNode.height / 2
    } ) );

    return rootNode;
  }

  // helper function for creating the icons that look like stacks of cards
  function createCardStackIcon( numberOnStack, numberOfAdditionalCards ) {
    var rootNode = new Node();
    var cardWidth = ICON_WIDTH - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cardHeight = CARD_ICON_HEIGHT - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cards = [];

    // create the blank cards
    _.times( numberOfAdditionalCards + 1, function( cardNumber ) {
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
    cards.reverse();
    cards.forEach( function( card ) {
      rootNode.addChild( card );
    } );

    return rootNode;
  }

  /**
   * static factory object used to create nodes that represent coins
   * @public
   */
  var EEGameLevelIconFactory = {

    /**
     * function to create a node for the specified game level
     * @param {number} gameLevel - zero based ID for the game level
     * @returns {Node}
     * @public
     */
    createIcon: function( gameLevel ) {

      var icon;

      switch( gameLevel ) {

        case 0:
          icon = createCoinIcon( CoinTermTypeID.X, 1 );
          break;

        case 1:
          icon = createCoinIcon( CoinTermTypeID.Y, 2 );
          break;

        case 2:
          icon = createCoinIcon( CoinTermTypeID.Z, 3 );
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
          assert && assert( false, 'no icon available for game level ' + gameLevel );
          break;
      }

      return icon;
    }
  };

  expressionExchange.register( 'EEGameLevelIconFactory', EEGameLevelIconFactory );

  return EEGameLevelIconFactory;

} );