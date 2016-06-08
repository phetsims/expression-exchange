// Copyright 2016, University of Colorado Boulder

/**
 * button used for putting expressions into edit mode
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // images
  var editExpressionIcon = require( 'image!EXPRESSION_EXCHANGE/edit-icon.png' );

  /**
   * @constructor
   */
  function EditExpressionButton( options ) {

    options = options || {};

    // the following options can't be overridden
    options.content = new Image( editExpressionIcon, { scale: 0.3 } ); // scale empirically determined
    options.xMargin = 3; // empirically determined
    options.yMargin = 4; // empirically determined
    options.baseColor = 'white';
    options.cursor = 'pointer';

    RectangularPushButton.call( this, options );

    // add a listener that will prevent events from bubbling to the parent
    this.addInputListener( {
      down: function( event ) {
        event.handle();
      },
      up: function( event ) {
        event.handle();
      }
    } );
  }

  expressionExchange.register( 'EditExpressionButton', EditExpressionButton );

  return inherit( RectangularPushButton, EditExpressionButton );
} );