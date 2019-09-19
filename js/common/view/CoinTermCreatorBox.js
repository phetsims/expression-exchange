// Copyright 2016-2018, University of Colorado Boulder

/**
 * Scenery node that holds a set of creator nodes.
 *
 * This is somewhat specific to the Expression Exchange simulation, but could easily be turned into a base class and
 * used more generally.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Carousel = require( 'SUN/Carousel' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );

  /**
   * @param {Array.<CoinTermCreatorNode>} creatorNodes - set of coin term creator nodes
   * @param {Object} [options]
   * @constructor
   */
  function CoinTermCreatorBox( creatorNodes, options ) {

    Node.call( this );

    options = _.extend( {
      itemsPerCarouselPage: 3,
      itemSpacing: 20, // empirically determined to work for most cases in this sim
      cornerRadius: 4,
      staggeredCreatorNodes: false,
      align: 'center'
    }, options );

    // @public (read-only) {boolean} - a flag that indicates if creator nodes that create coin terms with negative
    // initial values are present
    this.negativeTermsPresent = _.some( creatorNodes, function( creatorNode ) {
      return ( creatorNode.createdCoinTermInitialCount < 0 );
    } );

    // @public (read-only) {Array.<CoinTermTypeID>} - list of the coin term types present in this creator box
    this.coinTermTypeList = _.uniq( _.map( creatorNodes, 'typeID' ) );

    // add the panel or carousel that will contain the various coin terms that the user can create
    if ( creatorNodes.length > options.itemsPerCarouselPage ) {

      // check options compatibility
      assert && assert(
        options.align === 'center',
        'only center alignment is supported for creator boxes that use a carousel'
      );

      // @private {Node}
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
        align: options.align,
        resize: false
      } );
      // @private {Node}
      this.coinTermCreatorBox = new Panel( coinTermCreatorHBox, {
        cornerRadius: options.cornerRadius,
        xMargin: 65, // empirically determined to be similar in appearance to carousels
        yMargin: 14, // empirically determined to be similar in appearance to carousels
        resize: false
      } );
    }
    this.addChild( this.coinTermCreatorBox );

    this.mutate( options );

    // add a dispose function
    this.disposeCoinTermCreatorBox = function() {
      creatorNodes.forEach( function( creatorNode ) { creatorNode.dispose(); } );
    };
  }

  expressionExchange.register( 'CoinTermCreatorBox', CoinTermCreatorBox );

  return inherit( Node, CoinTermCreatorBox, {

    reset: function() {
      this.coinTermCreatorBox.reset && this.coinTermCreatorBox.reset();
    },

    /**
     * @public
     */
    dispose: function() {
      this.disposeCoinTermCreatorBox();
      Node.prototype.dispose.call( this );
    }
  } );
} );