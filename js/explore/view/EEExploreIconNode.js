// Copyright 2016-2020, University of Colorado Boulder

/**
 * icon node for 'Explore' screen
 *
 * @author John Blanco
 */

import Screen from '../../../../joist/js/Screen.js';
import inherit from '../../../../phet-core/js/inherit.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import expressionExchange from '../../expressionExchange.js';

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

inherit( Rectangle, EEExploreIconNode );
export default EEExploreIconNode;