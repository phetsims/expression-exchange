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
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INTER_COIN_TERM_SPACING = 30; // in model units, empirically determined
  var INSET = 10; // space around coin terms, empirically determined

  /**
   * @constructor
   */
  function Expression( anchorCoinTerm, floatingCoinTerm ) {

    var self = this;

    PropertySet.call( this, {
      upperLeftCorner: Vector2.ZERO, // @public (read only)
      width: 0, // @public (read only)
      height: 0, // @public (read only)
      userControlled: false, // @public
      leftHintActive: false, // @public (read only) - indicates whether the hint on the left side should be visible
      leftHintWidth: 0, // @public (read only) - width of the left hint
      rightHintActive: false, // @public (read only) - indicates whether the hint on the right side should be visible
      rightHintWidth: 0 // @public (read only) - width of the right hint
    } );

    // @public, read and listen only, items should be added and removed via methods
    this.coinTerms = new ObservableArray();

    // @private, tracks coin terms that are hovering over this expression but are being controlled by the user so are
    // not yet part of the expression.  This is used to activate and size the hints.  Coin terms should be added and
    // removed via methods.
    this.hoveringCoinTerms = [];

    // @private, tracks whether the expression should be resized on the next step
    this.resizeNeeded = false;

    // add the initial coin term
    this.coinTerms.push( anchorCoinTerm );
    anchorCoinTerm.relativeViewBoundsProperty.lazyLink( this.setResizeNeededFlag.bind( this ) );

    // set the initial size of the expression, which will enclose only the first coin term
    this.width = anchorCoinTerm.relativeViewBounds.width + 2 * INSET;
    this.height = anchorCoinTerm.relativeViewBounds.height + 2 * INSET;
    this.upperLeftCorner = new Vector2(
      anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.minX - INSET,
      anchorCoinTerm.position.y - this.height / 2
    );

    // create the bounds that will be used to decide if coin terms or other expressions are in a position to join this one
    // @private
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
  }

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
      if ( this.resizeNeeded ){
        this.handleResizedCoinTerms();
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

      // update the overall height of the expression if needed
      var neededHeight = tallestCoinTermHeight + 2 * INSET;
      if ( this.height !== neededHeight ) {
        this.upperLeftCorner = this.upperLeftCorner.minusXY( 0, ( neededHeight - this.height ) / 2 );
        this.height = tallestCoinTermHeight + 2 * INSET;
      }
    },

    /**
     * Size the expression and, if necessary, move the contained coin terms so that all coin terms are appropriately
     * positioned.  This is generally done when something affects the view bounds of the coin terms, such as turning
     * on coefficients or switching from coin view to variable view.
     * @private
     */
    handleResizedCoinTerms: function(){

      // get an array of the coin terms sorted from left to right
      var coinTermsLeftToRight = this.coinTerms.getArray().slice().sort( function( ct1, ct2 ) {
        return ct1.destination.x - ct2.destination.x;
      } );

      var middleCoinTermIndex = Math.floor( ( coinTermsLeftToRight.length - 1 ) / 2 );
      var xPos;
      var yPos = coinTermsLeftToRight[ middleCoinTermIndex ].destination.y;

      // adjust the positions of coin terms to the right of the middle
      for ( var i = middleCoinTermIndex + 1; i < coinTermsLeftToRight.length; i++ ){
        // adjust the position of this coin term to be the correct distance from its neighbor to the left
        var leftNeighbor = coinTermsLeftToRight[ i - 1 ];
        xPos = leftNeighbor.destination.x + leftNeighbor.relativeViewBounds.maxX + INTER_COIN_TERM_SPACING -
               coinTermsLeftToRight[ i ].relativeViewBounds.minX;
        coinTermsLeftToRight[ i ].travelToDestination( new Vector2( xPos, yPos ) );
      }

      // adjust the positions of coin terms to the left of the middle
      for ( i = middleCoinTermIndex - 1; i >= 0; i-- ){
        // adjust the position of this coin term to be the correct distance from its neighbor to the right
        var rightNeighbor = coinTermsLeftToRight[ i + 1 ];
        xPos = rightNeighbor.destination.x + rightNeighbor.relativeViewBounds.minX - INTER_COIN_TERM_SPACING -
               coinTermsLeftToRight[ i ].relativeViewBounds.maxX;
        coinTermsLeftToRight[ i ].travelToDestination( new Vector2( xPos, yPos ) );
      }

      // adjust the size and position of the background
      var maxHeight = 0;
      var totalWidth = 0;
      coinTermsLeftToRight.forEach( function( coinTerm ){
        maxHeight = coinTerm.relativeViewBounds.height > maxHeight ? coinTerm.relativeViewBounds.height : maxHeight;
        totalWidth+= coinTerm.relativeViewBounds.width;
      } );
      this.upperLeftCorner = new Vector2(
        coinTermsLeftToRight[ 0 ].destination.x + coinTermsLeftToRight[ 0 ].relativeViewBounds.minX - INSET,
        yPos - maxHeight / 2 - INSET
      );
      this.height = maxHeight + 2 * INSET;
      this.width = totalWidth + 2 * INSET + INTER_COIN_TERM_SPACING * ( coinTermsLeftToRight.length - 1 );
    },

    /**
     * add the specified coin term, moving into the correct location
     * @param {CoinTerm} coinTerm
     * @public
     */
    addCoinTerm: function( coinTerm ) {
      if ( this.isCoinTermHovering( coinTerm ) ) {
        this.removeHoveringCoinTerm( coinTerm );
      }
      this.coinTerms.push( coinTerm );

      // adjust the expression's width to accommodate the new coin term
      this.width = this.width + INTER_COIN_TERM_SPACING + coinTerm.relativeViewBounds.width;

      // figure out where the coin term should go
      var xDestination;
      if ( coinTerm.position.x > this.upperLeftCorner.x + this.width / 2 ) {
        // add to the right side
        xDestination = this.upperLeftCorner.x + this.width - INSET - coinTerm.relativeViewBounds.maxX;
      }
      else {
        // add to the left side, and shift the expression accordingly
        this.upperLeftCorner = this.upperLeftCorner.minusXY( INTER_COIN_TERM_SPACING + coinTerm.relativeViewBounds.width, 0 );
        xDestination = this.upperLeftCorner.x + INSET - coinTerm.relativeViewBounds.minX;
        //xDestination = this.upperLeftCorner;
      }

      // animate to the new location
      coinTerm.travelToDestination( new Vector2( xDestination, this.upperLeftCorner.y + this.height / 2 ) );

      // add a listener to resize the expression if this coin term's bound changes
      coinTerm.relativeViewBoundsProperty.lazyLink( this.setResizeNeededFlag.bind( this ) );
    },

    removeCoinTerm: function( coinTerm ){
      // TODO: Implement, and don't forget to unhook listeners that set the resize flag
    },

    // @private, function to set flag indicating that a resize is needed, used as a listener function
    setResizeNeededFlag: function() {
      this.resizeNeeded = true;
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

      // update the join zone
      this.joinZone.shift( deltaX, deltaY );
    },

    /**
     * get the amount of overlap between the provided coin term's bounds and this expression's "join zone"
     * @param coinTerm
     */
    getCoinTermJoinZoneOverlap: function( coinTerm ) {
      var coinTermBounds = coinTerm.relativeViewBounds.copy();
      coinTermBounds.shift( coinTerm.position.x, coinTerm.position.y );
      var xOverlap = Math.max( 0, Math.min( coinTermBounds.maxX, this.joinZone.maxX ) - Math.max( coinTermBounds.minX, this.joinZone.minX ) );
      var yOverlap = Math.max( 0, Math.min( coinTermBounds.maxY, this.joinZone.maxY ) - Math.max( coinTermBounds.minY, this.joinZone.minY ) );
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