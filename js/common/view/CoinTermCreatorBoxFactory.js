// Copyright 2017-2023, University of Colorado Boulder

/**
 * A static factory object that provide methods for creating the 'boxes', which are either a panel or a carousel, that
 * contain coin term creator nodes.
 *
 * This was centralized into a factory object because the simulation requires a rather large number of different
 * creator node sets, 43 at the time of this writing.
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import CoinTermCreatorSetID from '../enum/CoinTermCreatorSetID.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import CoinTermCreatorBox from './CoinTermCreatorBox.js';
import CoinTermCreatorNode from './CoinTermCreatorNode.js';

// constants
const CREATION_LIMIT_FOR_EXPLORE_SCREENS = 8;

// descriptors for the coin term creator sets used in the explore screens
const EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS = {};
EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.BASICS ] = [
  { typeID: CoinTermTypeID.X, initialCount: 1 },
  { typeID: CoinTermTypeID.Y, initialCount: 1 },
  { typeID: CoinTermTypeID.Z, initialCount: 1 }
];
EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.EXPLORE ] = [
  { typeID: CoinTermTypeID.X, initialCount: 1 },
  { typeID: CoinTermTypeID.Y, initialCount: 1 },
  { typeID: CoinTermTypeID.Z, initialCount: 1 },
  { typeID: CoinTermTypeID.X, initialCount: 2 },
  { typeID: CoinTermTypeID.Y, initialCount: 3 },
  { typeID: CoinTermTypeID.X_TIMES_Y, initialCount: 1 },
  { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 },
  { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1 },
  { typeID: CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED, initialCount: 1 }
];
EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.VARIABLES ] = [
  { typeID: CoinTermTypeID.X, initialCount: 1 },
  { typeID: CoinTermTypeID.X, initialCount: -1 },
  { typeID: CoinTermTypeID.CONSTANT, initialCount: 1 },
  { typeID: CoinTermTypeID.CONSTANT, initialCount: -1 },
  { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1 },
  { typeID: CoinTermTypeID.X_SQUARED, initialCount: -1 },
  { typeID: CoinTermTypeID.Y, initialCount: 1 },
  { typeID: CoinTermTypeID.Y, initialCount: -1 }
];

/**
 * helper function for making coin term creator nodes for the explore screens, which use a non-staggered format
 * @param {CoinTermTypeID} typeID
 * @param {number} createdCoinTermInitialCount
 * @param {ExpressionManipulationModel} model
 * @param {ExpressionManipulationView} view
 * @returns {CoinTermCreatorNode}
 */
function makeExploreScreenCreatorNode( typeID, createdCoinTermInitialCount, model, view ) {

  // Create a property that will control number of coin terms shown in this creator node.  For the explore screens,
  // only one is even shown, and the property goes to zero when the max number of this type have been added to the
  // model.
  const numberToShowProperty = new Property( 1 );
  const instanceCount = model.getCoinTermCountProperty(
    typeID,
    createdCoinTermInitialCount > 0 ? 1 : -1,
    true
  );
  instanceCount.link( count => {
    numberToShowProperty.set( count + Math.abs( createdCoinTermInitialCount ) <= CREATION_LIMIT_FOR_EXPLORE_SCREENS ? 1 : 0 );
  } );

  // create the "creator node" for the specified coin term type
  return new CoinTermCreatorNode(
    model,
    view,
    typeID,
    model.coinTermFactory.createCoinTerm.bind( model.coinTermFactory ),
    {
      dragBounds: EESharedConstants.LAYOUT_BOUNDS,
      createdCoinTermInitialCount: createdCoinTermInitialCount,
      maxNumberShown: 1,
      numberToShowProperty: numberToShowProperty
    }
  );
}

/**
 * helper function for making coin term creator nodes for the game screens, which use a staggered format
 * @param {CoinTermTypeID} typeID
 * @param {number} createdCoinTermInitialCount
 * @param {number} numInstancesAllowed
 * @param {ExpressionManipulationModel} model
 * @param {ExpressionManipulationView} view
 * @returns {CoinTermCreatorNode}
 */
function makeGameScreenCreatorNode( typeID, createdCoinTermInitialCount, numInstancesAllowed, model, view ) {

  // Create a property that will control number of coin terms shown in this creator node.  For the game screen,
  // multiple creator nodes are shown in a staggered arrangement.
  const numberToShowProperty = new DerivedProperty(
    [ model.getCoinTermCountProperty( typeID, createdCoinTermInitialCount, true ) ],
    instanceCount => numInstancesAllowed - instanceCount
  );

  // create the "creator node" for the specified coin term type
  const coinTermCreatorNode = new CoinTermCreatorNode(
    model,
    view,
    typeID,
    model.coinTermFactory.createCoinTerm.bind( model.coinTermFactory ),
    {
      dragBounds: EESharedConstants.LAYOUT_BOUNDS,
      createdCoinTermInitialCount: createdCoinTermInitialCount,
      createdCoinTermDecomposable: false,
      maxNumberShown: numInstancesAllowed,
      numberToShowProperty: numberToShowProperty,
      onCard: true,
      supportShowValues: false
    }
  );

  // dispose of the derived property in order to avoid memory leaks
  coinTermCreatorNode.disposeEmitter.addListener( () => {
    numberToShowProperty.dispose();
  } );

  return coinTermCreatorNode;
}


/**
 * static factory object used to create "toolbox-ish" controls that allows the user to created coin terms by clicking
 * and dragging
 * @public
 */
const CoinTermCreatorBoxFactory = {

  /**
   *
   * @param {Object} creatorSetID
   * @param {ExpressionManipulationModel} model
   * @param {Object} [options]
   * @returns {CoinTermCreatorBox}
   * @public
   */
  createExploreScreenCreatorBox( creatorSetID, model, view, options ) {

    options = merge( {
      itemsPerCarouselPage: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 4 : 3,
      itemSpacing: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 5 : 10
    }, options );

    // create the list of creator nodes from the descriptor list
    const creatorNodes = [];
    EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ creatorSetID ].forEach( descriptor => {
      creatorNodes.push( makeExploreScreenCreatorNode(
        descriptor.typeID,
        descriptor.initialCount,
        model,
        view
      ) );
    } );

    return new CoinTermCreatorBox( creatorNodes, options );
  },

  /**
   * @param {EEChallengeDescriptor} challengeDescriptor
   * @param {ExpressionManipulationModel} model
   * @param {ExpressionManipulationView} view
   * @param {Object} [options]
   * @returns {CoinTermCreatorBox}
   * @public
   */
  createGameScreenCreatorBox( challengeDescriptor, model, view, options ) {
    options = merge( {
      itemSpacing: 5,
      align: 'top'
    }, options );

    // create the list of creator nodes from the descriptor list
    const creatorNodes = [];
    challengeDescriptor.carouselContents.forEach( descriptor => {
      creatorNodes.push( makeGameScreenCreatorNode(
        descriptor.typeID,
        descriptor.minimumDecomposition,
        descriptor.creationLimit,
        model,
        view
      ) );
    } );

    // set the options so that all creator nodes are always shown
    options.itemsPerCarouselPage = creatorNodes.length;

    return new CoinTermCreatorBox( creatorNodes, options );
  }
};

expressionExchange.register( 'CoinTermCreatorBoxFactory', CoinTermCreatorBoxFactory );

export default CoinTermCreatorBoxFactory;