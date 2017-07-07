// Copyright 2016, University of Colorado Boulder

/**
 * button used for putting expressions into edit mode
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // constants
  var ICON = new FontAwesomeNode( 'exchange', { scale: 0.35 } ); // scale empirically determined

  /**
   * @constructor
   */
  function EditExpressionButton( options ) {

    options = _.extend( {}, options );

    var iconNode = new Node( { children: [ ICON ] } );

    // the following options can't be overridden
    options = _.extend( options, {
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