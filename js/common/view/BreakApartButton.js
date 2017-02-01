// Copyright 2016, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // images
  var breakApartIconBlackImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon-black.png' );
  var breakApartIconYellowImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon-yellow.png' );

  // constants
  var MARGIN = 3.5;
  var ICON_SCALE = 0.35;
  var YELLOW = new Color( 'yellow' );
  var BLACK = new Color( 'black' );

  /**
   * @constructor
   * {Object} options
   */
  function BreakApartButton( options ) {

    options = _.extend( {
      mode: 'normal' // valid values are 'normal' and 'inverted'
    }, options );

    // verify options are valid
    assert && assert( options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option' );

    // the following options can't be overridden
    options.xMargin = MARGIN;
    options.yMargin = MARGIN;
    options.baseColor = options.mode === 'normal' ? YELLOW : BLACK;
    options.cursor = 'pointer';

    // set up the content node
    if ( options.mode === 'normal' ) {
      options.content = new Image( breakApartIconBlackImage, { scale: ICON_SCALE } );
    }
    else if ( options.mode === 'inverted' ) {
      options.content = new Image( breakApartIconYellowImage, { scale: ICON_SCALE } );
    }

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton );
} );