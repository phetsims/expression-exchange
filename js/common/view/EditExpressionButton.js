// Copyright 2016-2025, University of Colorado Boulder

/**
 * button used for putting expressions into edit mode
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import exchangeAltSolidShape from '../../../../sherpa/js/fontawesome-5/exchangeAltSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';


// constants
const ICON = new Path( exchangeAltSolidShape, { scale: 0.03, fill: Color.BLACK } ); // scale empirically determined

class EditExpressionButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {}, options );

    const iconNode = new Node( { children: [ ICON ] } );

    // the following options can't be overridden
    options = merge( options, {
      content: iconNode,
      xMargin: 3, // empirically determined
      yMargin: 5.5, // empirically determined
      baseColor: 'white',
      cursor: 'pointer'
    } );

    super( options );

    // @private
    this.disposeEditExpressionButton = () => {
      iconNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeEditExpressionButton();
    super.dispose();
  }
}

expressionExchange.register( 'EditExpressionButton', EditExpressionButton );
export default EditExpressionButton;