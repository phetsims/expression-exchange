// Copyright 2017, University of Colorado Boulder

/**
 * model dialog shown when all levels have been completed
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  var FACE_DIAMETER = 160; // empirically determined

  // strings
  var doneString = require( 'string!EXPRESSION_EXCHANGE/done' );
  var youCompletedAllLevelsString = require( 'string!EXPRESSION_EXCHANGE/youCompletedAllLevels' );

  /**
   * @param {Function} listener - function that gets called when 'next' button is pressed
   * @param {Object} [options]
   * @constructor
   */
  function AllLevelsCompletedDialog( listener, options ) {
    Node.call( this );

    // create the smiley face
    var faceNode = new FaceNode( FACE_DIAMETER );

    // create the dialog text
    var textMessage = new MultiLineText( youCompletedAllLevelsString, { font: new PhetFont( 25 ) } );

    // create the button
    var button = new RectangularPushButton( {
      content: new Text( doneString, { font: new PhetFont( 30 ) } ),
      listener: listener,
      baseColor: 'yellow'
    } );

    // add the main background panel
    this.addChild( new Panel(
      new VBox( { children: [ faceNode, textMessage, button ], spacing: 20 } ),
      { xMargin: 50, yMargin: 20 }
    ) );

    this.mutate( options );
  }

  expressionExchange.register( 'AllLevelsCompletedDialog', AllLevelsCompletedDialog );

  return inherit( Node, AllLevelsCompletedDialog );
} );