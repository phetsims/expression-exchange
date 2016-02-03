// Copyright 2016, University of Colorado Boulder

/**
 * This type represents a model of a single or combined coin which can be represented in the view as a coin image or a
 * mathematical term.  A 'combined' coin is one where other matching coins have been combined with this one, kind of
 * like a stack of coins, though they are not represented in the view as a stack.  A 'term' refers to a mathematical
 * term, like xy or x squared.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquareYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // constants
  var MOVEMENT_SPEED = 100; // in model units (which are basically screen coordinates) per second

  /**
   * TODO: document parameters thoroughly once finalized.  Make sure to note requirement for subSupText format of some of the string values.
   * @constructor
   */
  function CoinTerm( coinValue, coinDiameter, coinFrontImage, termText, termValueTextProperty, options ) {

    options = _.extend( {
      initialCount: 1
    }, options );

    PropertySet.call( this, {
      position: Vector2.ZERO, // @public
      userControlled: false, // @public, indicate whether user is currently dragging this coin
      combinedCount: options.initialCount, // @public, number of coins/terms combined into this one, must be 1 or more
      combineHaloActive: false, // @public

      // @public - The dimensions of this model element's view representation and an X offset relative to its model
      // position.  This admittedly breaks the usual model-view rules, but many things in the view need to know this, so
      // having it set by the view worked out to be the best approach.  This is a composite of the view dimensions and
      // an X offset relative to its location in the model.  The X offset is necessary because of the coefficient,
      // which can come and go, and expands the dimensions to the left but not the right.
      viewInfo: null
    } );

    // @public, read only, values that describe the nature of this coin term
    this.coinValue = coinValue;
    this.termText = termText;
    this.coinDiameter = coinDiameter;
    this.coinFrontImage = coinFrontImage;

    // @public, listen only, a property with contains the text that should be shown when displaying term value
    this.termValueTextProperty = termValueTextProperty;

    // @public, listen only, emits and event when an animation finishes and the destination is reached
    this.destinationReached = new Emitter();
  }

  return inherit( PropertySet, CoinTerm, {

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} destination
     */
    travelToDestination: function( destination ){
      var self = this;
      var movementTime = self.position.distance( destination ) / MOVEMENT_SPEED * 1000;
      new TWEEN.Tween( { x: this.position.x, y: this.position.y } )
        .to( { x: destination.x, y: destination.y }, movementTime )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function() {
          self.position = new Vector2( this.x, this.y );
        } )
        .onComplete( function(){
          self.destinationReached.emit();
        } )
        .start();

    }
  }, {

    //-------------------------------------------------------------------------
    // Below are the constructors for the specific coin terms used in the sim.
    //-------------------------------------------------------------------------

    /**
     * @param {Property.<number>} xValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    X: function( xValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      xValueProperty.link( function( xValue ){
        termValueTextProperty.value = xValueProperty.value.toString();
      } );
      return new CoinTerm(
        xValueProperty.value,
        45,
        coinXFrontImage,
        'x',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} yValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    Y: function( yValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      yValueProperty.link( function( yValue ){
        termValueTextProperty.value = yValueProperty.value.toString();
      } );
      return new CoinTerm(
        yValueProperty.value,
        45,
        coinYFrontImage,
        'y',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} zValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    Z: function( zValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      zValueProperty.link( function( zValue ){
        termValueTextProperty.value = zValueProperty.value.toString();
      } );
      return new CoinTerm(
        zValueProperty.value,
        50,
        coinZFrontImage,
        'z',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} xValueProperty
     * @param {Property.<number>} yValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    XTimesY: function( xValueProperty, yValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      Property.multilink( [ xValueProperty, yValueProperty ], function(){
        termValueTextProperty.value = xValueProperty.value.toString() + '\u00B7' + yValueProperty.value.toString();
      } );
      return new CoinTerm(
        xValueProperty.value * yValueProperty.value,
        50,
        coinXYFrontImage,
        'xy',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} xValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    XSquared: function( xValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      xValueProperty.link( function( xValue ){
        termValueTextProperty.value = xValueProperty.value.toString() + '<sup>2</sup>';
      } );
      return new CoinTerm(
        xValueProperty.value * xValueProperty.value,
        55,
        coinXSquaredFrontImage,
        'x<sup>2</sup>',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} yValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    YSquared: function( yValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      yValueProperty.link( function( yValue ){
        termValueTextProperty.value = yValueProperty.value.toString() + '<sup>' + '2' + '</sup>';
      } );
      return new CoinTerm(
        yValueProperty.value * yValueProperty.value,
        60,
        coinYSquaredFrontImage,
        'y<sup>2</sup>',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    },

    /**
     * @param {Property.<number>} xValueProperty
     * @param {Property.<number>} yValueProperty
     * @param {number} initialCount - count of pre-combined coins/terms, defaults to 1
     * @returns {CoinTerm}
     * @constructor
     */
    XSquaredTimesYSquared: function( xValueProperty, yValueProperty, initialCount ){
      var termValueTextProperty = new Property();
      Property.multilink( [ xValueProperty, yValueProperty ], function(){
        termValueTextProperty.value = xValueProperty.value.toString() + '<sup>' + '2' + '</sup>'  + '\u00B7' +
                                      yValueProperty.value.toString() + '<sup>' + '2' + '</sup>';
      } );
      return new CoinTerm(
        Math.pow( xValueProperty.value, 2 ) * Math.pow( yValueProperty.value, 2 ),
        65,
        coinXSquareYSquaredFrontImage,
        'x<sup>2</sup>y<sup>2</sup>',
        termValueTextProperty,
        { initialCount: initialCount || 1 }
      );
    }

  } );
} );