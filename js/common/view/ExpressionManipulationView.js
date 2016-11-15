// Copyright 2016, University of Colorado Boulder

/**
 * a view node that allows the user to interact with coin terms to create and manipulate expressions
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Carousel = require( 'SUN/Carousel' );
  var CoinTermCreatorSet = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSet' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorNode' );
  var CoinTermHaloNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermHaloNode' );
  var ConstantCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/ConstantCoinTermNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionHintNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionHintNode' );
  var ExpressionNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionNode' );
  var ExpressionOverlayNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionOverlayNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );

  // constants
  var MAX_COIN_TERMS_PER_TYPE = 8;

  /**
   * @param {ExpressionManipulationModel} model
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @constructor
   */
  function ExpressionManipulationView( model, visibleBoundsProperty ) {

    Node.call( this );
    var self = this;

    this.coinTermCreatorBox = null; // @public, read only
    this.negativeTermsPresent = false; // @public, read only

    // descriptors that list the coin terms available to the user in the carousel and their initial count
    this.coinTermCreatorDescriptors = []; // @public, read only

    // create the collection of coin term creator nodes that will be presented to the user, varies based on options
    var itemsPerCarouselPage = 3;
    var carouselItemSpacing = 45; // empirically determined to handle the worst case term text
    if ( model.coinTermCollection === CoinTermCreatorSet.BASIC ) {
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Z, initialCount: 1 } );
    }
    else if ( model.coinTermCollection === CoinTermCreatorSet.EXPLORE ) {
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Z, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 2 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 3 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_TIMES_Y, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED, initialCount: 1 } );
    }
    else if ( model.coinTermCollection === CoinTermCreatorSet.ADVANCED ) {
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.CONSTANT, initialCount: 1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: -1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: -1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: -1 } );
      this.coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.CONSTANT, initialCount: -1 } );
      itemsPerCarouselPage = 4; // this set works better with four items per page
      carouselItemSpacing = 40; // can be a bit smaller in this case because the largest term (x^2*y^2) isn't being used
    }
    else {
      assert( false, 'unknown value for coinTermCollection' );
    }

    // create the set of coin term creator nodes that will appear in the carousel
    var coinTermCreatorSet = [];

    this.coinTermCreatorDescriptors.forEach( function( coinTermCreatorDescriptor ) {

      // select the appropriate property from the model so that positive and negative counts are property tracked
      var createdCountProperty;
      if ( coinTermCreatorDescriptor.initialCount > 0 ) {
        createdCountProperty = model.getPositiveCountPropertyForType( coinTermCreatorDescriptor.typeID );
      }
      else {
        createdCountProperty = model.getNegativeCountPropertyForType( coinTermCreatorDescriptor.typeID );
      }

      // create the "creator node" and put it on the list of those that will be shown at the bottom of the view
      coinTermCreatorSet.push( new CoinTermCreatorNode(
        model,
        coinTermCreatorDescriptor.typeID,
        model.coinTermFactory.createCoinTerm.bind( model.coinTermFactory ),
        {
          initialCount: coinTermCreatorDescriptor.initialCount,
          creationLimit: MAX_COIN_TERMS_PER_TYPE,
          createdCountProperty: createdCountProperty,
          dragBounds: visibleBoundsProperty.get()
        }
      ) );

      // if one or more has a negative initial count, negatives should be shown in the collection
      if ( coinTermCreatorDescriptor.initialCount < 0 ) {
        self.negativeTermsPresent = true;
      }
    } );

    // add the panel or carousel that will contain the various coin terms that the user can create
    var coinTermHolderCenterX = visibleBoundsProperty.get().width / 2;
    var coinTermHolderBottom = visibleBoundsProperty.get().height - 50;
    if ( coinTermCreatorSet.length > 3 ) {
      this.coinTermCreatorBox = new Carousel( coinTermCreatorSet, {
        centerX: coinTermHolderCenterX,
        bottom: coinTermHolderBottom,
        itemsPerPage: itemsPerCarouselPage,
        spacing: carouselItemSpacing
      } );
    }
    else {
      // use a panel instead of a carousel
      // Many of the numbers in the following constructors were empirically determined to match the size of the
      // carousels on the other screens.
      var coinTermCreatorHBox = new HBox( { children: coinTermCreatorSet, spacing: 75, resize: false } );
      this.coinTermCreatorBox = new Panel( coinTermCreatorHBox, {
        centerX: coinTermHolderCenterX,
        bottom: coinTermHolderBottom,
        cornerRadius: 4,
        xMargin: 75,
        yMargin: 14,
        resize: false
      } );
    }
    this.addChild( this.coinTermCreatorBox );

    // add the node that will act as the layer where the expression backgrounds and expression hints will come and go
    var expressionLayer = new Node();
    this.addChild( expressionLayer );

    // add the node that will act as the layer where the coin halos will come and go
    var coinHaloLayer = new Node();
    this.addChild( coinHaloLayer );

    // add the node that will act as the layer where the coins will come and go
    var coinLayer = new Node();
    this.addChild( coinLayer );

    // add the node that will act as the layer where the expression overlays will come and go
    var expressionOverlayLayer = new Node();
    this.addChild( expressionOverlayLayer );

    // TODO: Consider putting the barrier rectangle into its own class for modularity
    // add the node that will act as the barrier to interaction with other expressions when editing an expression
    var barrierRectangleBounds = null;
    var barrierRectangleShape = new Shape();
    var barrierRectanglePath = new Path( barrierRectangleShape, {
      fill: 'rgba( 100, 100, 100, 0.5 )',
      visible: false, // initially invisible, will become visible when editing an expression
      cursor: 'pointer'
    } );
    this.addChild( barrierRectanglePath );

    // add a listener to the barrier rectangle that will exit the expression editing mode when clicked upon
    var barrierRectangleArmedForRemoval = false;
    barrierRectanglePath.addInputListener( {

      down: function() {
        barrierRectangleArmedForRemoval = true;
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
      barrierRectangleShape = Shape.rect(
        barrierRectangleBounds.minX,
        barrierRectangleBounds.minY,
        barrierRectangleBounds.maxX - barrierRectangleBounds.minX,
        barrierRectangleBounds.maxY - barrierRectangleBounds.minY
      );
      if ( model.expressionBeingEditedProperty.get() ) {
        var barrierRectangleHoleBounds = model.expressionBeingEditedProperty.get().getBounds();
        // note - must travel counterclockwise to create a hole
        barrierRectangleShape.moveTo( barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.minY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.maxY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.maxY );
        barrierRectangleShape.lineTo( barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.minY );
        barrierRectangleShape.moveTo( barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.minY );
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
          model.simplifyNegativesProperty,
          { addDragHandler: true, dragBounds: visibleBoundsProperty.get() }
        );
      }
      else {
        coinTermNode = new VariableCoinTermNode(
          addedCoinTerm,
          model.viewModeProperty,
          model.showCoinValuesProperty,
          model.showVariableValuesProperty,
          model.showAllCoefficientsProperty,
          { addDragHandler: true, dragBounds: visibleBoundsProperty.get() }
        );
      }

      coinLayer.addChild( coinTermNode );

      // Add a listener to the coin to detect when it overlaps with the carousel, at which point it will be removed
      // from the model.
      addedCoinTerm.userControlledProperty.onValue( false, function() {

        // remove the coin term if it was released over the carousel, but check first to make sure that this event
        // didn't already cause the coin term to join up with an expression or another coin term
        if ( coinTermNode.bounds.intersectsBounds( self.coinTermCreatorBox.bounds ) &&
             model.coinTerms.contains( addedCoinTerm ) &&
             addedCoinTerm.inProgressAnimationProperty.get() === ( null ) &&
             !model.isCoinTermInExpression( addedCoinTerm ) ) {
          model.removeCoinTerm( addedCoinTerm, true );
        }

      } );

      // add the coin halo
      var coinTermHaloNode = new CoinTermHaloNode( addedCoinTerm, model.viewModeProperty );
      coinHaloLayer.addChild( coinTermHaloNode );

      // set up a listener to remove the nodes when the corresponding coin is removed from the model
      model.coinTerms.addItemRemovedListener( function removalListener( removedCoin ) {
        if ( removedCoin === addedCoinTerm ) {
          coinLayer.removeChild( coinTermNode );
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

      // Add a listener to the expression to detect when it overlaps with the panel or carousel, at which point it will
      // be removed from the model.
      addedExpression.userControlledProperty.onValue( false, function() {
        if ( addedExpression.getBounds().intersectsBounds( self.coinTermCreatorBox.bounds ) ) {
          model.removeExpression( addedExpression );
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

    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );