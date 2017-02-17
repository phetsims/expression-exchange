// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var ExpressionCollectionArea = require( 'EXPRESSION_EXCHANGE/game/model/ExpressionCollectionArea' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var EXPRESSION_COLLECTION_AREA_X_OFFSET = 750;
  var EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET = 100;
  var EXPRESSION_COLLECTION_AREA_Y_SPACING = 130;
  var NUM_EXPRESSION_COLLECTION_AREAS = 3;

  /**
   * TODO: Document parameters when finalized
   * @constructor
   */
  function EEGameLevelModel( level, allowedRepresentations ) {

    var self = this;

    this.challengeNumber = 0; // TODO: Make this private later if possible
    this.level = level; // {number} @public, read only

    // @public, read only, model that allows user to manipulate coin terms and expressions
    this.expressionManipulationModel = new ExpressionManipulationModel( {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false // partial cancellation isn't performed in the games
    } );

    // @public - property that refers to the current challenge
    this.currentChallengeProperty = new Property(
      EEChallengeDescriptors.getChallengeDescriptor( level, this.challengeNumber )
    );

    assert && assert(
      allowedRepresentations !== AllowedRepresentationsEnum.COINS_AND_VARIABLES,
      'games do not support switching between coin and variable view'
    );

    // @public, read only - areas where expressions can be collected
    this.expressionCollectionAreas = [];
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, function( index ) {
      self.expressionCollectionAreas.push( new ExpressionCollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET + index * EXPRESSION_COLLECTION_AREA_Y_SPACING,
        allowedRepresentations === AllowedRepresentationsEnum.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES
      ) );
    } );

    // update the expression description associated with the expression collection areas each time a new challenge is set
    this.currentChallengeProperty.link( function( currentChallenge ) {
      self.expressionCollectionAreas.forEach( function( expressionCollectionArea, index ) {
        expressionCollectionArea.expressionDescriptionProperty.set( currentChallenge.expressionsToCollect[ index ] );
      } );
    } );

    // handle interaction between expressions and the collection areas
    this.expressionManipulationModel.expressions.addItemAddedListener( function( addedExpression ) {

      // define a function that will attempt to collect this expression if it is dropped over a collection area
      function expressionUserControlledListener( userControlled ) {
        if ( !userControlled ) {

          // test if this expression was dropped over a collection area
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionArea( addedExpression );

          if ( mostOverlappingCollectionArea ) {

            // Attempt to put this expression into the collection area.  The collection area will take care of either
            // moving the expression inside or pushing it to the side.
            mostOverlappingCollectionArea.collectOrRejectExpression( addedExpression );
          }
        }
      }

      // hook up the listener
      addedExpression.userControlledProperty.lazyLink( expressionUserControlledListener );

      // listen for the removal of this expression and unhook the listener in order to avoid memory leaks
      self.expressionManipulationModel.expressions.addItemRemovedListener( function( removedExpression ) {
        if ( addedExpression === removedExpression ) {
          removedExpression.userControlledProperty.unlink( expressionUserControlledListener );
        }
      } );
    } );
  }

  expressionExchange.register( 'EEGameLevelModel', EEGameLevelModel );

  return inherit( Object, EEGameLevelModel, {

    /**
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      this.expressionManipulationModel.step( dt );
    },

    /**
     * get a reference to the collection area that most overlaps with the provided expression, if not overlap exists
     * then return null
     * @param {Expression} expression
     * @private
     */
    getMostOverlappingCollectionArea: function( expression ) {
      var maxOverlap = 0;
      var mostOverlappingCollectionArea = null;
      this.expressionCollectionAreas.forEach( function( collectionArea ) {
        if ( collectionArea.collectedExpressionProperty.get() === null && // collection area must be empty
             expression.getOverlap( collectionArea ) > maxOverlap ) {
          mostOverlappingCollectionArea = collectionArea;
          maxOverlap = expression.getOverlap( collectionArea );
        }
      } );
      return mostOverlappingCollectionArea;
    },

    /**
     * @public
     */
    reset: function() {
      // TODO: This is incomplete and will need to be expanded once the collection boxes are implemented.
      this.expressionManipulationModel.reset();
    },

    /**
     * @public
     */
    refresh: function() {
      // TODO: This is probably incomplete, and will need to do something like only go to the next challenge if the
      // current one has been completed.
      this.loadNextChallenge();
    },

    loadNextChallenge: function() {
      this.challengeNumber = ( this.challengeNumber + 1 ) % EEChallengeDescriptors.CHALLENGES_PER_LEVEL;
      this.currentChallengeProperty.set( EEChallengeDescriptors.getChallengeDescriptor(
        this.level,
        this.challengeNumber
      ) );
    },

    setCoinTermRetrievalBounds: function( bounds ) {
      this.expressionManipulationModel.coinTermRetrievalBounds = bounds;
    }
  } );
} );