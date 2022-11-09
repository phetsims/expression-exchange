// Copyright 2017-2022, University of Colorado Boulder


import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionExchangeStrings from '../../ExpressionExchangeStrings.js';

// constants
const FACE_DIAMETER = 150; // empirically determined

const nextString = ExpressionExchangeStrings.next;

class NextLevelNode extends Node {

  /**
   * @param {Function} listener - function that gets called when 'next' button is pressed
   * @param {Object} [options]
   */
  constructor( listener, options ) {
    super();

    // add the smiley face
    const faceNode = new FaceNode( FACE_DIAMETER );
    this.addChild( faceNode );

    const button = new RectangularPushButton( {
      content: new Text( nextString, { font: new PhetFont( 30 ) } ),
      centerX: faceNode.centerX,
      top: faceNode.bottom + 10,
      listener: listener,
      baseColor: PhetColorScheme.BUTTON_YELLOW
    } );

    // add the push button
    this.addChild( button );

    this.mutate( options );
  }
}

expressionExchange.register( 'NextLevelNode', NextLevelNode );

export default NextLevelNode;