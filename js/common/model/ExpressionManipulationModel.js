// Copyright 2015-2022, University of Colorado Boulder

/**
 * A model that allows users to move coin terms around, combine them into expressions, edit the expressions, change the
 * values of the underlying variables, and track different view modes.  This is the main model type used in all of the
 * explore screens and for each of the game challenges.  Options are used to support the different restrictions for
 * each screen.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import AllowedRepresentations from '../enum/AllowedRepresentations.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import ViewMode from '../enum/ViewMode.js';
import CoinTermFactory from './CoinTermFactory.js';
import Expression from './Expression.js';
import ExpressionHint from './ExpressionHint.js';

// constants
const BREAK_APART_SPACING = 10;
const RETRIEVED_COIN_TERMS_X_SPACING = 100;
const RETRIEVED_COIN_TERMS_Y_SPACING = 60;
const RETRIEVED_COIN_TERM_FIRST_POSITION = new Vector2( 250, 50 ); // upper left, doesn't overlap with control panels
const NUM_RETRIEVED_COIN_TERM_COLUMNS = 6;
const MIN_RETRIEVAL_PLACEMENT_DISTANCE = 30; // empirically determined

class ExpressionManipulationModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentations.COINS_AND_VARIABLES,

      // flag that controls how cancellation is handled in cases where coin terms don't completely cancel each other out
      partialCancellationEnabled: true,

      // flag that controls whether the 'simplify negatives' setting is on or off by default
      simplifyNegativesDefault: false

    }, options );

    const initialViewMode = options.allowedRepresentations === AllowedRepresentations.VARIABLES_ONLY ?
                            ViewMode.VARIABLES : ViewMode.COINS;

    // @public {Property.<ViewMode>}
    this.viewModeProperty = new StringProperty( initialViewMode );

    // @public {Property.<boolean>}
    this.showCoinValuesProperty = new Property( false );
    this.showVariableValuesProperty = new Property( false );
    this.showAllCoefficientsProperty = new Property( false );

    // @public {Property.<number>}
    this.xTermValueProperty = new Property( 2 );
    this.yTermValueProperty = new Property( 5 );
    this.zTermValueProperty = new Property( 10 );

    // @public (read-only) {Property.<number>}
    this.totalValueProperty = new Property( 0 );

    // @public (read-only) {Property.<Expression>} - null when no expression is being edited
    this.expressionBeingEditedProperty = new Property( null );

    // @public {Property.<boolean>}
    this.simplifyNegativesProperty = new Property( options.simplifyNegativesDefault );


    // @public (read-only) {CoinTermFactory} - factory used to create coin terms
    this.coinTermFactory = new CoinTermFactory( this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty );

    // @public (read-only) {AllowedRepresentations} - options that control what is available to the user to manipulate
    this.allowedRepresentations = options.allowedRepresentations;

    // @public (read/listen-only) {ObservableArrayDef.<CoinTerm>} - list of all coin terms in the model
    this.coinTerms = createObservableArray();

    // @public (read/listen-only) {ObservableArrayDef.<Expression>} - list of expressions in the model
    this.expressions = createObservableArray();

    // @public (read/listen-only) {ObservableArrayDef.<ExpressionHint} - list of expression hints in the model
    this.expressionHints = createObservableArray();

    // @public (read-only) {Bounds2} - coin terms and expression that end up outside these bounds are moved back inside
    this.retrievalBounds = Bounds2.EVERYTHING;

    // @public (read-only) {Array.<EECollectionArea>} - areas where expressions or coin terms can be collected, used
    // only in game
    this.collectionAreas = [];

    /*
     * @private, with some elements accessible via methods define below - This is a populated data structure that
     * contains counts for the various possible combinations of coin term types and minimum decomposition.  For
     * instance, it keeps track of the number of 2X values that can't be further decomposed.
     * {CoinTermTypeID} => {Array.<{ count: {number}, countProperty: {Property.<number>|null} }>}
     *
     * This is structured as an object with each of the possible coin term types as the keys.  Each of the values is
     * an array that is indexed by the minimum decomposibility, but is offset to account for the fact that the values
     * can be negative, such as for the number of instances of -2x.  Each element of the array is an object that has
     * a count value and a count property.  The counts are updated any time a coin term is added or removed.  The count
     * properties are created lazily when requested via methods defined below, and are updated at the same time as the
     * counts if they exist.
     */
    this.coinTermCounts = {};
    const countObjectsPerCoinTermType = EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT * 2 + 1;
    _.keys( CoinTermTypeID ).forEach( coinTermType => {
      this.coinTermCounts[ coinTermType ] = new Array( countObjectsPerCoinTermType );
      _.times( countObjectsPerCoinTermType, index => {
        this.coinTermCounts[ coinTermType ][ index ] = { count: 0, countProperty: null };
      } );
    } );

    // @public {@Bounds2} - should be set by view, generally just once.  Used to determine when to remove a coin term
    // because the user has essentially put it away
    this.creatorBoxBounds = Bounds2.NOTHING;

    // @private {boolean} - make this option available to methods
    this.partialCancellationEnabled = options.partialCancellationEnabled;

    // add a listener that resets the coin term values when the view mode switches from variables to coins
    this.viewModeProperty.link( ( newViewMode, oldViewMode ) => {
      if ( newViewMode === ViewMode.COINS && oldViewMode === ViewMode.VARIABLES ) {
        this.xTermValueProperty.reset();
        this.yTermValueProperty.reset();
        this.zTermValueProperty.reset();
      }
    } );

    // add a listener that updates the total whenever one of the term value properties change
    Multilink.multilink(
      [ this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty, this.coinTerms.lengthProperty ],
      () => {
        let total = 0;
        this.coinTerms.forEach( coinTerm => {
          total += coinTerm.valueProperty.value * coinTerm.totalCountProperty.get();
        } );
        this.totalValueProperty.set( total );
      }
    );

    // add a listener that handles the addition of coin terms
    this.coinTerms.addItemAddedListener( this.coinTermAddedListener.bind( this ) );

    // add a listener that handles the addition of an expression
    this.expressions.addItemAddedListener( this.expressionAddedListener.bind( this ) );
  }

  /**
   * main step function for this model, should only be called by the framework
   * @param {number} dt
   * @public
   */
  step( dt ) {

    let userControlledCoinTerms;
    const coinTermsWithHalos = [];

    // step all the coin terms
    this.coinTerms.forEach( coinTerm => { coinTerm.step( dt ); } );

    // Update the state of the hints and halos.  This has to be done in the step function rather than in the
    // event listeners, where much of the other action occurs, because the code needs to figure out which hints and
    // halos should be activated and deactivated based on the positions of all coin terms and expressions.
    if ( !this.expressionBeingEditedProperty.get() ) {

      // clear the hovering lists for all expressions - they will then be updated below
      this.expressions.forEach( expression => {
        expression.clearHoveringCoinTerms();
        expression.clearHoveringExpressions();
      } );

      // get a list of user controlled expressions, max of one on mouse based systems, any number on touch devices
      const userControlledExpressions = _.filter( this.expressions, expression => expression.userControlledProperty.get() );

      const collectionAreasWhoseHalosShouldBeActive = [];

      // Update hints for expressions and collection areas.
      userControlledExpressions.forEach( userControlledExpression => {

        const expressionIsOverCreatorBox = userControlledExpression.getBounds().intersectsBounds( this.creatorBoxBounds );
        const mostOverlappingCollectionArea = this.getMostOverlappingCollectionAreaForExpression( userControlledExpression );
        const mostOverlappingExpression = this.getExpressionMostOverlappingWithExpression( userControlledExpression );
        const mostOverlappingCoinTerm = this.getFreeCoinTermMostOverlappingWithExpression( userControlledExpression );
        let expressionOverWhichThisExpressionIsHovering = null;
        let coinTermOverWhichThisExpressionIsHovering = null;

        if ( expressionIsOverCreatorBox ) {
          // The expression is at least partially over the creator box, which takes precedence over everything else,
          // so don't activate any hints or halos.
        }
        else if ( mostOverlappingCollectionArea ) {

          // activate the halo if the collection area is empty
          if ( mostOverlappingCollectionArea.collectedItemProperty.get() === null ) {
            collectionAreasWhoseHalosShouldBeActive.push( mostOverlappingCollectionArea );
          }
        }
        else if ( mostOverlappingExpression ) {
          expressionOverWhichThisExpressionIsHovering = mostOverlappingExpression;
        }
        else if ( mostOverlappingCoinTerm ) {
          coinTermOverWhichThisExpressionIsHovering = mostOverlappingCoinTerm;
        }

        // update hover info for each of the other expressions with respect to this one
        this.expressions.forEach( expression => {

          if ( expression === userControlledExpression ) {
            // skip self
            return;
          }

          if ( expression === expressionOverWhichThisExpressionIsHovering ) {
            expression.addHoveringExpression( userControlledExpression );
          }
        } );

        // update overlap info with respect to free coin terms
        userControlledExpression.clearHoveringCoinTerms();
        if ( coinTermOverWhichThisExpressionIsHovering ) {

          // there can only be one most overlapping coin term, so out with the old, in with the new
          userControlledExpression.addHoveringCoinTerm( mostOverlappingCoinTerm );
        }
      } );

      // get a list of all user controlled coin terms, max of one coin on mouse-based systems, any number on touch devices
      userControlledCoinTerms = _.filter( this.coinTerms, coin => coin.userControlledProperty.get() );

      // check each user-controlled coin term to see if it's in a position to combine with an expression or another
      // coin term
      const neededExpressionHints = [];
      userControlledCoinTerms.forEach( userControlledCoinTerm => {

        const coinTermIsOverCreatorBox = userControlledCoinTerm.getViewBounds().intersectsBounds( this.creatorBoxBounds );
        const mostOverlappingCollectionArea = this.getMostOverlappingCollectionAreaForCoinTerm( userControlledCoinTerm );
        const mostOverlappingExpression = this.getExpressionMostOverlappingWithCoinTerm( userControlledCoinTerm );
        const mostOverlappingLikeCoinTerm = this.getMostOverlappingLikeCoinTerm( userControlledCoinTerm );
        const joinableFreeCoinTerm = this.checkForJoinableFreeCoinTerm( userControlledCoinTerm );
        let expressionOverWhichCoinTermIsHovering = null;

        if ( coinTermIsOverCreatorBox ) {
          // The coin term is over the creator box, which takes precedence over everything else, so don't activate any
          // hints or halos.
        }
        else if ( mostOverlappingCollectionArea ) {

          // the coin term is over a collection area, so activate that collection area's hint (if it is empty)
          if ( mostOverlappingCollectionArea.collectedItemProperty.get() === null ) {
            collectionAreasWhoseHalosShouldBeActive.push( mostOverlappingCollectionArea );
          }
        }
        else if ( mostOverlappingExpression ) {

          // the coin term is over an expression, so add this coin term to the list of those hovering
          expressionOverWhichCoinTermIsHovering = mostOverlappingExpression;
        }
        else if ( mostOverlappingLikeCoinTerm ) {

          // activate halos for overlapping coin terms
          coinTermsWithHalos.push( userControlledCoinTerm );
          coinTermsWithHalos.push( mostOverlappingLikeCoinTerm );
        }
        else if ( joinableFreeCoinTerm ) {

          // this coin term is positioned such that it could join a free coin term, so add a hint
          neededExpressionHints.push( new ExpressionHint( joinableFreeCoinTerm, userControlledCoinTerm ) );
        }

        // update hover info for each expression with respect to this coin term
        this.expressions.forEach( expression => {
          if ( expression === expressionOverWhichCoinTermIsHovering ) {
            expression.addHoveringCoinTerm( userControlledCoinTerm );
          }
        } );
      } );

      // update the expression hints for single coins that could combine into expressions
      if ( neededExpressionHints.length > 0 ) {

        // remove any expression hints that are no longer needed
        this.expressionHints.forEach( existingExpressionHint => {
          let matchFound = false;
          neededExpressionHints.forEach( neededExpressionHint => {
            if ( neededExpressionHint.equals( existingExpressionHint ) ) {
              matchFound = true;
            }
          } );
          if ( !matchFound ) {
            this.removeExpressionHint( existingExpressionHint );
          }
        } );

        // add any needed expression hints that are not yet on the list
        neededExpressionHints.forEach( neededExpressionHint => {
          let matchFound = false;
          this.expressionHints.forEach( existingExpressionHint => {
            if ( existingExpressionHint.equals( neededExpressionHint ) ) {
              matchFound = true;
            }
          } );
          if ( !matchFound ) {
            this.expressionHints.add( neededExpressionHint );
          }
        } );
      }
      else {
        this.expressionHints.forEach( existingExpressionHint => {
          this.removeExpressionHint( existingExpressionHint );
        } );
      }

      // update hover info for each collection area
      this.collectionAreas.forEach( collectionArea => {
        collectionArea.haloActiveProperty.set(
          collectionAreasWhoseHalosShouldBeActive.indexOf( collectionArea ) >= 0
        );
      } );

      // step the expressions
      this.expressions.forEach( expression => {
        expression.step( dt );
      } );
    }
    else {
      // The stepping behavior is significantly different - basically much simpler - when an expression is being
      // edited.  The individual expressions are not stepped at all to avoid activating halos, updating layouts, and
      // so forth.  Interaction between coin terms and expressions is not tested.  Only overlap between two like
      // coins is tested so that their halos can be activated.

      // get a list of all user controlled coins, max of one coin on mouse-based systems, any number on touch devices
      userControlledCoinTerms = _.filter( this.coinTerms, coinTerm => coinTerm.userControlledProperty.get() );

      // check for overlap between coins that can combine
      userControlledCoinTerms.forEach( userControlledCoinTerm => {

        const overlappingCoinTerm = this.getOverlappingLikeCoinTermWithinExpression(
          userControlledCoinTerm,
          this.expressionBeingEditedProperty.get()
        );

        if ( overlappingCoinTerm ) {

          // these coin terms can be combined, so they should have their halos activated
          coinTermsWithHalos.push( userControlledCoinTerm );
          coinTermsWithHalos.push( overlappingCoinTerm );
        }
      } );
    }

    // go through all coin terms and update the state of their combine halos
    this.coinTerms.forEach( coinTerm => {
      coinTerm.combineHaloActiveProperty.set( coinTermsWithHalos.indexOf( coinTerm ) !== -1 );
    } );
  }

  // @public
  addCoinTerm( coinTerm ) {
    this.coinTerms.add( coinTerm );
    this.updateCoinTermCounts( coinTerm.typeID );
    phet.log && phet.log( `added ${coinTerm.id}, composition = [${coinTerm.composition}]`
    );
  }

  // @public
  removeCoinTerm( coinTerm, animate ) {

    // remove the coin term from any expressions
    this.expressions.forEach( expression => {
      if ( expression.containsCoinTerm( coinTerm ) ) {
        expression.removeCoinTerm( coinTerm );
      }
    } );

    if ( animate ) {
      // send the coin term back to its origin - the final steps of its removal will take place when it gets there
      coinTerm.returnToOrigin();
    }
    else {
      phet.log && phet.log( `removed ${coinTerm.id}` );
      this.coinTerms.remove( coinTerm );
      this.updateCoinTermCounts( coinTerm.typeID );
    }
  }

  /**
   * get a property that represents the count in the model of coin terms of the given type and min decomposition
   * @param {CoinTermTypeID} coinTermTypeID
   * @param {number} minimumDecomposition - miniumum amount into which the coin term can be decomposed
   * @param {boolean} createIfUndefined
   * @public
   */
  getCoinTermCountProperty( coinTermTypeID, minimumDecomposition, createIfUndefined ) {
    assert && assert( this.coinTermCounts.hasOwnProperty( coinTermTypeID ), 'unrecognized coin term type ID' );
    assert && assert( minimumDecomposition !== 0, 'minimumDecomposition cannot be 0' );

    // Calculate the corresponding index into the data structure - this is necessary in order to support negative
    // minimum decomposition values, e.g. -3X.
    const countPropertyIndex = minimumDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT;

    // get the property or, if specified, create it
    let coinTermCountProperty = this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].countProperty;
    if ( coinTermCountProperty === null && createIfUndefined ) {

      // the requested count property does not yet exist - create and add it
      coinTermCountProperty = new Property( 0 );
      coinTermCountProperty.set( this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].count );
      this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].countProperty = coinTermCountProperty;
    }

    return coinTermCountProperty;
  }

  /**
   * stop editing the expression that is currently selected for edit, does nothing if no expression selected
   * @public
   */
  stopEditingExpression() {

    const expressionBeingEdited = this.expressionBeingEditedProperty.get();
    expressionBeingEdited.inEditModeProperty.set( false );

    // Handle the special cases where one or zero coin terms remain after combining terms, which is no longer
    // considered an expression.
    if ( expressionBeingEdited.coinTerms.length <= 1 ) {
      expressionBeingEdited.breakApart();
    }

    this.expressionBeingEditedProperty.set( null );
  }

  // @private - update the count properties for the specified coin term type
  updateCoinTermCounts( coinTermTypeID ) {

    // zero the non-property version of the counts
    this.coinTermCounts[ coinTermTypeID ].forEach( countObject => {
      countObject.count = 0;
    } );

    // loop through the current set of coin terms and update counts for the specified coin term type
    this.coinTerms.forEach( coinTerm => {
      if ( coinTerm.typeID === coinTermTypeID ) {
        coinTerm.composition.forEach( minDecomposition => {
          this.coinTermCounts[ coinTermTypeID ][ minDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT ].count++;
        } );
      }
    } );

    // update any count properties that exist
    this.coinTermCounts[ coinTermTypeID ].forEach( countObject => {
      if ( countObject.countProperty ) {
        countObject.countProperty.set( countObject.count );
      }
    } );
  }

  // @public - remove the specified expression
  removeExpression( expression ) {
    const coinTermsToRemove = expression.removeAllCoinTerms();
    coinTermsToRemove.forEach( coinTerm => {
      this.removeCoinTerm( coinTerm, true );
    } );
    this.expressions.remove( expression );
    phet.log && phet.log( `removed ${expression.id}` );
  }

  // @private, remove an expression hint
  removeExpressionHint( expressionHint ) {
    expressionHint.clear();
    this.expressionHints.remove( expressionHint );
  }

  /**
   * get the expression that overlaps the most with the provided coin term, null if no overlap exists, user controlled
   * expressions are excluded
   * @param {CoinTerm} coinTerm
   * @private
   */
  getExpressionMostOverlappingWithCoinTerm( coinTerm ) {
    let maxOverlap = 0;
    let mostOverlappingExpression = null;

    // check each expression against the coin term to see which has max overlap
    this.expressions.forEach( expression => {

      if ( !expression.userControlledProperty.get() && // exclude expressions that are being moved by a user
           !expression.inProgressAnimationProperty.get() && // exclude expressions that are animating to a destination
           !expression.collectedProperty.get() && // exclude expression that are in a collection area
           expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {

        mostOverlappingExpression = expression;
        maxOverlap = expression.getCoinTermJoinZoneOverlap( coinTerm );
      }
    } );
    return mostOverlappingExpression;
  }

  /**
   * get the free coin term (i.e. one that is not in an expression) that overlaps the most with the provided
   * expression, null if no overlapping coin terms exist
   * @param {Expression} expression
   * @returns {CoinTerm}
   * @private
   */
  getFreeCoinTermMostOverlappingWithExpression( expression ) {
    let maxOverlap = 0;
    let mostOverlappingFreeCoinTerm = null;

    this.coinTerms.forEach( coinTerm => {

      // make sure the coin term is eligible and then compare the amount of overlap to what was previously seen
      if ( !coinTerm.userControlledProperty.get() && // exclude user controlled coin terms
           coinTerm.expressionProperty.get() === null && // exclude coin terms already in or bound for an expression
           !coinTerm.collectedProperty.get() && // exclude coin terms in a collection
           !coinTerm.isFadingOut() && // exclude fading coin terms
           expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {
        maxOverlap = expression.getCoinTermJoinZoneOverlap( coinTerm );
        mostOverlappingFreeCoinTerm = coinTerm;
      }
    } );
    return mostOverlappingFreeCoinTerm;
  }

  /**
   * get the expression that overlaps the most with the provided expression, null if no overlap exists, user
   * controlled expressions are excluded
   * @param {Expression} thisExpression
   * @private
   */
  getExpressionMostOverlappingWithExpression( thisExpression ) {
    let maxOverlap = 0;
    let mostOverlappingExpression = null;

    // test each other expression for eligibility and overlap
    this.expressions.forEach( thatExpression => {

      // make sure the expression is eligible for consideration, then determine if it is the most overlapping
      if ( thatExpression !== thisExpression && !thatExpression.userControlledProperty.get() && // exclude expressions that are being moved by a user
           !thatExpression.inProgressAnimationProperty.get() && // exclude expressions that are moving somewhere
           !thatExpression.collectedProperty.get() && // exclude expressions that are in a collection area
           thisExpression.getOverlap( thatExpression ) > maxOverlap ) {
        mostOverlappingExpression = thatExpression;
        maxOverlap = thisExpression.getOverlap( thatExpression );
      }
    } );
    return mostOverlappingExpression;
  }

  /**
   * Get the next position where a retrieved coin term (i.e. one that ended up out of bounds) can be placed.
   * @returns {Vector2}
   * @private
   */
  getNextOpenRetrievalSpot() {
    const position = new Vector2( 0, 0 );
    let row = 0;
    let column = 0;
    let openPositionFound = false;
    while ( !openPositionFound ) {
      position.x = RETRIEVED_COIN_TERM_FIRST_POSITION.x + column * RETRIEVED_COIN_TERMS_X_SPACING;
      position.y = RETRIEVED_COIN_TERM_FIRST_POSITION.y + row * RETRIEVED_COIN_TERMS_Y_SPACING;
      let closeCoinTerm = false;
      for ( let i = 0; i < this.coinTerms.length; i++ ) {
        if ( this.coinTerms.get( i ).destinationProperty.get().distance( position ) < MIN_RETRIEVAL_PLACEMENT_DISTANCE ) {
          closeCoinTerm = true;
          break;
        }
      }
      if ( closeCoinTerm ) {
        // move to next position
        column++;
        if ( column >= NUM_RETRIEVED_COIN_TERM_COLUMNS ) {
          row++;
          column = 0;
        }
      }
      else {
        openPositionFound = true;
      }
    }
    return position;
  }

  /**
   * find a position where the provided expression won't overlap with others - this is only approximate, and doesn't
   * work perfectly in situations where there are lots of expressions in the play area
   * @returns {Vector2}
   * @private
   */
  getOpenExpressionPlacementPosition( expression ) {

    // variables that controls the search grid, empirically determined
    const minX = 170;
    const minY = 30;
    let xPos = minX;
    let yPos = minY;
    const xIncrement = 30;
    const yIncrement = 30;

    // variables used in the loop to test if a position is available
    const position = new Vector2( xPos, minY );
    let openPositionFound = false;
    const proposedBounds = new Bounds2( 0, 0, 0, 0 );

    // loop, searching for open positions
    while ( this.retrievalBounds.containsPoint( position ) && !openPositionFound ) {

      // calculate the bounds for the expression at this position
      proposedBounds.setMinMax(
        xPos,
        yPos,
        xPos + expression.widthProperty.get(),
        yPos + expression.heightProperty.get()
      );

      let overlapFound = false;
      for ( let i = 0; i < this.expressions.length && !overlapFound; i++ ) {
        if ( this.expressions.get( i ).getBounds().intersectsBounds( proposedBounds ) ) {
          overlapFound = true;
        }
      }

      if ( !overlapFound ) {

        // this position works
        openPositionFound = true;
      }
      else {

        // move to the next grid position
        yPos += yIncrement;
        if ( yPos > this.retrievalBounds.maxY ) {
          yPos = minY;
          xPos += xIncrement;
          if ( xPos > this.retrievalBounds.maxX ) {

            // we're out of space, fall out of the loop
            break;
          }
        }
        position.setXY( xPos, yPos );
      }
    }

    if ( !openPositionFound ) {

      // the screen was too full and we couldn't find a spot, so choose something at random
      position.setXY(
        minX + dotRandom.nextDouble() * ( this.retrievalBounds.width - expression.widthProperty.get() - minX ),
        minY + dotRandom.nextDouble() * ( this.retrievalBounds.height - expression.widthProperty.get() - minY )
      );
    }

    return position;
  }

  /**
   * get a reference to the collection area that most overlaps with the provided expression, null if no overlap exists
   * @param {Expression} expression
   * @private
   */
  getMostOverlappingCollectionAreaForExpression( expression ) {
    let maxOverlap = 0;
    let mostOverlappingCollectionArea = null;
    this.collectionAreas.forEach( collectionArea => {
      if ( expression.getOverlap( collectionArea ) > maxOverlap ) {
        mostOverlappingCollectionArea = collectionArea;
        maxOverlap = expression.getOverlap( collectionArea );
      }
    } );
    return mostOverlappingCollectionArea;
  }

  /**
   * get a reference to the collection area that most overlaps with the provided coin term, null if no overlap exists
   * @param {CoinTerm} coinTerm
   * @private
   */
  getMostOverlappingCollectionAreaForCoinTerm( coinTerm ) {
    let maxOverlap = 0;
    let mostOverlappingCollectionArea = null;
    this.collectionAreas.forEach( collectionArea => {
      const coinTermBounds = coinTerm.getViewBounds();
      const collectionAreaBounds = collectionArea.bounds;
      const xOverlap = Math.max(
        0,
        Math.min( coinTermBounds.maxX, collectionAreaBounds.maxX ) - Math.max( coinTermBounds.minX, collectionAreaBounds.minX )
      );
      const yOverlap = Math.max(
        0,
        Math.min( coinTermBounds.maxY, collectionAreaBounds.maxY ) - Math.max( coinTermBounds.minY, collectionAreaBounds.minY )
      );
      const totalOverlap = xOverlap * yOverlap;
      if ( totalOverlap > maxOverlap ) {
        maxOverlap = totalOverlap;
        mostOverlappingCollectionArea = collectionArea;
      }
    } );
    return mostOverlappingCollectionArea;
  }

  /**
   * handler for when a coin term is added to the model, hooks up a bunch of listeners
   * @param addedCoinTerm
   * @private
   */
  coinTermAddedListener( addedCoinTerm ) {

    const self = this;

    // Add a listener that will potentially combine this coin term with expressions or other coin terms based on
    // where it is released.
    function coinTermUserControlledListener( userControlled ) {

      if ( !userControlled ) {

        // Set a bunch of variables related to the current state of this coin term.  It's not really necessary to set
        // them all every time, but it avoids a deeply nested if-else structure.
        const releasedOverCreatorBox = addedCoinTerm.getViewBounds().intersectsBounds( self.creatorBoxBounds );
        const expressionBeingEdited = self.expressionBeingEditedProperty.get();
        const mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForCoinTerm( addedCoinTerm );
        const mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( addedCoinTerm );
        const mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm( addedCoinTerm );
        const joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( addedCoinTerm );

        if ( expressionBeingEdited && expressionBeingEdited.coinTerms.includes( addedCoinTerm ) ) {

          // An expression is being edited, so a released coin term could be either moved to a new position within an
          // expression or combined with another coin term in the expression.

          // determine if the coin term was dropped while overlapping a coin term of the same type
          const overlappingLikeCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(
            addedCoinTerm,
            expressionBeingEdited
          );

          if ( overlappingLikeCoinTerm ) {

            // combine the dropped coin term with the one with which it overlaps
            overlappingLikeCoinTerm.absorb( addedCoinTerm, self.partialCancellationEnabled );
            phet.log && phet.log(
              `${overlappingLikeCoinTerm.id} absorbed ${addedCoinTerm.id}, ${overlappingLikeCoinTerm.id
              } composition = [${overlappingLikeCoinTerm.composition}]` );
            self.removeCoinTerm( addedCoinTerm, false );
          }
          else {

            // the coin term has been dropped at some potentially new position withing the expression
            expressionBeingEdited.reintegrateCoinTerm( addedCoinTerm );
          }
        }
        else if ( releasedOverCreatorBox ) {

          // the user has put this coin term back in the creator box, so remove it
          self.removeCoinTerm( addedCoinTerm, true );
        }
        else if ( mostOverlappingCollectionArea ) {

          // The coin term was released over a collection area (this only occurs on game screens).  Notify the
          // collection area so that it can either collect or reject it.
          mostOverlappingCollectionArea.collectOrRejectCoinTerm( addedCoinTerm );
        }
        else if ( mostOverlappingExpression ) {

          // the user is adding the coin term to an expression
          mostOverlappingExpression.addCoinTerm( addedCoinTerm );
          phet.log && phet.log( `added ${addedCoinTerm.id} to ${mostOverlappingExpression.id}` );
        }
        else if ( mostOverlappingLikeCoinTerm ) {

          // The coin term was released over a coin term of the same type, so combine the two coin terms into a single
          // one with a higher count value.
          addedCoinTerm.destinationReachedEmitter.addListener( function destinationReachedListener() {
            mostOverlappingLikeCoinTerm.absorb( addedCoinTerm, self.partialCancellationEnabled );
            phet.log && phet.log(
              `${mostOverlappingLikeCoinTerm.id} absorbed ${addedCoinTerm.id}, ${
                mostOverlappingLikeCoinTerm.id} composition = [${
                mostOverlappingLikeCoinTerm.composition}]` );
            self.removeCoinTerm( addedCoinTerm, false );
            addedCoinTerm.destinationReachedEmitter.removeListener( destinationReachedListener );
          } );
          addedCoinTerm.travelToDestination( mostOverlappingLikeCoinTerm.positionProperty.get() );
        }
        else if ( joinableFreeCoinTerm ) {

          // The coin term was released in a place where it could join another free coin term.
          let expressionHintToRemove;
          self.expressionHints.forEach( expressionHint => {
            if ( expressionHint.containsCoinTerm( addedCoinTerm ) && expressionHint.containsCoinTerm( joinableFreeCoinTerm ) ) {
              expressionHintToRemove = expressionHint;
            }
          } );
          if ( expressionHintToRemove ) {
            self.removeExpressionHint( expressionHintToRemove );
          }

          // create the next expression with these coin terms
          self.expressions.push( new Expression(
            joinableFreeCoinTerm,
            addedCoinTerm,
            self.simplifyNegativesProperty
          ) );
        }
      }
    }

    addedCoinTerm.userControlledProperty.lazyLink( coinTermUserControlledListener );

    // add a listener that will handle requests to break apart the coin term
    function coinTermBreakApartListener() {

      if ( addedCoinTerm.composition.length < 2 ) {
        // bail if the coin term can't be decomposed
        return;
      }
      const extractedCoinTerms = addedCoinTerm.extractConstituentCoinTerms();
      const relativeViewBounds = addedCoinTerm.localViewBoundsProperty.get();
      let pointToDistributeAround = addedCoinTerm.destinationProperty.get();

      // If the total combined coin count was even, shift the distribution point a bit so that the coins end up being
      // distributed around the centerX position.
      if ( extractedCoinTerms.length % 2 === 1 ) {
        pointToDistributeAround = pointToDistributeAround.plusXY(
          -relativeViewBounds.width / 2 - BREAK_APART_SPACING / 2,
          0
        );

        // set the parent coin position to the distribution point if it is in bounds
        if ( self.retrievalBounds.containsPoint( pointToDistributeAround ) ) {
          addedCoinTerm.travelToDestination( pointToDistributeAround );
        }
        else {
          addedCoinTerm.travelToDestination( self.getNextOpenRetrievalSpot() );
        }
      }

      // add the extracted coin terms to the model
      const interCoinTermDistance = relativeViewBounds.width + BREAK_APART_SPACING;
      let nextLeftX = pointToDistributeAround.x - interCoinTermDistance;
      let nextRightX = pointToDistributeAround.x + interCoinTermDistance;
      extractedCoinTerms.forEach( ( extractedCoinTerm, index ) => {
        let destination;
        self.addCoinTerm( extractedCoinTerm );
        if ( index % 2 === 0 ) {
          destination = new Vector2( nextRightX, pointToDistributeAround.y );
          nextRightX += interCoinTermDistance;
        }
        else {
          destination = new Vector2( nextLeftX, pointToDistributeAround.y );
          nextLeftX -= interCoinTermDistance;
        }

        // if the destination is outside of the allowed bounds, change it to be in bounds
        if ( !self.retrievalBounds.containsPoint( destination ) ) {
          destination = self.getNextOpenRetrievalSpot();
        }

        // initiate the animation
        extractedCoinTerm.travelToDestination( destination );
      } );
    }

    addedCoinTerm.breakApartEmitter.addListener( coinTermBreakApartListener );

    // add a listener that will remove this coin if and when it returns to its original position
    function coinTermReturnedToOriginListener() {
      self.removeCoinTerm( addedCoinTerm, false );
    }

    addedCoinTerm.returnedToOriginEmitter.addListener( coinTermReturnedToOriginListener );

    // monitor the existence strength of this coin term
    function coinTermExistenceStrengthListener( existenceStrength ) {

      if ( existenceStrength <= 0 ) {

        // the existence strength has gone to zero, remove this from the model
        self.removeCoinTerm( addedCoinTerm, false );

        if ( self.expressionBeingEditedProperty.get() ) {
          if ( self.expressionBeingEditedProperty.get().coinTerms.length === 0 ) {

            // the removal of the coin term caused the expression being edited to be empty, so drop out of edit mode
            self.stopEditingExpression();
          }
        }
      }
    }

    addedCoinTerm.existenceStrengthProperty.link( coinTermExistenceStrengthListener );

    // clean up the listeners added above if and when this coin term is removed from the model
    this.coinTerms.addItemRemovedListener( function coinTermRemovalListener( removedCoinTerm ) {
      if ( removedCoinTerm === addedCoinTerm ) {
        addedCoinTerm.userControlledProperty.unlink( coinTermUserControlledListener );
        addedCoinTerm.breakApartEmitter.removeListener( coinTermBreakApartListener );
        addedCoinTerm.returnedToOriginEmitter.removeListener( coinTermReturnedToOriginListener );
        addedCoinTerm.existenceStrengthProperty.unlink( coinTermExistenceStrengthListener );
        self.coinTerms.removeItemRemovedListener( coinTermRemovalListener );
      }
    } );
  }

  /**
   * handle the addition of an expresion to the model
   * @param {Expression} addedExpression
   * @private
   */
  expressionAddedListener( addedExpression ) {
    const self = this;

    // add a listener for when the expression is released, which may cause it to be combined with another expression
    function expressionUserControlledListener( userControlled ) {

      if ( !userControlled ) {

        // Set a bunch of variables related to the current state of this expression.  It's not really necessary to set
        // them all every time, but it avoids a deeply nested if-else structure.
        const releasedOverCreatorBox = addedExpression.getBounds().intersectsBounds( self.creatorBoxBounds );
        const mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression( addedExpression );
        const mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( addedExpression );
        const numOverlappingCoinTerms = addedExpression.hoveringCoinTerms.length;

        // state checking
        assert && assert(
          numOverlappingCoinTerms === 0 || numOverlappingCoinTerms === 1,
          `max of one overlapping free coin term when expression is released, seeing ${numOverlappingCoinTerms}`
        );

        if ( releasedOverCreatorBox ) {

          // the expression was released over the creator box, so it and the coin terms should be "put away"
          self.removeExpression( addedExpression );
        }
        else if ( mostOverlappingCollectionArea ) {

          // The expression was released in a position that at least partially overlaps a collection area.  The
          // collection area must decide whether to collect or reject the expression.
          mostOverlappingCollectionArea.collectOrRejectExpression( addedExpression );
        }
        else if ( mostOverlappingExpression ) {

          // The expression was released in a place where it at least partially overlaps another expression, so the
          // two expressions should be joined into one.  The first step is to remove the expression from the list of
          // those hovering.
          mostOverlappingExpression.removeHoveringExpression( addedExpression );

          // send the combining expression to the right side of receiving expression
          const destinationForCombine = mostOverlappingExpression.getUpperRightCorner();
          addedExpression.travelToDestination( destinationForCombine );

          // Listen for when the expression is in place and, when it is, transfer its coin terms to the receiving
          // expression.
          addedExpression.destinationReachedEmitter.addListener( function destinationReachedListener() {

            // destination reached, combine with other expression, but ONLY if it hasn't moved or been removed
            if ( mostOverlappingExpression.getUpperRightCorner().equals( destinationForCombine ) &&
                 self.expressions.includes( mostOverlappingExpression ) ) {

              const coinTermsToBeMoved = addedExpression.removeAllCoinTerms();
              self.expressions.remove( addedExpression );
              coinTermsToBeMoved.forEach( coinTerm => {
                phet.log && phet.log( `moving ${coinTerm.id
                } from ${addedExpression.id
                } to ${mostOverlappingExpression.id}` );
                mostOverlappingExpression.addCoinTerm( coinTerm );
              } );
            }
            else {

              // The destination was reached, but the expression that this one was joining has moved, so the wedding
              // is off.  If this one is now out of bounds, move it to a reachable position.
              if ( !self.retrievalBounds.intersectsBounds( addedExpression.getBounds() ) ) {
                addedExpression.travelToDestination( self.getOpenExpressionPlacementPosition( addedExpression ) );
              }
            }
            addedExpression.destinationReachedEmitter.removeListener( destinationReachedListener );
          } );
        }
        else if ( numOverlappingCoinTerms === 1 ) {

          // the expression was released over a free coin term, so have that free coin term join the expression
          const coinTermToAddToExpression = addedExpression.hoveringCoinTerms[ 0 ];
          coinTermToAddToExpression.expressionProperty.set( addedExpression ); // prevents interaction during animation
          if ( addedExpression.rightHintActiveProperty.get() ) {

            // move to the left side of the coin term
            addedExpression.travelToDestination(
              coinTermToAddToExpression.positionProperty.get().plusXY(
                -addedExpression.widthProperty.get() - addedExpression.rightHintWidthProperty.get() / 2,
                -addedExpression.heightProperty.get() / 2
              )
            );
          }
          else {

            assert && assert(
              addedExpression.leftHintActiveProperty.get(),
              'at least one hint should be active if there is a hovering coin term'
            );

            // move to the right side of the coin term
            addedExpression.travelToDestination(
              coinTermToAddToExpression.positionProperty.get().plusXY(
                addedExpression.leftHintWidthProperty.get() / 2,
                -addedExpression.heightProperty.get() / 2
              )
            );
          }

          addedExpression.destinationReachedEmitter.addListener( function addCoinTermAfterAnimation() {
            addedExpression.addCoinTerm( coinTermToAddToExpression );
            addedExpression.destinationReachedEmitter.removeListener( addCoinTermAfterAnimation );
          } );
        }
      }
    }

    addedExpression.userControlledProperty.lazyLink( expressionUserControlledListener );

    // add a listener that will handle requests to break apart this expression
    function expressionBreakApartListener() {

      // keep a reference to the center for when we spread out the coin terms
      const expressionCenterX = addedExpression.getBounds().centerX;

      // remove the coin terms from the expression and the expression from the model
      const newlyFreedCoinTerms = addedExpression.removeAllCoinTerms();
      self.expressions.remove( addedExpression );

      // spread the released coin terms out horizontally
      newlyFreedCoinTerms.forEach( newlyFreedCoinTerm => {

        // calculate a destination that will cause the coin terms to spread out from the expression center
        const horizontalDistanceFromExpressionCenter = newlyFreedCoinTerm.positionProperty.get().x - expressionCenterX;
        let coinTermDestination = new Vector2(
          newlyFreedCoinTerm.positionProperty.get().x + horizontalDistanceFromExpressionCenter * 0.15, // spread factor empirically determined
          newlyFreedCoinTerm.positionProperty.get().y
        );

        // if the destination is outside of the allowed bounds, change it to be in bounds
        if ( !self.retrievalBounds.containsPoint( coinTermDestination ) ) {
          coinTermDestination = self.getNextOpenRetrievalSpot();
        }

        // initiate the animation
        newlyFreedCoinTerm.travelToDestination( coinTermDestination );
      } );
    }

    addedExpression.breakApartEmitter.addListener( expressionBreakApartListener );

    // add a listener that will handle requests to edit this expression
    function editModeListener( inEditMode ) {
      if ( inEditMode ) {
        self.expressionBeingEditedProperty.set( addedExpression );
      }
    }

    addedExpression.inEditModeProperty.link( editModeListener );

    // remove the listeners when this expression is removed
    this.expressions.addItemRemovedListener( function expressionRemovedListener( removedExpression ) {
      if ( removedExpression === addedExpression ) {
        addedExpression.dispose();
        addedExpression.userControlledProperty.unlink( expressionUserControlledListener );
        addedExpression.breakApartEmitter.removeListener( expressionBreakApartListener );
        addedExpression.inEditModeProperty.unlink( editModeListener );
        self.expressions.removeItemRemovedListener( expressionRemovedListener );
      }
    } );
  }

  /**
   * @public
   */
  reset() {

    // reset any collection areas that have been created
    this.collectionAreas.forEach( collectionArea => {
      collectionArea.reset();
    } );

    this.expressions.clear();
    this.coinTerms.clear();
    this.viewModeProperty.reset();
    this.showCoinValuesProperty.reset();
    this.showVariableValuesProperty.reset();
    this.showAllCoefficientsProperty.reset();
    this.xTermValueProperty.reset();
    this.yTermValueProperty.reset();
    this.zTermValueProperty.reset();
    this.totalValueProperty.reset();
    this.expressionBeingEditedProperty.reset();
    this.simplifyNegativesProperty.reset();
    _.values( this.coinTermCounts ).forEach( coinTermCountArray => {
      coinTermCountArray.forEach( coinTermCountObject => {
        coinTermCountObject.count = 0;
        coinTermCountObject.countProperty && coinTermCountObject.countProperty.reset();
      } );
    } );
  }

  /**
   * test if coinTermB is in the "expression combine zone" of coinTermA
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {boolean}
   * @private
   */
  isCoinTermInExpressionCombineZone( coinTermA, coinTermB ) {

    // Make the combine zone wider, but vertically shorter, than the actual bounds, as this gives the most desirable
    // behavior.  The multiplier for the height was empirically determined.
    const extendedTargetCoinTermBounds = coinTermA.getViewBounds().dilatedXY(
      coinTermA.localViewBoundsProperty.get().width,
      -coinTermA.localViewBoundsProperty.get().height * 0.25
    );

    return extendedTargetCoinTermBounds.intersectsBounds( coinTermB.getViewBounds() );
  }

  /**
   * returns true if coin term is currently part of an expression
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @public
   */
  isCoinTermInExpression( coinTerm ) {
    for ( let i = 0; i < this.expressions.length; i++ ) {
      if ( this.expressions.get( i ).containsCoinTerm( coinTerm ) ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for coin terms that are not already in expressions that are positioned such that they could combine with
   * the provided coin into a new expression.  If more than one possibility exists, the closest is returned.  If none
   * are found, null is returned.
   * @param {CoinTerm} thisCoinTerm
   * @returns {CoinTerm|null}
   * @private
   */
  checkForJoinableFreeCoinTerm( thisCoinTerm ) {

    let joinableFreeCoinTerm = null;
    this.coinTerms.forEach( thatCoinTerm => {

      // Okay, this is one nasty looking 'if' clause, but the basic idea is that first a bunch of conditions are
      // checked that would exclude the provided coin terms from joining, then it checks to see if the coin term is
      // in the 'join zone', and then checks that it's closer than any previously found joinable coin term.
      if ( thatCoinTerm !== thisCoinTerm && // exclude thisCoinTerm
           !thatCoinTerm.userControlledProperty.get() && // exclude coin terms that are user controlled
           thatCoinTerm.expressionProperty.get() === null && // exclude coin terms that are in or are joining expressions
           !thatCoinTerm.collectedProperty.get() && // exclude coin terms that are in a collection
           !thatCoinTerm.inProgressAnimationProperty.get() && // exclude coin terms that are moving
           this.isCoinTermInExpressionCombineZone( thatCoinTerm, thisCoinTerm ) && // in the 'combine zone'
           ( !joinableFreeCoinTerm ||
             ( joinableFreeCoinTerm.positionProperty.get().distance( thatCoinTerm ) <
               joinableFreeCoinTerm.positionProperty.get().distance( thisCoinTerm ) ) ) ) {

        joinableFreeCoinTerm = thatCoinTerm;
      }
    } );

    return joinableFreeCoinTerm;
  }

  /**
   * get the amount of overlap given two coin terms by comparing position and coin radius
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {number}
   * @private
   */
  getCoinOverlapAmount( coinTermA, coinTermB ) {
    const distanceBetweenCenters = coinTermA.positionProperty.get().distance( coinTermB.positionProperty.get() );
    return Math.max( ( coinTermA.coinRadius + coinTermB.coinRadius ) - distanceBetweenCenters, 0 );
  }

  /**
   * get the amount of overlap between the view representations of two coin terms
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {number} amount of overlap, which is essentially an area value in view coordinates
   * @private
   */
  getViewBoundsOverlapAmount( coinTermA, coinTermB ) {
    let overlap = 0;

    if ( coinTermA.getViewBounds().intersectsBounds( coinTermB.getViewBounds() ) ) {
      const intersection = coinTermA.getViewBounds().intersection( coinTermB.getViewBounds() );
      overlap = intersection.width * intersection.height;
    }
    return overlap;
  }

  /**
   * get the coin term that overlaps the most with the provided coin term, is of the same type, is not user
   * controlled, and is not already in an expression
   * @param {CoinTerm} thisCoinTerm
   * @returns {CoinTerm}
   * @private
   */
  getMostOverlappingLikeCoinTerm( thisCoinTerm ) {
    assert && assert( this.coinTerms.includes( thisCoinTerm ), 'overlap requested for something that is not in model' );
    let mostOverlappingLikeCoinTerm = null;
    let maxOverlapAmount = 0;

    this.coinTerms.forEach( thatCoinTerm => {

      // test that the coin term is eligible for consideration first
      if ( thatCoinTerm.isEligibleToCombineWith( thisCoinTerm ) && !this.isCoinTermInExpression( thatCoinTerm ) ) {

        // calculate and compare the relative overlap amounts, done a bit differently in the different view modes
        let overlapAmount;
        if ( this.viewModeProperty.get() === ViewMode.COINS ) {
          overlapAmount = this.getCoinOverlapAmount( thisCoinTerm, thatCoinTerm );
        }
        else {
          overlapAmount = this.getViewBoundsOverlapAmount( thisCoinTerm, thatCoinTerm );
        }

        if ( overlapAmount > maxOverlapAmount ) {
          maxOverlapAmount = overlapAmount;
          mostOverlappingLikeCoinTerm = thatCoinTerm;
        }
      }
    } );
    return mostOverlappingLikeCoinTerm;
  }

  /**
   * @param {CoinTerm} coinTerm
   * @param {Expression} expression
   * @returns {CoinTerm|null}
   * @private
   */
  getOverlappingLikeCoinTermWithinExpression( coinTerm, expression ) {

    let overlappingCoinTerm = null;

    for ( let i = 0; i < expression.coinTerms.length; i++ ) {
      const potentiallyOverlappingCoinTerm = expression.coinTerms.get( i );
      if ( potentiallyOverlappingCoinTerm.isEligibleToCombineWith( coinTerm ) ) {
        let overlapAmount = 0;
        if ( this.viewModeProperty.get() === ViewMode.COINS ) {
          overlapAmount = this.getCoinOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
        }
        else {
          overlapAmount = this.getViewBoundsOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
        }
        if ( overlapAmount > 0 ) {
          overlappingCoinTerm = potentiallyOverlappingCoinTerm;
          // since this is an expression, there should be a max of one overlapping coin term, so we can bail here
          break;
        }
      }
    }
    return overlappingCoinTerm;
  }

  /**
   * @param {Bounds2} bounds
   * @public
   */
  setRetrievalBounds( bounds ) {
    assert && assert( this.retrievalBounds === Bounds2.EVERYTHING, 'coin term bounds should only be set once' );
    this.retrievalBounds = bounds;
  }

  /**
   * returns true is any expression or coin term is currently user controlled, helpful in preventing multi-touch
   * issues
   * @returns {boolean}
   * @public
   */
  isAnythingUserControlled() {
    let somethingIsUserControlled = false;
    let i;
    for ( i = 0; i < this.coinTerms.length && !somethingIsUserControlled; i++ ) {
      if ( this.coinTerms.get( i ).userControlledProperty.get() ) {
        somethingIsUserControlled = true;
      }
    }
    for ( i = 0; i < this.expressions.length && !somethingIsUserControlled; i++ ) {
      if ( this.expressions.get( i ).userControlledProperty.get() ) {
        somethingIsUserControlled = true;
      }
    }
    return somethingIsUserControlled;
  }
}

expressionExchange.register( 'ExpressionManipulationModel', ExpressionManipulationModel );

export default ExpressionManipulationModel;
