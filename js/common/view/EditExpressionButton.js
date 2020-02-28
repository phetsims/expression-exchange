// Copyright 2016-2020, University of Colorado Boulder

/**
 * button used for putting expressions into edit mode
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const ICON = new FontAwesomeNode( 'exchange', { scale: 0.35 } ); // scale empirically determined

/**
 * @constructor
 */
function EditExpressionButton( options ) {

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

  RectangularPushButton.call( this, options );

  this.disposeEditExpressionButton = function() {
    iconNode.dispose();
  };
}

expressionExchange.register( 'EditExpressionButton', EditExpressionButton );

export default inherit( RectangularPushButton, EditExpressionButton, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeEditExpressionButton();
    RectangularPushButton.prototype.dispose.call( this );
  }

} );