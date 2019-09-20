// Copyright 2016-2019, University of Colorado Boulder

/**
 * icon node for 'Explore' screen
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Screen = require( 'JOIST/Screen' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
  const FONT_SIZE = 84;
  const NORMAL_FONT = new PhetFont( { size: FONT_SIZE } );
  const ITALIC_FONT = new MathSymbolFont( FONT_SIZE );
  const BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;

  /**
   * @constructor
   */
  function EEExploreIconNode() {

    // create the background
    Rectangle.call( this, 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // add the nodes
    const equationNode = new Node();
    equationNode.addChild( new Text( '2', { font: NORMAL_FONT } ) );
    equationNode.addChild( new Text( '(4)', { font: ITALIC_FONT, left: equationNode.width } ) );
    equationNode.addChild( new Text( MathSymbols.PLUS, { font: NORMAL_FONT, left: equationNode.width + 25 } ) );
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