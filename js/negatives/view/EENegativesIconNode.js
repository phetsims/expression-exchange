// Copyright 2016-2022, University of Colorado Boulder

/**
 * icon node for 'Negatives' screen
 *
 * @author John Blanco
 */

import Screen from '../../../../joist/js/Screen.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
const BACKGROUND_COLOR = EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR;
const FONT_SIZE = 100;
const MATH_FONT = new MathSymbolFont( FONT_SIZE );
const TEXT_FONT = new PhetFont( FONT_SIZE );

class EENegativesIconNode extends Rectangle {

  /**
   */
  constructor() {

    // create the background
    super( 0, 0, ICON_SIZE.width, ICON_SIZE.height, { fill: BACKGROUND_COLOR } );

    // create and add the equation node
    const equationNode = new HBox( {
      children: [
        new Text( '3', { font: TEXT_FONT } ),
        new RichText( 'x<sup>2</sup>', { font: MATH_FONT, supScale: 0.5 } ),
        new Text( ` ${MathSymbols.MINUS} `, { font: TEXT_FONT } ),
        new RichText( 'x<sup>2</sup>', { font: MATH_FONT, supScale: 0.5 } )
      ],
      align: 'bottom'
    } );
    equationNode.centerX = ICON_SIZE.width / 2;
    equationNode.centerY = ICON_SIZE.height * 0.45;
    this.addChild( equationNode );
  }
}

expressionExchange.register( 'EENegativesIconNode', EENegativesIconNode );

export default EENegativesIconNode;