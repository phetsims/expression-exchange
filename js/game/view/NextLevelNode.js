// Copyright 2017-2019, University of Colorado Boulder


import inherit from '../../../../phet-core/js/inherit.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchangeStrings from '../../expression-exchange-strings.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const FACE_DIAMETER = 150; // empirically determined

const nextString = expressionExchangeStrings.next;

/**
 * @param {Function} listener - function that gets called when 'next' button is pressed
 * @param {Object} [options]
 * @constructor
 */
function NextLevelNode( listener, options ) {
  Node.call( this );

  // add the smiley face
  const faceNode = new FaceNode( FACE_DIAMETER );
  this.addChild( faceNode );

  const button = new RectangularPushButton( {
    content: new Text( nextString, { font: new PhetFont( 30 ) } ),
    centerX: faceNode.centerX,
    top: faceNode.bottom + 10,
    listener: listener,
    baseColor: 'yellow'
  } );

  // add the push button
  this.addChild( button );

  this.mutate( options );
}

expressionExchange.register( 'NextLevelNode', NextLevelNode );

inherit( Node, NextLevelNode );
export default NextLevelNode;