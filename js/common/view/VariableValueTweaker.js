// Copyright 2016, University of Colorado Boulder

/**
 * control that allows the user to adjust, a.k.a. 'tweak', the value of a variable
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var READOUT_FONT = new PhetFont( 16 );
  var READOUT_HEIGHT = 15;
  var ARROW_HEIGHT = READOUT_HEIGHT * 0.65;  // multiplier empirically determined
  var EQUATION_FONT = new PhetFont( 20 );
  var MIN_VALUE = 2;
  var MAX_VALUE = 10;

  /**
   * @constructor
   */
  function VariableValueTweaker( variableValueProperty, variableString ) {
    Node.call( this );

    // create and add the readout
    var readout = new NumberDisplay( variableValueProperty, new Range( MIN_VALUE, MAX_VALUE ), '', '{0}', {
      font: READOUT_FONT,
      backgroundStroke: 'black',
      cornerRadius: 4
    } );

    // create the arrow buttons
    var arrowButtonOptions = { arrowHeight: ARROW_HEIGHT, arrowWidth: ARROW_HEIGHT * Math.sqrt( 3 ) / 2 };
    var leftArrowButton = new ArrowButton( 'left', function() { variableValueProperty.value--; }, arrowButtonOptions );
    var rightArrowButton = new ArrowButton( 'right', function() { variableValueProperty.value++; }, arrowButtonOptions );

    // set the enabled states of the arrow buttons
    variableValueProperty.link( function( variableValue ){
      leftArrowButton.enabled = variableValue > MIN_VALUE;
      rightArrowButton.enabled = variableValue < MAX_VALUE;
    } );

    // put the arrow buttons and readout into an HBox
    var arrowsAndReadout = new HBox( { spacing: 3, children: [ leftArrowButton, readout, rightArrowButton ] } );

    // create another HBox that will hold the variable, the equals sign, and the HBox with the buttons and readout
    this.addChild( new HBox( {
      spacing: 5,
      children: [
        new Text( variableString, { font: EQUATION_FONT } ),
        new Text( '=', { font: EQUATION_FONT } ),
        arrowsAndReadout ]
    } ) );
  }

  expressionExchange.register( 'VariableValueTweaker', VariableValueTweaker );

  return inherit( Node, VariableValueTweaker );
} );
