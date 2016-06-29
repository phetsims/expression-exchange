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
  var Emitter = require( 'AXON/Emitter' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INTER_COIN_TERM_SPACING = 30; // in model units, empirically determined
  var INSET = 10; // space around coin terms, empirically determined
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

    PropertySet.call( this, {
      upperLeftCorner: Vector2.ZERO, // @public (read only)
      width: 0, // @public (read only)
      height: 0, // @public (read only)
      userControlled: false, // @public
      leftHintActive: false, // @public (read only) - indicates whether the hint on the left side should be visible
      leftHintWidth: 0, // @public (read only) - width of the left hint
      rightHintActive: false, // @public (read only) - indicates whether the hint on the right side should be visible
      rightHintWidth: 0, // @public (read only) - width of the right hint
      combineHaloActive: false, // @public (read only) indicates whether the 'combine halo' should be visible
      inProgressAnimation: null, // @public (read only), tracks the current in-progress animation, if any
      inEditMode: false // @public, indicates whether this expression is being edited
    } );

    // @public, read and listen only, items should be added and removed via methods
    this.coinTerms = new ObservableArray();

    // @public, listen only, emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public, listen only, emits an event when this expression has been selected by the user to be edited
    this.selectedForEditEmitter = new Emitter();

    // @public, listen only, emits an event when the size of the expression or the relative positions of the coins
    // change, generally used by the view so that it knows when to update, does NOT fire for position-only changes
    // or for activitation/deactivation of hints
    this.layoutChangedEmitter = new Emitter();

    // @public, listen only, emits an event when this expression should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private, used to update whether or not coin terms should show minus sign when negative
    this.simplifyNegativesProperty = simplifyNegativesProperty;

    // @private, tracks coin terms that are hovering over this expression but are being controlled by the user so are
    // not yet part of the expression.  This is used to activate and size the hints.  Coin terms should be added and
    // removed via methods.
    this.hoveringCoinTerms = [];

    // @private, tracks expressions that are hovering over this expression and would be combined with this one if
    // released by the user.  This is used to activate the 'halo' that indicates that potential combination.
    this.hoveringExpressions = [];

    // @private, tracks whether the expression should be resized on the next step
    this.resizeNeeded = false;

    // add the initial coin term
    this.coinTerms.push( anchorCoinTerm );
    anchorCoinTerm.breakApartAllowed = false;
    anchorCoinTerm.positionInExpression = 0;

    // Define a listener that is bound to this object that will set the resize needed flag when fired.  This is done
    // in this way so that the listener can be found and removed when the coin term is removed from this expression.
    this.setResizeFlagFunction = function() { self.resizeNeeded = true; }; // @private

    // hook up the resize listener to the anchor coin
    anchorCoinTerm.relativeViewBoundsProperty.lazyLink( this.setResizeFlagFunction );

    // set the initial size of the expression, which will enclose only the first coin term
    this.width = anchorCoinTerm.relativeViewBounds.width + 2 * INSET;
    this.height = anchorCoinTerm.relativeViewBounds.height + 2 * INSET;
    this.upperLeftCorner = new Vector2(
      anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.minX - INSET,
      anchorCoinTerm.position.y - this.height / 2
    );

    // @private, bounds that will be used to decide if coin terms or other expressions are in a position to join this one
    this.joinZone = new Bounds2(
      this.upperLeftCorner.x - this.height,
      this.upperLeftCorner.y,
      this.upperLeftCorner.x + this.width + this.height,
      this.upperLeftCorner.y + this.height
    );

    // update the join zone as the size and/or location of the expression changes
    Property.multilink( [ this.upperLeftCornerProperty, this.widthProperty, this.heightProperty ],
      function( upperLeftCorner, width, height ) {
        self.joinZone.setMinMax(
          self.upperLeftCorner.x - self.height,
          self.upperLeftCorner.y,
          self.upperLeftCorner.x + self.width + self.height,
          self.upperLeftCorner.y + self.height );
      }
    );

    // add the second coin term
    this.addCoinTerm( floatingCoinTerm );

    // add a listener that will immediately finish animations for incoming coin terms if the expression is grabbed
    this.userControlledProperty.onValue( true, function() {
      self.coinTerms.forEach( function( coinTerm ) {
        if ( coinTerm.inProgressAnimation ) {
          coinTerm.goImmediatelyToDestination();
        }
      } );
    } );

    // monitor the setting for whether negatives are simplified and update the contained coin terms when it changes
    // TODO: Unlink this in a dispose function
    simplifyNegativesProperty.link( function() {
      self.updateCoinTermShowMinusSignFlag();
    } );

    // logging, for debug purposes
    expressionExchange.log( 'created ' + this.id + ' with anchor = ' + anchorCoinTerm.id + ' and floating = ' + floatingCoinTerm.id );
  }

  expressionExchange.register( 'Expression', Expression );

  return inherit( PropertySet, Expression, {

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
        this.updateSizeAndCoinTermPositions();
        this.resizeNeeded = false;
      }

      // determine the needed height and which hints should be active
      var tallestCoinTermHeight = 0;
      this.coinTerms.forEach( function( residentCoinTerm ) {
        tallestCoinTermHeight = Math.max( tallestCoinTermHeight, residentCoinTerm.relativeViewBounds.height );
      } );
      var rightHintActive = false;
      var rightHintMaxCoinWidth = 0;
      var leftHintActive = false;
      var leftHintMaxCoinWidth = 0;
      this.hoveringCoinTerms.forEach( function( hoveringCoinTerm ) {
        tallestCoinTermHeight = Math.max( tallestCoinTermHeight, hoveringCoinTerm.relativeViewBounds.height );
        if ( hoveringCoinTerm.position.x > self.upperLeftCorner.x + self.width / 2 ) {
          // coin is over right half of the expression
          rightHintActive = true;
          rightHintMaxCoinWidth = Math.max( rightHintMaxCoinWidth, hoveringCoinTerm.relativeViewBounds.width );
        }
        else {
          // coin is over left half of the expression
          leftHintActive = true;
          leftHintMaxCoinWidth = Math.max( leftHintMaxCoinWidth, hoveringCoinTerm.relativeViewBounds.width );
        }
      } );

      // update the hint states
      this.rightHintActive = rightHintActive;
      this.leftHintActive = leftHintActive;

      // to minimize redraws in the view, only update width when the hints are active
      if ( this.rightHintActive ) {
        this.rightHintWidth = rightHintMaxCoinWidth + 2 * INSET;
      }
      if ( this.leftHintActive ) {
        this.leftHintWidth = leftHintMaxCoinWidth + 2 * INSET;
      }

      // update the property that indicates whether the combine halo is active
      this.combineHaloActive = this.hoveringExpressions.length > 0;

      // update the overall height of the expression if needed
      var neededHeight = tallestCoinTermHeight + 2 * INSET;
      if ( this.height !== neededHeight ) {
        this.upperLeftCorner = this.upperLeftCorner.minusXY( 0, ( neededHeight - this.height ) / 2 );
        this.height = tallestCoinTermHeight + 2 * INSET;
        this.layoutChangedEmitter.emit();
      }
    },

    /**
     * get the current bounds of this expression
     * @param {Bounds2} [boundsToSet] - optional bounds to set if caller wants to avoid an allocation
     */
    getBounds: function( boundsToSet ) {
      var bounds = boundsToSet || new Bounds2( 0, 0, 1, 1 );
      bounds.setMinMax(
        this.upperLeftCorner.x,
        this.upperLeftCorner.y,
        this.upperLeftCorner.x + this.width,
        this.upperLeftCorner.y + this.height
      );
      return bounds;
    },

    /**
     * get a list of the coin terms ordered from left to right based on their position in the expression
     * @private
     */
    getCoinTermsLeftToRight: function() {
      return this.coinTerms.getArray().slice( 0 ).sort( function( ct1, ct2 ) {
        return ct1.destination.x - ct2.destination.x;
      } );
    },

    /**
     * Size the expression and, if necessary, move the contained coin terms so that all coin terms are appropriately
     * positioned.  This is generally done when something affects the view bounds of the coin terms, such as turning
     * on coefficients or switching from coin view to variable view.
     * @private
     */
    updateSizeAndCoinTermPositions: function() {

      // keep track of original size so we know when to fire event about layout changes
      var originalWidth = this.width;
      var originalHeight = this.height;
      var coinTermsMoved = false;

      // get an array of the coin terms sorted from left to right
      var coinTermsLeftToRight = this.getCoinTermsLeftToRight();

      var middleCoinTermIndex = Math.floor( ( coinTermsLeftToRight.length - 1 ) / 2 );
      var xPos;
      var yPos = coinTermsLeftToRight[ middleCoinTermIndex ].destination.y;

      // adjust the positions of coin terms to the right of the middle
      for ( var i = middleCoinTermIndex + 1; i < coinTermsLeftToRight.length; i++ ) {

        // adjust the position of this coin term to be the correct distance from its neighbor to the left
        var leftNeighbor = coinTermsLeftToRight[ i - 1 ];
        xPos = leftNeighbor.destination.x + leftNeighbor.relativeViewBounds.maxX + INTER_COIN_TERM_SPACING -
               coinTermsLeftToRight[ i ].relativeViewBounds.minX;
        if ( coinTermsLeftToRight[ i ].position.x !== xPos ) {
          coinTermsLeftToRight[ i ].travelToDestination( new Vector2( xPos, yPos ) );
          coinTermsMoved = true;
        }
      }

      // adjust the positions of coin terms to the left of the middle
      for ( i = middleCoinTermIndex - 1; i >= 0; i-- ) {
        // adjust the position of this coin term to be the correct distance from its neighbor to the right
        var rightNeighbor = coinTermsLeftToRight[ i + 1 ];
        xPos = rightNeighbor.destination.x + rightNeighbor.relativeViewBounds.minX - INTER_COIN_TERM_SPACING -
               coinTermsLeftToRight[ i ].relativeViewBounds.maxX;
        if ( coinTermsLeftToRight[ i ].position.x !== xPos ) {
          coinTermsLeftToRight[ i ].travelToDestination( new Vector2( xPos, yPos ) );
          coinTermsMoved = true;
        }
      }

      // adjust the size and position of the background
      var maxHeight = 0;
      var totalWidth = 0;
      coinTermsLeftToRight.forEach( function( coinTerm ) {
        maxHeight = coinTerm.relativeViewBounds.height > maxHeight ? coinTerm.relativeViewBounds.height : maxHeight;
        totalWidth += coinTerm.relativeViewBounds.width;
      } );
      this.upperLeftCorner = new Vector2(
        coinTermsLeftToRight[ 0 ].destination.x + coinTermsLeftToRight[ 0 ].relativeViewBounds.minX - INSET,
        yPos - maxHeight / 2 - INSET
      );
      this.height = maxHeight + 2 * INSET;
      this.width = totalWidth + 2 * INSET + INTER_COIN_TERM_SPACING * ( coinTermsLeftToRight.length - 1 );

      // emit an event if the size or the coin term positions changed
      if ( this.width !== originalWidth || this.height !== originalHeight || coinTermsMoved ) {
        this.layoutChangedEmitter.emit();
      }
    },

    /**
     * add the specified coin term to this expression, moving it to the correct location
     * @param {CoinTerm} coinTerm
     * @public
     */
    addCoinTerm: function( coinTerm ) {

      // if the coin term being added is currently on the list of hovering coin terms, remove it
      if ( this.isCoinTermHovering( coinTerm ) ) {
        this.removeHoveringCoinTerm( coinTerm );
        if ( this.hoveringCoinTerms.length === 0 ) {
          this.rightHintActive = false;
          this.leftHintActive = false;
        }
      }

      // don't allow coin terms to be broken apart while in expressions
      coinTerm.breakApartAllowed = false;

      // adjust the expression's width to accommodate the new coin term
      var originalWidth = this.width;
      this.width = this.width + INTER_COIN_TERM_SPACING + coinTerm.relativeViewBounds.width;

      // figure out where the coin term should go
      var xDestination;
      if ( coinTerm.position.x > this.upperLeftCorner.x + originalWidth / 2 ) {
        // add to the right side
        xDestination = this.upperLeftCorner.x + this.width - INSET - coinTerm.relativeViewBounds.maxX;
      }
      else {
        // add to the left side, and shift the expression accordingly
        this.upperLeftCorner = this.upperLeftCorner.minusXY( INTER_COIN_TERM_SPACING + coinTerm.relativeViewBounds.width, 0 );
        xDestination = this.upperLeftCorner.x + INSET - coinTerm.relativeViewBounds.minX;
      }
      var destination = new Vector2( xDestination, this.upperLeftCorner.y + this.height / 2 );

      // decide whether or not to animate to the destination
      if ( !this.userControlled ) {
        // animate to the new location
        coinTerm.travelToDestination( destination );
      }
      else {
        // if this expression is being moved by the user, don't animate - it won't end well
        coinTerm.setPositionAndDestination( destination );
      }

      // officially add the coin term
      this.coinTerms.push( coinTerm );

      // add a listener to resize the expression if the bounds of this coin term change
      coinTerm.relativeViewBoundsProperty.lazyLink( this.setResizeFlagFunction );

      // add a listener to update whether minus sign is shown when negative when the user moves this coin term
      coinTerm.userControlledProperty.link( this.updateCoinTermShowMinusSignFlag.bind( this ) );

      // update whether the coin terms should be showing minus signs
      this.updateCoinTermShowMinusSignFlag();
    },

    // @public
    removeCoinTerm: function( coinTerm ) {
      coinTerm.relativeViewBoundsProperty.unlink( this.setResizeFlagFunction );
      coinTerm.breakApartAllowed = true;
      coinTerm.showMinusSignWhenNegative = true;
      this.coinTerms.remove( coinTerm );
      coinTerm.relativeViewBoundsProperty.unlink( this.setResizeFlagFunction );
      coinTerm.userControlledProperty.unlink( this.updateCoinTermShowMinusSignFlag );

      if ( this.coinTerms.length > 0 ) {
        this.updateSizeAndCoinTermPositions();
        this.updateCoinTermShowMinusSignFlag();
      }

      expressionExchange.log( 'removed ' + coinTerm.id + ' from ' + this.id );
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

      // TODO: Temp assert for tracking down and issue
      assert && assert( this.coinTerms.length === 0 );

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

      // set the position of each coin term based on its order
      var leftEdge = this.upperLeftCorner.x + INSET;
      var centerY = this.upperLeftCorner.y + this.height / 2;
      coinTermsLeftToRight.forEach( function( orderedCoinTerm ) {
        orderedCoinTerm.travelToDestination( new Vector2( leftEdge - orderedCoinTerm.relativeViewBounds.minX, centerY ) );
        leftEdge += orderedCoinTerm.relativeViewBounds.width + INTER_COIN_TERM_SPACING;
      } );

      // update coin term minus sign flags
      this.updateCoinTermShowMinusSignFlag();

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
                                        residentCoinTerm.userControlled;

        if ( showMinusSignWhenNegative !== residentCoinTerm.showMinusSignWhenNegative ){
          residentCoinTerm.showMinusSignWhenNegative = showMinusSignWhenNegative;
          oneOrMoreChanged = true;
        }
      } );

      if ( oneOrMoreChanged ){
        this.layoutChangedEmitter.emit();
      }
    },

    /**
     * move, a.k.a. translate, by the specified amounts
     * @public
     */
    translate: function( deltaX, deltaY ) {

      // move the coin terms
      this.coinTerms.forEach( function( coinTerm ) {
        coinTerm.setPositionAndDestination( coinTerm.position.plusXY( deltaX, deltaY ) );
      } );

      // move the outline shape
      this.upperLeftCorner = this.upperLeftCorner.plusXY( deltaX, deltaY );
    },

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} upperLeftCornerDestination
     */
    travelToDestination: function( upperLeftCornerDestination ) {
      var self = this;
      var prevX = this.upperLeftCorner.x;
      var prevY = this.upperLeftCorner.y;
      var movementTime = self.upperLeftCorner.distance( upperLeftCornerDestination ) / ANIMATION_SPEED * 1000;
      this.inProgressAnimation = new TWEEN.Tween( { x: this.upperLeftCorner.x, y: this.upperLeftCorner.y } )
        .to( { x: upperLeftCornerDestination.x, y: upperLeftCornerDestination.y }, movementTime )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function() {
          self.translate( this.x - prevX, this.y - prevY );
          prevX = this.x;
          prevY = this.y;
        } )
        .onComplete( function() {
          self.inProgressAnimation = null;
          self.destinationReachedEmitter.emit();
        } )
        .start();
    },

    /**
     * set both the position and destination of the upper left corner immediately, i.e. without animation
     * @param {Vector2} upperLeftCornerDestination
     * @public
     */
    setPositionAndDestination: function( upperLeftCornerDestination ) {
      this.translate(
        upperLeftCornerDestination.x - this.upperLeftCorner.x,
        upperLeftCornerDestination.y - this.upperLeftCorner.y
      );
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
      this.inEditMode = true;
      this.selectedForEditEmitter.emit();
    },

    /**
     * clear the edit mode, provided essentially for API symmetry
     * @public
     */
    exitEditMode: function() {
      this.inEditMode = false;
    },

    /**
     * get the amount of overlap between the provided coin term's bounds and this expression's "join zone"
     * @param {CoinTerm} coinTerm
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
     * @param {Expression} otherExpression
     */
    getExpressionOverlap: function( otherExpression ) {
      // TODO: Test and see if having pre-allocated bounds helps performance (right now getBounds does an allocation)
      var otherExpressionBounds = otherExpression.getBounds();
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

    /**
     * Add a coin term to the list of those that are hovering over this expression.  This is a no-op if the coin term is
     * already on the list.
     * @param {CoinTerm} coinTerm
     * @public
     */
    addHoveringCoinTerm: function( coinTerm ) {
      if ( this.hoveringCoinTerms.indexOf( coinTerm ) === -1 ) {
        this.hoveringCoinTerms.push( coinTerm );
        coinTerm.breakApartAllowed = false;
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
        coinTerm.breakApartAllowed = true;
      }
    },

    /**
     * TODO: doc once finalized
     * @param coinTerm
     * @returns {boolean}
     */
    isHoveringCoinTerm: function( coinTerm ) {
      return this.hoveringCoinTerms.indexOf( coinTerm ) > -1;
    },

    clearHoveringCoinTerms: function() {
      this.hoveringCoinTerms.forEach( function( hoveringCoinTerm ) {
        hoveringCoinTerm.breakApartAllowed = true;
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