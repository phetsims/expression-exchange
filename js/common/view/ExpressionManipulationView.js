// Copyright 2016-2022, University of Colorado Boulder

/**
 * a view node that allows the user to interact with coin terms to create and manipulate expressions
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import UndoButton from '../../../../scenery-phet/js/buttons/UndoButton.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Node, Path, PressListener } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EECollectionAreaNode from '../../game/view/EECollectionAreaNode.js';
import CoinTermHaloNode from './CoinTermHaloNode.js';
import ConstantCoinTermNode from './ConstantCoinTermNode.js';
import ExpressionHintNode from './ExpressionHintNode.js';
import ExpressionNode from './ExpressionNode.js';
import ExpressionOverlayNode from './ExpressionOverlayNode.js';
import VariableCoinTermNode from './VariableCoinTermNode.js';

class ExpressionManipulationView extends Node {

  /**
   * @param {ExpressionManipulationModel} model
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   */
  constructor( model, visibleBoundsProperty, options ) {

    options = merge( {
      coinTermBreakApartButtonMode: 'normal' // passed through to the coin terms
    }, options );

    super();

    // add the expression collection area nodes
    model.collectionAreas.forEach( collectionArea => {
      this.addChild( new EECollectionAreaNode( collectionArea ) );
    } );

    // add the node that will act as the layer where the expression backgrounds and expression hints will come and go
    const expressionLayer = new Node();
    this.addChild( expressionLayer );

    // add the node that will act as the layer where the coin term halos will come and go
    const coinHaloLayer = new Node();
    this.addChild( coinHaloLayer );

    // add the node that will act as the layer where the coin terms will come and go
    const coinTermLayer = new Node();
    this.coinTermLayer = coinTermLayer; // @private, used by a method
    this.addChild( coinTermLayer );

    // add the node that will act as the layer where the expression overlays will come and go
    const expressionOverlayLayer = new Node();
    this.addChild( expressionOverlayLayer );

    // add the buttons for ejecting expressions from the collection area, must be above the expressions in the z-order
    model.collectionAreas.forEach( collectionArea => {
      const undoButton = new UndoButton( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        listener: () => { collectionArea.ejectCollectedItem(); },
        leftTop: collectionArea.bounds.leftTop
      } );
      this.addChild( undoButton );

      // control the visibility of the undo button
      Multilink.multilink(
        [ collectionArea.undoAllowedProperty, collectionArea.collectedItemProperty ],
        ( undoAllowed, collectedItem ) => {
          undoButton.visible = undoAllowed && collectedItem !== null;
        }
      );
    } );

    // add the node that will act as the barrier to interaction with other expressions when editing an expression
    let barrierRectangleBounds = null;
    const barrierRectanglePath = new Path( null, {
      fill: 'rgba( 100, 100, 100, 0.5 )',
      visible: false, // initially invisible, will become visible when editing an expression
      cursor: 'pointer'
    } );
    this.addChild( barrierRectanglePath );

    // Add a listener to the barrier rectangle that will exit the expression editing mode when clicked upon.
    barrierRectanglePath.addInputListener( new PressListener( {
      release: () => {
        if ( !model.isAnythingUserControlled() ) {
          model.stopEditingExpression();
        }
      }
    } ) );

    // define a function that will update the shape of the barrier rectangle
    function updateBarrierRectangle() {
      const barrierRectangleShape = Shape.bounds( barrierRectangleBounds );
      if ( model.expressionBeingEditedProperty.get() ) {
        const barrierRectangleHoleBounds = model.expressionBeingEditedProperty.get().getBounds();
        // note - must travel counterclockwise to create a hole
        barrierRectangleShape.moveTo( barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.minY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.maxY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.maxY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.minY );
        barrierRectangleShape.close();
      }
      barrierRectanglePath.setShape( barrierRectangleShape );
    }

    // monitor the view bounds and update the barrier rectangle size
    visibleBoundsProperty.link( visibleBounds => {

      // update the size of the barrier rectangle
      barrierRectangleBounds = visibleBounds;
      updateBarrierRectangle();
    } );

    // show the barrier rectangle when an expression is being edited
    let updateHoleMultilink = null;
    model.expressionBeingEditedProperty.link( ( currentExpressionBeingEdited, previousExpressionBeingEdited ) => {

      // if there is an expression being edited, the barrier rectangle should be visible
      barrierRectanglePath.visible = currentExpressionBeingEdited !== null;

      // if there previously was an expression being edited, we need to release the multilink that was watching its size
      if ( previousExpressionBeingEdited ) {
        assert && assert( updateHoleMultilink, 'expected a multilink to be present' );
        Multilink.unmultilink( updateHoleMultilink );
        updateHoleMultilink = null;
      }

      // If there is a new expression being edited, we need to listen to its size and adjust the hole in the barrier if
      // the size changes.
      if ( currentExpressionBeingEdited !== null ) {
        updateHoleMultilink = Multilink.multilink(
          [
            currentExpressionBeingEdited.upperLeftCornerProperty,
            currentExpressionBeingEdited.widthProperty,
            currentExpressionBeingEdited.heightProperty
          ],
          () => {
            updateBarrierRectangle();
          }
        );
      }
    } );

    // add and remove coin nodes as coins are added and removed from the model
    model.coinTerms.addItemAddedListener( addedCoinTerm => {

      // add the appropriate representation for the coin term
      let coinTermNode;
      if ( addedCoinTerm.isConstant ) {
        coinTermNode = new ConstantCoinTermNode(
          addedCoinTerm,
          model.viewModeProperty,
          {
            addDragHandler: true,
            dragBounds: visibleBoundsProperty.get(),
            breakApartButtonMode: options.coinTermBreakApartButtonMode
          }
        );
      }
      else {
        coinTermNode = new VariableCoinTermNode(
          addedCoinTerm,
          model.viewModeProperty,
          model.showCoinValuesProperty,
          model.showVariableValuesProperty,
          model.showAllCoefficientsProperty,
          {
            addDragHandler: true,
            dragBounds: visibleBoundsProperty.get(),
            breakApartButtonMode: options.coinTermBreakApartButtonMode
          }
        );
      }

      coinTermLayer.addChild( coinTermNode );

      // add the coin halo
      const coinTermHaloNode = new CoinTermHaloNode( addedCoinTerm, model.viewModeProperty );
      coinHaloLayer.addChild( coinTermHaloNode );

      // set up a listener to remove the nodes when the corresponding coin is removed from the model
      model.coinTerms.addItemRemovedListener( function removalListener( removedCoinTerm ) {
        if ( removedCoinTerm === addedCoinTerm ) {
          coinTermLayer.removeChild( coinTermNode );
          coinTermNode.dispose();
          coinHaloLayer.removeChild( coinTermHaloNode );
          coinTermHaloNode.dispose();
          model.coinTerms.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // add and remove expressions and expression overlays as they come and go
    model.expressions.addItemAddedListener( addedExpression => {

      const expressionNode = new ExpressionNode( addedExpression, model.simplifyNegativesProperty );
      expressionLayer.addChild( expressionNode );

      const expressionOverlayNode = new ExpressionOverlayNode( addedExpression, visibleBoundsProperty.get() );
      expressionOverlayLayer.addChild( expressionOverlayNode );

      // set up a listener to remove these nodes when the corresponding expression is removed from the model
      model.expressions.addItemRemovedListener( function removalListener( removedExpression ) {
        if ( removedExpression === addedExpression ) {
          expressionLayer.removeChild( expressionNode );
          expressionNode.dispose();
          expressionOverlayLayer.removeChild( expressionOverlayNode );
          expressionOverlayNode.dispose();
          model.expressions.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // add and remove expression hints as they come and go
    model.expressionHints.addItemAddedListener( addedExpressionHint => {

      const expressionHintNode = new ExpressionHintNode( addedExpressionHint, model.viewModeProperty );
      expressionLayer.addChild( expressionHintNode );

      // set up a listener to remove the hint node when the corresponding hint is removed from the model
      model.expressionHints.addItemRemovedListener( function removalListener( removedExpressionHint ) {
        if ( removedExpressionHint === addedExpressionHint ) {
          expressionLayer.removeChild( expressionHintNode );
          expressionHintNode.dispose();
          model.expressionHints.removeItemRemovedListener( removalListener );
        }
      } );
    } );
  }

  /**
   * get the view node for the provided coin term model element
   * @param {CoinTerm} coinTerm
   * @returns {AbstractCoinTermNode}
   * @public
   */
  getViewForCoinTerm( coinTerm ) {
    return this.coinTermLayer.children.find( coinTermNode => coinTermNode.coinTerm === coinTerm );
  }
}

expressionExchange.register( 'ExpressionManipulationView', ExpressionManipulationView );

export default ExpressionManipulationView;