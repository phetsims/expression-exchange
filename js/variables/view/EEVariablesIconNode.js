// Copyright 2016, University of Colorado Boulder

/**
 * icon node for 'Variables' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var ICON_SIZE = Screen.HOME_SCREEN_ICON_SIZE;
  var BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
  var FONT_SIZE = 100;

  /**
   * @constructor
   */
  function EEVariablesIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // create and add the equation node
    var equationNode = new Node();
    equationNode.addChild( new Text( '3', { font: new PhetFont( FONT_SIZE ) } ) );
    var subSupOptions = {
      font: new MathSymbolFont( FONT_SIZE ),
      supScale: 0.5,
      left: equationNode.width
    };
    equationNode.addChild( new SubSupText( 'x<sup>2</sup>', {
      font: new MathSymbolFont( FONT_SIZE ),
      supScale: 0.5,
      left: equationNode.width
    } ) );
    equationNode.addChild( new Text( ' - ', { font: new PhetFont( FONT_SIZE * 1.1 ), left: equationNode.width } ) );
    equationNode.addChild( new SubSupText( 'x<sup>2</sup>', {
      font: new MathSymbolFont( FONT_SIZE ),
      supScale: 0.5,
      left: equationNode.width
    } ) );
    equationNode.centerX = ICON_SIZE.width / 2;
    equationNode.centerY = ICON_SIZE.height * 0.45;
    this.addChild( equationNode );
  }

  expressionExchange.register( 'EEVariablesIconNode', EEVariablesIconNode );

  return inherit( Rectangle, EEVariablesIconNode );
} );