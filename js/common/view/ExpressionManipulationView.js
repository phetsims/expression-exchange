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
  var CoinTermCollection = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCollection' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorNode' );
  var CoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermNode' );
  var CoinTermHaloNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermHaloNode' );
  var CollectionDisplayNode = require( 'EXPRESSION_EXCHANGE/common/view/CollectionDisplayNode' );
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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VariableValueControl = require( 'EXPRESSION_EXCHANGE/common/view/VariableValueControl' );
  var ViewModeEnum = require( 'EXPRESSION_EXCHANGE/common/model/ViewModeEnum' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var myCollectionString = require( 'string!EXPRESSION_EXCHANGE/myCollection' );
  var numberCentsString = require( 'string!EXPRESSION_EXCHANGE/numberCents' );
  var allCoefficientsString = require( 'string!EXPRESSION_EXCHANGE/allCoefficients' );
  var coinValuesString = require( 'string!EXPRESSION_EXCHANGE/coinValues' );
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
  var INSET = 10; // inset from edges of layout bounds, in screen coords

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
        if ( model.viewMode === ViewModeEnum.COINS ) {
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

    // add the control that allows the user to adjust the values of the variables
    var variableValuesAccordionBox = new AccordionBox(
      new VariableValueControl( model.xTermValueProperty,  model.yTermValueProperty,  model.zTermValueProperty ),
      {
        titleNode: new Text( valuesString, { font: ACCORDION_BOX_TITLE_FONT } ),
        fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
        contentYMargin: 20,
        left: INSET,
        top: totalValueAccordionBox.bottom + 10,
        cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
        buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
        buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN
      }
    );
    variableValuesAccordionBox.expandedProperty.value = false; // initially closed
    this.addChild( variableValuesAccordionBox );

    // the values control is only visible when in variable mode
    model.viewModeProperty.link( function( viewMode ) {
      variableValuesAccordionBox.visible = viewMode === ViewModeEnum.VARIABLES;
    } );

    // add accordion box that will contain the user's coin collection
    var myCollectionAccordionBox = new AccordionBox( new CollectionDisplayNode( model ), {
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
        top: myCollectionAccordionBox.bottom + 6,
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
        top: myCollectionAccordionBox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showVariableValuesCheckbox );

    // control whether the coin values or variable values checkbox is visible
    model.viewModeProperty.link( function( viewMode ) {
      showCoinValuesCheckbox.visible = viewMode === ViewModeEnum.COINS;
      showVariableValuesCheckbox.visible = viewMode === ViewModeEnum.VARIABLES;
    } );

    // add the checkbox that controls whether all coefficients (including 1) are shown
    var showAllCoefficientsCheckbox = new CheckBox(
      new Text( allCoefficientsString, { font: CHECK_BOX_FONT } ),
      model.showAllCoefficientsProperty,
      {
        top: showCoinValuesCheckbox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showAllCoefficientsCheckbox );

    // create the collection of coin term creator nodes that will be presented to the user, varies based on options
    var coinTermFactory = model.coinTermFactory; // convenience var
    var coinTermCollection = [];
    if ( model.coinTermCollection === CoinTermCollection.BASIC ) {

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Z, { initialPosition: initialPosition } );
      } ) );

    }
    else if ( model.coinTermCollection === CoinTermCollection.EXPLORE ) {

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Z, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X, {
          initialPosition: initialPosition,
          initialCount: 2
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y, {
          initialPosition: initialPosition,
          initialCount: 3
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X_TIMES_Y, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X_SQUARED, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y_SQUARED, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED, { initialPosition: initialPosition } );
      } ) );
    }
    else if ( model.coinTermCollection === CoinTermCollection.ADVANCED ) {

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X, { initialPosition: initialPosition } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.X, {
          initialPosition: initialPosition,
          initialCount: -1
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y, {
          initialPosition: initialPosition,
          initialCount: 1
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Y, {
          initialPosition: initialPosition,
          initialCount: -1
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Z, {
          initialPosition: initialPosition,
          initialCount: 1
        } );
      } ) );

      coinTermCollection.push( new CoinTermCreatorNode( model, function( initialPosition ) {
        return coinTermFactory.createCoinTerm( CoinTermTypeID.Z, {
          initialPosition: initialPosition,
          initialCount: -1
        } );
      } ) );
    }
    else {
      assert( false, 'unknown value for coinTermCollection' );
    }

    // add the panel or carousel that will contain the various coin terms that the user can create
    var coinTermCreatorHolder;
    var coinTermHolderCenterX = this.layoutBounds.width / 2;
    var coinTermHolderBottom = this.layoutBounds.height - 50;
    if ( coinTermCollection.length > 3 ){
      coinTermCreatorHolder = new Carousel( coinTermCollection, {
        centerX: coinTermHolderCenterX,
        bottom: coinTermHolderBottom,
        itemsPerPage: 3,
        spacing: 60 // empirically determined to handle worst case term test
      } );
    }
    else{
      // use a panel instead of a carousel
      // Many of the numbers in the following constructors were empirically determined to match the size of the
      // carousels on the other screens.
      var coinTermCreatorHBox = new HBox( { children: coinTermCollection, spacing: 75, resize: false } );
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
      var variableIconNode = new Node( { children: [
        new VStrut( coinImageNode.bounds.height ),
        new Text( EESharedConstants.X_VARIABLE_CHAR, {
          font: new MathSymbolFont( 36 ),
          boundsMethod: 'accurate',
          centerX: 0,
          centerY: coinImageNode.height / 2
        } )
      ] } );

      // add the switch
      this.addChild( new ABSwitch(
        model.viewModeProperty,
        ViewModeEnum.COINS,
        coinImageNode,
        ViewModeEnum.VARIABLES,
        variableIconNode,
        { switchSize: new Dimension2( 40, 20 ), top: coinTermCreatorHolder.bottom + 10, centerX: coinTermCreatorHolder.centerX }
      ) );
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
        if ( coinTermCreatorHolder.pageNumberProperty ){
          coinTermCreatorHolder.pageNumberProperty.reset();
        }
        variableValuesAccordionBox.expandedProperty.value = false;
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // add and remove coin nodes as coins are added and removed from the model
    model.coinTerms.addItemAddedListener( function( addedCoinTerm ) {

      // add a representation of the coin
      var coinTermNode = new CoinTermNode(
        addedCoinTerm,
        model.viewModeProperty,
        model.showCoinValuesProperty,
        model.showVariableValuesProperty,
        model.showAllCoefficientsProperty,
        { addDragHandler: true, dragBounds: self.layoutBounds }
      );
      coinLayer.addChild( coinTermNode );

      // Add a listener to the coin to detect when it overlaps with the carousel, at which point it will be removed
      // from the model.
      addedCoinTerm.userControlledProperty.onValue( false, function() {
        if ( coinTermNode.bounds.intersectsBounds( coinTermCreatorHolder.bounds ) &&
             !model.isCoinTermInExpression( addedCoinTerm ) ) {
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

      // Add a listener to the coin to detect when it overlaps with the panel or carousel, at which point it will be
      // removed from the model.
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