// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents a model of an expression.  An expression is a set of coin terms all positioned in a line.  In
 * the view, an expression is represented as a box containing the coin terms with plus symboles between them.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import AnimationSpec from './AnimationSpec.js';

// constants
const INTER_COIN_TERM_SPACING = 30; // in model units, empirically determined
const X_MARGIN = 14; // margin for coin terms, empirically determined
const Y_MARGIN = 12; // margin for coin terms, empirically determined
const ANIMATION_SPEED = 400; // in model units (which are basically screen coordinates) per second
const MAX_ANIMATION_TIME = 1; // seconds

// class var for creating unique IDs
let creationCount = 0;

class Expression {

  /**
   * @param {CoinTerm} anchorCoinTerm
   * @param {CoinTerm} floatingCoinTerm
   * @param {Property.<boolean>} simplifyNegativesProperty
   */
  constructor( anchorCoinTerm, floatingCoinTerm, simplifyNegativesProperty ) {

    const self = this;
    this.id = `EX-${++creationCount}`;

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    this.upperLeftCornerProperty = new Vector2Property( Vector2.ZERO ); // @public
    this.widthProperty = new Property( 0 ); // @public (read-only) {Property.<number>}
    this.heightProperty = new Property( 0 ); // @public (read-only) {Property.<number>}
    this.userControlledProperty = new Property( false ); // @public {Property.<boolean>}
    this.inEditModeProperty = new Property( false ); // @public {Property.<boolean>} - indicates whether this expression is being edited
    this.collectedProperty = new Property( false ); // @public {Property.<boolean>} - indicates whether this is in a collection box (for game)

    // @public (read-only) {Property.<AnimationSpec>} - tracks the current in-progress animation, if any
    this.inProgressAnimationProperty = new Property( null );

    // @public (read-only) {Property.<boolean>} indicates whether the 'combine halo' should be visible
    this.combineHaloActiveProperty = new Property( false );

    // @public (read-only) - size and state of the hints that can appear at left and right of the expression
    this.leftHintActiveProperty = new Property( false );
    this.leftHintWidthProperty = new Property( 0 );
    this.rightHintActiveProperty = new Property( false );
    this.rightHintWidthProperty = new Property( 0 );

    // @private, used to update whether or not coin terms should show minus sign when negative
    this.simplifyNegativesProperty = simplifyNegativesProperty;

    // @public (read-only) - scale, used to shrink the expression when it is collected or uncollected
    this.scaleProperty = new DerivedProperty( [ this.collectedProperty ], collected => collected ?
                                                                                       Math.min( EESharedConstants.COLLECTION_AREA_SIZE.width / this.widthProperty.get(), 1 ) * 0.9 :
                                                                                       1 );

    //------------------------------------------------------------------------
    // observable arrays
    //------------------------------------------------------------------------

    // @public (read/listen-only) {ObservableArrayDef.<CoinTerm>} - items should be added and removed via methods
    this.coinTerms = createObservableArray();

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public (read-only) {Emitter} - emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when the size of the expression or the relative positions of the coins
    // change, generally used by the view so that it knows when to update, does NOT fire for position-only changes
    // or for activation/deactivation of hints
    this.layoutChangedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when this expression should be broken apart
    this.breakApartEmitter = new Emitter();

    //------------------------------------------------------------------------
    // non-observable attributes
    //------------------------------------------------------------------------

    // @private {Array.<CoinTerm>} - tracks coin terms that are hovering over this expression but are being controlled by
    // the user so are not yet part of the expression.  This is used to activate and size the hints.  Coin terms should
    // be added and removed via methods.
    this.hoveringCoinTerms = [];

    // @private {Array.<Expression>} - tracks expressions that are hovering over this expression and would be combined
    // with this one if released by the user.  This is used to activate the 'halo' that indicates that potential
    // combination.
    this.hoveringExpressions = [];

    // @private {boolean} - tracks whether the expression should be resized on the next step
    this.resizeNeeded = false;

    // @private {CoinTerm.id} => {Function} - map used to track user controlled listeners that are added to coin terms
    // that join this expression
    this.mapCoinTermsToUCListeners = {};

    // @private {Bounds2} - bounds that will be used to decide if coin terms or other expressions are in a position to
    // join this one
    this.joinZone = new Bounds2( 0, 0, 0, 0 );

    // update the join zone as the size and/or position of the expression changes
    Multilink.multilink(
      [ this.upperLeftCornerProperty, this.widthProperty, this.heightProperty ],
      ( upperLeftCorner, width, height ) => {
        this.joinZone.setMinMax(
          upperLeftCorner.x - height,
          upperLeftCorner.y,
          upperLeftCorner.x + width + height,
          upperLeftCorner.y + height );
      }
    );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // @private
    this.setResizeNeededFlagBound = this.setResizeNeededFlag.bind( this );

    // add the initial coin term
    this.addCoinTerm( anchorCoinTerm );

    // add the second coin term
    this.addCoinTerm( floatingCoinTerm );

    // add a listener that will immediately finish animations for incoming coin terms if the expression is grabbed
    this.userControlledProperty.link( userControlled => {
      if ( userControlled ) {
        this.coinTerms.forEach( coinTerm => {
          if ( coinTerm.inProgressAnimationProperty.get() ) {
            coinTerm.goImmediatelyToDestination();
          }
        } );
      }
    } );

    // add a listener that will adjust the scale when needed, generally done when expression is collected or uncollected
    this.scaleProperty.lazyLink( ( scale, previousScale ) => {

      // state checking
      assert && assert( scale <= 1, 'scaling up beyond 1 is not supported' );
      assert && assert(
        ( scale <= 1 && previousScale === 1 ) || ( scale === 1 && previousScale <= 1 ),
        'expressions only scale down from 1 or up to 1, anything else is unexpected'
      );

      // set the scale of each constituent coin term
      this.coinTerms.forEach( coinTerm => {
        coinTerm.scaleProperty.set( scale );
      } );

      // Setting the scale of the resident coin terms will often set the 'resizeNeeded' flag, which is intended to be
      // handled during the next call to the step function.  This is done for efficiency, since we don't want to resize
      // the expression on every single coin term size change.  However, this approach is problematic in the case of
      // scale changes because expressions are often scaled when collected and then immediately moved into or out of a
      // collection area, and if the expression's bounds aren't accurate, the placement of the expression (generally
      // animated) gets screwed up.  Because of this, we handle the resizing immediately when the scale changes.
      if ( this.resizeNeeded ) {
        this.updateSizeAndCoinTermPositions( false );
        this.resizeNeeded = false;
      }
    } );

    // monitor the setting for whether negatives are simplified and update the contained coin terms when it changes
    function updateCoinTermMinusSignFlags() {
      self.updateCoinTermShowMinusSignFlag();
    }

    simplifyNegativesProperty.link( updateCoinTermMinusSignFlags );

    // create a dispose function
    this.disposeExpression = () => {
      simplifyNegativesProperty.unlink( updateCoinTermMinusSignFlags );
    };

    // logging, for debug purposes
    phet.log && phet.log( `created ${this.id} with anchor = ${anchorCoinTerm.id
    } and floating = ${floatingCoinTerm.id}` );
  }

  /**
   * step this expression in time, which will cause it to make any updates in its state that are needed
   * @param dt
   * @public
   */
  step( dt ) {

    // If needed, adjust the size of the expression and the positions of the contained coin terms.  This is done here
    // in the step function so that it is only done a max of once per animation frame rather than redoing it for each
    // coin term whose bounds change.
    if ( this.resizeNeeded ) {
      const animateUpdateMotion = !this.userControlledProperty.get() && !this.inProgressAnimationProperty.get();
      this.updateSizeAndCoinTermPositions( animateUpdateMotion );
      this.resizeNeeded = false;
    }

    // determine the needed height and which hints should be active
    let tallestCoinTermHeight = 0;
    this.coinTerms.forEach( residentCoinTerm => {
      tallestCoinTermHeight = Math.max( tallestCoinTermHeight, residentCoinTerm.localViewBoundsProperty.get().height );
    } );
    let rightHintActive = false;
    let rightHintMaxCoinWidth = 0;
    let leftHintActive = false;
    let leftHintMaxCoinWidth = 0;
    this.hoveringCoinTerms.forEach( hoveringCoinTerm => {
      const hctRelativeViewBounds = hoveringCoinTerm.localViewBoundsProperty.get();
      tallestCoinTermHeight = Math.max( tallestCoinTermHeight, hctRelativeViewBounds.height );
      if ( hoveringCoinTerm.positionProperty.get().x > this.upperLeftCornerProperty.get().x + this.widthProperty.get() / 2 ) {

        // coin is over right half of the expression
        rightHintActive = true;
        rightHintMaxCoinWidth = Math.max( rightHintMaxCoinWidth, hctRelativeViewBounds.width );
      }
      else {

        // coin is over left half of the expression
        leftHintActive = true;
        leftHintMaxCoinWidth = Math.max( leftHintMaxCoinWidth, hctRelativeViewBounds.width );
      }
    } );

    // update the hint states
    this.rightHintActiveProperty.set( rightHintActive );
    this.leftHintActiveProperty.set( leftHintActive );

    // to minimize redraws in the view, only update width when the hints are active
    if ( this.rightHintActiveProperty.get() ) {
      this.rightHintWidthProperty.set( rightHintMaxCoinWidth + 2 * X_MARGIN );
    }
    if ( this.leftHintActiveProperty.get() ) {
      this.leftHintWidthProperty.set( leftHintMaxCoinWidth + 2 * X_MARGIN );
    }

    // update the property that indicates whether the combine halo is active
    this.combineHaloActiveProperty.set( this.hoveringExpressions.length > 0 );

    // update the overall height of the expression if needed
    const neededHeight = tallestCoinTermHeight + 2 * Y_MARGIN;
    if ( this.heightProperty.get() !== neededHeight ) {
      this.upperLeftCornerProperty.set( this.upperLeftCornerProperty.get().minusXY(
        0,
        ( neededHeight - this.heightProperty.get() ) / 2
      ) );
      this.heightProperty.set( neededHeight );
      this.layoutChangedEmitter.emit();
    }

    // Do any motion animation.  This is done last because the animation can sometimes cause the expression to be
    // removed from the model (such as when it joins another expression), and this can cause the prior steps to fail.
    const animation = this.inProgressAnimationProperty.get();
    if ( animation ) {
      animation.timeSoFar += dt;
      if ( animation.timeSoFar < animation.totalDuration ) {

        // not there yet - take a step towards the destination
        const easingProportion = Easing.CUBIC_IN_OUT.value( animation.timeSoFar / animation.totalDuration );
        const nextPosition = animation.startPosition.plus(
          animation.travelVector.withMagnitude( animation.travelVector.magnitude * easingProportion )
        );
        const deltaPosition = nextPosition.minus( this.upperLeftCornerProperty.get() );
        this.translate( deltaPosition );
      }
      else {

        // destination reached, end the animation
        this.setPositionAndDestination( animation.startPosition.plus( animation.travelVector ) );
        this.inProgressAnimationProperty.set( null );
        this.destinationReachedEmitter.emit();
      }
    }
  }

  /**
   * @public
   */
  dispose() {
    this.disposeExpression();
  }

  /**
   * get the current bounds of this expression
   * @param {Bounds2} [boundsToSet] - optional bounds to set if caller wants to avoid an allocation
   * @public
   */
  getBounds( boundsToSet ) {
    const bounds = boundsToSet || new Bounds2( 0, 0, 1, 1 );
    const upperLeftCorner = this.upperLeftCornerProperty.get();
    bounds.setMinMax(
      upperLeftCorner.x,
      upperLeftCorner.y,
      upperLeftCorner.x + this.widthProperty.get(),
      upperLeftCorner.y + this.heightProperty.get()
    );
    return bounds;
  }

  /**
   * get a list of the coin terms ordered from left to right based on their position in the expression
   * @private
   */
  getCoinTermsLeftToRight() {
    return this.coinTerms.slice( 0 ).sort( ( ct1, ct2 ) => ct1.destinationProperty.get().x - ct2.destinationProperty.get().x );
  }

  /**
   * Size the expression and, if necessary, move the contained coin terms so that all coin terms are appropriately
   * positioned.  This is generally done when something affects the view bounds of the coin terms, such as turning
   * on coefficients or switching from coin view to variable view.
   * @param {boolean} animate
   * @private
   */
  updateSizeAndCoinTermPositions( animate ) {

    // keep track of original size so we know when to fire event about layout changes
    const originalWidth = this.widthProperty.get();
    const originalHeight = this.heightProperty.get();
    let coinTermsMoved = false;

    // get an array of the coin terms sorted from left to right
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();

    const middleCoinTermIndex = Math.floor( ( coinTermsLeftToRight.length - 1 ) / 2 );
    let xPos;
    const yPos = coinTermsLeftToRight[ middleCoinTermIndex ].destinationProperty.get().y;
    const scaledCoinTermSpacing = INTER_COIN_TERM_SPACING * this.scaleProperty.get();

    // adjust the positions of coin terms to the right of the middle
    for ( let i = middleCoinTermIndex + 1; i < coinTermsLeftToRight.length; i++ ) {

      // adjust the position of this coin term to be the correct distance from its neighbor to the left
      const leftNeighbor = coinTermsLeftToRight[ i - 1 ];
      xPos = leftNeighbor.destinationProperty.get().x + leftNeighbor.localViewBoundsProperty.get().maxX +
             scaledCoinTermSpacing - coinTermsLeftToRight[ i ].localViewBoundsProperty.get().minX;
      if ( coinTermsLeftToRight[ i ].destinationProperty.get().x !== xPos ) {
        coinTermsLeftToRight[ i ].goToPosition( new Vector2( xPos, yPos ), animate );
        coinTermsMoved = true;
      }
    }

    // adjust the positions of coin terms to the left of the middle
    for ( let i = middleCoinTermIndex - 1; i >= 0; i-- ) {
      // adjust the position of this coin term to be the correct distance from its neighbor to the right
      const rightNeighbor = coinTermsLeftToRight[ i + 1 ];
      xPos = rightNeighbor.destinationProperty.get().x + rightNeighbor.localViewBoundsProperty.get().minX -
             scaledCoinTermSpacing - coinTermsLeftToRight[ i ].localViewBoundsProperty.get().maxX;
      if ( coinTermsLeftToRight[ i ].positionProperty.get().x !== xPos ) {
        coinTermsLeftToRight[ i ].goToPosition( new Vector2( xPos, yPos ), animate );
        coinTermsMoved = true;
      }
    }

    // adjust the size and position of this expression
    let maxHeight = 0;
    let totalWidth = 0;
    coinTermsLeftToRight.forEach( coinTerm => {
      const relativeViewBounds = coinTerm.localViewBoundsProperty.get();
      maxHeight = relativeViewBounds.height > maxHeight ? relativeViewBounds.height : maxHeight;
      totalWidth += relativeViewBounds.width;
    } );
    const scaledXMargin = X_MARGIN * this.scaleProperty.get();
    const scaledYMargin = Y_MARGIN * this.scaleProperty.get();
    this.upperLeftCornerProperty.set( new Vector2(
      coinTermsLeftToRight[ 0 ].destinationProperty.get().x +
      coinTermsLeftToRight[ 0 ].localViewBoundsProperty.get().minX - scaledXMargin,
      yPos - maxHeight / 2 - scaledYMargin
    ) );
    this.widthProperty.set( totalWidth + 2 * scaledXMargin + scaledCoinTermSpacing * ( coinTermsLeftToRight.length - 1 ) );
    this.heightProperty.set( maxHeight + 2 * scaledYMargin );

    // emit an event if the size or the coin term positions changed
    if ( this.widthProperty.get() !== originalWidth || this.heightProperty.get() !== originalHeight || coinTermsMoved ) {
      this.layoutChangedEmitter.emit();
    }
  }

  /**
   * add the specified coin term to this expression, moving it to the correct position
   * @param {CoinTerm} coinTerm
   * @public
   */
  addCoinTerm( coinTerm ) {

    assert && assert( !this.coinTerms.includes( coinTerm ), 'coin term is already present in expression' );

    // prevent the user from direct interaction with this coin term while it's in this expression
    coinTerm.expressionProperty.set( this );

    this.coinTerms.push( coinTerm );

    const coinTermRelativeViewBounds = coinTerm.localViewBoundsProperty.get();
    const coinTermPosition = coinTerm.positionProperty.get();

    if ( this.coinTerms.length === 1 ) {

      // this is the first coin term, so set the initial width and height
      this.widthProperty.set( coinTermRelativeViewBounds.width + 2 * X_MARGIN );
      this.heightProperty.set( coinTermRelativeViewBounds.height + 2 * X_MARGIN );
      this.upperLeftCornerProperty.set( new Vector2(
        coinTermPosition.x + coinTermRelativeViewBounds.minX - X_MARGIN,
        coinTermPosition.y - this.heightProperty.get() / 2
      ) );
    }
    else {

      // adjust the expression's width to accommodate the new coin term
      const originalWidth = this.widthProperty.get();
      this.widthProperty.set( this.widthProperty.get() + INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width );
      const upperLeftCorner = this.upperLeftCornerProperty.get();

      // figure out where the coin term should go
      let xDestination;
      if ( coinTermPosition.x > upperLeftCorner.x + originalWidth / 2 ) {
        // add to the right side
        xDestination = upperLeftCorner.x + this.widthProperty.get() - X_MARGIN - coinTermRelativeViewBounds.maxX;
      }
      else {
        // add to the left side, and shift the expression accordingly
        this.upperLeftCornerProperty.set(
          upperLeftCorner.minusXY( INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width, 0 )
        );
        xDestination = this.upperLeftCornerProperty.get().x + X_MARGIN - coinTermRelativeViewBounds.minX;
      }

      const destination = new Vector2(
        xDestination,
        this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2
      );

      // decide whether or not to animate to the destination
      if ( !this.userControlledProperty.get() && !this.inProgressAnimationProperty.get() ) {

        // animate to the new position
        coinTerm.travelToDestination( destination );
      }
      else {

        // if this expression is being moved by the user or is animating, don't animate - it won't end well
        coinTerm.setPositionAndDestination( destination );
      }
    }

    // if the coin term being added is currently on the list of hovering coin terms, remove it
    if ( this.isCoinTermHovering( coinTerm ) ) {
      this.removeHoveringCoinTerm( coinTerm );
      if ( this.hoveringCoinTerms.length === 0 ) {
        this.rightHintActiveProperty.set( false );
        this.leftHintActiveProperty.set( false );
      }
    }

    // make sure that the coin term can't be broken apart while in an expression
    coinTerm.breakApartAllowedProperty.set( false );

    // add a listener to resize the expression if the bounds of this coin term change
    coinTerm.localViewBoundsProperty.lazyLink( this.setResizeNeededFlagBound );

    // add a listener to update whether minus sign is shown when negative when the user moves this coin term
    const userControlledListener = this.updateCoinTermShowMinusSignFlag.bind( this );
    assert && assert( !this.mapCoinTermsToUCListeners[ coinTerm.id ], 'key should not yet exist in map' );
    this.mapCoinTermsToUCListeners[ coinTerm.id ] = userControlledListener;
    coinTerm.userControlledProperty.link( userControlledListener );

    // update whether the coin terms should be showing minus signs
    this.updateCoinTermShowMinusSignFlag();

    // trigger an event so that the view is sure to be updated
    this.layoutChangedEmitter.emit();
  }

  /**
   * remove a coin term from this expression
   * @param {CoinTerm} coinTerm
   * @public
   */
  removeCoinTerm( coinTerm ) {
    coinTerm.expressionProperty.set( null );
    coinTerm.breakApartAllowedProperty.set( true );
    coinTerm.showMinusSignWhenNegativeProperty.set( true );
    this.coinTerms.remove( coinTerm );
    coinTerm.localViewBoundsProperty.unlink( this.setResizeNeededFlagBound );
    coinTerm.userControlledProperty.unlink( this.mapCoinTermsToUCListeners[ coinTerm.id ] );
    delete this.mapCoinTermsToUCListeners[ coinTerm.id ];

    if ( this.coinTerms.length > 0 ) {
      this.updateSizeAndCoinTermPositions();
      this.updateCoinTermShowMinusSignFlag();
    }

    phet.log && phet.log( `removed ${coinTerm.id} from ${this.id}` );
  }

  /**
   * @param {CoinTerm} coinTerm
   * @private
   */
  containsCoinTerm( coinTerm ) {
    return this.coinTerms.includes( coinTerm );
  }

  /**
   * remove all coin terms
   * @returns {Array.<CoinTerm>} a simple array with all coin terms, sorted in left-to-right order
   * @public
   */
  removeAllCoinTerms() {

    // make a copy of the coin terms and sort them in left to right order
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();

    // remove them from this expression
    coinTermsLeftToRight.forEach( coinTerm => {
      this.removeCoinTerm( coinTerm );
    } );

    // return the sorted array
    return coinTermsLeftToRight;
  }

  /**
   * add back a coin term that is already part of this expression, but something about it (most likely its position)
   * has changed
   * @param {CoinTerm} coinTerm
   * @public
   */
  reintegrateCoinTerm( coinTerm ) {

    assert && assert( this.containsCoinTerm( coinTerm ), 'coin term is not part of this expression, can\'t be reintegrated' );

    // get an array of the coin terms sorted from left to right
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();

    // update coin term minus sign flags
    this.updateCoinTermShowMinusSignFlag();

    // set the position of each coin term based on its order
    let leftEdge = this.upperLeftCornerProperty.get().x + X_MARGIN;
    const centerY = this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2;
    coinTermsLeftToRight.forEach( orderedCoinTerm => {
      orderedCoinTerm.travelToDestination( new Vector2(
        leftEdge - orderedCoinTerm.localViewBoundsProperty.get().minX,
        centerY
      ) );
      leftEdge += orderedCoinTerm.localViewBoundsProperty.get().width + INTER_COIN_TERM_SPACING;
    } );

    // trigger an event so that the view is sure to be updated
    this.layoutChangedEmitter.emit();
  }

  /**
   * update the contained coin terms for whether they should show minus sign when negative, supports subtraction mode
   * @private
   */
  updateCoinTermShowMinusSignFlag() {
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();
    let oneOrMoreChanged = false;
    coinTermsLeftToRight.forEach( ( residentCoinTerm, index ) => {

      // The minus sign is suppressed if subtraction is being shown, the coin term is not user controlled, and the
      // coin term is not the first one in the expression so that subtraction expressions will look correct.
      const showMinusSignWhenNegative = !( this.simplifyNegativesProperty.value && index > 0 ) ||
                                        residentCoinTerm.userControlledProperty.get();

      if ( showMinusSignWhenNegative !== residentCoinTerm.showMinusSignWhenNegativeProperty.get() ) {
        residentCoinTerm.showMinusSignWhenNegativeProperty.set( showMinusSignWhenNegative );
        oneOrMoreChanged = true;
      }
    } );

    if ( oneOrMoreChanged ) {
      this.layoutChangedEmitter.emit();
    }
  }

  /**
   * move, a.k.a. translate, by the specified amount and move the coin terms too
   * @param {Vector2} deltaPosition
   * @private
   */
  translate( deltaPosition ) {

    // move the coin terms
    this.coinTerms.forEach( coinTerm => {
      coinTerm.setPositionAndDestination( coinTerm.positionProperty.get().plus( deltaPosition ) );
    } );

    // move the outline shape
    this.upperLeftCornerProperty.set( this.upperLeftCornerProperty.get().plus( deltaPosition ) );
  }

  /**
   * move to the specified destination, but do so a step at a time rather than all at once
   * @param {Vector2} upperLeftCornerDestination
   * @public
   */
  travelToDestination( upperLeftCornerDestination ) {
    const animationDuration = Math.min(
      this.upperLeftCornerProperty.get().distance( upperLeftCornerDestination ) / ANIMATION_SPEED,
      MAX_ANIMATION_TIME
    );
    if ( animationDuration === 0 ) {

      // already there, so emit a notification and call it good
      this.destinationReachedEmitter.emit();
    }
    else {

      // set up the animation to get to the destination
      this.inProgressAnimationProperty.set( new AnimationSpec(
        this.upperLeftCornerProperty.get().copy(),
        upperLeftCornerDestination.minus( this.upperLeftCornerProperty.get() ),
        animationDuration
      ) );
    }
  }

  /**
   * set both the position and destination of the upper left corner immediately, i.e. without animation
   * @param {Vector2} upperLeftCornerDestination
   * @public
   */
  setPositionAndDestination( upperLeftCornerDestination ) {
    this.translate( upperLeftCornerDestination.minus( this.upperLeftCornerProperty.get() ) );
  }

  /**
   * initiate a break apart, which just emits an event and counts on parent model to handle
   * @public
   */
  breakApart() {
    this.breakApartEmitter.emit();
  }

  /**
   * get the amount of overlap between the provided coin term's bounds and this expression's "join zone"
   * @param {CoinTerm} coinTerm
   * @returns {number} the area of the overlap
   * @public
   */
  getCoinTermJoinZoneOverlap( coinTerm ) {
    const coinTermBounds = coinTerm.getViewBounds();
    const xOverlap = Math.max(
      0,
      Math.min( coinTermBounds.maxX, this.joinZone.maxX ) - Math.max( coinTermBounds.minX, this.joinZone.minX )
    );
    const yOverlap = Math.max(
      0,
      Math.min( coinTermBounds.maxY, this.joinZone.maxY ) - Math.max( coinTermBounds.minY, this.joinZone.minY )
    );
    return xOverlap * yOverlap;
  }

  /**
   * get the amount of overlap between the provided expression and this expression
   * @param {Expression||EECollectionArea} otherEntity - must provide a 'getBounds' method
   * @returns {number} the area of the overlap
   * @public
   */
  getOverlap( otherEntity ) {
    const otherExpressionBounds = otherEntity.getBounds();
    const thisExpressionBounds = this.getBounds();
    const xOverlap = Math.max(
      0,
      Math.min( otherExpressionBounds.maxX, thisExpressionBounds.maxX ) - Math.max( otherExpressionBounds.minX, thisExpressionBounds.minX )
    );
    const yOverlap = Math.max(
      0,
      Math.min( otherExpressionBounds.maxY, thisExpressionBounds.maxY ) - Math.max( otherExpressionBounds.minY, thisExpressionBounds.minY )
    );
    return xOverlap * yOverlap;
  }

  /**
   * get the upper right corner of this expression
   * @returns {Vector2}
   * @public
   */
  getUpperRightCorner() {
    return this.upperLeftCornerProperty.get().plusXY( this.widthProperty.get(), 0 );
  }

  /**
   * Add a coin term to the list of those that are hovering over this expression.  This is a no-op if the coin term is
   * already on the list.
   * @param {CoinTerm} coinTerm
   * @public
   */
  addHoveringCoinTerm( coinTerm ) {
    if ( this.hoveringCoinTerms.indexOf( coinTerm ) === -1 ) {
      this.hoveringCoinTerms.push( coinTerm );
      coinTerm.breakApartAllowedProperty.set( false );
    }
  }

  /**
   * Remove a coin term from the list of those that are hovering over this expression.  This is a no-op if the coin
   * term is not on the list.
   * @param {CoinTerm} coinTerm
   * @public
   */
  removeHoveringCoinTerm( coinTerm ) {
    const index = this.hoveringCoinTerms.indexOf( coinTerm );
    if ( index !== -1 ) {
      this.hoveringCoinTerms.splice( index, 1 );
      coinTerm.breakApartAllowedProperty.set( true );
    }
  }

  /**
   * clear the list of coin terms that are currently hovering over this expression
   * @public
   */
  clearHoveringCoinTerms() {
    this.hoveringCoinTerms.forEach( hoveringCoinTerm => {
      hoveringCoinTerm.breakApartAllowedProperty.set( true );
    } );
    this.hoveringCoinTerms.length = 0;
  }

  /**
   * Add an expression to the list of those that are hovering over this expression.  This is a no-op if the expression
   * is already on the list.
   * @param {Expression} expression
   * @public
   */
  addHoveringExpression( expression ) {
    if ( this.hoveringExpressions.indexOf( expression ) === -1 ) {
      this.hoveringExpressions.push( expression );
    }
  }

  /**
   * Remove an expression from the list of those that are hovering over this expression.  This is a no-op if the
   * provided expression is not on the list.
   * @param {Expression} expression
   * @public
   */
  removeHoveringExpression( expression ) {
    const index = this.hoveringExpressions.indexOf( expression );
    if ( index !== -1 ) {
      this.hoveringExpressions.splice( index, 1 );
    }
  }

  /**
   * clear the list of other expressions that are currently hovering over this expression
   * @public
   */
  clearHoveringExpressions() {
    this.hoveringExpressions.length = 0;
  }

  /**
   * returns true if the given coin term is on the list of those hovering over the expression
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @private
   */
  isCoinTermHovering( coinTerm ) {
    return this.hoveringCoinTerms.indexOf( coinTerm ) > -1;
  }

  /**
   * set the resize needed flag, used to hook up listeners
   * @private
   */
  setResizeNeededFlag() {
    this.resizeNeeded = true;
  }
}

expressionExchange.register( 'Expression', Expression );

export default Expression;
