// Copyright 2016, University of Colorado Boulder

/**
 * a UI component that is used to create coin terms when clicked upon
 *
 * This is generally used in a carousel or other "creator box".  There are a few sim-specific items currently used, but
 * this could probably be generalized fairly easily so that it could be reused in similar situations.  My (jbphet)
 * initial thoughts are that we would need to decide whether to extract much of the functionality into a base class
 * and derive subclasses to handle sim-specific behavior, or have some sort of options that could make it work in all
 * cases.
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
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Util = require( 'DOT/Util' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var STAGGER_OFFSET = 3; // in screen coordinates, empirically determined for optimal look

  /**
   * @param {ExpressionManipulationModel} exploreModel - model where coins are to be added
   * @param {CoinTermTypeID} typeID - type of coin term to create
   * @param {function} coinTermCreatorFunction - the function that will be invoked in order to create the coin term
   * model element.  This will be used for creating the elements that are added to the model, and also for creating
   * "dummy" instances to associate with the view nodes that collectively comprise the constructed creator node.
   * @param {Object} options
   * @constructor
   */
  function CoinTermCreatorNode( exploreModel, typeID, coinTermCreatorFunction, options ) {

    options = _.extend( {

      dragBounds: Bounds2.EVERYTHING,

      // initial count of the coin term that will be created, can be negative
      createdCoinTermInitialCount: 1,

      // flag that controls whether created coin term can be decomposed
      createdCoinTermDecomposable: true,

      // property that controls the number of creator nodes to show as a stack
      numberToShowProperty: new Property( 1 ),

      // the maximum number of this coin term that will be shown
      maxNumberShown: 1,

      // controls whether the coin term(s) that comprise this node should be on backgrounds that look like cards
      onCard: false
    }, options );

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;
    this.createdCoinTermInitialCount = options.createdCoinTermInitialCount; // @public, read only
    this.typeID = typeID; // @public, read only

    // add the individual coin term node(s)
    var coinTermNodes = [];
    _.times( options.maxNumberShown, function( index ) {
      var coinTermNode;
      var coinTermNodeOptions = {
        addDragHandler: false,
        x: index * STAGGER_OFFSET,
        y: index * STAGGER_OFFSET
      };
      var dummyCoinTerm = coinTermCreatorFunction( typeID, {
        initialPosition: Vector2.ZERO,
        initialCount: options.createdCoinTermInitialCount,
        initiallyOnCard: options.onCard
      } );
      if ( typeID === CoinTermTypeID.CONSTANT ) {
        coinTermNode = new ConstantCoinTermNode( dummyCoinTerm, exploreModel.viewModeProperty, coinTermNodeOptions );
      }
      else {
        coinTermNode = new VariableCoinTermNode(
          dummyCoinTerm,
          exploreModel.viewModeProperty,
          exploreModel.showCoinValuesProperty,
          exploreModel.showVariableValuesProperty,
          exploreModel.showAllCoefficientsProperty,
          coinTermNodeOptions
        );
      }
      self.addChild( coinTermNode );
      coinTermNodes.push( coinTermNode );
    } );

    // control the visibility of the individual coin term nodes
    options.numberToShowProperty.link( function( numberToShow ) {

      self.pickable = numberToShow > 0;

      coinTermNodes.forEach( function( coinTermNode, index ) {
        coinTermNode.visible = index < numberToShow;
      } );

      if ( numberToShow === 0 ) {

        // show a faded version of the first node
        coinTermNodes[ 0 ].opacity = 0.4;
        coinTermNodes[ 0 ].visible = true;
      }
      else {
        coinTermNodes[ 0 ].opacity = 1;
      }
    } );

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
        createdCoinTerm = coinTermCreatorFunction( typeID, {
          initialPosition: originPosition,
          initialCount: options.createdCoinTermInitialCount,
          decomposable: options.createdCoinTermDecomposable,
          initiallyOnCard: options.onCard
        } );
        createdCoinTerm.setPositionAndDestination( initialPosition );
        createdCoinTerm.userControlledProperty.set( true );
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
        createdCoinTerm.userControlledProperty.set( false );
        createdCoinTerm = null;
      }
    } ) );
  }

  expressionExchange.register( 'CoinTermCreatorNode', CoinTermCreatorNode );

  return inherit( Node, CoinTermCreatorNode );
} );