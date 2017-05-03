// Copyright 2017, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // constants
  var CARD_CORNER_ROUNDING = 4;
  var CARD_NUMBER_FONT = new PhetFont( 30 ); // size empirically determined
  var CARD_STAGGER_OFFSET = 1.5; // empirically determined, same in x and y directions
  var CARD_ICON_WIDTH = 40;
  var CARD_ICON_HEIGHT = 40;

  // define a helper function for creating the icons that look like stacks of cards
  function createCardStackIcon( numberOnStack, numberOfAdditionalCards ) {
    var rootNode = new Node();
    var cardWidth = CARD_ICON_WIDTH - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cardHeight = CARD_ICON_HEIGHT - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cards = [];

    // create the blank cards
    _.times( numberOfAdditionalCards + 1, function( cardNumber ) {
      cards.push( new Rectangle( 0, 0, cardWidth, cardHeight, CARD_CORNER_ROUNDING, CARD_CORNER_ROUNDING, {
        fill: EESharedConstants.CARD_BACKGROUND_COLOR,
        stroke: 'black',
        lineWidth: 0.5,
        left: cardNumber * CARD_STAGGER_OFFSET,
        top: cardNumber * CARD_STAGGER_OFFSET
      } ) );
    } );

    // add the text to the top card
    cards[ 0 ].addChild( new Text( numberOnStack, {
      font: CARD_NUMBER_FONT,
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

  // helper function for coin icons

  // initialize the icon nodes in an array
  var iconNodes = [
    new Image( coinXFrontImage ),
    new Image( coinYFrontImage ),
    new Image( coinZFrontImage ),
    createCardStackIcon( 4, 0 ),
    createCardStackIcon( 5, 1 ),
    createCardStackIcon( 6, 2 ),
    createCardStackIcon( 7, 3 ),
    createCardStackIcon( 8, 4 )
  ];

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
      assert && assert( gameLevel < iconNodes.length, 'no icon available for requested level' );
      return iconNodes[ gameLevel ];
    }
  };

  expressionExchange.register( 'EEGameLevelIconFactory', EEGameLevelIconFactory );

  return EEGameLevelIconFactory;

} );