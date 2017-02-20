// Copyright 2017, University of Colorado Boulder

/**
 * button for undoing a previous operation
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var MARGIN = 5;
  var ICON_HEIGHT = 17; // empirically determined, controls size of icon

  /**
   * @constructor
   * {Object} options
   */
  function UndoButton( options ) {

    options = _.extend(
      {
        xMargin: MARGIN,
        yMargin: MARGIN,
        baseColor: new Color( 'yellow' ),
        cursor: 'pointer',
        arrowFill: 'black'
      },
      options
    );

    // create the shape for the undo arrow
    var undoArrowShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, ICON_HEIGHT )
      .lineTo( ICON_HEIGHT, ICON_HEIGHT )
      .lineTo( ICON_HEIGHT * 0.7, ICON_HEIGHT * 0.7 )
      //.lineTo( ICON_HEIGHT * 2, ICON_HEIGHT * 0.5 )
      .quadraticCurveTo( ICON_HEIGHT * 1.25, -ICON_HEIGHT * 0.1, ICON_HEIGHT * 2, ICON_HEIGHT * 0.75 )
      //.lineTo( ICON_HEIGHT * 0.25, ICON_HEIGHT * 0.25 )
      .quadraticCurveTo( ICON_HEIGHT * 1.25, -ICON_HEIGHT * 0.5, ICON_HEIGHT * 0.3, ICON_HEIGHT * 0.3 )
      .lineTo( 0, 0 )
      .close();

    // set up the content node
    options.content = new Path( undoArrowShape, {
      fill: options.arrowFill
    } );

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'UndoButton', UndoButton );

  return inherit( RectangularPushButton, UndoButton );
} );