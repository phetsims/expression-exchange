// Copyright 2016-2017, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // constants
  var MARGIN = 3.5;
  var ICON_SCALE = 0.35;
  var BLACK_SCISSORS_ICON = createIconNode( 'black' );
  var YELLOW_SCISSORS_ICON = createIconNode( 'yellow' );

  /**
   * @constructor
   * @param {Object} [options]
   */
  function BreakApartButton( options ) {

    options = _.extend( {
      mode: 'normal' // valid values are 'normal' and 'inverted'
    }, options );

    // verify options are valid
    assert && assert( options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option' );

    var icon = options.mode === 'normal' ? BLACK_SCISSORS_ICON : YELLOW_SCISSORS_ICON;
    var iconNode = new Node( { children: [ icon ] } );

    // the following options can't be overridden, and are set here and then passed to the parent type below
    _.extend( options, {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: options.mode === 'normal' ? 'yellow' : 'black',
      cursor: 'pointer',
      content: iconNode
    } );

    RectangularPushButton.call( this, options );

    this.disposeBreakApartButton = function() {
      iconNode.dispose();
    };
  }

  /**
   * helper function for creating the icon node used on the button
   * @param {string} color
   * @returns {FontAwesomeNode}
   */
  function createIconNode( color ) {
    return new FontAwesomeNode( 'cut', {
      scale: ICON_SCALE,
      rotation: -Math.PI / 2, // scissors point up
      fill: color,
      stroke: color
    } );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeBreakApartButton();
      RectangularPushButton.prototype.dispose.call( this );
    }
  } );
} );