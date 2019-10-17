// Copyright 2016-2019, University of Colorado Boulder

/**
 * button used for putting expressions into edit mode
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

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

  return inherit( RectangularPushButton, EditExpressionButton, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeEditExpressionButton();
      RectangularPushButton.prototype.dispose.call( this );
    }

  } );
} );