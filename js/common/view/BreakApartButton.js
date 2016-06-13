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
  var MARGIN = 3.5;
  //function HANDLE( event ){ event.handle(); };
  function HANDLE( event ){
    console.log( 'event.type = ' + event.type );
    event.handle();
  };

  /**
   * @constructor
   */
  function BreakApartButton( options ) {

    options = options || {};

    // the following options can't be overridden
    options.content = new Image( breakApartIconImage, { scale: 0.35 } ); // scale empirically determined
    options.xMargin = MARGIN;
    options.yMargin = MARGIN;
    options.baseColor = 'yellow';
    options.cursor = 'pointer';

    RectangularPushButton.call( this, options );

    // add a listener that will prevent events from bubbling to the parent
    this.addInputListener( {
      down: HANDLE,
      up: HANDLE
      //move: HANDLE,
      //touchenter: HANDLE,
      //touchover: HANDLE,
      //touchdown: HANDLE,
      //touchout: HANDLE,
      //touchexit: HANDLE,
      //touchup: HANDLE,
      //touchStart: HANDLE,
      //touchEnd: HANDLE,
      //touchMove: HANDLE,
      //pointerdown: HANDLE,
      //pointerup: HANDLE
    } );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton );
} );