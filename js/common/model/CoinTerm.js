// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents a model of a single or combined coin which can be represented in the view as a coin image or a
 * mathematical term.  A 'combined' coin is one where other matching coins have been combined with this one, kind of
 * like a stack of coins, though they are not represented in the view as a stack.  A 'term' refers to a mathematical
 * term, like xy or x squared.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import AnimationSpec from './AnimationSpec.js';

// constants
const COIN_TERM_FADE_TIME = 0.75; // in seconds
const CLOSE_ENOUGH_TO_HOME = 1E-6; // distance at which a coin term is considered to have returned to origin
const CARD_PRE_FADE_TIME = 0.25; // time before card starts to fade after user grabs it, in seconds
const CARD_FADE_TIME = 0.5; // time for a card to fade out
const MAX_ANIMATION_TIME = 1; // max time for an animation to complete

// class var for creating unique IDs
let creationCount = 0;

class CoinTerm {

  /**
   * @param {Property.<number>} valueProperty - value of the coin term wrapped in a property
   * @param {number} coinRadius - radius of the coin portion of the coin term, in view coordinates
   * @param {string} termText - textual representation, e.g. 'x', must be compatible with SubSupText
   * @param {Property.<string>} termValueStringProperty
   * @param {CoinTermTypeID} typeID - type identifier for this coin term
   * @param {Object} [options]
   */
  constructor( valueProperty, coinRadius, termText, termValueStringProperty, typeID, options ) {

    this.id = `CT-${++creationCount}`; // @public (read-only) - unique ID useful for debugging

    options = merge( {
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

    // @public (read-only) - set using methods below
    this.positionProperty = new Vector2Property( options.initialPosition );

    // @public (read-only) - set using methods below
    this.destinationProperty = new Vector2Property( options.initialPosition );

    // @public {Property.<boolean>} - indicate whether user is currently dragging this coin
    this.userControlledProperty = new Property( false );

    // @public {Property.<boolean>}
    this.combineHaloActiveProperty = new Property( false );

    // @public {Property.<boolean>} - supports showing subtraction in expressions
    this.showMinusSignWhenNegativeProperty = new Property( true );

    // @public {Property.<boolean>, indicates whether this is in a collection box (for game)
    this.collectedProperty = new Property( false );

    // @public (read-only) {Property.<AnimationSpec|null>} - tracks the current in-progress animation, null if none
    this.inProgressAnimationProperty = new Property( null );

    // @public (read-only) {Property.<number>} - total number of coins/terms combined into this one, can be negative
    this.totalCountProperty = new Property( options.initialCount );

    // @public {Property.<boolean> - flag that controls whether breaking apart is allowed
    this.breakApartAllowedProperty = new Property( true );

    // @public (read-only) {Property.<Bounds2> - The bounds of this model element's view representation relative to the
    // element's current position. This admittedly breaks the usual model-view rules, but many things in the view need
    // to know this, so having it available on the model element after being set by the view worked out to be the best
    // approach.
    this.localViewBoundsProperty = new Property( null );

    // @public (read-only) {Property.<number>} - ranges from 1 to 0, used primarily for fading out of a coin term when
    // cancellation occurs, once set to any value less than 1 it will automatically fade to 0
    this.existenceStrengthProperty = new Property( 1 );

    // @public {Property.<number>} - determines the opacity of the card on which the coin term can reside
    this.cardOpacityProperty = new Property( options.initiallyOnCard ? 1 : 0 );

    // @public {Property.<number>} - used by view to make the coin terms appear smaller if necessary when put in
    // collection areas (game only)
    this.scaleProperty = new Property( 1 );

    // @public {Property.<Expression|null>} - expression of which this coin term is a part, which is null for a 'solo'
    // coin term.
    this.expressionProperty = new Property( null );

    //------------------------------------------------------------------------
    // non-property attributes
    //------------------------------------------------------------------------

    // @public (read-only) - values that describe the nature of this coin term
    this.typeID = typeID;
    this.valueProperty = valueProperty;
    this.termText = termText;
    this.coinRadius = coinRadius;
    this.initiallyOnCard = options.initiallyOnCard;

    // @public (read-only) - indicates that the value will never change, will be displayed differently in the view
    this.isConstant = typeID === CoinTermTypeID.CONSTANT;

    // @public (read-only) - a property which contains the text that should be shown when displaying term value
    this.termValueStringProperty = termValueStringProperty;

    // @public (read-only) {Array.<number>} - tracks what this coin term is composed of and what it can be broken down into
    this.composition = [];
    if ( Math.abs( options.initialCount ) > 1 && options.decomposable ) {
      _.times( Math.abs( options.initialCount ), () => {
        this.composition.push( options.initialCount > 0 ? 1 : -1 );
      } );
    }
    else {
      this.composition.push( options.initialCount );
    }

    // @private {number|null} - countdown timers for fading out the card background
    this.cardPreFadeCountdown = null;
    this.cardFadeCountdown = null;

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public (read-only) {Emitter} - emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when coin terms returns to original position and is not user controlled
    this.returnedToOriginEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when this coin term should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private {Vector2} - used when animating back to original position
    this.initialPosition = options.initialPosition;

    //------------------------------------------------------------------------
    // listeners to own properties
    //------------------------------------------------------------------------

    this.userControlledProperty.link( uc => {
      phet.log && phet.log( `coin term ${this.id} uc changed to: ${uc}` );
    } );

    // monitor the total count, start fading the existence strength if it goes to zero
    this.totalCountProperty.lazyLink( totalCount => {
      if ( totalCount === 0 ) {

        // initiate the fade out by setting the existence strength to a value just less than 1
        this.existenceStrengthProperty.set( 0.9999 );
      }
    } );

    this.collectedProperty.link( collected => {

      // set the flag that is used to disable breaking apart whenever this coin term is captured in a collection area
      this.breakApartAllowedProperty.set( !collected );
    } );

    // update the appearance of the background card as the user interacts with this coin term
    this.userControlledProperty.lazyLink( userControlled => {

      if ( options.initiallyOnCard ) {

        if ( userControlled ) {

          // If this coin term is decomposed as far as it can go, show the background card when the user grabs it, but
          // fade it out after a little while.
          if ( this.composition.length === 1 ) {
            this.cardOpacityProperty.set( 1 );
            this.cardPreFadeCountdown = CARD_PRE_FADE_TIME;
            this.cardFadeCountdown = null;
          }
        }
        else if ( this.cardOpacityProperty.get() !== 0 ) {
          this.cardOpacityProperty.set( 0 ); // the card is not visible if not controlled by the user
          this.cardPreFadeCountdown = null;
          this.cardFadeCountdown = null;
        }
      }
    } );
  }

  /**
   * step function, used for animations
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step( dt ) {

    // if there is an animation in progress, step it
    const animation = this.inProgressAnimationProperty.get();
    if ( animation ) {
      animation.timeSoFar += dt;
      if ( animation.timeSoFar < animation.totalDuration ) {

        // not there yet - take a step towards the destination
        const proportionCompleted = animation.timeSoFar / animation.totalDuration;
        const easingProportion = Easing.CUBIC_IN_OUT.value( proportionCompleted );
        this.positionProperty.set(
          animation.startPosition.plus(
            animation.travelVector.withMagnitude( animation.travelVector.magnitude * easingProportion )
          )
        );
      }
      else {

        // destination reached, end the animation
        this.positionProperty.set( this.destinationProperty.get() );
        this.inProgressAnimationProperty.set( null );
        this.destinationReachedEmitter.emit();
      }
    }

    // if this coin term is fading out, continue the fade
    if ( this.isFadingOut() ) {
      this.existenceStrengthProperty.set( Math.max(
        this.existenceStrengthProperty.get() - ( dt / COIN_TERM_FADE_TIME ),
        0
      ) );
    }

    // if the background card is visible, step its fade sequence
    if ( this.cardPreFadeCountdown !== null ) {
      this.cardPreFadeCountdown = Math.max( this.cardPreFadeCountdown - dt, 0 );
      if ( this.cardPreFadeCountdown === 0 ) {

        // pre-fade complete, start fade
        this.cardPreFadeCountdown = null;
        this.cardFadeCountdown = CARD_FADE_TIME;
      }
    }
    else if ( this.cardFadeCountdown !== null ) {
      this.cardFadeCountdown = Math.max( this.cardFadeCountdown - dt, 0 );
      this.cardOpacityProperty.set( this.cardFadeCountdown / CARD_FADE_TIME );
      if ( this.cardFadeCountdown === 0 ) {

        // fade complete
        this.cardFadeCountdown = null;
      }
    }

    // if this coin term has returned to its origin, emit an event to trigger removal
    if ( this.positionProperty.get().distance( this.initialPosition ) < CLOSE_ENOUGH_TO_HOME && !this.userControlledProperty.get() ) {
      this.returnedToOriginEmitter.emit();
    }
  }

  /**
   * move to the specified destination, but do so a step at a time rather than all at once
   * @param {Vector2} destination
   * @public
   */
  travelToDestination( destination ) {
    this.destinationProperty.set( destination );
    const currentPosition = this.positionProperty.get();
    if ( currentPosition.equals( destination ) ) {

      // The coin terms is already at the destination, no animation is required, but emit a notification in case the
      // the client needs it.
      this.destinationReachedEmitter.emit();
    }
    else {

      // calculate the time needed to get to the destination
      const animationDuration = Math.min(
        this.positionProperty.get().distance( destination ) / EESharedConstants.COIN_TERM_MOVEMENT_SPEED,
        MAX_ANIMATION_TIME
      );

      this.inProgressAnimationProperty.set( new AnimationSpec(
        this.positionProperty.get().copy(),
        destination.minus( this.positionProperty.get() ),
        animationDuration
      ) );
    }
  }

  /**
   * send this coin term back to its origin, generally used when putting a coin term back in the 'creator box'
   * @public
   */
  returnToOrigin() {
    this.travelToDestination( this.initialPosition );
  }

  /**
   * set both the position and destination in such a way that no animation is initiated
   * @param {Vector2} position
   * @public
   */
  setPositionAndDestination( position ) {
    this.positionProperty.set( position );
    this.destinationProperty.set( position );
  }

  /**
   * make the coin term cancel any in progress animation and go immediately to the current destination
   * @public
   */
  goImmediatelyToDestination() {
    if ( this.inProgressAnimationProperty.get() ) {
      this.inProgressAnimationProperty.set( null );
    }
    this.positionProperty.set( this.destinationProperty.get() );
  }

  /**
   * an alternative way to set position that uses a flag to determine whether to animate or travel instantly
   * @param {Vector2} position
   * @param {boolean} animate
   * @public
   */
  goToPosition( position, animate ) {
    if ( animate ) {
      this.travelToDestination( position );
    }
    else {
      this.setPositionAndDestination( position );
    }
  }

  /**
   * absorb the provided coin term into this one
   * @param {CoinTerm} coinTermToAbsorb
   * @param {boolean} doPartialCancellation - controls whether opposite terms in the composition cancel one another
   * or are retained, for example, when combining a coin term composed of [ -1, -1 ] with one composed of [ 1 ] and
   * doPartialCancellation set to true, the result is [ -1 ], if false, it's [ 1, -1, -1 ].
   * @public
   */
  absorb( coinTermToAbsorb, doPartialCancellation ) {
    assert && assert( this.typeID === coinTermToAbsorb.typeID, 'can\'t combine coin terms of different types' );
    this.totalCountProperty.value += coinTermToAbsorb.totalCountProperty.value;

    if ( doPartialCancellation ) {
      coinTermToAbsorb.composition.forEach( minDecomposableValue => {
        const index = this.composition.indexOf( -1 * minDecomposableValue );
        if ( index > -1 ) {
          // cancel this value from the composition of the receiving coin term
          this.composition.splice( index, 1 );
        }
        else {
          // add this element of the incoming coin term to the receiving coin term
          this.composition.push( minDecomposableValue );
        }
      } );
    }
    else {
      coinTermToAbsorb.composition.forEach( minDecomposableValue => {
        this.composition.push( minDecomposableValue );
      } );
    }
  }

  /**
   * pull out the coin terms from which this one is composed, omitting the first one
   * @returns Array.<CoinTerm>
   * @public
   */
  extractConstituentCoinTerms() {
    const extractedCoinTerms = [];

    // create a coin term to reflect each one from which this one is composed
    for ( let i = 1; i < this.composition.length; i++ ) {
      const extractedCoinTerm = new CoinTerm(
        this.valueProperty,
        this.coinRadius,
        this.termText,
        this.termValueStringProperty,
        this.typeID,
        {
          initialCount: this.composition[ i ],
          initialPosition: this.initialPosition,
          initiallyOnCard: this.initiallyOnCard,
          decomposable: false
        } );
      extractedCoinTerm.cardOpacityProperty.set( 0 ); // set card invisible when extracted
      extractedCoinTerm.setPositionAndDestination( this.positionProperty.get() );
      extractedCoinTerms.push( extractedCoinTerm );
    }

    // set this to be a single fully decomposed coin term
    this.composition.splice( 1 );
    this.totalCountProperty.set( this.composition[ 0 ] );

    // return the list of extracted coin terms
    return extractedCoinTerms;
  }

  /**
   * initiate a break apart, which just emits an event and counts on parent model to handle
   * @public
   */
  breakApart() {
    assert && assert( Math.abs( this.composition.length ) > 1, 'coin term can\'t be broken apart' );
    this.breakApartEmitter.emit();
  }

  /**
   * check if this coin term is eligible to combine with the provided one, see the implementation for details of what
   * it means to be 'eligible'
   * @param {CoinTerm} candidateCoinTerm
   * @returns {boolean}
   * @public
   */
  isEligibleToCombineWith( candidateCoinTerm ) {

    return candidateCoinTerm !== this && // can't combine with self
           candidateCoinTerm.typeID === this.typeID && // can only combine with coins of same type
           !this.userControlledProperty.get() && // can't combine if currently user controlled
           !this.isFadingOut() && // can't combine if currently fading out
           !this.collectedProperty.get(); // can't combine if in a collection area
  }

  /**
   * return the bounds of this model elements representation in the view
   * @returns {Bounds2}
   * @public
   */
  getViewBounds() {
    const position = this.positionProperty.get();
    return this.localViewBoundsProperty.get().shiftedXY( position.x, position.y );
  }

  /**
   * returns true if this coin term is fading out, false otherwise
   * @returns {boolean}
   * @public
   */
  isFadingOut() {
    return this.existenceStrengthProperty.get() < 1;
  }
}

expressionExchange.register( 'CoinTerm', CoinTerm );

export default CoinTerm;