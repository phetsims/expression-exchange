// Copyright 2017-2019, University of Colorado Boulder

define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const FaceNode = require( 'SCENERY_PHET/FaceNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const FACE_DIAMETER = 150; // empirically determined

  // strings
  const nextString = require( 'string!EXPRESSION_EXCHANGE/next' );

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

  return inherit( Node, NextLevelNode );
} );