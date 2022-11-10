// Copyright 2016-2022, University of Colorado Boulder

/**
 * a UI component that is used to create coin terms when clicked upon
 *
 * This is generally used in a carousel or other "creator box".  There are a few sim-specific items currently used, but
 * this could probably be generalized fairly easily so that it could be reused in similar situations.  My (jbphet)
 * initial thoughts are that we would need to decide whether to extract much of the functionality into a base class
 * and derive subclasses to handle sim-specific behavior, or have some sort of options that could make it work in all
 * cases.
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import ConstantCoinTermNode from './ConstantCoinTermNode.js';
import VariableCoinTermNode from './VariableCoinTermNode.js';

// constants
const STAGGER_OFFSET = 3; // in screen coordinates, empirically determined for optimal look

class CoinTermCreatorNode extends Node {

  /**
   * @param {ExpressionManipulationModel} expressionManipulationModel - model where coin terms are to be added
   * @param {ExpressionManipulationView} expressionManipulationView - view where coin term nodes will be shown
   * @param {CoinTermTypeID} typeID - type of coin term to create
   * @param {function} coinTermCreatorFunction - function( {CoinTermTypeID}, options ) : {CoinTerm} - creates the coin
   * term model elements that are added to the model, also used for creating "dummy" instances to associate with the
   * view nodes that collectively comprise the constructed creator node
   * @param {Object} [options]
   */
  constructor( expressionManipulationModel, expressionManipulationView, typeID, coinTermCreatorFunction, options ) {

    options = merge( {

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

    super( { cursor: 'pointer' } );
    const self = this;

    // @public (read-only) {number} - initial count of the coin term created by this creator node, a.k.a. the coefficient
    this.createdCoinTermInitialCount = options.createdCoinTermInitialCount;

    this.typeID = typeID; // @public (read-only) {CoinTermID}

    // add the individual coin term node(s)
    const coinTermNodes = [];
    _.times( options.maxNumberShown, index => {
      let coinTermNode;
      const coinTermNodeOptions = {
        addDragHandler: false,
        x: index * STAGGER_OFFSET,
        y: index * STAGGER_OFFSET
      };
      const dummyCoinTerm = coinTermCreatorFunction( typeID, {
        initialPosition: Vector2.ZERO,
        initialCount: options.createdCoinTermInitialCount,
        initiallyOnCard: options.onCard
      } );
      if ( typeID === CoinTermTypeID.CONSTANT ) {
        coinTermNode = new ConstantCoinTermNode(
          dummyCoinTerm,
          expressionManipulationModel.viewModeProperty,
          coinTermNodeOptions
        );
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
      this.addChild( coinTermNode );
      coinTermNodes.push( coinTermNode );
    } );

    // create a listener that changes the visibility of individual nodes as the number to show changes
    function numberToShowListener( numberToShow ) {

      self.pickable = numberToShow > 0;

      coinTermNodes.forEach( ( coinTermNode, index ) => {
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
    }

    // control the visibility of the individual coin term nodes
    options.numberToShowProperty.link( numberToShowListener );

    // Add the listener that will allow the user to click on this node and create a new coin term, and then position it
    // in the model.  This works by forwarding the events it receives to the node that gets created in the view.
    this.addInputListener( DragListener.createForwardingListener( event => {

        // Determine the origin position of the new element based on where the creator node is.  This is done so that
        // the position to which this element will return when it is "put away" will match the position of this creator
        // node.
        const originPosition = expressionManipulationView.globalToLocalPoint( this.localToGlobalPoint( Vector2.ZERO ) );

        // Determine the initial position where this element should move to after it's created based on the position of
        // the pointer event.
        const initialPosition = expressionManipulationView.globalToLocalPoint( event.pointer.point );

        // create and add the new coin term to the model, which result in a node being created in the view
        const createdCoinTerm = coinTermCreatorFunction( typeID, {
          initialPosition: originPosition,
          initialCount: options.createdCoinTermInitialCount,
          decomposable: options.createdCoinTermDecomposable,
          initiallyOnCard: options.onCard
        } );
        createdCoinTerm.setPositionAndDestination( initialPosition );
        expressionManipulationModel.addCoinTerm( createdCoinTerm );

        // get the view node that should have appeared in the view so that events can be forwarded to its drag handler
        const createdCoinTermView = expressionManipulationView.getViewForCoinTerm( createdCoinTerm );
        assert && assert( createdCoinTermView, 'unable to find coin term view' );

        if ( createdCoinTermView ) {

          // forward the event to the view node's drag handler
          createdCoinTermView.dragHandler.press( event, createdCoinTermView );
        }
      },
      {
        allowTouchSnag: true
      }
    ) );

    // dispose function
    this.disposeCoinTermCreatorNode = function() {
      coinTermNodes.forEach( coinTermNode => {
        coinTermNode.dispose();
      } );
      options.numberToShowProperty.unlink( numberToShowListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeCoinTermCreatorNode();
    super.dispose();
  }
}

expressionExchange.register( 'CoinTermCreatorNode', CoinTermCreatorNode );

export default CoinTermCreatorNode;
