// Copyright 2016, University of Colorado Boulder

/**
 * icon node for 'Explore' screen
 *
 * @author John Blanco (MLearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );

  // constants
  var ICON_SIZE = Screen.HOME_SCREEN_ICON_SIZE;
  var BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;

  /**
   * @constructor
   */
  function EEVariablesIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // add the equation node
    this.addChild( new SubSupText( '3x<sup>2</sup> - x<sup>2</sup>', {
      font: new MathSymbolFont( 94 ),
      centerX: ICON_SIZE.width / 2,
      y: ICON_SIZE.height / 2
    } ) );
  }

  expressionExchange.register( 'EEVariablesIconNode', EEVariablesIconNode );

  return inherit( Rectangle, EEVariablesIconNode );
} );