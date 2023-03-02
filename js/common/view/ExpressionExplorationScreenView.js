// Copyright 2016-2023, University of Colorado Boulder

/**
 * Base class for views where the user creates and manipulates expressions - used for the explore screens.  This adds
 * the various control panels and indicators that are common to the explore screens.
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Text, VStrut } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import switchCoin_png from '../../../mipmaps/switchCoin_png.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionExchangeStrings from '../../ExpressionExchangeStrings.js';
import EESharedConstants from '../EESharedConstants.js';
import AllowedRepresentations from '../enum/AllowedRepresentations.js';
import CoinTermCreatorSetID from '../enum/CoinTermCreatorSetID.js';
import ViewMode from '../enum/ViewMode.js';
import CoinTermCreatorBoxFactory from './CoinTermCreatorBoxFactory.js';
import CollectionDisplayNode from './CollectionDisplayNode.js';
import ExpressionManipulationView from './ExpressionManipulationView.js';
import ShowSubtractionIcon from './ShowSubtractionIcon.js';
import VariableValueControl from './VariableValueControl.js';

const allCoefficientsString = ExpressionExchangeStrings.allCoefficients;
const coinValuesString = ExpressionExchangeStrings.coinValues;
const myCollectionString = ExpressionExchangeStrings.myCollection;
const numberCentsPatternString = ExpressionExchangeStrings.numberCentsPattern;
const totalString = ExpressionExchangeStrings.total;
const variablesString = ExpressionExchangeStrings.variables;
const variableValuesString = ExpressionExchangeStrings.variableValues;

// constants
const ACCORDION_BOX_TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );
const ACCORDION_BOX_BUTTON_X_MARGIN = 6;
const ACCORDION_BOX_BUTTON_Y_MARGIN = 4;
const ACCORDION_BOX_CORNER_RADIUS = 7;
const ACCORDION_BOX_CONTENT_X_MARGIN = 15;
const ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_X = 15;
const ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_Y = 15;
const CHECKBOX_FONT = new PhetFont( { size: 16 } );
const CHECKBOX_VERTICAL_SPACING = 6;
const INSET = 10; // inset from edges of layout bounds, in screen coords
const FLOATING_PANEL_INSET = 10;
const SWITCH_COIN_WIDTH = 30; // in view coordinates, empirically determined
const NARROW_COLLECTION_DISPLAY_WIDTH = 150; // in view coordinates, empirically determined
const WIDE_COLLECTION_DISPLAY_WIDTH = 180; // in view coordinates, empirically determined

class ExpressionExplorationScreenView extends ScreenView {

  /**
   * @param {ExpressionManipulationModel} model
   * @param {CoinTermCreatorSetID} coinTermCreatorSetID
   */
  constructor( model, coinTermCreatorSetID ) {

    super();

    // set the bounds used to decide when coin terms need to be "pulled back"
    model.setRetrievalBounds( this.layoutBounds );

    // create the view element where coin terms and expressions will be manipulated, but don't add it yet
    const expressionManipulationView = new ExpressionManipulationView( model, this.visibleBoundsProperty );

    // create the box with the coin term creator nodes
    const coinTermCreatorBox = CoinTermCreatorBoxFactory.createExploreScreenCreatorBox(
      coinTermCreatorSetID,
      model,
      expressionManipulationView,
      { centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.bottom - 100 }
    );
    this.addChild( coinTermCreatorBox );

    // let the model know the bounds of the creator box so that it can know when the user is returning coin terms
    model.creatorBoxBounds = coinTermCreatorBox.bounds;

    // max size of the boxes on the left side,  multiplier empirically determined to look good
    const leftSideBoxWidth = this.layoutBounds.width * 0.15;

    // create the readout that will display the total accumulated value, use max length string initially
    const totalValueText = new Text(
      StringUtils.fillIn( numberCentsPatternString, { number: 9999 } ),
      { font: new PhetFont( { size: 14 } ) }
    );
    const totalValueReadoutWidth = Math.min( totalValueText.width + 20, leftSideBoxWidth * 0.8 );
    const totalValueReadout = new Panel( totalValueText, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 5,
      xMargin: 10,
      align: 'center',
      minWidth: totalValueReadoutWidth,
      maxWidth: totalValueReadoutWidth
    } );
    Multilink.multilink(
      [ model.totalValueProperty, model.viewModeProperty ],
      totalValue => {
        if ( model.viewModeProperty.get() === ViewMode.COINS ) {
          totalValueText.string = StringUtils.fillIn( numberCentsPatternString, { number: totalValue } );
        }
        else {
          totalValueText.string = totalValue;
        }
      }
    );

    // add accordion box that will contain the total value readout
    const totalValueAccordionBox = new AccordionBox( totalValueReadout, {
      titleNode: new Text( totalString, { font: ACCORDION_BOX_TITLE_FONT, maxWidth: leftSideBoxWidth * 0.7 } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      left: INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      // contentXMargin: 30, // empirically determined
      minWidth: leftSideBoxWidth,
      maxWidth: leftSideBoxWidth,
      expandCollapseButtonOptions: {
        touchAreaXDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_X,
        touchAreaYDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_Y
      }
    } );
    this.addChild( totalValueAccordionBox );

    // create the control that will allow the user to manipulate variable values
    let variableValueControl;
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
    const variableValuesAccordionBox = new AccordionBox( variableValueControl, {
      titleNode: new Text( variablesString, { font: ACCORDION_BOX_TITLE_FONT, maxWidth: leftSideBoxWidth * 0.65 } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      contentYMargin: 20,
      left: INSET,
      top: totalValueAccordionBox.bottom + 10,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      minWidth: leftSideBoxWidth,
      maxWidth: leftSideBoxWidth,
      expandCollapseButtonOptions: {
        touchAreaXDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_X,
        touchAreaYDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_Y
      }
    } );
    variableValuesAccordionBox.expandedProperty.value = false; // initially closed
    this.addChild( variableValuesAccordionBox );

    // the values control is only visible when in variable mode
    model.viewModeProperty.link( viewMode => {
      variableValuesAccordionBox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // if both representations are allowed, add the switch for switching between coin and term view
    if ( model.allowedRepresentations === AllowedRepresentations.COINS_AND_VARIABLES ) {

      const coinImageNode = new Image( switchCoin_png, { minWidth: SWITCH_COIN_WIDTH, maxWidth: SWITCH_COIN_WIDTH } );
      coinImageNode.touchArea = coinImageNode.localBounds.dilatedXY( 15, 20 ).shiftedX( -10 );

      // enclose the variable text in a node so that its vertical position can be accurately set
      const variableIconNode = new Node( {
        children: [
          new VStrut( coinImageNode.bounds.height ),
          new Text( 'x', {
            font: new MathSymbolFont( 36 ),
            boundsMethod: 'accurate',
            center: coinImageNode.leftCenter
          } )
        ]
      } );
      variableIconNode.touchArea = variableIconNode.localBounds.dilatedXY( 10, 5 ).shiftedX( 5 );

      // add the switch
      this.addChild( new ABSwitch(
        model.viewModeProperty,
        ViewMode.COINS,
        coinImageNode,
        ViewMode.VARIABLES,
        variableIconNode,
        {
          toggleSwitchOptions: {
            size: new Dimension2( 40, 20 ),
            thumbTouchAreaXDilation: 5,
            thumbTouchAreaYDilation: 5
          },
          top: coinTermCreatorBox.bottom + 10,
          centerX: coinTermCreatorBox.centerX
        }
      ) );
    }

    const collectionDisplayWidth = coinTermCreatorSetID === CoinTermCreatorSetID.EXPLORE ?
                                   WIDE_COLLECTION_DISPLAY_WIDTH :
                                   NARROW_COLLECTION_DISPLAY_WIDTH;

    // create the "My Collection" display element
    const myCollectionDisplay = new CollectionDisplayNode( model, coinTermCreatorBox.coinTermTypeList, {
      width: collectionDisplayWidth,
      showNegatives: coinTermCreatorBox.negativeTermsPresent
    } );

    // add accordion box that will contain the collection display
    const myCollectionAccordionBox = new AccordionBox( myCollectionDisplay, {
      titleNode: new Text( myCollectionString, {
        font: ACCORDION_BOX_TITLE_FONT,
        maxWidth: collectionDisplayWidth * 0.90
      } ),
      fill: EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      right: this.layoutBounds.width - INSET,
      top: INSET,
      cornerRadius: ACCORDION_BOX_CORNER_RADIUS,
      buttonXMargin: ACCORDION_BOX_BUTTON_X_MARGIN,
      buttonYMargin: ACCORDION_BOX_BUTTON_Y_MARGIN,
      contentXMargin: ACCORDION_BOX_CONTENT_X_MARGIN,
      minWidth: collectionDisplayWidth + 2 * ACCORDION_BOX_BUTTON_X_MARGIN,
      maxWidth: collectionDisplayWidth + 2 * ACCORDION_BOX_BUTTON_X_MARGIN,
      expandCollapseButtonOptions: {
        touchAreaXDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_X,
        touchAreaYDilation: ACCORDION_BOX_BUTTON_TOUCH_AREA_DILATION_Y
      }
    } );
    this.addChild( myCollectionAccordionBox );

    // max size of checkbox text, multiplier empirically determined
    const checkboxTitleMaxWidth = myCollectionAccordionBox.width * 0.8;

    // add the checkbox that controls visibility of coin values
    const showCoinValuesCheckbox = new Checkbox( model.showCoinValuesProperty, new Text( coinValuesString, { font: CHECKBOX_FONT, maxWidth: checkboxTitleMaxWidth } ), {
      top: coinTermCreatorBox.top,
      left: myCollectionAccordionBox.left,
      maxWidth: myCollectionAccordionBox.width
    } );
    this.addChild( showCoinValuesCheckbox );

    // add the checkbox that controls visibility of variable values
    const showVariableValuesCheckbox = new Checkbox( model.showVariableValuesProperty, new Text( variableValuesString, { font: CHECKBOX_FONT, maxWidth: checkboxTitleMaxWidth } ), {
      top: coinTermCreatorBox.top,
      left: myCollectionAccordionBox.left,
      maxWidth: myCollectionAccordionBox.width
    } );
    this.addChild( showVariableValuesCheckbox );

    // control whether the coin values or variable values checkbox is visible
    model.viewModeProperty.link( viewMode => {
      showCoinValuesCheckbox.visible = viewMode === ViewMode.COINS;
      showVariableValuesCheckbox.visible = viewMode === ViewMode.VARIABLES;
    } );

    // add the checkbox that controls whether all coefficients (including 1) are shown
    const showAllCoefficientsCheckbox = new Checkbox( model.showAllCoefficientsProperty, new Text( allCoefficientsString, { font: CHECKBOX_FONT, maxWidth: checkboxTitleMaxWidth } ), {
      top: showCoinValuesCheckbox.bottom + CHECKBOX_VERTICAL_SPACING,
      left: myCollectionAccordionBox.left,
      maxWidth: myCollectionAccordionBox.width
    } );
    this.addChild( showAllCoefficientsCheckbox );

    // If negative values are possible, show the checkbox that allows them to be simplified.
    let showSubtractionCheckbox;
    if ( coinTermCreatorBox.negativeTermsPresent ) {
      showSubtractionCheckbox = new Checkbox( model.simplifyNegativesProperty, new ShowSubtractionIcon(), {
        top: showAllCoefficientsCheckbox.bottom + CHECKBOX_VERTICAL_SPACING,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      } );
      this.addChild( showSubtractionCheckbox );
    }

    // add the 'Reset All' button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        coinTermCreatorBox.reset();
        myCollectionAccordionBox.expandedProperty.reset();
        totalValueAccordionBox.expandedProperty.reset();
        if ( coinTermCreatorBox.pageNumberProperty ) {
          coinTermCreatorBox.pageNumberProperty.reset();
        }
        variableValuesAccordionBox.expandedProperty.value = false;
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      radius: EESharedConstants.RESET_ALL_BUTTON_RADIUS
    } );
    this.addChild( resetAllButton );

    // monitor the view bounds and update the layout and the barrier rectangle size
    this.visibleBoundsProperty.link( visibleBounds => {

      // update the positions of the floating controls
      totalValueAccordionBox.left = visibleBounds.left + FLOATING_PANEL_INSET;
      variableValuesAccordionBox.left = visibleBounds.left + FLOATING_PANEL_INSET;
      myCollectionAccordionBox.right = visibleBounds.right - FLOATING_PANEL_INSET;
      showCoinValuesCheckbox.left = myCollectionAccordionBox.left;
      showVariableValuesCheckbox.left = myCollectionAccordionBox.left;
      showAllCoefficientsCheckbox.left = myCollectionAccordionBox.left;
      if ( showSubtractionCheckbox ) {
        showSubtractionCheckbox.left = myCollectionAccordionBox.left;
      }
      resetAllButton.right = visibleBounds.right - FLOATING_PANEL_INSET;
    } );

    // Add the layer where the coin terms and expressions will be shown, done here so that coin terms and expressions
    // are above the panels and indicators.
    this.addChild( expressionManipulationView );
  }
}

expressionExchange.register( 'ExpressionExplorationScreenView', ExpressionExplorationScreenView );
export default ExpressionExplorationScreenView;