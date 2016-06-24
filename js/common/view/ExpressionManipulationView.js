// Copyright 2016, University of Colorado Boulder

/**
 * main view for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ABSwitch = require( 'SUN/ABSwitch' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/model/AllowedRepresentationsEnum' );
  var Carousel = require( 'SUN/Carousel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorSet = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSet' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorNode' );
  var CoinTermHaloNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermHaloNode' );
  var CollectionDisplayNode = require( 'EXPRESSION_EXCHANGE/common/view/CollectionDisplayNode' );
  var ConstantCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/ConstantCoinTermNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionHintNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionHintNode' );
  var ExpressionNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionNode' );
  var ExpressionOverlayNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionOverlayNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VariableCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/VariableCoinTermNode' );
  var VariableValueControl = require( 'EXPRESSION_EXCHANGE/common/view/VariableValueControl' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var allCoefficientsString = require( 'string!EXPRESSION_EXCHANGE/allCoefficients' );
  var coinValuesString = require( 'string!EXPRESSION_EXCHANGE/coinValues' );
  var myCollectionString = require( 'string!EXPRESSION_EXCHANGE/myCollection' );
  var numberCentsString = require( 'string!EXPRESSION_EXCHANGE/numberCents' );
  var simplifyNegativesString = require( 'string!EXPRESSION_EXCHANGE/simplifyNegatives' );
  var totalString = require( 'string!EXPRESSION_EXCHANGE/total' );
  var valuesString = require( 'string!EXPRESSION_EXCHANGE/values' );
  var variableValuesString = require( 'string!EXPRESSION_EXCHANGE/variableValues' );

  // images
  var switchCoinImage = require( 'mipmap!EXPRESSION_EXCHANGE/switch-coin.png' );

  // constants
  var ACCORDION_BOX_TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );
  var ACCORDION_BOX_BUTTON_X_MARGIN = 8;
  var ACCORDION_BOX_BUTTON_Y_MARGIN = 4;
  var ACCORDION_BOX_CORNER_RADIUS = 7;
  var CHECK_BOX_FONT = new PhetFont( { size: 16 } );
  var CHECK_BOX_VERTICAL_SPACING = 6;
  var INSET = 10; // inset from edges of layout bounds, in screen coords
  var MAX_COIN_TERMS_PER_TYPE = 10;
  var FLOATING_PANEL_INSET = 10;

  /**
   * @param {ExpressionManipulationModel} model
   * @constructor
   */
  function ExpressionManipulationView( model ) {

    ScreenView.call( this );
    var self = this;

    // create the readout that will display the total accumulated value, use max length string initially
    var totalValueText = new Text( StringUtils.format( numberCentsString, 9999 ), { font: new PhetFont( { size: 14 } ) } );
    var totalValueReadoutWidth = totalValueText.width + 20;
    var totalValueReadout = new Panel( totalValueText, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 5,
      xMargin: 10,
      align: 'center',
      minWidth: totalValueReadoutWidth,
      maxWidth: totalValueReadoutWidth
    } );
    Property.multilink(
      [ model.totalValueProperty, model.viewModeProperty ],
      function( totalValue ) {
        if ( model.viewMode === ViewMode.COINS ) {
          totalValueText.text = StringUtils.format( numberCentsString, totalValue );
        }
        else {
          totalValueText.text = totalValue;
        }
      }
    );

    // add accordion box that will contain the total value readout
    var totalValueAccordionBox = new AccordionBox( totalValueReadout, {
      titleNode: new Text( totalString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      left: INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      minWidth: totalValueReadout.width * 1.8 // multiplier empirically determined
    } );
    this.addChild( totalValueAccordionBox );

    // create the control that will allow the user to manipulate variable values
    var variableValueControl = new VariableValueControl(
      model.xTermValueProperty,
      model.yTermValueProperty,
      model.zTermValueProperty,
      model.coinTermCollection === CoinTermCreatorSet.ADVANCED ? -10 : 1, // negative var values allowed for advanced screen
      10
    );

    // add the variable value control to an accordion box, and add the accordion box to the view
    var variableValuesAccordionBox = new AccordionBox( variableValueControl, {
      titleNode: new Text( valuesString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      contentYMargin: 20,
      left: INSET,
      top: totalValueAccordionBox.bottom + 10,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN
    } );
    variableValuesAccordionBox.expandedProperty.value = false; // initially closed
    this.addChild( variableValuesAccordionBox );

    // the values control is only visible when in variable mode
    model.viewModeProperty.link( function( viewMode ) {
      variableValuesAccordionBox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // variables used to create the coin term creator nodes
    var coinTermFactory = model.coinTermFactory; // convenience var

    // descriptors that list the coin terms available to the user in the carousel and their initial count
    var coinTermCreatorDescriptors = [];

    // create the collection of coin term creator nodes that will be presented to the user, varies based on options
    var itemsPerCarouselPage = 3;
    var carouselItemSpacing = 60; // empirically determined to handle the worst case term text
    if ( model.coinTermCollection === CoinTermCreatorSet.BASIC ) {
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Z, initialCount: 1 } );
    }
    else if ( model.coinTermCollection === CoinTermCreatorSet.EXPLORE ) {
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Z, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 2 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 3 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_TIMES_Y, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED, initialCount: 1 } );
    }
    else if ( model.coinTermCollection === CoinTermCreatorSet.ADVANCED ) {
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.CONSTANT, initialCount: 1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X_SQUARED, initialCount: -1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.X, initialCount: -1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.Y, initialCount: -1 } );
      coinTermCreatorDescriptors.push( { typeID: CoinTermTypeID.CONSTANT, initialCount: -1 } );
      itemsPerCarouselPage = 4; // this set works better with four items per page
      carouselItemSpacing = 40; // can be a bit smaller in this case because the largest term (x^2*y^2) isn't being used
    }
    else {
      assert( false, 'unknown value for coinTermCollection' );
    }

    // flag that is set when negative terms exist in the creator set and can thus be created by the user
    var negativeTermsPresent = false;

    // create the set of coin term creator nodes that will appear in the carousel
    var coinTermCreatorSet = [];

    coinTermCreatorDescriptors.forEach( function( coinTermCreatorDescriptor ){

      // select the appropriate property from the model so that positive and negative counts are property tracked
      var createdCountProperty;
      if ( coinTermCreatorDescriptor.initialCount > 0 ){
        createdCountProperty = model.getPositiveCountPropertyForType( coinTermCreatorDescriptor.typeID );
      }
      else{
        createdCountProperty = model.getNegativeCountPropertyForType( coinTermCreatorDescriptor.typeID );
      }

      // create the "creator node" and put it on the list of those that will be shown at the bottom of the view
      coinTermCreatorSet.push( new CoinTermCreatorNode(
        model,
        coinTermCreatorDescriptor.typeID,
        coinTermFactory.createCoinTerm.bind( coinTermFactory ),
        {
          initialCount: coinTermCreatorDescriptor.initialCount,
          creationLimit: MAX_COIN_TERMS_PER_TYPE,
          createdCountProperty: createdCountProperty
        }
      ) );

      // if one or more has a negative initial count, negatives should be shown in the collection
      if ( coinTermCreatorDescriptor.initialCount < 0 ){
        negativeTermsPresent = true;
      }
    } );

    // add the panel or carousel that will contain the various coin terms that the user can create
    var coinTermCreatorHolder;
    var coinTermHolderCenterX = this.layoutBounds.width / 2;
    var coinTermHolderBottom = this.layoutBounds.height - 50;
    if ( coinTermCreatorSet.length > 3 ) {
      coinTermCreatorHolder = new Carousel( coinTermCreatorSet, {
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
      coinTermCreatorHolder = new Panel( coinTermCreatorHBox, {
        centerX: coinTermHolderCenterX,
        bottom: coinTermHolderBottom,
        cornerRadius: 4,
        xMargin: 75,
        yMargin: 14,
        resize: false
      } );
    }
    this.addChild( coinTermCreatorHolder );

    // if both representations are allowed, add the switch for switching between coin and term view
    if ( model.allowedRepresentations === AllowedRepresentationsEnum.COINS_AND_VARIABLES ) {

      var coinImageNode = new Image( switchCoinImage, { scale: 0.6 } ); // scale empirically determined

      // enclose the variable text in a node so that its vertical position can be accurately set
      var variableIconNode = new Node( {
        children: [
          new VStrut( coinImageNode.bounds.height ),
          new Text( EESharedConstants.X_VARIABLE_CHAR, {
            font: new MathSymbolFont( 36 ),
            boundsMethod: 'accurate',
            centerX: 0,
            centerY: coinImageNode.height / 2
          } )
        ]
      } );

      // add the switch
      this.addChild( new ABSwitch(
        model.viewModeProperty,
        ViewMode.COINS,
        coinImageNode,
        ViewMode.VARIABLES,
        variableIconNode,
        {
          switchSize: new Dimension2( 40, 20 ),
          top: coinTermCreatorHolder.bottom + 10,
          centerX: coinTermCreatorHolder.centerX
        }
      ) );
    }

    // create the "My Collection" display element
    var myCollectionDisplay = new CollectionDisplayNode(
      model,
      _.uniq( _.map( coinTermCreatorDescriptors, function( descriptor ){ return descriptor.typeID; } ) ),
      negativeTermsPresent // show negative values for advanced screen
    );

    // add accordion box that will contain the collection display
    var myCollectionAccordionBox = new AccordionBox( myCollectionDisplay, {
      titleNode: new Text( myCollectionString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      right: this.layoutBounds.width - INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN
    } );
    this.addChild( myCollectionAccordionBox );

    // add the checkbox that controls visibility of coin values
    var showCoinValuesCheckbox = new CheckBox(
      new Text( coinValuesString, { font: CHECK_BOX_FONT } ),
      model.showCoinValuesProperty,
      {
        top: myCollectionAccordionBox.bottom + CHECK_BOX_VERTICAL_SPACING,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showCoinValuesCheckbox );

    // add the checkbox that controls visibility of variable values
    var showVariableValuesCheckbox = new CheckBox(
      new Text( variableValuesString, { font: CHECK_BOX_FONT } ),
      model.showVariableValuesProperty,
      {
        top: myCollectionAccordionBox.bottom + CHECK_BOX_VERTICAL_SPACING,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showVariableValuesCheckbox );

    // control whether the coin values or variable values checkbox is visible
    model.viewModeProperty.link( function( viewMode ) {
      showCoinValuesCheckbox.visible = viewMode === ViewMode.COINS;
      showVariableValuesCheckbox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // add the checkbox that controls whether all coefficients (including 1) are shown
    var showAllCoefficientsCheckbox = new CheckBox(
      new Text( allCoefficientsString, { font: CHECK_BOX_FONT } ),
      model.showAllCoefficientsProperty,
      {
        top: showCoinValuesCheckbox.bottom + CHECK_BOX_VERTICAL_SPACING,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showAllCoefficientsCheckbox );

    // if negative values are possible, show the check box that allows them to be simplified
    if ( negativeTermsPresent ){
      // TODO: The label for this check box is in flux, make sure its name and the string match before publication
      var simplifyNegativesCheckbox = new CheckBox(
        new Text( simplifyNegativesString, { font: CHECK_BOX_FONT } ),
        model.simplifyNegativesProperty,
        {
          top: showAllCoefficientsCheckbox.bottom + CHECK_BOX_VERTICAL_SPACING,
          left: myCollectionAccordionBox.left,
          maxWidth: myCollectionAccordionBox.width
        }
      );
      this.addChild( simplifyNegativesCheckbox );
    }

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

    // add the 'Reset All' button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        myCollectionAccordionBox.expandedProperty.reset();
        totalValueAccordionBox.expandedProperty.reset();
        if ( coinTermCreatorHolder.pageNumberProperty ) {
          coinTermCreatorHolder.pageNumberProperty.reset();
        }
        variableValuesAccordionBox.expandedProperty.value = false;
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      touchAreaDilation: 10
    } );
    this.addChild( resetAllButton );

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
      if ( model.expressionBeingEdited ) {
        var barrierRectangleHoleBounds = model.expressionBeingEdited.getBounds();
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

    // monitor the view bounds and update the layout and the barrier rectangle size
    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // update the size of the barrier rectangle
      barrierRectangleBounds = visibleBounds;
      updateBarrierRectangle();

      // update the positions of the floating controls
      totalValueAccordionBox.left = visibleBounds.minX + FLOATING_PANEL_INSET;
      variableValuesAccordionBox.left = visibleBounds.minX + FLOATING_PANEL_INSET;
      myCollectionAccordionBox.right = visibleBounds.maxX - FLOATING_PANEL_INSET;
      showCoinValuesCheckbox.left = myCollectionAccordionBox.left;
      showVariableValuesCheckbox.left = myCollectionAccordionBox.left;
      showAllCoefficientsCheckbox.left = myCollectionAccordionBox.left;
      resetAllButton.right = visibleBounds.maxX - FLOATING_PANEL_INSET;
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
      if ( addedCoinTerm.isConstant ){
        coinTermNode = new ConstantCoinTermNode(
          addedCoinTerm,
          model.viewModeProperty,
          model.simplifyNegativesProperty,
          { addDragHandler: true, dragBounds: self.layoutBounds }
        );
      }
      else{
        coinTermNode = new VariableCoinTermNode(
          addedCoinTerm,
          model.viewModeProperty,
          model.showCoinValuesProperty,
          model.showVariableValuesProperty,
          model.showAllCoefficientsProperty,
          model.simplifyNegativesProperty,
          { addDragHandler: true, dragBounds: self.layoutBounds }
        );
      }

      coinLayer.addChild( coinTermNode );

      // Add a listener to the coin to detect when it overlaps with the carousel, at which point it will be removed
      // from the model.
      addedCoinTerm.userControlledProperty.onValue( false, function() {
        if ( coinTermNode.bounds.intersectsBounds( coinTermCreatorHolder.bounds ) && !model.isCoinTermInExpression( addedCoinTerm ) ) {
          model.removeCoinTerm( addedCoinTerm, true );
        }
      } );

      // add the coin halo
      var coinHaloNode = new CoinTermHaloNode( addedCoinTerm, model.viewModeProperty );
      coinHaloLayer.addChild( coinHaloNode );

      // set up a listener to remove the nodes when the corresponding coin is removed from the model
      model.coinTerms.addItemRemovedListener( function removalListener( removedCoin ) {
        if ( removedCoin === addedCoinTerm ) {
          if ( removedCoin.combinedCount === 0 ) {
            // if the coin term being removed has a combined count of zero, it should fade out rather than disappearing
            coinTermNode.fadeAway();
          }
          else {
            coinLayer.removeChild( coinTermNode );
          }
          coinHaloLayer.removeChild( coinHaloNode );
          model.coinTerms.removeItemRemovedListener( removalListener );
        }
      } );

    } );

    // add and remove expressions and expression overlays as they come and go
    model.expressions.addItemAddedListener( function( addedExpression ) {

      var expressionNode = new ExpressionNode( addedExpression, model.viewModeProperty );
      expressionLayer.addChild( expressionNode );

      var expressionOverlayNode = new ExpressionOverlayNode( addedExpression, self.layoutBounds );
      expressionOverlayLayer.addChild( expressionOverlayNode );

      // Add a listener to the expression to detect when it overlaps with the panel or carousel, at which point it will
      // be removed from the model.
      addedExpression.userControlledProperty.onValue( false, function() {
        if ( addedExpression.getBounds().intersectsBounds( coinTermCreatorHolder.bounds ) ) {
          model.removeExpression( addedExpression );
        }
      } );

      // set up a listener to remove these nodes when the corresponding expression is removed from the model
      model.expressions.addItemRemovedListener( function removalListener( removedExpression ) {
        if ( removedExpression === addedExpression ) {
          expressionLayer.removeChild( expressionNode );
          expressionOverlayLayer.removeChild( expressionOverlayNode );
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
          model.expressionHints.removeItemRemovedListener( removalListener );
        }
      } );

    } );

  }

  expressionExchange.register( 'ExpressionManipulationView', ExpressionManipulationView );

  return inherit( ScreenView, ExpressionManipulationView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );