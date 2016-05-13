// Copyright 2016, University of Colorado Boulder

/**
 * a UI component that is used to create coin terms when clicked upon
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {ExpressionManipulationModel} exploreModel - model where coins are to be added
   * @param {function} creatorFunction - the function that will be invoked in order to create the model element.  This
   * will be used both for creating a local model instance that will then be used for creating the view node, and it
   * will also be used to create the elements that will be added to the model.  The function should take no parameters
   * and should return the created model element.
   * @param {Object} options
   * TODO: This type may need to be moved and generalized if used in the game
   * @constructor
   */
  function CoinTermCreatorNode( exploreModel, creatorFunction, options ) {

    options = _.extend( {

      dragBounds: Bounds2.EVERYTHING,

      // max number of coin terms that this can create
      creationLimit: Number.POSITIVE_INFINITY
    }, options );

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // add the coin node that will be clicked upon to create coins of the same denomination
    var coinNode = new CoinTermNode(
      creatorFunction( Vector2.ZERO ),
      exploreModel.viewModeProperty,
      exploreModel.showCoinValuesProperty,
      exploreModel.showVariableValuesProperty,
      exploreModel.showAllCoefficientsProperty,
      { addDragHandler: false }
    );
    this.addChild( coinNode );

    var createdCountProperty = new Property( 0 ); // Used to track the number of shapes created and not returned.

    // If the created count exceeds the max, make this node invisible (which also makes it unusable).
    createdCountProperty.link( function( numCreated ) {
      self.visible = numCreated < options.creationLimit;
    } );

    var parentScreenView = null; // needed for coordinate transforms
    var createdCoinTerm;
    var unboundedPosition = new Vector2();

    // add the listener that will allow the user to click on this node and create a new coin, then position it in the model
    // TODO: Look at applying the "event forwarding" approach to send events to view object instead of having a separate handler
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

        // Determine the origin position of the new element based on where the creator node is.  This is done so that
        // the position to which this element will return when sent to the origin will match the position of this
        // creator node.
        var originPosition = parentScreenView.globalToLocalPoint( self.localToGlobalPoint( Vector2.ZERO ) );

        // Now determine the initial position where this element should move to after it's created, which corresponds
        // to the location of the mouse or touch event.
        var initialPosition = parentScreenView.globalToLocalPoint( event.pointer.point );

        // create and add the new model element
        createdCoinTerm = creatorFunction( originPosition );
        createdCoinTerm.setPositionAndDestination( initialPosition );
        createdCoinTerm.userControlled = true;
        exploreModel.addCoinTerm( createdCoinTerm );
        unboundedPosition.set( initialPosition );

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
        unboundedPosition.setXY(
          unboundedPosition.x + translationParams.delta.x,
          unboundedPosition.y + translationParams.delta.y
        );
        createdCoinTerm.setPositionAndDestination( new Vector2(
          Util.clamp( unboundedPosition.x, options.dragBounds.minX, options.dragBounds.maxX ),
          Util.clamp( unboundedPosition.y, options.dragBounds.minY, options.dragBounds.maxY )
        )  );
      },

      end: function( event, trail ) {
        createdCoinTerm.userControlled = false;
        createdCoinTerm = null;
      }
    } ) );
  }

  expressionExchange.register( 'CoinTermCreatorNode', CoinTermCreatorNode );

  return inherit( Node, CoinTermCreatorNode );
} );