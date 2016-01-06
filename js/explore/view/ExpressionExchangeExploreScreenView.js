// Copyright 2016, University of Colorado Boulder

/**
 * main view for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Carousel = require( 'SUN/Carousel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinCreatorNode = require( 'EXPRESSION_EXCHANGE/explore/view/CoinCreatorNode' );
  var CoinNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var myCollectionString = require( 'string!EXPRESSION_EXCHANGE/myCollection' );
  var numberCentsString = require( 'string!EXPRESSION_EXCHANGE/numberCents' );
  var showAllCoefficientsString = require( 'string!EXPRESSION_EXCHANGE/showAllCoefficients' );
  var showValuesString = require( 'string!EXPRESSION_EXCHANGE/showValues' );
  var totalString = require( 'string!EXPRESSION_EXCHANGE/total' );

  // constants
  var ACCORDION_BOX_TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );
  var ACCORDION_BOX_BUTTON_X_MARGIN = 8;
  var ACCORDION_BOX_BUTTON_Y_MARGIN = 4;
  var ACCORDION_BOX_CORNER_RADIUS = 7;
  var CHECK_BOX_FONT = new PhetFont( { size: 16 } );
  var INSET = 10; // inset from edges of layout bounds, in screen coords

  /**
   * @param {ExpressionExchangeExploreModel} exploreModel
   * @constructor
   */
  function ExpressionExchangeExploreScreenView( exploreModel ) {

    ScreenView.call( this );

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

    // add the checkbox that controls visibility of values
    var showValuesCheckbox = new CheckBox(
      new Text( showValuesString, { font: CHECK_BOX_FONT } ),
      exploreModel.showValuesProperty,
      {
        top: myCollectionAccordionBox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showValuesCheckbox );

    // add the checkbox that controls whether all coefficients (including 1) are shown
    var showAllCoefficientsCheckbox = new CheckBox(
      new Text( showAllCoefficientsString, { font: CHECK_BOX_FONT } ),
      exploreModel.showAllCoefficientsProperty,
      {
        top: showValuesCheckbox.bottom + 6,
        left: myCollectionAccordionBox.left,
        maxWidth: myCollectionAccordionBox.width
      }
    );
    this.addChild( showAllCoefficientsCheckbox );

    // add the carousel that will contain the various coins and expressions
    this.addChild( new Carousel(
      [
        new CoinCreatorNode( 1, exploreModel ),
        new CoinCreatorNode( 2, exploreModel ),
        new CoinCreatorNode( 5, exploreModel ),
        new CoinCreatorNode( 10, exploreModel ),
        new CoinCreatorNode( 25, exploreModel )
      ],
      {
        centerX: this.layoutBounds.width / 2,
        bottom: this.layoutBounds.height - 50
      }
    ) );

    // add the node that will act as the layer where the coins will come and go
    var coinLayer = new Node();
    this.addChild( coinLayer );

    // add the 'Reset All' button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        exploreModel.reset();
        myCollectionAccordionBox.expandedProperty.reset();
        totalCentsAccordionBox.expandedProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // add and remove coin nodes as coins are added and removed from the model
    exploreModel.coins.addItemAddedListener( function( addedCoin ) {

      // add a representation of the coin
      coinLayer.addChild( new CoinNode( addedCoin ) );

      // set up a listener to remove the node when the corresponding coin is removed from the model
      exploreModel.coins.addItemRemovedListener( function removalListener( removedCoin ) {
        if ( removedCoin === addedCoin ) {
          coinLayer.removeChild( removedCoin );
          exploreModel.coins.removeItemRemovedListener( removalListener );
        }
      } );

    } );
  }

  return inherit( ScreenView, ExpressionExchangeExploreScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );