// Copyright 2016, University of Colorado Boulder

/**
 * button used for breaking things apart
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // images
  var breakApartIconImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon.png' );
  var yellowBreakApartIconImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon-yellow.png' );

  // constants
  var MARGIN = 3.5;
  var ICON_SCALE = 0.35;
  var YELLOW = new Color( 'yellow' );
  var BLACK = new Color( 'black' );

  /**
   * @constructor
   */
  function BreakApartButton( options ) {

    options = options || {};

    // the following options can't be overridden
    this.blackIconNode = new Image( breakApartIconImage, { scale: ICON_SCALE } );
    this.yellowIconNode = new Image( yellowBreakApartIconImage, { scale: ICON_SCALE } );
    options.content = new Node( { children: [ this.blackIconNode, this.yellowIconNode ] } );
    options.xMargin = MARGIN;
    options.yMargin = MARGIN;
    options.baseColor = YELLOW;
    options.cursor = 'pointer';

    RectangularPushButton.call( this, options );
    this.setInverted( false );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton, {

    /**
     * sets an inverted color scheme
     * @param {boolean} inverted
     * @public
     */
    setInverted: function( inverted ) {
      this.baseColor = inverted ? BLACK : YELLOW;
      this.blackIconNode.visible = !inverted;
      this.yellowIconNode.visible = inverted;
    },
    set inverted( value ) { this.setInverted( value ); }
  } );
} );