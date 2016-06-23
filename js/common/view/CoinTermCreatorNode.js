// Copyright 2016, University of Colorado Boulder

/**
 * a UI component that is used to create coin terms when clicked upon
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var ConstantCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/ConstantCoinTermNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Util = require( 'DOT/Util' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {ExpressionManipulationModel} exploreModel - model where coins are to be added
   * @param {CoinTermTypeID} typeID - type of coin term to create
   * @param {function} creatorFunction - the function that will be invoked in order to create the model element.  This
   * will be used both for creating a local model instance that will then be used for creating the view node, and it
   * will also be used to create the elements that will be added to the model.  The function should take no parameters
   * and should return the created model element.
   * @param {Object} options
   * TODO: This type may need to be moved and generalized if used in the game
   * @constructor
   */
  function CoinTermCreatorNode( exploreModel, typeID, creatorFunction, options ) {

    options = _.extend( {

      dragBounds: Bounds2.EVERYTHING,

      // initial combined count of the coin term that will be created
      initialCount: 1,

      // max number of coin terms that this can create
      creationLimit: Number.POSITIVE_INFINITY,

      // property that indicates the number of this type of coin term in the model
      createdCountProperty: null

    }, options );

    // if a creation limit is set, the createdCountProperty must also be set
    assert && assert(
      options.creationLimit === Number.POSITIVE_INFINITY || options.createdCountProperty,
      'must have a createdCountProperty if the creation limit is finite'
    );

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // add the coin node that will be clicked upon to create coins of the same denomination
    var coinNode;
    if ( typeID === CoinTermTypeID.CONSTANT ){
      coinNode = new ConstantCoinTermNode(
        creatorFunction( typeID, { initialPosition: Vector2.ZERO, initialCount: options.initialCount } ),
        exploreModel.viewModeProperty,
        { addDragHandler: false }
      );
    }
    else{
      coinNode = new VariableCoinTermNode(
        creatorFunction( typeID, { initialPosition: Vector2.ZERO, initialCount: options.initialCount } ),
        exploreModel.viewModeProperty,
        exploreModel.showCoinValuesProperty,
        exploreModel.showVariableValuesProperty,
        exploreModel.showAllCoefficientsProperty,
        { addDragHandler: false }
      );
    }
    this.addChild( coinNode );

    // variables used by the input listener
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

        // create and add the new coin term
        createdCoinTerm = creatorFunction( typeID, {
          initialPosition: originPosition,
          initialCount: options.initialCount
        } );
        createdCoinTerm.setPositionAndDestination( initialPosition );
        createdCoinTerm.userControlled = true;
        exploreModel.addCoinTerm( createdCoinTerm );
        unboundedPosition.set( initialPosition );
      },

      translate: function( translationParams ) {
        unboundedPosition.setXY(
          unboundedPosition.x + translationParams.delta.x,
          unboundedPosition.y + translationParams.delta.y
        );
        createdCoinTerm.setPositionAndDestination( new Vector2(
          Util.clamp( unboundedPosition.x, options.dragBounds.minX, options.dragBounds.maxX ),
          Util.clamp( unboundedPosition.y, options.dragBounds.minY, options.dragBounds.maxY )
        ) );
      },

      end: function( event, trail ) {
        createdCoinTerm.userControlled = false;
        createdCoinTerm = null;
      }
    } ) );

    // update the enabled state of this creator node - will be disabled if creation limits are reached
    if ( options.createdCountProperty ) {
      options.createdCountProperty.link( function( count ) {
        console.log( 'count = ' + count );
        if ( count + Math.abs( options.initialCount ) > options.creationLimit ) {
          self.pickable = false;
          self.opacity = 0.4;
        }
        else {
          self.pickable = true;
          self.opacity = 1;
        }
      } );
    }
  }

  expressionExchange.register( 'CoinTermCreatorNode', CoinTermCreatorNode );

  return inherit( Node, CoinTermCreatorNode );
} );