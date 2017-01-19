// Copyright 2016, University of Colorado Boulder

/**
 * Scenery node that holds a set of creator nodes.
 *
 * This is somewhat specific to the Expression Exchange simulation, but could easily be turned into a base class and
 * used more generally.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Carousel = require( 'SUN/Carousel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );

  /**
   * @param {Array.<CoinTermCreatorNode>} creatorNodes - set of coin term creator nodes
   * @param {Object} options
   * @constructor
   */
  function CoinTermCreatorBox( creatorNodes, options ) {

    Node.call( this );

    options = _.extend( {
      itemsPerCarouselPage: 3,
      itemSpacing: 45, // empirically determined to work for most cases in this sim
      cornerRadius: 4,
      staggeredCreatorNodes: false
    }, options );

    // @public, read only - a flag that indicates if creator nodes that create coin terms with negative initial values
    // are present
    this.negativeTermsPresent = _.some( creatorNodes, function( creatorNode ) {
      return ( creatorNode.createdCoinTermInitialCount < 0 );
    } );

    // @public, read only - list of the coin term types present in this creator box
    this.coinTermTypeList = _.uniq( _.map(
      creatorNodes,
      function( creatorNode ) { return creatorNode.typeID; }
    ) );

    // add the panel or carousel that will contain the various coin terms that the user can create
    if ( creatorNodes.length > options.itemsPerCarouselPage ) {
      this.coinTermCreatorBox = new Carousel( creatorNodes, {
        itemsPerPage: options.itemsPerCarouselPage,
        spacing: options.itemSpacing,
        cornerRadius: options.cornerRadius
      } );
    }
    else {
      // everything will fit on one page, so use a panel instead of a carousel
      var coinTermCreatorHBox = new HBox( {
        children: creatorNodes,
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

  return inherit( Node, CoinTermCreatorBox );
} );