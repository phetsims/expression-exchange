// Copyright 2017, University of Colorado Boulder

/**
 * a static factory object that provide methods for creating the 'boxes' (either a panel or a carouse) containing the
 * set of creator nodes for all explore screens and game levels
 *
 * This was centralized into a factory object because the simulation requires a rather large number of different
 * creator node sets, 43 at the time of this writing.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var CoinTermCreatorBox = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBox' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorNode' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Property = require( 'AXON/Property' );

  // constants
  var CREATION_LIMIT_FOR_EXPLORE_SCREENS = 8;

  // descriptors for the coin term creator sets used in the explore screens
  var EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS = {};
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

  // helper function for making coin term creator nodes for the explore screens, which use a non-staggered format
  function makeExploreScreenCreatorNode( typeID, createdCoinTermInitialCount, model ) {

    // Create a property that will control number of coin terms shown in this creator node.  For the explore screens,
    // only one is even shown, and the property goes to zero when the max number of this type have been added to the
    // model.
    var numberToShowProperty = new Property( 1 );
    var instanceCount = model.getCoinTermCountProperty(
      typeID,
      createdCoinTermInitialCount > 0 ? 1 : -1,
      true
    );
    instanceCount.link( function( count ) {
      numberToShowProperty.set( count + Math.abs( createdCoinTermInitialCount ) <= CREATION_LIMIT_FOR_EXPLORE_SCREENS ? 1 : 0 );
    } );

    // create the "creator node" for the specified coin term type
    return new CoinTermCreatorNode(
      model,
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

  // helper function for making creator nodes for the game screen, which uses a staggered format
  function makeGameScreenCreatorNode( typeID, createdCoinTermInitialCount, numInstancesAllowed, model ) {

    // Create a property that will control number of coin terms shown in this creator node.  For the game screen,
    // multiple creator nodes are shown and a staggered arrangement.
    var numberToShowProperty = new Property( numInstancesAllowed );
    var instanceCount = model.getCoinTermCountProperty( typeID, createdCoinTermInitialCount, true );
    instanceCount.link( function( count ) {
      numberToShowProperty.set( numInstancesAllowed - count );
    } );

    // create the "creator node" for the specified coin term type
    return new CoinTermCreatorNode(
      model,
      typeID,
      model.coinTermFactory.createCoinTerm.bind( model.coinTermFactory ),
      {
        dragBounds: EESharedConstants.LAYOUT_BOUNDS,
        createdCoinTermInitialCount: createdCoinTermInitialCount,
        createdCoinTermDecomposable: false,
        maxNumberShown: numInstancesAllowed,
        numberToShowProperty: numberToShowProperty,
        onCard: true
      }
    );
  }


  /**
   * static factory object used to create "toolbox-ish" controls that allows the user to created coin terms by clicking
   * and dragging
   * @public
   */
  var CoinTermCreatorBoxFactory = {

    /**
     *
     * @param {Object} creatorSetID
     * @param {ExpressionManipulationModel} model
     * @param {Object} options
     * @returns {CoinTermCreatorBox}
     * @public
     */
    createExploreScreenCreatorBox: function( creatorSetID, model, options ) {

      options = _.extend( {
        itemsPerCarouselPage: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 4 : 3,
        itemSpacing: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 40 : 45
      }, options );

      // create the list of creator nodes from the descriptor list
      var creatorNodes = [];
      EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ creatorSetID ].forEach( function( descriptor ) {
        creatorNodes.push( makeExploreScreenCreatorNode(
          descriptor.typeID,
          descriptor.initialCount,
          model
        ) );
      } );

      return new CoinTermCreatorBox( creatorNodes, options );
    },

    /**
     * @param {number} level
     * @param {number} challengeNumber
     * @param {ExpressionManipulationModel} model
     * @param {Object} options
     * @returns {CoinTermCreatorBox}
     * @public
     */
    createGameScreenCreatorBox: function( level, challengeNumber, model, options ) {
      options = _.extend( {
        itemSpacing: 40
      }, options );

      // create the list of creator nodes from the descriptor list
      var creatorNodes = [];
      EEChallengeDescriptors[ level ][ challengeNumber ].carouselContents.forEach( function( descriptor ) {
        creatorNodes.push( makeGameScreenCreatorNode(
          descriptor.typeID,
          descriptor.minimumDecomposition,
          descriptor.creationLimit,
          model
        ) );
      } );

      // set the options so that all creator nodes are always shown
      options.itemsPerCarouselPage = creatorNodes.length;

      return new CoinTermCreatorBox( creatorNodes, options );
    }
  };

  expressionExchange.register( 'CoinTermCreatorBoxFactory', CoinTermCreatorBoxFactory );

  return CoinTermCreatorBoxFactory;

} );