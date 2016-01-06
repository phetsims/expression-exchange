// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var Coin = require( 'EXPRESSION_EXCHANGE/common/model/Coin' );
  var CoinNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {number} denomination - value, in cents, of coin to be created
   * @param {ExpressionExchangeExploreModel} exploreModel - model where coins are to be added
   * @param {Object} options
   * TODO: This type may need to be moved and generalized if used in the game
   * @constructor
   */
  function CoinCreatorNode( denomination, exploreModel, options ) {
    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;
    options = _.extend( {

      // max number of coins that this can create
      creationLimit: Number.POSITIVE_INFINITY
    }, options );

    // add the coin node that will be clicked upon to create coins of the same denomination
    this.addChild( CoinNode.createCoinRepresentation( denomination ) );

    var createdCountProperty = new Property( 0 ); // Used to track the number of shapes created and not returned.

    // If the created count exceeds the max, make this node invisible (which also makes it unusable).
    createdCountProperty.link( function( numCreated ) {
      self.visible = numCreated < options.creationLimit;
    } );

    // add the listener that will allow the user to click on this node and create a new coin, then position it in the model
    this.addInputListener( new SimpleDragHandler( {

      parentScreen: null, // needed for coordinate transforms
      movableShape: null,

      // allow moving a finger (on a touchscreen) dragged across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {
        var thisDragHandler = this;

        // find the parent screen by moving up the scene graph
        var testNode = self;
        while ( testNode !== null ) {
          if ( testNode instanceof ScreenView ) {
            this.parentScreen = testNode;
            break;
          }
          testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
        }

        // determine the initial position of the new element as a function of the event position and this node's bounds
        var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point );

        // create and add the new model element
        this.createdCoin = new Coin( denomination );
        this.createdCoin.position = initialPosition;
        this.createdCoin.userControlled = true;
        exploreModel.addCoin( this.createdCoin );

        // If the creation count is limited, adjust the value and monitor the created shape for if/when it is returned.
        if ( options.creationLimit < Number.POSITIVE_INFINITY ) {
          // Use an IIFE to keep a reference of the movable shape in a closure.
          (function() {
            createdCountProperty.value++;
            var localRefToMovableShape = thisDragHandler.createdCoin;
            localRefToMovableShape.on( 'returnedToOrigin', function returnedToOriginListener() {
              if ( !localRefToMovableShape.userControlled ) {
                // the shape has been returned to its origin, so decrement the created count
                createdCountProperty.value--;
                localRefToMovableShape.off( 'returnedToOrigin', returnedToOriginListener );
              }
            } );
          })();
        }
      },

      translate: function( translationParams ) {
        this.createdCoin.position = this.createdCoin.position.plus( translationParams.delta );
      },

      end: function( event, trail ) {
        this.createdCoin.userControlled = false;
        this.createdCoin = null;
      }
    } ) );
  }

  return inherit( Node, CoinCreatorNode );
} );