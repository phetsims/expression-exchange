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

    options = _.extend( {}, options );

    // the following options can't be overridden
    options = _.extend( options, {
      content: new FontAwesomeNode( 'exchange', { scale: 0.35 } ), // scale empirically determined
      xMargin: 3, // empirically determined
      yMargin: 5.5, // empirically determined
      baseColor: 'white',
      cursor: 'pointer'
    } );

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'EditExpressionButton', EditExpressionButton );

  return inherit( RectangularPushButton, EditExpressionButton );
} );