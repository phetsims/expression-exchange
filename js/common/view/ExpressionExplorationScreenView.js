// Copyright 2016, University of Colorado Boulder

/**
 * Base class for views where the user creates and manipulates expressions - used for the explore screens.  This adds
 * the various control panels and indicators that are common to the explore screens.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ABSwitch = require( 'SUN/ABSwitch' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorBoxFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBoxFactory' );
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var CollectionDisplayNode = require( 'EXPRESSION_EXCHANGE/common/view/CollectionDisplayNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ShowSubtractionIcon = require( 'EXPRESSION_EXCHANGE/common/view/ShowSubtractionIcon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VariableValueControl = require( 'EXPRESSION_EXCHANGE/common/view/VariableValueControl' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var allCoefficientsString = require( 'string!EXPRESSION_EXCHANGE/allCoefficients' );
  var coinValuesString = require( 'string!EXPRESSION_EXCHANGE/coinValues' );
  var myCollectionString = require( 'string!EXPRESSION_EXCHANGE/myCollection' );
  var numberCentsPatternString = require( 'string!EXPRESSION_EXCHANGE/numberCentsPattern' );
  var totalString = require( 'string!EXPRESSION_EXCHANGE/total' );
  var valuesString = require( 'string!EXPRESSION_EXCHANGE/values' );
  var variableValuesString = require( 'string!EXPRESSION_EXCHANGE/variableValues' );

  // images
  var switchCoinImage = require( 'mipmap!EXPRESSION_EXCHANGE/switch-coin.png' );

  // constants
  var ACCORDION_BOX_TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );
  var ACCORDION_BOX_BUTTON_X_MARGIN = 6;
  var ACCORDION_BOX_BUTTON_Y_MARGIN = 4;
  var ACCORDION_BOX_CORNER_RADIUS = 7;
  var ACCORDION_BOX_CONTENT_X_MARGIN = 15;
  var CHECK_BOX_FONT = new PhetFont( { size: 16 } );
  var CHECK_BOX_VERTICAL_SPACING = 6;
  var INSET = 10; // inset from edges of layout bounds, in screen coords
  var FLOATING_PANEL_INSET = 10;
  var SWITCH_COIN_WIDTH = 30; // in view coordinates, empirically determined
  var NARROW_COLLECTION_DISPLAY_WIDTH = 150; // in view coordinates, empirically determined
  var WIDE_COLLECTION_DISPLAY_WIDTH = 180; // in view coordinates, empirically determined

  /**
   * @param {ExpressionManipulationModel} model
   * @param {CoinTermCreatorSetID} coinTermCreatorSetID
   * @constructor
   */
  function ExpressionExplorationScreenView( model, coinTermCreatorSetID ) {

    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    // set the bounds used to decide when coin terms need to be "pulled back"
    model.setCoinTermRetrievalBounds( this.layoutBounds );

    // create the view element where coin terms and expressions will be manipulated, but don't add it yet
    var expressionManipulationView = new ExpressionManipulationView( model, this.visibleBoundsProperty );

    // create the box with the coin term creator nodes
    var coinTermCreatorBox = CoinTermCreatorBoxFactory.createExploreScreenCreatorBox(
      coinTermCreatorSetID,
      model,
      expressionManipulationView,
      { centerX: this.layoutBounds.centerX, bottom: this.layoutBounds.bottom - 50 }
    );
    this.addChild( coinTermCreatorBox );

    // let the model know the bounds of the creator box so that it can know when the user is returning coin terms
    model.creatorBoxBounds = coinTermCreatorBox.bounds;

    // create the readout that will display the total accumulated value, use max length string initially
    var totalValueText = new Text(
      StringUtils.fillIn( numberCentsPatternString, { number: 9999 } ),
      { font: new PhetFont( { size: 14 } ) }
    );
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
        if ( model.viewModeProperty.get() === ViewMode.COINS ) {
          totalValueText.text = StringUtils.fillIn( numberCentsPatternString, { number: totalValue } );
        }
        else {
          totalValueText.text = totalValue;
        }
      }
    );

    var leftSideBoxWidth = this.layoutBounds.width * 0.15; // multiplier empirically determined

    // add accordion box that will contain the total value readout
    var totalValueAccordionBox = new AccordionBox( totalValueReadout, {
      titleNode: new Text( totalString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      left: INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      contentXMargin: 30, // empirically determined
      minWidth: leftSideBoxWidth,
      maxWidth: leftSideBoxWidth
    } );
    this.addChild( totalValueAccordionBox );

    // create the control that will allow the user to manipulate variable values
    var variableValueControl;
    if ( coinTermCreatorSetID === CoinTermCreatorSetID.VARIABLES ) {

      // the variable value control is slightly different for the advanced screen
      variableValueControl = new VariableValueControl( {
        xTermValueProperty: model.xTermValueProperty,
        yTermValueProperty: model.yTermValueProperty,
        minValue: -10,
        maxValue: 10
      } );
    }
    else {
      variableValueControl = new VariableValueControl( {
        xTermValueProperty: model.xTermValueProperty,
        yTermValueProperty: model.yTermValueProperty,
        zTermValueProperty: model.zTermValueProperty,
        minValue: 1,
        maxValue: 10
      } );
    }

    // add the variable value control to an accordion box, and add the accordion box to the view
    var variableValuesAccordionBox = new AccordionBox( variableValueControl, {
      titleNode: new Text( valuesString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      contentYMargin: 20,
      left: INSET,
      top: totalValueAccordionBox.bottom + 10,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      minWidth: leftSideBoxWidth,
      maxWidth: leftSideBoxWidth
    } );
    variableValuesAccordionBox.expandedProperty.value = false; // initially closed
    this.addChild( variableValuesAccordionBox );

    // the values control is only visible when in variable mode
    model.viewModeProperty.link( function( viewMode ) {
      variableValuesAccordionBox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // if both representations are allowed, add the switch for switching between coin and term view
    if ( model.allowedRepresentations === AllowedRepresentationsEnum.COINS_AND_VARIABLES ) {

      var coinImageNode = new Image( switchCoinImage, { minWidth: SWITCH_COIN_WIDTH, maxWidth: SWITCH_COIN_WIDTH } );

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
          thumbTouchAreaXDilation: 5,
          thumbTouchAreaYDilation: 5,
          top: coinTermCreatorBox.bottom + 10,
          centerX: coinTermCreatorBox.centerX
        }
      ) );
    }

    var collectionDisplayWidth = coinTermCreatorSetID === CoinTermCreatorSetID.EXPLORE ?
                                 WIDE_COLLECTION_DISPLAY_WIDTH :
                                 NARROW_COLLECTION_DISPLAY_WIDTH;

    // create the "My Collection" display element
    var myCollectionDisplay = new CollectionDisplayNode( model, coinTermCreatorBox.coinTermTypeList, {
      width: collectionDisplayWidth,
      showNegatives: coinTermCreatorBox.negativeTermsPresent
    } );

    // add accordion box that will contain the collection display
    var myCollectionAccordionBox = new AccordionBox( myCollectionDisplay, {
      titleNode: new Text( myCollectionString, { font: ACCORDION_BOX_TITLE_FONT } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      right: this.layoutBounds.width - INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      contentXMargin: ACCORDION_BOX_CONTENT_X_MARGIN,
      minWidth: collectionDisplayWidth + 2 * ACCORDION_BOX_BUTTON_X_MARGIN,
      maxWidth: collectionDisplayWidth + 2 * ACCORDION_BOX_BUTTON_X_MARGIN
    } );
    this.addChild( myCollectionAccordionBox );

    // add the checkbox that controls visibility of coin values
    var showCoinValuesCheckbox = new CheckBox(
      new Text( coinValuesString, { font: CHECK_BOX_FONT } ),
      model.showCoinValuesProperty,
      {
        top: coinTermCreatorBox.top,
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
        top: coinTermCreatorBox.top,
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
    if ( coinTermCreatorBox.negativeTermsPresent ) {
      var showSubtractionCheckbox = new CheckBox(
        new ShowSubtractionIcon(),
        model.simplifyNegativesProperty,
        {
          top: showAllCoefficientsCheckbox.bottom + CHECK_BOX_VERTICAL_SPACING,
          left: myCollectionAccordionBox.left,
          maxWidth: myCollectionAccordionBox.width
        }
      );
      this.addChild( showSubtractionCheckbox );
    }

    // add the 'Reset All' button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        myCollectionAccordionBox.expandedProperty.reset();
        totalValueAccordionBox.expandedProperty.reset();
        if ( coinTermCreatorBox.pageNumberProperty ) {
          coinTermCreatorBox.pageNumberProperty.reset();
        }
        variableValuesAccordionBox.expandedProperty.value = false;
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      touchAreaDilation: 10,
      radius: EESharedConstants.RESET_BUTTON_RADIUS
    } );
    this.addChild( resetAllButton );

    // monitor the view bounds and update the layout and the barrier rectangle size
    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // update the positions of the floating controls
      // REVIEW: use bounds.left/bounds.right
      totalValueAccordionBox.left = visibleBounds.minX + FLOATING_PANEL_INSET;
      variableValuesAccordionBox.left = visibleBounds.minX + FLOATING_PANEL_INSET;
      myCollectionAccordionBox.right = visibleBounds.maxX - FLOATING_PANEL_INSET;
      showCoinValuesCheckbox.left = myCollectionAccordionBox.left;
      showVariableValuesCheckbox.left = myCollectionAccordionBox.left;
      showAllCoefficientsCheckbox.left = myCollectionAccordionBox.left;
      if ( showSubtractionCheckbox ) {
        showSubtractionCheckbox.left = myCollectionAccordionBox.left;
      }
      //REVIEW: bounds.right
      resetAllButton.right = visibleBounds.maxX - FLOATING_PANEL_INSET;
    } );

    // Add the layer where the coin terms and expressions will be shown, done here so that coin terms and expressions
    // are above the panels and indicators.
    this.addChild( expressionManipulationView );
  }

  expressionExchange.register( 'ExpressionExplorationScreenView', ExpressionExplorationScreenView );

  return inherit( ScreenView, ExpressionExplorationScreenView );
} );