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
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INTER_COIN_TERM_SPACING = 26; // in model units, between the bounds
  var INSET = 10; // space around coin terms, empirically determined

  /**
   * @constructor
   */
  function Expression( anchorCoinTerm, floatingCoinTerm ) {

    PropertySet.call( this, {
      upperLeftCorner: Vector2.ZERO, // @public (read only)
      width: 0, // @public (read only)
      height: 0, // @public (read only)
      userControlled: false, // @public
      leftHintActive: false, // @public (read only) indicates whether the hint on the left side should be visible
      rightHintActive: false // @public (read only) indicates whether the hint on the right side should be visible
    } );

    var self = this;

    // @public, read and listen only, items should be added and removed via methods
    this.coinTerms = new ObservableArray();
    this.coinTerms.add( anchorCoinTerm );

    // TODO: there will need to be methods that update width and height based on adding and removing of coin terms
    // set the boundaries of the expression and set up the destination for the floating coin term
    var xDestination;
    this.width = anchorCoinTerm.relativeViewBounds.width + floatingCoinTerm.relativeViewBounds.width + 2 * INSET +
                 INTER_COIN_TERM_SPACING;
    this.height = Math.max( anchorCoinTerm.relativeViewBounds.height, floatingCoinTerm.relativeViewBounds.height ) +
                  2 * INSET;
    if ( floatingCoinTerm.position.x >= anchorCoinTerm.position.x ){

      // the floating one is to the right of the anchor, create a space and destination where it can land
      this.upperLeftCorner = new Vector2(
        anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.minX - INSET,
        anchorCoinTerm.position.y - this.height / 2
      );
      xDestination = anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.maxX + INTER_COIN_TERM_SPACING -
                     floatingCoinTerm.relativeViewBounds.minX;
    }
    else{
      // the floating one is to the left of the anchor, create a space and destination where it can land
      this.upperLeftCorner = new Vector2(
        anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.minX - INTER_COIN_TERM_SPACING -
        floatingCoinTerm.relativeViewBounds.width - INSET,
        anchorCoinTerm.position.y - this.height / 2
      );
      xDestination = anchorCoinTerm.position.x + anchorCoinTerm.relativeViewBounds.minX - INTER_COIN_TERM_SPACING -
                     floatingCoinTerm.relativeViewBounds.maxX;
    }

    // @private - a rectangle used to decide if coin terms or other expressions are in a position to join this expression
    this.joinZone = new Bounds2(
      this.upperLeftCorner.x - this.height,
      this.upperLeftCorner.y,
      this.upperLeftCorner.x + this.width + this.height,
      this.upperLeftCorner.y + this.height
    );

    // TODO: I don't think this would property handle a reset that occurs during the animation, so I'll need to add that.
    // animate the floating coin term to its destination within the expression
    var destination = new Vector2( xDestination, anchorCoinTerm.position.y );
    var movementTime = anchorCoinTerm.position.distance( destination ) / EESharedConstants.COIN_TERM_MOVEMENT_SPEED * 1000;
    new TWEEN.Tween( { x: floatingCoinTerm.position.x, y: floatingCoinTerm.position.y } )
      .to( { x: destination.x, y: destination.y }, movementTime )
      .easing( TWEEN.Easing.Cubic.InOut )
      .onUpdate( function() {
        floatingCoinTerm.position = new Vector2( this.x, this.y );
      } )
      .onComplete( function() {
        self.coinTerms.add( floatingCoinTerm );
      } )
      .start();
  }

  return inherit( PropertySet, Expression, {

    /**
     * add the specified coin
     * @param {CoinTerm} coinTerm
     * @public
     */
    addCoinTerm: function( coinTerm ) {
      // TODO: implement
    },

    /**
     * move, a.k.a. translate, by the specified amounts
     * @public
     */
    translate: function( deltaX, deltaY ){

      // move the coin terms
      this.coinTerms.forEach( function( coinTerm ){
        coinTerm.position = coinTerm.position.plusXY( deltaX, deltaY );
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
    getCoinTermJoinZoneOverlap: function( coinTerm ){
      var coinTermBounds = coinTerm.relativeViewBounds.copy();
      coinTermBounds.shift( coinTerm.position.x, coinTerm.position.y );
      var xOverlap = Math.max( 0, Math.min( coinTermBounds.maxX, this.joinZone.maxX ) - Math.max( coinTermBounds.minX, this.joinZone.minX ) );
      var yOverlap = Math.max( 0, Math.min( coinTermBounds.maxY, this.joinZone.maxY ) - Math.max( coinTermBounds.minY, this.joinZone.minY ) );
      return xOverlap * yOverlap;
    }
  } );
} );