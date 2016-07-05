// Copyright 2016, University of Colorado Boulder

/**
 * icon node for 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var ICON_SIZE = Screen.HOME_SCREEN_ICON_SIZE;
  var FONT_SIZE = 84;
  var NORMAL_FONT = new PhetFont( { size: FONT_SIZE } );
  var ITALIC_FONT = new PhetFont( { size: FONT_SIZE, style: 'italic' } );
  var BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;

  /**
   * @constructor
   */
  function EEExploreIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // add the nodes
    var equationNode = new Node();

    equationNode.addChild( new Text( '2', { font: NORMAL_FONT } ) );
    equationNode.addChild( new Text( '(4)', { font: ITALIC_FONT, left: equationNode.width } ) );
    equationNode.addChild( new Text( '+', { font: NORMAL_FONT, left: equationNode.width + 25 } ) );
    equationNode.addChild( new Text( '1', { font: NORMAL_FONT, left: equationNode.width + 25 } ) );
    equationNode.addChild( new Text( '(5)', { font: ITALIC_FONT, left: equationNode.width } ) );

    // position the equation
    equationNode.centerX = ICON_SIZE.width / 2;
    equationNode.centerY = ICON_SIZE.height * 0.45;

    this.addChild( equationNode );

  }

  expressionExchange.register( 'EEExploreIconNode', EEExploreIconNode );

  return inherit( Rectangle, EEExploreIconNode );
} );