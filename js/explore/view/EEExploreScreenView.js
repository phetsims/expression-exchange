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
  var Carousel = require( 'SUN/Carousel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/explore/view/CoinTermCreatorNode' );
  var CoinTerm = require( 'EXPRESSION_EXCHANGE/common/model/CoinTerm' );
  var CoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermNode' );
  var CoinTermHaloNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermHaloNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var ExpressionHintNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionHintNode' );
  var ExpressionNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionNode' );
  var ExpressionOverlayNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionOverlayNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var myCollectionString = require( 'string!EXPRESSION_EXCHANGE/myCollection' );
  var numberCentsString = require( 'string!EXPRESSION_EXCHANGE/numberCents' );
  var allCoefficientsString = require( 'string!EXPRESSION_EXCHANGE/allCoefficients' );
  var coinValuesString = require( 'string!EXPRESSION_EXCHANGE/coinValues' );
  var totalString = require( 'string!EXPRESSION_EXCHANGE/total' );
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
   * @param {EEExploreModel} exploreModel
   * @constructor
   */
  function EEExploreScreenView( exploreModel ) {

    ScreenView.call( this );
    var self = this;

    // create the readout that will display the total accumulated cents
    var totalCentsText = new Text( '', { font: new PhetFont( { size: 14 } ) } );
    var totalCentsReadout = new Panel( totalCentsText, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 5,
      xMargin: 10
    } );
    exploreModel.totalCentsProperty.link( function( totalCents ) {
      totalCentsText.text = StringUtils.format( numberCentsString, totalCents );
    } );

    // add accordion box that will contain the total cents readout
    var totalCentsAccordionBox = new AccordionBox( totalCentsReadout, {
      titleNode: new Text( totalString, { font: ACCORDION_BOX_TITLE_FONT } ),
      left: INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      minWidth: totalCentsReadout.width * 1.8 // multiplier empirically determined
    } );
    this.addChild( totalCentsAccordionBox );

    // add accordion box that will contain the user's coin collection
    var myCollectionAccordionBox = new AccordionBox( new VStrut( 350 ), {
      titleNode: new Text( myCollectionString, { font: ACCORDION_BOX_TITLE_FONT } ),
      right: this.layoutBounds.width - INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      minWidth: 200 // empirically determined
    } );
    this.addChild( myCollectionAccordionBox );

    // add the checkbox that controls visibility of coin values
    var showCoinValuesCheckbox = new CheckBox(
      new Text( coinValuesString, { font: CHECK_BOX_FONT } ),
      exploreModel.showCoinValuesProperty,
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
      exploreModel.showVariableValuesProperty,
      {
        top: myCollectionAccordionBox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showVariableValuesCheckbox );

    // control whether the coin values or variable values checkbox is visible
    exploreModel.viewModeProperty.link( function( viewMode ) {
      showCoinValuesCheckbox.visible = viewMode === ViewMode.COINS;
      showVariableValuesCheckbox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // add the checkbox that controls whether all coefficients (including 1) are shown
    var showAllCoefficientsCheckbox = new CheckBox(
      new Text( allCoefficientsString, { font: CHECK_BOX_FONT } ),
      exploreModel.showAllCoefficientsProperty,
      {
        top: showCoinValuesCheckbox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showAllCoefficientsCheckbox );

    // add the carousel that will contain the various coins and expressions
    var carousel = new Carousel(
      [
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.X( exploreModel.xTermValueProperty ); } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.Y( exploreModel.yTermValueProperty ); } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.Z( exploreModel.zTermValueProperty ); } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.X( exploreModel.xTermValueProperty, 2 ); } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.Y( exploreModel.xTermValueProperty, 3 ); } ),
        new CoinTermCreatorNode( exploreModel, function() {
          return new CoinTerm.XTimesY(
            exploreModel.xTermValueProperty,
            exploreModel.yTermValueProperty
          );
        } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.XSquared( exploreModel.xTermValueProperty ); } ),
        new CoinTermCreatorNode( exploreModel, function() { return new CoinTerm.YSquared( exploreModel.yTermValueProperty ); } ),
        new CoinTermCreatorNode( exploreModel, function() {
          return new CoinTerm.XSquaredTimesYSquared(
            exploreModel.xTermValueProperty,
            exploreModel.yTermValueProperty
          );
        } )
      ],
      {
        centerX: this.layoutBounds.width / 2,
        bottom: this.layoutBounds.height - 50,
        itemsPerPage: 3
      }
    );
    this.addChild( carousel );

    // add the switch for switching between coin and term view
    this.addChild( new ABSwitch(
      exploreModel.viewModeProperty,
      ViewMode.COINS,
      new Image( switchCoinImage, { scale: 0.6 } ),
      ViewMode.VARIABLES,
      new Text( 'x', { font: new PhetFont( { family: '"Times New Roman", serif', size: 32, style: 'italic' } ) } ),
      { switchSize: new Dimension2( 40, 20 ), top: carousel.bottom + 10, centerX: carousel.centerX }
    ) );

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
        exploreModel.reset();
        myCollectionAccordionBox.expandedProperty.reset();
        totalCentsAccordionBox.expandedProperty.reset();
        carousel.pageNumberProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // add and remove coin nodes as coins are added and removed from the model
    exploreModel.coinTerms.addItemAddedListener( function( addedCoinTerm ) {

      // add a representation of the coin
      var coinNode = new CoinTermNode(
        addedCoinTerm,
        exploreModel.viewModeProperty,
        exploreModel.showCoinValuesProperty,
        exploreModel.showVariableValuesProperty,
        exploreModel.showAllCoefficientsProperty,
        true
      );
      coinLayer.addChild( coinNode );

      // Add a listener to the coin to detect when it overlaps with the carousel, at which point it will be removed
      // from the model.
      addedCoinTerm.userControlledProperty.onValue( false, function() {
        if ( coinNode.bounds.intersectsBounds( carousel.bounds ) && !exploreModel.isCoinTermInExpression( addedCoinTerm ) ) {
          exploreModel.removeCoinTerm( addedCoinTerm );
        }
      } );

      // add the coin halo
      var coinHaloNode = new CoinTermHaloNode( addedCoinTerm, exploreModel.viewModeProperty );
      coinHaloLayer.addChild( coinHaloNode );

      // set up a listener to remove the nodes when the corresponding coin is removed from the model
      exploreModel.coinTerms.addItemRemovedListener( function removalListener( removedCoin ) {
        if ( removedCoin === addedCoinTerm ) {
          coinLayer.removeChild( coinNode );
          coinHaloLayer.removeChild( coinHaloNode );
          exploreModel.coinTerms.removeItemRemovedListener( removalListener );
        }
      } );

    } );

    // add and remove expressions and expression overlays as they come and go
    exploreModel.expressions.addItemAddedListener( function( addedExpression ) {

      var expressionNode = new ExpressionNode( addedExpression, exploreModel.viewModeProperty );
      expressionLayer.addChild( expressionNode );

      var expressionOverlayNode = new ExpressionOverlayNode( addedExpression, self.layoutBounds );
      expressionOverlayLayer.addChild( expressionOverlayNode );

      // set up a listener to remove these nodes when the corresponding expression is removed from the model
      exploreModel.expressions.addItemRemovedListener( function removalListener( removedExpression ) {
        if ( removedExpression === addedExpression ) {
          expressionLayer.removeChild( expressionNode );
          expressionOverlayLayer.removeChild( expressionOverlayNode );
          exploreModel.expressions.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // add and remove expression hints as they come and go
    exploreModel.expressionHints.addItemAddedListener( function( addedExpressionHint ) {

      var expressionHintNode = new ExpressionHintNode( addedExpressionHint, exploreModel.viewModeProperty );
      expressionLayer.addChild( expressionHintNode );

      // set up a listener to remove the hint node when the corresponding hint is removed from the model
      exploreModel.expressionHints.addItemRemovedListener( function removalListener( removedExpressionHint ) {
        if ( removedExpressionHint === addedExpressionHint ) {
          expressionLayer.removeChild( expressionHintNode );
          exploreModel.expressionHints.removeItemRemovedListener( removalListener );
        }
      } );

    } );

  }

  return inherit( ScreenView, EEExploreScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );