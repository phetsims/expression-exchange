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
  var Property = require( 'AXON/Property' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var FADE_TIME = 0.75; // in seconds
  var NUM_FADE_STEPS = 10; // number of steps for fade out to occur
  var CLOSE_ENOUGH_TO_HOME = 1E-6; // distance at which a coin term is considered to have returned to origin

  // class var for creating unique IDs
  var creationCount = 0;

  /**
   * TODO: document parameters thoroughly once finalized.  Make sure to note requirement for subSupText format of some of the string values.
   * @constructor
   */
  function CoinTerm( valueProperty, coinRadius, termText, termValueTextProperty, typeID, options ) {

    var self = this;
    this.id = 'CT-' + ( ++creationCount ); // @public, read only, unique ID useful for debugging

    options = _.extend( {
      initialCount: 1, // number of instances of this coin term initially combined together, can be negative
      initialPosition: Vector2.ZERO,
      initiallyOnCard: false,

      // flag that controls whether this can be broken down below its initial count, only looked at if the absolute
      // value of the initial count is greater than one
      decomposable: true
    }, options );

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    this.positionProperty = new Property( options.initialPosition );// @public (read only), set using methods below
    this.destinationProperty = new Property( options.initialPosition );// @public (read only), set using methods below
    this.userControlledProperty = new Property( false );// @public, indicate whether user is currently dragging this coin
    this.combineHaloActiveProperty = new Property( false );// @public
    this.showMinusSignWhenNegativeProperty = new Property( true ); // @public, supports showing subtraction in expressions

    // @public (read only), tracks the current in-progress animation, if any
    this.inProgressAnimationProperty = new Property( null );

    // @public, number of coins/terms combined into this one, can be negative
    this.combinedCountProperty = new Property( options.initialCount );

    // @public, flag set to disallow breaking apart, generally used when coin term is in or over an expression
    this.breakApartAllowedProperty = new Property( true );

    // @public - The bounds of this model element's view representation relative to the element's current position.
    // This admittedly breaks the usual model-view rules, but many things in the view need to know this, so having it
    // available on the model element after being set by the view worked out to be the best approach.
    this.relativeViewBoundsProperty = new Property( null );

    // @public (read only), ranges from 1 to 0, used primarily for fading out of a coin term when cancellation occurs
    this.existenceStrengthProperty = new Property( 1 );

    // @public, determines whether the coin term should be depicted on a card in the view
    this.onCardProperty = new Property( options.initiallyOnCard );

    //------------------------------------------------------------------------
    // non-property attributes
    //------------------------------------------------------------------------

    // @public, read only, values that describe the nature of this coin term
    this.typeID = typeID;
    this.valueProperty = valueProperty;
    this.termText = termText;
    this.coinRadius = coinRadius;

    // @public, read only, indicates that the value will never change, will be displayed differently in the view
    this.isConstant = typeID === CoinTermTypeID.CONSTANT;

    // @public, listen only, a property with contains the text that should be shown when displaying term value
    this.termValueTextProperty = termValueTextProperty;

    // @public, read only, tracks what this coin term is composed of and what it can be broken down into
    this.composition = [];
    if ( Math.abs( options.initialCount ) > 1 && options.decomposable ) {
      _.times( Math.abs( options.initialCount ), function() {
        self.composition.push( options.initialCount > 0 ? 1 : -1 );
      } );
    }
    else {
      this.composition.push( options.initialCount );
    }

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public, listen only, emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public, listen only, emits an event when coin terms returns to original position and is not user controlled
    this.returnedToOriginEmitter = new Emitter();

    // @public, listen only, emits an event when this coin term should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private, used when animating back to original position
    this.initialPosition = options.initialPosition;

    //------------------------------------------------------------------------
    // listeners to own properties
    //------------------------------------------------------------------------

    // monitor position, emit returned to origin event when appropriate
    this.positionProperty.lazyLink( function( position ) {
      if ( position.distance( self.initialPosition ) < CLOSE_ENOUGH_TO_HOME && !self.userControlledProperty.get() ) {
        self.returnedToOriginEmitter.emit();
      }
    } );

    // monitor combined count, start fading the existence strength if the count goes to zero
    this.combinedCountProperty.lazyLink( function( combinedCount ) {
      if ( combinedCount === 0 ) {

        // start the periodic timer that will fade the existence strength to zero
        var timerInterval = Timer.setInterval( function() {
          self.existenceStrengthProperty.set( Math.max( self.existenceStrengthProperty.get() - 1 / NUM_FADE_STEPS, 0 ) );
          if ( self.existenceStrengthProperty.get() === 0 ) {
            // fading complete, stop the timer
            Timer.clearInterval( timerInterval );
          }
        }, Math.max( FADE_TIME / NUM_FADE_STEPS * 1000, 1 / 60 * 1000 ) ); // interval should be at least one animation frame
      }
    } );
  }

  expressionExchange.register( 'CoinTerm', CoinTerm );

  return inherit( Object, CoinTerm, {

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} destination
     */
    travelToDestination: function( destination ) {
      var self = this;
      this.destinationProperty.set( destination );
      var movementTime = self.positionProperty.get().distance( destination ) / EESharedConstants.COIN_TERM_MOVEMENT_SPEED * 1000;
      if ( this.inProgressAnimationProperty.get() ) {
        // an animation was in progress - cancel it and start a new one
        this.inProgressAnimationProperty.get().stop();
        this.inProgressAnimationProperty.set( null );
      }
      var currentPosition = this.positionProperty.get();
      if ( !currentPosition.equals( destination ) ) {
        this.inProgressAnimationProperty.set( new TWEEN.Tween( { x: currentPosition.x, y: currentPosition.y } )
          .to( { x: destination.x, y: destination.y }, movementTime )
          .easing( TWEEN.Easing.Cubic.InOut )
          .onUpdate( function() {
            self.positionProperty.set( new Vector2( this.x, this.y ) );
          } )
          .onComplete( function() {
            self.destinationReachedEmitter.emit();
            self.inProgressAnimationProperty.set( null );
          } )
          .start( phet.joist.elapsedTime ) );
      }
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
      this.positionProperty.set( position );
      this.destinationProperty.set( position );
    },

    /**
     * make the coin term cancel any in progress animation and go immediately to the current destination
     * @public
     */
    goImmediatelyToDestination: function() {
      if ( this.inProgressAnimationProperty.get() ) {
        // TODO: replace .stop with .cancel once TWEEN is upgraded
        this.inProgressAnimationProperty.get().stop();
        this.inProgressAnimationProperty.set( null );
        this.positionProperty.set( this.destinationProperty.get() );
      }
    },

    /**
     * absorb the provided coin term into this one
     * @param {CoinTerm} coinTerm
     */
    absorb: function( coinTerm ) {
      var self = this;
      this.combinedCountProperty.set( this.combinedCountProperty.get() + coinTerm.combinedCountProperty.get() );
      coinTerm.composition.forEach( function( minDecomposableValue ) {
        self.composition.push( minDecomposableValue );
      } );
    },

    /**
     * pull out the coin terms from which this one is composed, omitting the first one
     * returns Array.<CoinTerm>
     */
    extractConstituentCoinTerms: function() {
      var extractedCoinTerms = [];

      // create a coin term to reflect each one from which this one is composed
      for ( var i = 1; i < this.composition.length; i++ ) {
        var clone = new CoinTerm(
          this.valueProperty,
          this.coinRadius,
          this.termText,
          this.termValueTextProperty,
          this.typeID,
          {
            initialCount: this.composition[ i ],
            initialPosition: this.initialPosition,
            decomposable: false
          } );
        clone.setPositionAndDestination( this.positionProperty.get() );
        extractedCoinTerms.push( clone );
      }

      // set this to be a single fully decomposed coin term
      this.composition.splice( 1 );
      this.combinedCountProperty.set( this.composition[ 0 ] );

      // return the list of extracted coin terms
      return extractedCoinTerms;
    },

    /**
     * initiate a break apart, which just emits an event and counts on parent model to handle
     * @public
     */
    breakApart: function() {
      assert && assert( Math.abs( this.composition.length ) > 1, 'coin term can\'t be broken apart' );
      this.breakApartEmitter.emit();
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
      var position = this.positionProperty.get();
      var relativeViewBounds = this.relativeViewBoundsProperty.get();
      return new Bounds2(
        position.x + relativeViewBounds.minX,
        position.y + relativeViewBounds.minY,
        position.x + relativeViewBounds.maxX,
        position.y + relativeViewBounds.maxY
      );
    }
  } );
} );