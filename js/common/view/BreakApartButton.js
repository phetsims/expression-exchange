// Copyright 2016-2022, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import scissorsShape from '../../../../sherpa/js/fontawesome-4/scissorsShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const MARGIN = 3.5;
const ICON_WIDTH = 16; // in screen coordinates
const BLACK_SCISSORS_ICON = createIconNode( Color.BLACK );
const YELLOW_SCISSORS_ICON = createIconNode( PhetColorScheme.BUTTON_YELLOW );

class BreakApartButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      mode: 'normal' // valid values are 'normal' and 'inverted'
    }, options );

    // verify options are valid
    assert && assert( options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option' );

    const icon = options.mode === 'normal' ? BLACK_SCISSORS_ICON : YELLOW_SCISSORS_ICON;
    const iconNode = new Node( { children: [ icon ] } );

    // the following options can't be overridden, and are set here and then passed to the parent type below
    merge( options, {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: options.mode === 'normal' ? PhetColorScheme.BUTTON_YELLOW : Color.BLACK,
      cursor: 'pointer',
      content: iconNode
    } );

    super( options );

    // @private
    this.disposeBreakApartButton = () => {
      iconNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBreakApartButton();
    super.dispose();
  }
}

/**
 * helper function for creating the icon node used on the button
 * @param {Color} color
 * @returns {Path}
 */
function createIconNode( color ) {
  const iconNode = new Path( scissorsShape, {
    rotation: -Math.PI / 2, // make scissors point up
    fill: color
  } );
  iconNode.setScaleMagnitude( ICON_WIDTH / iconNode.width );
  return iconNode;
}

expressionExchange.register( 'BreakApartButton', BreakApartButton );
export default BreakApartButton;