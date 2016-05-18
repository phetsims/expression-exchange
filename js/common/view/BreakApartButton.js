// Copyright 2016, University of Colorado Boulder

/**
 * button used for breaking things apart
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // images
  var breakApartIconImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon.png' );

  // constants
  var MARGIN = 3;

  /**
   * @constructor
   */
  function BreakApartButton( options ) {

    options = options || {};

    // the following options can't be overridden
    options.content = new Image( breakApartIconImage, { scale: 0.3 } ); // scale empirically determined
    options.xMargin = MARGIN;
    options.yMargin = MARGIN;
    options.baseColor = 'yellow';

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton );
} );