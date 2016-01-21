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
   * @param {TermInfo} termInfo - object that defines the term represented by this coin
   * @param {ExpressionExchangeExploreModel} exploreModel - model where coins are to be added
   * @param {Object} options
   * TODO: This type may need to be moved and generalized if used in the game
   * @constructor
   */
  function CoinCreatorNode( termInfo, exploreModel, options ) {
    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;
    options = _.extend( {

      // max number of coins that this can create
      creationLimit: Number.POSITIVE_INFINITY
    }, options );

    // add the coin node that will be clicked upon to create coins of the same denomination
    var coinNode = new CoinNode( new Coin( termInfo ), exploreModel.viewModeProperty, exploreModel.showValuesProperty,
      exploreModel.showAllCoefficientsProperty );
    this.addChild( coinNode );

    var createdCountProperty = new Property( 0 ); // Used to track the number of shapes created and not returned.

    // If the created count exceeds the max, make this node invisible (which also makes it unusable).
    createdCountProperty.link( function( numCreated ) {
      self.visible = numCreated < options.creationLimit;
    } );

    // remove the default input listener from the coin node so that it can be replaced
    var coinNodeInputListeners = coinNode.getInputListeners();
    assert && assert( coinNodeInputListeners.length === 1, 'unexpected listeners present on coin node' );
    coinNode.removeInputListener( coinNodeInputListeners[ 0 ] );

    // add the listener that will allow the user to click on this node and create a new coin, then position it in the model
    this.addInputListener( new SimpleDragHandler( {

      parentScreenView: null, // needed for coordinate transforms
      movableShape: null,

      // allow moving a finger (on a touchscreen) dragged across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {
        var thisDragHandler = this;

        // find the parent screen if not already found by moving up the scene graph
        if ( !this.parentScreenView ) {
          var testNode = self;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreenView = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // move up the scene graph by one level
          }
          assert && assert( this.parentScreenView, 'unable to find parent screen view' );
        }

        // determine the initial position of the new element as a function of the event position and this node's bounds
        var initialPosition = this.parentScreenView.globalToLocalPoint( event.pointer.point );

        // create and add the new model element
        this.createdCoin = new Coin( termInfo );
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