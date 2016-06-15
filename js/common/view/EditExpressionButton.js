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
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  /**
   * @constructor
   */
  function EditExpressionButton( options ) {

    options = options || {};

    // the following options can't be overridden
    options.content = new FontAwesomeNode( 'pencil_square_o', { scale: 0.35 } ); // scale empirically determined
    options.xMargin = 3; // empirically determined
    options.yMargin = 4; // empirically determined
    options.baseColor = 'white';
    options.cursor = 'pointer';

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'EditExpressionButton', EditExpressionButton );

  return inherit( RectangularPushButton, EditExpressionButton );
} );