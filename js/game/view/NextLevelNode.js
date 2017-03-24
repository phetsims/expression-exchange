// Copyright 2017, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var FACE_DIAMETER = 150; // empirically determined

  // strings
  var nextString = require( 'string!EXPRESSION_EXCHANGE/next' );

  /**
   * @param {function} listener - function that gets called when 'next' button is pressed
   * @constructor
   */
  function NextLevelNode( listener, options ) {
    var self = this;
    Node.call( this );

    options = _.extend( {

      // option used to make the node become invisible as soon as its button is pressed, generally used to avoid issues
      // with multiple fast button presses, like those that can occur during fuzz testing
      hideWhenButtonPressed: true
    }, options );

    // add the smiley face
    var faceNode = new FaceNode( FACE_DIAMETER );
    this.addChild( faceNode );

    var button = new RectangularPushButton( {
      content: new Text( nextString, { font: new PhetFont( 30 ) } ),
      centerX: faceNode.centerX,
      top: faceNode.bottom + 10,
      listener: listener,
      baseColor: 'yellow'
    } );

    if ( options.hideWhenButtonPressed ) {

      // add an additional listener to the button that hides this node so that the button can't be repeatedly pressed
      button.addListener( function() { self.visible = false } );
    }

    // add the push button
    this.addChild( button );

    this.mutate( options );
  }

  expressionExchange.register( 'NextLevelNode', NextLevelNode );

  return inherit( Node, NextLevelNode );
} );