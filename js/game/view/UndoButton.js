// Copyright 2017-2020, University of Colorado Boulder

/**
 * button for undoing a previous operation
 *
 * @author John Blanco
 */

import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const MARGIN = 5;
const ICON_HEIGHT = 17; // empirically determined, controls size of icon

class UndoButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: new Color( 'yellow' ),
      cursor: 'pointer',
      arrowFill: 'black'
    }, options );

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
    assert && assert( !options.content, 'content should not be specified for this button' );
    options.content = new Path( undoArrowShape, {
      fill: options.arrowFill
    } );

    super( options );
  }
}

expressionExchange.register( 'UndoButton', UndoButton );
export default UndoButton;