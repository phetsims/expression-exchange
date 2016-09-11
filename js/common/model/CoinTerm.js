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
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var Emitter = require( 'AXON/Emitter' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var FADE_TIME = 0.75; // in seconds
  var NUM_FADE_STEPS = 10; // number of steps for fade out to occur

  // class var for creating unique IDs
  var creationCount = 0;

  /**
   * TODO: document parameters thoroughly once finalized.  Make sure to note requirement for subSupText format of some of the string values.
   * @constructor
   */
  function CoinTerm( valueProperty, coinRadius, termText, termValueTextProperty, typeID, options ) {

    var self = this;
    this.id = 'CT-' + (++creationCount);

    options = _.extend( {
      initialCount: 1,
      initialPosition: Vector2.ZERO
    }, options );

    PropertySet.call( this, {
      position: options.initialPosition, // @public (read only), set using methods below
      destination: options.initialPosition, // @public (read only), set using methods below
      userControlled: false, // @public, indicate whether user is currently dragging this coin
      combinedCount: options.initialCount, // @public, number of coins/terms combined into this one, can be negative
      combineHaloActive: false, // @public
      inProgressAnimation: null, // @public (read only), tracks the current in-progress animation, if any
      showMinusSignWhenNegative: true, // @public, supports showing subtraction in expressions

      // @public, flag set to disallow breaking apart, generally used when coin term is in or over an expression
      breakApartAllowed: true,

      // @public - The bounds of this model element's view representation relative to the element's current position.
      // This admittedly breaks the usual model-view rules, but many things in the view need to know this, so having it
      // available on the model element after being set by the view worked out to be the best approach.
      relativeViewBounds: null,

      // @public (read only), ranges from 1 to 0, used primarily for fading out of a coin term when cancellation occurs
      existenceStrength: 1
    } );

    // @public, read only, values that describe the nature of this coin term
    this.typeID = typeID;
    this.valueProperty = valueProperty;
    this.termText = termText;
    this.coinRadius = coinRadius;

    // @public, read only, indicates that the value will never change, will be displayed differently in the view
    this.isConstant = typeID === CoinTermTypeID.CONSTANT;

    // @public, listen only, a property with contains the text that should be shown when displaying term value
    this.termValueTextProperty = termValueTextProperty;

    // @public, listen only, emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public, listen only, emits an event when coin terms returns to original position and is not user controlled
    this.returnedToOriginEmitter = new Emitter();

    // @public, listen only, emits an event when this coin term should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private, used when animating back to original position
    this.initialPosition = options.initialPosition;

    // monitor position, emit returned to origin event when appropriate
    this.positionProperty.lazyLink( function( position ) {
      if ( position.equals( self.initialPosition ) && !this.userControlled ) {
        self.returnedToOriginEmitter.emit();
      }
    } );

    // monitor combined count, start fading the existence strength if the count goes to zero
    this.combinedCountProperty.lazyLink( function( combinedCount ) {
      if ( combinedCount === 0 ) {
        // start the periodic timer that will fade the existence strength to zero
        var timerInterval = Timer.setInterval( function() {
          self.existenceStrength = Math.max( self.existenceStrength - 1 / NUM_FADE_STEPS, 0 );
          if ( self.existenceStrength === 0 ) {
            // fading complete, stop the timer
            Timer.clearInterval( timerInterval );
          }
        }, Math.max( FADE_TIME / NUM_FADE_STEPS * 1000, 1 / 60 * 1000 ) ); // interval should be at least one animation frame
      }
    } );
  }

  expressionExchange.register( 'CoinTerm', CoinTerm );

  return inherit( PropertySet, CoinTerm, {

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} destination
     */
    travelToDestination: function( destination ) {
      var self = this;
      this.destination = destination;
      var movementTime = self.position.distance( destination ) / EESharedConstants.COIN_TERM_MOVEMENT_SPEED * 1000;
      if ( this.inProgressAnimation ) {
        // an animation was in progress - cancel it and start a new one
        this.inProgressAnimation.stop();
        this.inProgressAnimation = null;
      }
      this.inProgressAnimation = new TWEEN.Tween( { x: this.position.x, y: this.position.y } )
        .to( { x: destination.x, y: destination.y }, movementTime )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function() {
          self.position = new Vector2( this.x, this.y );
        } )
        .onComplete( function() {
          self.destinationReachedEmitter.emit();
          self.inProgressAnimation = null;
        } )
        .start( phet.joist.elapsedTime );
    },

    returnToOrigin: function() {
      this.travelToDestination( this.initialPosition );
    },

    /**
     * set both the position and destination in such a way that no animation is initiated
     * @param position
     * @public
     */
    setPositionAndDestination: function( position ) {
      this.position = position;
      this.destination = position;
    },

    /**
     * make the coin term cancel any in progress animation and go immediately to the current destination
     * @public
     */
    goImmediatelyToDestination: function() {
      if ( this.inProgressAnimation ) {
        // TODO: replace .stop with .cancel once TWEEN is upgraded
        this.inProgressAnimation.stop();
        this.inProgressAnimation = null;
        this.position = this.destination;
      }
    },

    /**
     * initiate a break apart, which just emits an event and counts on parent model to handle
     * @public
     */
    breakApart: function() {
      assert && assert( Math.abs( this.combinedCount ) > 1, 'coin term can\'t be broken apart' );
      this.breakApartEmitter.emit();
    },

    /**
     * Get a coin term with all of the same fixed attributes and the same position.  Some attributes, such as
     * userControlled, are not copied.
     * @returns {CoinTerm}
     * @public
     */
    cloneMostly: function() {
      var clone = new CoinTerm(
        this.valueProperty,
        this.coinRadius,
        this.termText,
        this.termValueTextProperty,
        this.typeID,
        { initialCount: this.combinedCount, initialPosition: this.initialPosition } );
      clone.setPositionAndDestination( this.position );
      return clone;
    },

    /**
     * tests if this coin term can be legitimately combined with another coin term
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
     */
    canCombineWith: function( coinTerm ) {
      return coinTerm !== this && coinTerm.typeID === this.typeID;
    },

    /**
     * return the bounds of this model elements representation in the view
     * @public
     */
    getViewBounds: function() {
      return new Bounds2(
        this.position.x + this.relativeViewBounds.minX,
        this.position.y + this.relativeViewBounds.minY,
        this.position.x + this.relativeViewBounds.maxX,
        this.position.y + this.relativeViewBounds.maxY
      );
    }
  } );
} );