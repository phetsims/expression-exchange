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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var STAGGER_OFFSET = 3; // in screen coordinates, empirically determined for optimal look

  /**
   * @param {ExpressionManipulationModel} expressionManipulationModel - model where coin terms are to be added
   * @param {ExpressionManipulationView} expressionManipulationView - view where coin terms will be shown
   * @param {CoinTermTypeID} typeID - type of coin term to create
   * @param {function} coinTermCreatorFunction - the function that will be invoked in order to create the coin term
   * model element.  This will be used for creating the elements that are added to the model, and also for creating
   * "dummy" instances to associate with the view nodes that collectively comprise the constructed creator node.
   * @param {Object} options
   * @constructor
   */
  function CoinTermCreatorNode( expressionManipulationModel,
                                expressionManipulationView,
                                typeID,
                                coinTermCreatorFunction,
                                options ) {

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
        coinTermNode = new ConstantCoinTermNode( dummyCoinTerm, expressionManipulationModel.viewModeProperty, coinTermNodeOptions );
      }
      else {
        coinTermNode = new VariableCoinTermNode(
          dummyCoinTerm,
          expressionManipulationModel.viewModeProperty,
          expressionManipulationModel.showCoinValuesProperty,
          expressionManipulationModel.showVariableValuesProperty,
          expressionManipulationModel.showAllCoefficientsProperty,
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
    var createdCoinTermView = null;

    // Add the listener that will allow the user to click on this node and create a new coin, then position it in the
    // model.  This works by forwarding the events it receives to the node that gets created in the model.
    this.addInputListener( new SimpleDragHandler( {

      // allow moving a finger (on a touchscreen) dragged across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {

        // Determine the origin position of the new element based on where the creator node is.  This is done so that
        // the position to which this element will return when sent to the origin will match the position of this
        // creator node.
        var originPosition = expressionManipulationView.globalToLocalPoint( self.localToGlobalPoint( Vector2.ZERO ) );

        // Now determine the initial position where this element should move to after it's created, which corresponds
        // to the location of the mouse or touch event.
        var initialPosition = expressionManipulationView.globalToLocalPoint( event.pointer.point );

        // create and add the new coin term
        var createdCoinTerm = coinTermCreatorFunction( typeID, {
          initialPosition: originPosition,
          initialCount: options.createdCoinTermInitialCount,
          decomposable: options.createdCoinTermDecomposable,
          initiallyOnCard: options.onCard
        } );
        createdCoinTerm.setPositionAndDestination( initialPosition );
        //createdCoinTerm.userControlledProperty.set( true );
        expressionManipulationModel.addCoinTerm( createdCoinTerm );
        createdCoinTermView = expressionManipulationView.getViewForCoinTerm( createdCoinTerm );
        assert && assert( createdCoinTermView, 'unable to find coin term view' );

        // forward the event to the view node's drag handler
        createdCoinTermView.dragHandler.movableDragHandlerStart( event, trail );
      },

      drag: function( event, trail ) {

        // forward this event to the view node's drag handler
        createdCoinTermView.dragHandler.movableDragHandlerDrag( event, trail );
      },

      end: function( event, trail ) {

        // forward this event to the view node's drag handler
        createdCoinTermView.dragHandler.movableDragHandlerEnd( event, trail );
      }
    } ) );
  }

  expressionExchange.register( 'CoinTermCreatorNode', CoinTermCreatorNode );

  return inherit( Node, CoinTermCreatorNode );
} );