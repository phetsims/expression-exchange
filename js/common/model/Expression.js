// Copyright 2016, University of Colorado Boulder

/**
 * This type represents a model of an expression.  An expression is a set of coin terms all positioned in a line.  In
 * the view, an expression is represented as a box containing the coin terms with plus symboles between them.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var Easing = require( 'TWIXT/Easing' );
  var Emitter = require( 'AXON/Emitter' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INTER_COIN_TERM_SPACING = 30; // in model units, empirically determined
  var INSET = 12; // space around coin terms, empirically determined
  var ANIMATION_SPEED = 400; // in model units (which are basically screen coordinates) per second

  // class var for creating unique IDs
  var creationCount = 0;

  /**
   * @param {CoinTerm} anchorCoinTerm
   * @param {CoinTerm} floatingCoinTerm
   * @param {Property.<boolean>} simplifyNegativesProperty
   * @constructor
   */
  function Expression( anchorCoinTerm, floatingCoinTerm, simplifyNegativesProperty ) {

    var self = this;
    this.id = 'EX-' + (++creationCount);

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    this.upperLeftCornerProperty = new Property( Vector2.ZERO ); // @public {Property.<Vector2>} (read only)
    this.widthProperty = new Property( 0 ); // @public {Property.<number>} (read only)
    this.heightProperty = new Property( 0 ); // @public {Property.<number>} (read only)
    this.userControlledProperty = new Property( false ); // @public {Property.<boolean>} (read-write)
    this.inEditModeProperty = new Property( false ); // @public {Property.<boolean>}, indicates whether this expression is being edited
    this.collectedProperty = new Property( false ); // @public {Property.<boolean>}, indicates whether this is in a collection box (for game)

    // @public (read only), tracks the current in-progress animation, if any
    //REVIEW: Type docs especially important here. No clue what type it takes besides null
    this.inProgressAnimationProperty = new Property( null );

    // @public {Property.<boolean>} (read only) indicates whether the 'combine halo' should be visible
    this.combineHaloActiveProperty = new Property( false );

    // @public (read only) - size and state of the hints that can appear at left and right of the expression
    this.leftHintActiveProperty = new Property( false );
    this.leftHintWidthProperty = new Property( 0 );
    this.rightHintActiveProperty = new Property( false );
    this.rightHintWidthProperty = new Property( 0 );

    // @private, used to update whether or not coin terms should show minus sign when negative
    this.simplifyNegativesProperty = simplifyNegativesProperty;

    // @public (read-only) - scale, used to shrink the expression when it is collected or uncollected
    this.scaleProperty = new DerivedProperty( [ this.collectedProperty ], function( collected ) {
      return collected ?
             Math.min( EESharedConstants.COLLECTION_AREA_SIZE.width / self.widthProperty.get(), 1 ) * 0.9 :
             1;
    } );

    //------------------------------------------------------------------------
    // observable arrays
    //------------------------------------------------------------------------

    // @public {ObservableArray.<CoinTerm>}, read and listen only, items should be added and removed via methods
    this.coinTerms = new ObservableArray();

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public {Emitter}, listen only, emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public {Emitter}, listen only, emits an event when this expression has been selected by the user to be edited
    this.selectedForEditEmitter = new Emitter();

    // @public {Emitter}, listen only, emits an event when the size of the expression or the relative positions of the coins
    // change, generally used by the view so that it knows when to update, does NOT fire for position-only changes
    // or for activation/deactivation of hints
    this.layoutChangedEmitter = new Emitter();

    // @public {Emitter}, listen only, emits an event when this expression should be broken apart
    this.breakApartEmitter = new Emitter();

    //------------------------------------------------------------------------
    // non-observable attributes
    //------------------------------------------------------------------------

    // @private {Array.<CoinTerm>}, tracks coin terms that are hovering over this expression but are being controlled by
    // the user so are not yet part of the expression.  This is used to activate and size the hints.  Coin terms should
    // be added and removed via methods.
    this.hoveringCoinTerms = [];

    // @private, tracks expressions that are hovering over this expression and would be combined with this one if
    // released by the user.  This is used to activate the 'halo' that indicates that potential combination.
    this.hoveringExpressions = [];

    // @private, tracks whether the expression should be resized on the next step
    this.resizeNeeded = false;

    // @private, map used to track user controlled listeners that are added to coin terms that join this expression
    this.mapCoinTermsToUCListeners = {};

    // create the bounds that will be used to decide if coin terms or other expressions are in a position to join this one
    // @private
    var upperLeftCorner = this.upperLeftCornerProperty.get();
    this.joinZone = new Bounds2(
      upperLeftCorner.x - this.heightProperty.get(),
      upperLeftCorner.y,
      upperLeftCorner.x + this.widthProperty.get() + this.heightProperty.get(),
      upperLeftCorner.y + this.heightProperty.get()
    );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // Define a listener that is bound to this object that will set the resize needed flag when fired.  This is done
    // in this way so that the listener can be found and removed when the coin term is removed from this expression.
    this.setResizeFlagFunction = function() { self.resizeNeeded = true; }; // @private

    // add the initial coin term
    this.addCoinTerm( anchorCoinTerm );

    // update the join zone as the size and/or location of the expression changes
    Property.multilink(
      [ this.upperLeftCornerProperty, this.widthProperty, this.heightProperty ],
      function( upperLeftCorner, width, height ) {
        self.joinZone.setMinMax(
          upperLeftCorner.x - height,
          upperLeftCorner.y,
          upperLeftCorner.x + width + height,
          upperLeftCorner.y + height );
      }
    );

    // add the second coin term
    this.addCoinTerm( floatingCoinTerm );

    // add a listener that will immediately finish animations for incoming coin terms if the expression is grabbed
    this.userControlledProperty.onValue( true, function() {
      self.coinTerms.forEach( function( coinTerm ) {
        if ( coinTerm.inProgressAnimationProperty.get() ) {
          coinTerm.goImmediatelyToDestination();
        }
      } );
    } );

    // add a listener that will adjust the scale when needed, generally done when expression is collected or uncollected
    this.scaleProperty.lazyLink( function( scale, previousScale ) {

      // state checking
      assert && assert( scale <= 1, 'scaling up beyond 1 is not supported' );
      assert && assert(
        ( scale <= 1 && previousScale === 1 ) || ( scale === 1 && previousScale <= 1 ),
        'expressions only scale down from 1 or up to 1, anything else is unexpected'
      );

      // set the scale of each constituent coin term
      self.coinTerms.forEach( function( coinTerm ) {
        coinTerm.scaleProperty.set( scale );
      } );

      // Setting the scale of the resident coin terms will often set the 'resizeNeeded' flag, which is intended to be
      // handled during the next call to the step function.  This is done for efficiency, since we don't want to resize
      // the expression on every single coin term size change.  However, this approach is problematic in the case of
      // scale changes because expressions are often scaled when collected and then immediately moved into or out of a
      // collection area, and if the expression's bounds aren't accurate, the placement of the expression (generally
      // animated) gets screwed up.  Because of this, we handle the resizing immediately when the scale changes.
      if ( self.resizeNeeded ) {
        self.updateSizeAndCoinTermPositions( false );
        self.resizeNeeded = false;
      }
    } );

    // monitor the setting for whether negatives are simplified and update the contained coin terms when it changes
    function updateCoinTermMinusSignFlags() {
      self.updateCoinTermShowMinusSignFlag();
    }

    simplifyNegativesProperty.link( updateCoinTermMinusSignFlags );

    // create a dispose function
    this.disposeExpression = function() {
      simplifyNegativesProperty.unlink( updateCoinTermMinusSignFlags );
    };

    // logging, for debug purposes
    expressionExchange.log && expressionExchange.log( 'created ' + this.id + ' with anchor = ' + anchorCoinTerm.id +
                                                      ' and floating = ' + floatingCoinTerm.id );
  }

  expressionExchange.register( 'Expression', Expression );

  return inherit( Object, Expression, {

    /**
     * step this expression in time, which will cause it to make any updates in its state that are needed
     * @param dt
     */
    step: function( dt ) {

      var self = this;

      // If needed, adjust the size of the expression and the positions of the contained coin terms.  This is done here
      // in the step function so that it is only done a max of once per animation frame rather than redoing it for each
      // coin term whose bounds change.
      if ( this.resizeNeeded ) {
        this.updateSizeAndCoinTermPositions( true );
        this.resizeNeeded = false;
      }

      // determine the needed height and which hints should be active
      var tallestCoinTermHeight = 0;
      this.coinTerms.forEach( function( residentCoinTerm ) {
        tallestCoinTermHeight = Math.max( tallestCoinTermHeight, residentCoinTerm.relativeViewBoundsProperty.get().height );
      } );
      var rightHintActive = false;
      var rightHintMaxCoinWidth = 0;
      var leftHintActive = false;
      var leftHintMaxCoinWidth = 0;
      this.hoveringCoinTerms.forEach( function( hoveringCoinTerm ) {
        var hctRelativeViewBounds = hoveringCoinTerm.relativeViewBoundsProperty.get();
        tallestCoinTermHeight = Math.max( tallestCoinTermHeight, hctRelativeViewBounds.height );
        if ( hoveringCoinTerm.positionProperty.get().x > self.upperLeftCornerProperty.get().x + self.widthProperty.get() / 2 ) {

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
        this.rightHintWidthProperty.set( rightHintMaxCoinWidth + 2 * INSET );
      }
      if ( this.leftHintActiveProperty.get() ) {
        this.leftHintWidthProperty.set( leftHintMaxCoinWidth + 2 * INSET );
      }

      // update the property that indicates whether the combine halo is active
      this.combineHaloActiveProperty.set( this.hoveringExpressions.length > 0 );

      // update the overall height of the expression if needed
      var neededHeight = tallestCoinTermHeight + 2 * INSET;
      if ( this.heightProperty.get() !== neededHeight ) {
        this.upperLeftCornerProperty.set( this.upperLeftCornerProperty.get().minusXY(
          0,
          ( neededHeight - this.heightProperty.get() ) / 2
        ) );
        this.heightProperty.set( tallestCoinTermHeight + 2 * INSET );
        this.layoutChangedEmitter.emit();
      }

      // Do any motion animation.  This is done last because the animation can sometimes cause the expression to be
      // removed from the model (such as when it joins another expression), and this can cause the prior steps to fail.
      var animation = this.inProgressAnimationProperty.get();
      if ( animation ) {
        animation.timeSoFar += dt;
        if ( animation.timeSoFar < animation.totalDuration ) {

          // not there yet - take a step towards the destination
          var easingProportion = Easing.CUBIC_IN_OUT.value( animation.timeSoFar / animation.totalDuration );
          var nextPosition = animation.startPosition.plus(
            animation.travelVector.withMagnitude( animation.travelVector.magnitude() * easingProportion )
          );
          var deltaPosition = nextPosition.minus( this.upperLeftCornerProperty.get() );
          this.translate( deltaPosition );
        }
        else {

          // destination reached, end the animation
          this.setPositionAndDestination( animation.startPosition.plus( animation.travelVector ) );
          this.inProgressAnimationProperty.set( null );
          this.destinationReachedEmitter.emit();
        }
      }
    },

    // TODO: doc
    dispose: function() {
      this.disposeExpression();
    },

    /**
     * get the current bounds of this expression
     * @param {Bounds2} [boundsToSet] - optional bounds to set if caller wants to avoid an allocation
     */
    getBounds: function( boundsToSet ) {
      var bounds = boundsToSet || new Bounds2( 0, 0, 1, 1 );
      var upperLeftCorner = this.upperLeftCornerProperty.get();
      bounds.setMinMax(
        upperLeftCorner.x,
        upperLeftCorner.y,
        upperLeftCorner.x + this.widthProperty.get(),
        upperLeftCorner.y + this.heightProperty.get()
      );
      return bounds;
    },

    /**
     * get a list of the coin terms ordered from left to right based on their position in the expression
     * @private
     */
    getCoinTermsLeftToRight: function() {
      return this.coinTerms.getArray().slice( 0 ).sort( function( ct1, ct2 ) {
        return ct1.destinationProperty.get().x - ct2.destinationProperty.get().x;
      } );
    },

    /**
     * Size the expression and, if necessary, move the contained coin terms so that all coin terms are appropriately
     * positioned.  This is generally done when something affects the view bounds of the coin terms, such as turning
     * on coefficients or switching from coin view to variable view.
     * @param {boolean} animate
     * @private
     */
    updateSizeAndCoinTermPositions: function( animate ) {

      // keep track of original size so we know when to fire event about layout changes
      var originalWidth = this.widthProperty.get();
      var originalHeight = this.heightProperty.get();
      var coinTermsMoved = false;

      // get an array of the coin terms sorted from left to right
      var coinTermsLeftToRight = this.getCoinTermsLeftToRight();

      var middleCoinTermIndex = Math.floor( ( coinTermsLeftToRight.length - 1 ) / 2 );
      var xPos;
      var yPos = coinTermsLeftToRight[ middleCoinTermIndex ].destinationProperty.get().y;
      var scaledCoinTermSpacing = INTER_COIN_TERM_SPACING * this.scaleProperty.get();

      // adjust the positions of coin terms to the right of the middle
      for ( var i = middleCoinTermIndex + 1; i < coinTermsLeftToRight.length; i++ ) {

        // adjust the position of this coin term to be the correct distance from its neighbor to the left
        var leftNeighbor = coinTermsLeftToRight[ i - 1 ];
        xPos = leftNeighbor.destinationProperty.get().x + leftNeighbor.relativeViewBoundsProperty.get().maxX +
               scaledCoinTermSpacing - coinTermsLeftToRight[ i ].relativeViewBoundsProperty.get().minX;
        if ( coinTermsLeftToRight[ i ].destinationProperty.get().x !== xPos ) {
          coinTermsLeftToRight[ i ].goToPosition( new Vector2( xPos, yPos ), animate );
          coinTermsMoved = true;
        }
      }

      // adjust the positions of coin terms to the left of the middle
      for ( i = middleCoinTermIndex - 1; i >= 0; i-- ) {
        // adjust the position of this coin term to be the correct distance from its neighbor to the right
        var rightNeighbor = coinTermsLeftToRight[ i + 1 ];
        xPos = rightNeighbor.destinationProperty.get().x + rightNeighbor.relativeViewBoundsProperty.get().minX -
               scaledCoinTermSpacing - coinTermsLeftToRight[ i ].relativeViewBoundsProperty.get().maxX;
        if ( coinTermsLeftToRight[ i ].positionProperty.get().x !== xPos ) {
          coinTermsLeftToRight[ i ].goToPosition( new Vector2( xPos, yPos ), animate );
          coinTermsMoved = true;
        }
      }

      // adjust the size and position of the background
      var maxHeight = 0;
      var totalWidth = 0;
      coinTermsLeftToRight.forEach( function( coinTerm ) {
        var relativeViewBounds = coinTerm.relativeViewBoundsProperty.get();
        maxHeight = relativeViewBounds.height > maxHeight ? relativeViewBounds.height : maxHeight;
        totalWidth += relativeViewBounds.width;
      } );
      var scaledInset = INSET * this.scaleProperty.get();
      this.upperLeftCornerProperty.set( new Vector2(
        coinTermsLeftToRight[ 0 ].destinationProperty.get().x +
        coinTermsLeftToRight[ 0 ].relativeViewBoundsProperty.get().minX - scaledInset,
        yPos - maxHeight / 2 - scaledInset
      ) );
      this.heightProperty.set( maxHeight + 2 * scaledInset );
      this.widthProperty.set( totalWidth + 2 * scaledInset + scaledCoinTermSpacing * ( coinTermsLeftToRight.length - 1 ) );

      // emit an event if the size or the coin term positions changed
      if ( this.widthProperty.get() !== originalWidth || this.heightProperty.get() !== originalHeight || coinTermsMoved ) {
        this.layoutChangedEmitter.emit();
      }
    },

    /**
     * add the specified coin term to this expression, moving it to the correct location @param {CoinTerm} coinTerm
     * @public
     */
    addCoinTerm: function( coinTerm ) {

      if ( this.coinTerms.contains( coinTerm ) ) {
        //REVIEW: This.
        // TODO:   There is a race condition that only occurs during fuzz testing where somehow a coin term that is
        // inside an expression becomes user controlled and then is added back to the expression.  This is a workaround.
        // This should be fully investigated before publication.  See
        // https://github.com/phetsims/expression-exchange/issues/31
        expressionExchange.log && expressionExchange.log( 'warning: an attempt was made to re-add a coin term that is already in the expression' );
        return;
      }

      this.coinTerms.push( coinTerm );

      var coinTermRelativeViewBounds = coinTerm.relativeViewBoundsProperty.get();
      var coinTermPosition = coinTerm.positionProperty.get();

      if ( this.coinTerms.length === 1 ) {

        // this is the first coin term, so set the initial width and height
        this.widthProperty.set( coinTermRelativeViewBounds.width + 2 * INSET );
        this.heightProperty.set( coinTermRelativeViewBounds.height + 2 * INSET );
        this.upperLeftCornerProperty.set( new Vector2(
          coinTermPosition.x + coinTermRelativeViewBounds.minX - INSET,
          coinTermPosition.y - this.heightProperty.get() / 2
        ) );
      }
      else {

        // adjust the expression's width to accommodate the new coin term
        var originalWidth = this.widthProperty.get();
        this.widthProperty.set( this.widthProperty.get() + INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width );
        var upperLeftCorner = this.upperLeftCornerProperty.get();

        // figure out where the coin term should go
        var xDestination;
        if ( coinTermPosition.x > upperLeftCorner.x + originalWidth / 2 ) {
          // add to the right side
          xDestination = upperLeftCorner.x + this.widthProperty.get() - INSET - coinTermRelativeViewBounds.maxX;
        }
        else {
          // add to the left side, and shift the expression accordingly
          this.upperLeftCornerProperty.set(
            upperLeftCorner.minusXY( INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width, 0 )
          );
          xDestination = this.upperLeftCornerProperty.get().x + INSET - coinTermRelativeViewBounds.minX;
        }

        var destination = new Vector2(
          xDestination,
          this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2
        );

        // decide whether or not to animate to the destination
        if ( !this.userControlledProperty.get() ) {

          // animate to the new location
          coinTerm.travelToDestination( destination );
        }
        else {

          // if this expression is being moved by the user, don't animate - it won't end well
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
      coinTerm.relativeViewBoundsProperty.lazyLink( this.setResizeFlagFunction );

      // add a listener to update whether minus sign is shown when negative when the user moves this coin term
      var userControlledListener = this.updateCoinTermShowMinusSignFlag.bind( this );
      assert && assert( !this.mapCoinTermsToUCListeners[ coinTerm.id ], 'key should not yet exist in map' );
      this.mapCoinTermsToUCListeners[ coinTerm.id ] = userControlledListener;
      coinTerm.userControlledProperty.link( userControlledListener );

      // update whether the coin terms should be showing minus signs
      this.updateCoinTermShowMinusSignFlag();

      // trigger an event so that the view is sure to be updated
      this.layoutChangedEmitter.emit();
    },

    // @public
    removeCoinTerm: function( coinTerm ) {
      coinTerm.breakApartAllowedProperty.set( true );
      coinTerm.showMinusSignWhenNegativeProperty.set( true );
      this.coinTerms.remove( coinTerm );
      coinTerm.relativeViewBoundsProperty.unlink( this.setResizeFlagFunction );
      coinTerm.userControlledProperty.unlink( this.mapCoinTermsToUCListeners[ coinTerm.id ] );
      delete this.mapCoinTermsToUCListeners[ coinTerm.id ];

      if ( this.coinTerms.length > 0 ) {
        this.updateSizeAndCoinTermPositions();
        this.updateCoinTermShowMinusSignFlag();
      }

      expressionExchange.log && expressionExchange.log( 'removed ' + coinTerm.id + ' from ' + this.id );
    },

    /**
     * @param {CoinTerm} coinTerm
     * @private
     */
    containsCoinTerm: function( coinTerm ) {
      return this.coinTerms.contains( coinTerm );
    },

    /**
     * remove all coin terms
     * @return a simple array with all coin terms, sorted in left-to-right order
     * @public
     */
    removeAllCoinTerms: function() {

      var self = this;

      // make a copy of the coin terms and sort them in left to right order
      var coinTermsLeftToRight = this.getCoinTermsLeftToRight();

      // remove them from this expression
      coinTermsLeftToRight.forEach( function( coinTerm ) {
        self.removeCoinTerm( coinTerm );
      } );

      // return the sorted array
      return coinTermsLeftToRight;
    },

    /**
     * add back a coin term that is already part of this expression, but something about it (most likely its position)
     * has changed
     * @param {CoinTerm} coinTerm
     * @public
     */
    reintegrateCoinTerm: function( coinTerm ) {

      assert && assert( this.containsCoinTerm( coinTerm ), 'coin term is not part of this expression, can\'t be reintegrated' );

      // get an array of the coin terms sorted from left to right
      var coinTermsLeftToRight = this.getCoinTermsLeftToRight();

      // update coin term minus sign flags
      this.updateCoinTermShowMinusSignFlag();

      // set the position of each coin term based on its order
      var leftEdge = this.upperLeftCornerProperty.get().x + INSET;
      var centerY = this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2;
      coinTermsLeftToRight.forEach( function( orderedCoinTerm ) {
        orderedCoinTerm.travelToDestination( new Vector2(
          leftEdge - orderedCoinTerm.relativeViewBoundsProperty.get().minX,
          centerY
        ) );
        leftEdge += orderedCoinTerm.relativeViewBoundsProperty.get().width + INTER_COIN_TERM_SPACING;
      } );

      // trigger an event so that the view is sure to be updated
      this.layoutChangedEmitter.emit();
    },

    /**
     * update the contained coin terms for whether they should show minus sign when negative, supports subtraction mode
     * @private
     */
    updateCoinTermShowMinusSignFlag: function() {
      var self = this;
      var coinTermsLeftToRight = self.getCoinTermsLeftToRight();
      var oneOrMoreChanged = false;
      coinTermsLeftToRight.forEach( function( residentCoinTerm, index ) {

        // The minus sign is suppressed if subtraction is being shown, the coin term is not user controlled, and the
        // coin term is not the first one in the expression so that subtraction expressions will look correct.
        var showMinusSignWhenNegative = !( self.simplifyNegativesProperty.value && index > 0 ) ||
                                        residentCoinTerm.userControlledProperty.get();

        if ( showMinusSignWhenNegative !== residentCoinTerm.showMinusSignWhenNegativeProperty.get() ) {
          residentCoinTerm.showMinusSignWhenNegativeProperty.set( showMinusSignWhenNegative );
          oneOrMoreChanged = true;
        }
      } );

      if ( oneOrMoreChanged ) {
        this.layoutChangedEmitter.emit();
      }
    },

    /**
     * move, a.k.a. translate, by the specified amount and move the coin terms too
     * @private
     */
    translate: function( deltaPosition ) {

      // move the coin terms
      this.coinTerms.forEach( function( coinTerm ) {
        coinTerm.setPositionAndDestination( coinTerm.positionProperty.get().plus( deltaPosition ) );
      } );

      // move the outline shape
      this.upperLeftCornerProperty.set( this.upperLeftCornerProperty.get().plus( deltaPosition ) );
    },

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} upperLeftCornerDestination
     * @public
     */
    travelToDestination: function( upperLeftCornerDestination ) {
      var self = this;
      var animationDuration = self.upperLeftCornerProperty.get().distance( upperLeftCornerDestination ) / ANIMATION_SPEED;
      if ( animationDuration === 0 ) {

        // already there, so emit a notification and call it good
        self.destinationReachedEmitter.emit();
      }
      else {

        // set up the animation to get to the destination
        this.inProgressAnimationProperty.set( {
          startPosition: this.upperLeftCornerProperty.get().copy(),
          travelVector: upperLeftCornerDestination.minus( this.upperLeftCornerProperty.get() ),
          totalDuration: animationDuration,
          timeSoFar: 0
        } );
      }
    },

    /**
     * set both the position and destination of the upper left corner immediately, i.e. without animation
     * @param {Vector2} upperLeftCornerDestination
     * @public
     */
    setPositionAndDestination: function( upperLeftCornerDestination ) {
      this.translate( upperLeftCornerDestination.minus( this.upperLeftCornerProperty.get() ) );
    },

    /**
     * initiate a break apart, which just emits an event and counts on parent model to handle
     * @public
     */
    breakApart: function() {
      this.breakApartEmitter.emit();
    },

    /**
     * emit an event that signifies that this expression has been selected for editing
     * @public
     */
    enterEditMode: function() {
      this.inEditModeProperty.set( true );
      this.selectedForEditEmitter.emit();
    },

    /**
     * clear the edit mode, provided essentially for API symmetry
     * @public
     */
    exitEditMode: function() {
      this.inEditModeProperty.set( false );
    },

    /**
     * get the amount of overlap between the provided coin term's bounds and this expression's "join zone"
     * @param {CoinTerm} coinTerm
     * @public
     */
    getCoinTermJoinZoneOverlap: function( coinTerm ) {
      var coinTermBounds = coinTerm.getViewBounds();
      var xOverlap = Math.max(
        0,
        Math.min( coinTermBounds.maxX, this.joinZone.maxX ) - Math.max( coinTermBounds.minX, this.joinZone.minX )
      );
      var yOverlap = Math.max(
        0,
        Math.min( coinTermBounds.maxY, this.joinZone.maxY ) - Math.max( coinTermBounds.minY, this.joinZone.minY )
      );
      return xOverlap * yOverlap;
    },

    /**
     * get the amount of overlap between the provided expression and this expression
     * @param {Expression||EECollectionArea} otherEntity - must provide a 'getBounds' method
     */
    getOverlap: function( otherEntity ) {
      var otherExpressionBounds = otherEntity.getBounds();
      var thisExpressionBounds = this.getBounds();
      var xOverlap = Math.max(
        0,
        Math.min( otherExpressionBounds.maxX, thisExpressionBounds.maxX ) - Math.max( otherExpressionBounds.minX, thisExpressionBounds.minX )
      );
      var yOverlap = Math.max(
        0,
        Math.min( otherExpressionBounds.maxY, thisExpressionBounds.maxY ) - Math.max( otherExpressionBounds.minY, thisExpressionBounds.minY )
      );
      return xOverlap * yOverlap;
    },

    getUpperRightCorner: function() {
      return this.upperLeftCornerProperty.get().plusXY( this.widthProperty.get(), 0 );
    },

    /**
     * Add a coin term to the list of those that are hovering over this expression.  This is a no-op if the coin term is
     * already on the list.
     * @param {CoinTerm} coinTerm
     * @public
     */
    addHoveringCoinTerm: function( coinTerm ) {
      if ( this.hoveringCoinTerms.indexOf( coinTerm ) === -1 ) {
        this.hoveringCoinTerms.push( coinTerm );
        coinTerm.breakApartAllowedProperty.set( false );
      }
    },

    /**
     * Remove a coin term from the list of those that are hovering over this expression.  This is a no-op if the coin
     * term is not on the list.
     * @param {CoinTerm} coinTerm
     * @public
     */
    removeHoveringCoinTerm: function( coinTerm ) {
      var index = this.hoveringCoinTerms.indexOf( coinTerm );
      if ( index !== -1 ) {
        this.hoveringCoinTerms.splice( index, 1 );
        coinTerm.breakApartAllowedProperty.set( true );
      }
    },

    clearHoveringCoinTerms: function() {
      this.hoveringCoinTerms.forEach( function( hoveringCoinTerm ) {
        hoveringCoinTerm.breakApartAllowedProperty.set( true );
      } );
      this.hoveringCoinTerms.length = 0;
    },

    /**
     * Add an expression to the list of those that are hovering over this expression.  This is a no-op if the expression
     * is already on the list.
     * @param {Expression} expression
     * @public
     */
    addHoveringExpression: function( expression ) {
      if ( this.hoveringExpressions.indexOf( expression ) === -1 ) {
        this.hoveringExpressions.push( expression );
      }
    },

    /**
     * Remove an expression from the list of those that are hovering over this expression.  This is a no-op if the
     * provided expression is not on the list.
     * @param {Expression} expression
     * @public
     */
    removeHoveringExpression: function( expression ) {
      var index = this.hoveringExpressions.indexOf( expression );
      if ( index !== -1 ) {
        this.hoveringExpressions.splice( index, 1 );
      }
    },

    /**
     * returns true if the given coin term is on the list of those hovering over the expression
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
     */
    isCoinTermHovering: function( coinTerm ) {
      return this.hoveringCoinTerms.indexOf( coinTerm ) > -1;
    }
  } );
} );