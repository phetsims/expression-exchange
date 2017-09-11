// Copyright 2017, University of Colorado Boulder

/**
 * model element used in the game that represents the area where an expression or coin term can be collected if it
 * matches the collection specification
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTerm = require( 'EXPRESSION_EXCHANGE/common/model/CoinTerm' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var Expression = require( 'EXPRESSION_EXCHANGE/common/model/Expression' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var REJECTED_ITEM_DISTANCE = 20; // empirically determined

  /**
   * @param {number} x
   * @param {number} y
   * @param {ViewMode} viewMode
   * @param {Property.<boolean>} undoAllowedProperty
   * @constructor
   */
  function EECollectionArea( x, y, viewMode, undoAllowedProperty ) {

    // @public (read-only) {Property.<boolean>} - property indicating whether the undo functionality is enabled
    this.undoAllowedProperty = undoAllowedProperty;

    // @public (read-only) {Expression|CoinTerm} - expression or coin term that has been collected, null if nothing
    this.collectedItemProperty = new Property( null );

    // @public {Property.<ExpressionDescription|null} - description of the expression that this capture area can hold
    this.expressionDescriptionProperty = new Property( null );

    // @public (read-only) {Bounds2} - bounds in model space of this capture area
    this.bounds = EESharedConstants.COLLECTION_AREA_SIZE.toBounds( x, y );

    // @public (read-only) {ViewMode} - view mode (coins or variables)
    this.viewMode = viewMode;

    // @public {Property.<boolean>} - used by the view to turn on/off a "halo" for the collection area, generally used
    // when the user holds something over the collection area
    this.haloActiveProperty = new Property( false );

    // @public (read-only) {Emitter} - emitter that emits an event when an at attempt is made to collect an item, and
    // includes a parameter that is true if the item was collected and false if not
    this.collectionAttemptedEmitter = new Emitter();
  }

  expressionExchange.register( 'EECollectionArea', EECollectionArea );

  return inherit( Object, EECollectionArea, {

    /**
     * Test the provided expression and, if it matches the spec, capture it by moving it into the center of this
     * collection area and, if it doesn't match, push it away.
     * @param {Expression} expression
     * @public
     */
    collectOrRejectExpression: function( expression ) {

      // test that this collection area is in the correct state
      assert && assert( this.expressionDescriptionProperty.get(), 'no expression description for collection area' );

      // bounds used for positioning of the expression
      var expressionBounds;

      // results of the attempt to collect this expression
      var collected;

      if ( this.isEmpty() && this.expressionDescriptionProperty.get().expressionMatches( expression ) ) {

        // collect this expression - the collection state must be set first in case it causes an update of the bounds
        expression.collectedProperty.set( true );
        collected = true;
        expressionBounds = expression.getBounds();

        // move the expression into the container, a little below center so there's no overlap with eject button
        expression.travelToDestination( new Vector2(
          this.bounds.getCenterX() - expressionBounds.width / 2,
          this.bounds.getCenterY() - expressionBounds.height * 0.4
        ) );
        this.collectedItemProperty.set( expression );
      }
      else {

        // reject this expression
        expressionBounds = expression.getBounds();
        collected = false;
        expression.travelToDestination( new Vector2(
          this.bounds.minX - expressionBounds.width - REJECTED_ITEM_DISTANCE,
          this.bounds.getCenterY() - expressionBounds.height / 2
        ) );
      }

      // signal the results of this collection attempt
      this.collectionAttemptedEmitter.emit1( collected );
    },

    /**
     * Test the provided coin term and, if it matches the spec, capture it by moving it into the center of this
     * collection area and, if it doesn't match, push it away.
     * @param {CoinTerm} coinTerm
     * @public
     */
    collectOrRejectCoinTerm: function( coinTerm ) {

      // test that this collection area is in the correct state
      assert && assert( this.expressionDescriptionProperty.get(), 'no expression description for collection area' );

      // get bounds for positioning of the coin term
      var coinTermViewBounds = coinTerm.getViewBounds();

      // results of the attempt to collect this expression
      var collected;

      if ( this.isEmpty() && this.expressionDescriptionProperty.get().coinTermMatches( coinTerm ) ) {

        // collect this coin term
        collected = true;
        coinTerm.travelToDestination( this.bounds.center );
        coinTerm.collectedProperty.set( true );
        this.collectedItemProperty.set( coinTerm );
      }
      else {

        // reject this coin term
        collected = false;
        coinTerm.travelToDestination( new Vector2(
          this.bounds.minX - coinTermViewBounds.width - REJECTED_ITEM_DISTANCE, this.bounds.getCenterY()
        ) );
      }

      // signal the results of this collection attempt
      this.collectionAttemptedEmitter.emit1( collected );
    },

    /**
     * @returns {boolean}
     * @public
     */
    isEmpty: function() {
      return this.collectedItemProperty.get() === null;
    },

    /**
     * eject the currently collected expression, no-op if no expression is currently collected
     * @public
     */
    ejectCollectedItem: function() {
      var collectedItem = this.collectedItemProperty.get();
      var collectedItemBounds;
      var yDestination;

      // the item's collected state must be updated first, since this can sometimes cause its bounds to change
      collectedItem.collectedProperty.set( false );

      // figure out the destination, which is slightly different for coin terms versus expressions
      if ( collectedItem instanceof Expression ) {

        collectedItemBounds = collectedItem.getBounds();
        yDestination = this.bounds.getCenterY() - collectedItemBounds.height / 2;
      }
      else {
        assert && assert( collectedItem instanceof CoinTerm, 'unexpected item, cannot reject' );
        collectedItemBounds = collectedItem.getViewBounds();
        yDestination = this.bounds.getCenterY();
      }

      // send the collected item outside of the collection area
      collectedItem.travelToDestination( new Vector2(
        this.bounds.minX - collectedItemBounds.width - REJECTED_ITEM_DISTANCE,
        yDestination
      ) );

      // update internal state
      this.collectedItemProperty.reset();
    },

    /**
     * get a reference to this collection area's model bounds, the results should not be changed, this exists to allow
     * polymorphisim with other entities whose bounds are checked
     * @returns {Bounds2}
     * @public
     */
    getBounds: function() {
      return this.bounds;
    },

    /**
     * reset the collection area
     * @public
     */
    reset: function() {
      if ( this.collectedItemProperty.get() ) {
        this.collectedItemProperty.get().collectedProperty.set( false );
      }
      this.collectedItemProperty.reset();
    }

  } );
} );