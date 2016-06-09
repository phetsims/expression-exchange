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
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var READOUT_FONT = new PhetFont( 16 );
  var READOUT_HEIGHT = 15;
  var ARROW_HEIGHT = READOUT_HEIGHT * 0.65;  // multiplier empirically determined
  var EQUATION_FONT = new PhetFont( 20 );
  var DEFAULT_MIN_VALUE = -10;
  var DEFAULT_MAX_VALUE = 10;

  /**
   * @constructor
   */
  function VariableValueTweaker( variableValueProperty, variableString, options ) {
    Node.call( this );

    options = _.extend( {
      minValue: DEFAULT_MIN_VALUE,
      maxValue: DEFAULT_MAX_VALUE
    }, options );

    // create and add the readout
    var readout = new NumberDisplay( variableValueProperty, new Range( options.minValue, options.maxValue ), '', '{0}', {
      font: READOUT_FONT,
      backgroundStroke: 'black',
      cornerRadius: 4
    } );

    // create the arrow buttons
    var arrowButtonOptions = { arrowHeight: ARROW_HEIGHT, arrowWidth: ARROW_HEIGHT * Math.sqrt( 3 ) / 2 };
    var leftArrowButton = new ArrowButton( 'left', function() { variableValueProperty.value--; }, arrowButtonOptions );
    var rightArrowButton = new ArrowButton( 'right', function() { variableValueProperty.value++; }, arrowButtonOptions );

    // set the enabled states of the arrow buttons
    variableValueProperty.link( function( variableValue ) {
      leftArrowButton.enabled = variableValue > options.minValue;
      rightArrowButton.enabled = variableValue < options.maxValue;
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
