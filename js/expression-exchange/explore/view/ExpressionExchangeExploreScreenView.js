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
  var inherit = require( 'PHET_CORE/inherit' );
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
  var totalString = require( 'string!EXPRESSION_EXCHANGE/total' );

  // constants
  var INSET = 10; // inset from edges of layout bounds, in screen coords
  var ACCORDION_BOX_TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );

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
      minWidth: totalCentsReadout.width * 1.8 // multiplier empirically determined
    } );
    totalCentsAccordionBox.expandedProperty.value = false;
    this.addChild( totalCentsAccordionBox );

    // add accordion box that will contain the user's coin collection
    var myCollectionAccordionBox = new AccordionBox( new VStrut( 350 ), {
      titleNode: new Text( myCollectionString, { font: ACCORDION_BOX_TITLE_FONT } ),
      right: this.layoutBounds.width - INSET,
      top: INSET,
      minWidth: 200 // empirically determined
    } );
    myCollectionAccordionBox.expandedProperty.value = false;
    this.addChild( myCollectionAccordionBox );

    // add the 'Reset All' button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        exploreModel.reset();
      },
      right:  this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, ExpressionExchangeExploreScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );