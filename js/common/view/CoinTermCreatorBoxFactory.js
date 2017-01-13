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
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  // constants
  var CREATION_LIMIT_FOR_EXPLORE_SCREENS = 8;

  // descriptors for the coin term creator sets used in the explore screens
  var EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS = {};
  EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.BASICS ] = [
    { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS }
  ];
  EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.EXPLORE ] = [
    { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y, initialCount: 3, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X_TIMES_Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    {
      typeID: CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED,
      initialCount: 1,
      creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS
    }
  ];
  EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ CoinTermCreatorSetID.VARIABLES ] = [
    { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.CONSTANT, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.CONSTANT, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.X_SQUARED, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
    { typeID: CoinTermTypeID.Y, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS }
  ];

  /**
   * static factory object used to create "toolbox-ish" controls that allows the user to created coin terms by clicking
   * and dragging
   * @public
   */
  var CoinTermCreatorBoxFactory = {

    createExploreScreenCreatorBox: function( creatorSetID, model, options ) {

      options = _.extend( {
        itemsPerCarouselPage: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 4 : 3,
        itemSpacing: creatorSetID === CoinTermCreatorSetID.VARIABLES ? 40 : 45
      }, options );

      return new CoinTermCreatorBox(
        EXPLORE_SCREEN_COIN_TERM_CREATOR_SET_DESCRIPTORS[ creatorSetID ],
        model,
        EESharedConstants.LAYOUT_BOUNDS,
        options
      );
    },

    createGameScreenCreatorBox: function( level, challengeNumber ) {
    }
  };

  expressionExchange.register( 'CoinTermCreatorBoxFactory', CoinTermCreatorBoxFactory );

  return CoinTermCreatorBoxFactory;

} );