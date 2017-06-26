// Copyright 2016, University of Colorado Boulder

/**
 * a view node that allows the user to interact with coin terms to create and manipulate expressions
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermHaloNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermHaloNode' );
  var ConstantCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/ConstantCoinTermNode' );
  var EECollectionAreaNode = require( 'EXPRESSION_EXCHANGE/game/view/EECollectionAreaNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionHintNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionHintNode' );
  var ExpressionNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionNode' );
  var ExpressionOverlayNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionOverlayNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var UndoButton = require( 'EXPRESSION_EXCHANGE/game/view/UndoButton' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );

  /**
   * @param {ExpressionManipulationModel} model
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   * @constructor
   */
  function ExpressionManipulationView( model, visibleBoundsProperty, options ) {

    var self = this;
    options = _.extend( {
      coinTermBreakApartButtonMode: 'normal' // passed through to the coin terms
    }, options );

    Node.call( this );

    // add the expression collection area nodes
    model.collectionAreas.forEach( function( collectionArea ) {
      self.addChild( new EECollectionAreaNode( collectionArea ) );
    } );

    // add the node that will act as the layer where the expression backgrounds and expression hints will come and go
    var expressionLayer = new Node();
    this.addChild( expressionLayer );

    // add the node that will act as the layer where the coin term halos will come and go
    var coinHaloLayer = new Node();
    this.addChild( coinHaloLayer );

    // add the node that will act as the layer where the coin terms will come and go
    var coinTermLayer = new Node();
    this.coinTermLayer = coinTermLayer; // @private, used by a method
    this.addChild( coinTermLayer );

    // add the node that will act as the layer where the expression overlays will come and go
    var expressionOverlayLayer = new Node();
    this.addChild( expressionOverlayLayer );

    // add the buttons for ejecting expressions from the collection area, must be above the expressions in the z-order
    model.collectionAreas.forEach( function( collectionArea ) {
      var undoButton = new UndoButton( {
        listener: function() { collectionArea.ejectCollectedItem(); },
        leftTop: collectionArea.bounds.leftTop
      } );
      self.addChild( undoButton );

      // control the visibility of the undo button
      Property.multilink(
        [ collectionArea.undoAllowedProperty, collectionArea.collectedItemProperty ],
        function( undoAllowed, collectedItem ) {
          undoButton.visible = undoAllowed && collectedItem !== null;
        }
      );
    } );

    // add the node that will act as the barrier to interaction with other expressions when editing an expression
    var barrierRectangleBounds = null;
    var barrierRectanglePath = new Path( null, {
      fill: 'rgba( 100, 100, 100, 0.5 )',
      visible: false, // initially invisible, will become visible when editing an expression
      cursor: 'pointer'
    } );
    this.addChild( barrierRectanglePath );

    // TODO: Temp code for debugger fuzz test error
    if ( !window.phet.exex ) {
      window.phet.exex = {};
      window.phet.exex.barrierRects = [];
    }
    window.phet.exex.barrierRects.push( barrierRectanglePath );

    // add a listener to the barrier rectangle that will exit the expression editing mode when clicked upon
    var barrierRectangleArmedForRemoval = false;
    barrierRectanglePath.addInputListener( {

      down: function() {
        if ( !model.isAnythingUserControlled() ) {
          barrierRectangleArmedForRemoval = true;
        }
      },

      up: function() {
        if ( barrierRectangleArmedForRemoval ) {
          model.stopEditingExpression();
          barrierRectangleArmedForRemoval = false;
        }
      }
    } );

    // define a function that will update the shape of the barrier rectangle
    function updateBarrierRectangle() {
      var barrierRectangleShape = Shape.bounds( barrierRectangleBounds );
      if ( model.expressionBeingEditedProperty.get() ) {
        var barrierRectangleHoleBounds = model.expressionBeingEditedProperty.get().getBounds();
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
    visibleBoundsProperty.link( function( visibleBounds ) {

      // update the size of the barrier rectangle
      barrierRectangleBounds = visibleBounds;
      updateBarrierRectangle();
    } );

    // show the barrier rectangle when an expression is being edited
    var updateHoleMultilink = null;
    model.expressionBeingEditedProperty.link( function( currentExpressionBeingEdited, previousExpressionBeingEdited ) {

      // if there is an expression being edited, the barrier rectangle should be visible
      barrierRectanglePath.visible = currentExpressionBeingEdited !== null;

      // if there previously was an expression being edited, we need to release the multilink that was watching its size
      if ( previousExpressionBeingEdited ) {
        assert && assert( updateHoleMultilink, 'expected a multilink to be present' );
        Property.unmultilink( updateHoleMultilink );
        updateHoleMultilink = null;
      }

      // If there is a new expression being edited, we need to listen to its size and adjust the hole in the barrier if
      // the size changes.
      if ( currentExpressionBeingEdited !== null ) {
        updateHoleMultilink = Property.multilink(
          [
            currentExpressionBeingEdited.upperLeftCornerProperty,
            currentExpressionBeingEdited.widthProperty,
            currentExpressionBeingEdited.heightProperty
          ],
          function() {
            updateBarrierRectangle();
          }
        );
      }
    } );

    // add and remove coin nodes as coins are added and removed from the model
    model.coinTerms.addItemAddedListener( function( addedCoinTerm ) {

      // add the appropriate representation for the coin term
      var coinTermNode;
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
      var coinTermHaloNode = new CoinTermHaloNode( addedCoinTerm, model.viewModeProperty );
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
    model.expressions.addItemAddedListener( function( addedExpression ) {

      var expressionNode = new ExpressionNode( addedExpression, model.simplifyNegativesProperty );
      expressionLayer.addChild( expressionNode );

      var expressionOverlayNode = new ExpressionOverlayNode( addedExpression, visibleBoundsProperty.get() );
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
    model.expressionHints.addItemAddedListener( function( addedExpressionHint ) {

      var expressionHintNode = new ExpressionHintNode( addedExpressionHint, model.viewModeProperty );
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

  expressionExchange.register( 'ExpressionManipulationView', ExpressionManipulationView );

  return inherit( Node, ExpressionManipulationView, {

    /**
     * get the view node for the provided coin term model element
     * @param {CoinTerm} coinTerm
     * @returns {AbstractCoinTermNode}
     * @public
     */
    getViewForCoinTerm: function( coinTerm ) {
      var coinTermView = _.find( this.coinTermLayer.children, function( coinTermNode ) {
        return coinTermNode.coinTerm === coinTerm;
      } );
      return coinTermView;
    }

  } );
} );