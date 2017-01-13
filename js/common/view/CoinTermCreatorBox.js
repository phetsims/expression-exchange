// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that allows the user to create coin terms by dragging them out of a box
 */
define( function( require ) {
  'use strict';

  // modules
  var Carousel = require( 'SUN/Carousel' );
  var CoinTermCreatorNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorNode' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );

  // constants
  var CREATION_LIMIT_FOR_EXPLORE_SCREENS = 8;

  /**
   * @param {Array.<Object>} descriptorSet - set of descriptors that describe what coin term creator nodes should be
   * present in the box, see static examples at bottom of this file
   * @param {ExpressionManipulationModel} model
   * @param {Bounds2} coinTermDragBounds
   * @param {Object} options
   * @constructor
   */
  function CoinTermCreatorBox( descriptorSet, model, coinTermDragBounds, options ) {

    Node.call( this );
    var self = this;

    options = _.extend( {
      itemsPerCarouselPage: 3,
      itemSpacing: 45, // empirically determined to work for most cases in this sim
      cornerRadius: 4,
      staggeredCreatorNodes: false
    }, options );

    this.negativeTermsPresent = false; // @public, read only

    // @public, read only - list of the coin term types present in this creator box
    this.coinTermTypeList = _.uniq( _.map(
      descriptorSet,
      function( descriptor ) { return descriptor.typeID; }
    ) );

    // go through the provided set of descriptors and create the creator nodes for each
    var coinTermCreatorSet = [];
    descriptorSet.forEach( function( coinTermCreatorDescriptor ) {

      var numberToShowProperty;

      if ( options.staggeredCreatorNodes ) {
        numberToShowProperty = new Property( coinTermCreatorDescriptor.creationLimit );
      }
      else {
        numberToShowProperty = new Property( 1 );
        model.getCoinTermCountProperty(
          coinTermCreatorDescriptor.typeID,
          coinTermCreatorDescriptor.initialCount,
          true
        ).link( function( count ) {
          numberToShowProperty.set( count < coinTermCreatorDescriptor.creationLimit ? 1 : 0 );
        } );
      }

      // create the "creator node" and put it on the list of those that will be shown at the bottom of the view
      coinTermCreatorSet.push( new CoinTermCreatorNode(
        model,
        coinTermCreatorDescriptor.typeID,
        model.coinTermFactory.createCoinTerm.bind( model.coinTermFactory ),
        {
          dragBounds: coinTermDragBounds,
          initialCount: coinTermCreatorDescriptor.initialCount,
          numberToShowProperty: numberToShowProperty,
          maxNumberShown: options.staggeredCreatorNodes ? coinTermCreatorDescriptor.creationLimit : 1
        }
      ) );

      // if one or more has a negative initial count, negatives should be shown in the collection
      if ( coinTermCreatorDescriptor.initialCount < 0 ) {
        self.negativeTermsPresent = true;
      }
    } );

    // add the panel or carousel that will contain the various coin terms that the user can create
    if ( coinTermCreatorSet.length > options.itemsPerCarouselPage ) {
      this.coinTermCreatorBox = new Carousel( coinTermCreatorSet, {
        itemsPerPage: options.itemsPerCarouselPage,
        spacing: options.itemSpacing,
        cornerRadius: options.cornerRadius
      } );
    }
    else {
      // everything will fit on one page, so use a panel instead of a carousel
      var coinTermCreatorHBox = new HBox( {
        children: coinTermCreatorSet,
        spacing: options.itemSpacing,
        resize: false
      } );
      this.coinTermCreatorBox = new Panel( coinTermCreatorHBox, {
        cornerRadius: options.cornerRadius,
        xMargin: 75, // empirically determined to be similar in appearance to carousels
        yMargin: 14, // empirically determined to be similar in appearance to carousels
        resize: false
      } );
    }
    this.addChild( this.coinTermCreatorBox );

    this.mutate( options );
  }

  expressionExchange.register( 'CoinTermCreatorBox', CoinTermCreatorBox );

  return inherit( Node, CoinTermCreatorBox, {}, {

    BASIC_SCREEN_CONFIG: [
      { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS }
    ],

    EXPLORE_SCREEN_CONFIG: [
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
    ],

    VARIABLES_SCREEN_CONFIG: [
      { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.X, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.CONSTANT, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.CONSTANT, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.X_SQUARED, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS },
      { typeID: CoinTermTypeID.Y, initialCount: -1, creationLimit: CREATION_LIMIT_FOR_EXPLORE_SCREENS }
    ]
  } );
} );