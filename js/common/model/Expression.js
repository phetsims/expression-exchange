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
      userControlled: false // @public
    } );

    var self = this;

    // @public, read and listen only, items should be added and removed via methods
    this.coinTerms = new ObservableArray();
    this.coinTerms.add( anchorCoinTerm );

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

    // set up a listener to the position and move the coins as it changes
  }

  return inherit( PropertySet, Expression, {

    /**
     * add the specified coin
     * @param {CoinTerm} coinTerm
     */
    addCoinTerm: function( coinTerm ) {
      // TODO: implement
    },

    /**
     * move, or translate, by the specified amounts
     */
    translate: function( deltaX, deltaY ){

      // move the coin terms
      this.coinTerms.forEach( function( coinTerm ){
        coinTerm.position = coinTerm.position.plusXY( deltaX, deltaY );
      } );

      // move the outline shape
      this.upperLeftCorner = this.upperLeftCorner.plusXY( deltaX, deltaY );
    }
  } );
} );