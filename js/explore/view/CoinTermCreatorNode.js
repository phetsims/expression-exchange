// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var CoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {EEExploreModel} exploreModel - model where coins are to be added
   * @param {function} creatorFunction - the function that will be invoked in order to create the model element.  This
   * will be used both for creating a local model instance that will then be used for creating the view node, and it
   * will also be used to create the elements that will be added to the model.  The function should take no parameters
   * and should return the created model element.
   * @param {Object} options
   * TODO: This type may need to be moved and generalized if used in the game
   * @constructor
   */
  function CoinTermCreatorNode( exploreModel, creatorFunction, options ) {
    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;
    options = _.extend( {

      // max number of coin terms that this can create
      creationLimit: Number.POSITIVE_INFINITY
    }, options );

    // add the coin node that will be clicked upon to create coins of the same denomination
    var coinNode = new CoinTermNode(
      creatorFunction(),
      exploreModel.viewModeProperty,
      exploreModel.showCoinValuesProperty,
      exploreModel.showVariableValuesProperty,
      exploreModel.showAllCoefficientsProperty
    );
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

    var parentScreenView = null; // needed for coordinate transforms
    var createdCoinTerm;
    // add the listener that will allow the user to click on this node and create a new coin, then position it in the model
    this.addInputListener( new SimpleDragHandler( {

      // allow moving a finger (on a touchscreen) dragged across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {
        // find the parent screen if not already found by moving up the scene graph
        if ( !parentScreenView ) {
          var testNode = self;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              parentScreenView = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // move up the scene graph by one level
          }
          assert && assert( parentScreenView, 'unable to find parent screen view' );
        }

        // determine the initial position of the new element as a function of the event position and this node's bounds
        var initialPosition = parentScreenView.globalToLocalPoint( event.pointer.point );

        // create and add the new model element
        createdCoinTerm = creatorFunction();
        createdCoinTerm.setPositionAndDestination( initialPosition );
        createdCoinTerm.userControlled = true;
        exploreModel.addCoinTerm( createdCoinTerm );

        // If the creation count is limited, adjust the value and monitor the created shape for if/when it is returned.
        if ( options.creationLimit < Number.POSITIVE_INFINITY ) {
          // Use an IIFE to keep a reference of the movable shape in a closure.
          (function() {
            createdCountProperty.value++;
            var localRefToMovableShape = createdCoinTerm;
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
        createdCoinTerm.setPositionAndDestination( createdCoinTerm.position.plus( translationParams.delta ) );
      },

      end: function( event, trail ) {
        createdCoinTerm.userControlled = false;
        createdCoinTerm = null;
      }
    } ) );
  }

  return inherit( Node, CoinTermCreatorNode );
} );