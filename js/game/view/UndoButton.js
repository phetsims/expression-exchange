// Copyright 2017, University of Colorado Boulder

/**
 * button for undoing a previous operation
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const MARGIN = 5;
  const ICON_HEIGHT = 17; // empirically determined, controls size of icon

  /**
   * @constructor
   * @param {Object} [options]
   */
  function UndoButton( options ) {

    options = _.extend( {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: new Color( 'yellow' ),
      cursor: 'pointer',
      arrowFill: 'black'
    }, options );

    assert && assert( !options.content, 'content should not be specified for this button' );

    // create the shape for the undo arrow
    const undoArrowShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, ICON_HEIGHT )
      .lineTo( ICON_HEIGHT, ICON_HEIGHT )
      .lineTo( ICON_HEIGHT * 0.7, ICON_HEIGHT * 0.7 )
      .quadraticCurveTo( ICON_HEIGHT * 1.25, -ICON_HEIGHT * 0.1, ICON_HEIGHT * 2, ICON_HEIGHT * 0.75 )
      .quadraticCurveTo( ICON_HEIGHT * 1.25, -ICON_HEIGHT * 0.5, ICON_HEIGHT * 0.3, ICON_HEIGHT * 0.3 )
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