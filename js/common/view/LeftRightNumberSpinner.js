// Copyright 2016, University of Colorado Boulder

/**
 * control that allows the user to adjust value of a variable using arrow buttons displayed to the left and right of
 * the value
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberSpinner = require( 'SUN/NumberSpinner' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var READOUT_FONT = new PhetFont( 16 );
  var VARIABLE_FONT = new MathSymbolFont( 24 );
  var EQUALS_SIGN_FONT = new PhetFont( 22 ); // because the equals sign in MathSymbolFont looked bad
  var DEFAULT_MIN_VALUE = -10;
  var DEFAULT_MAX_VALUE = 10;

  /**
   * @param {Property.<number>} variableValueProperty - property that wraps the values that will be manipulated
   * @param {string} variableString - the variable text displayed in the control
   * @param {Object} [options]
   * @constructor
   */
  function LeftRightNumberSpinner( variableValueProperty, variableString, options ) {
    Node.call( this );

    options = _.extend( {
      minValue: DEFAULT_MIN_VALUE,
      maxValue: DEFAULT_MAX_VALUE
    }, options );

    // create and add the readout
    var numberSpinner = new NumberSpinner( variableValueProperty, new Property( new RangeWithValue( options.minValue, options.maxValue ) ), {
      arrowsPosition: 'leftRight',
      font: READOUT_FONT,
      backgroundStroke: 'black',
      cornerRadius: 4,
      valueAlign: 'right'
    } );

    // create an HBox that will hold the variable, the equals sign, and the number spinner
    this.addChild( new HBox( {
      spacing: 6,
      children: [
        new Text( variableString, { font: VARIABLE_FONT } ),
        new Text( '=', { font: EQUALS_SIGN_FONT } ),
        numberSpinner ]
    } ) );
  }

  expressionExchange.register( 'LeftRightNumberSpinner', LeftRightNumberSpinner );

  return inherit( Node, LeftRightNumberSpinner );
} );
