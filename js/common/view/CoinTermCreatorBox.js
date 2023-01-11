// Copyright 2016-2022, University of Colorado Boulder

/**
 * Scenery node that holds a set of creator nodes.
 *
 * This is somewhat specific to the Expression Exchange simulation, but could easily be turned into a base class and
 * used more generally.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import expressionExchange from '../../expressionExchange.js';

class CoinTermCreatorBox extends Node {

  /**
   * @param {Array.<CoinTermCreatorNode>} creatorNodes - set of coin term creator nodes
   * @param {Object} [options]
   */
  constructor( creatorNodes, options ) {

    super();

    options = merge( {
      itemsPerCarouselPage: 3,
      itemSpacing: 20, // empirically determined to work for most cases in this sim
      cornerRadius: 4,
      align: 'center'
    }, options );

    // @public (read-only) {boolean} - a flag that indicates if creator nodes that create coin terms with negative
    // initial values are present
    this.negativeTermsPresent = _.some( creatorNodes, creatorNode => creatorNode.createdCoinTermInitialCount < 0 );

    // @public (read-only) {Array.<CoinTermTypeID>} - list of the coin term types present in this creator box
    this.coinTermTypeList = _.uniq( _.map( creatorNodes, 'typeID' ) );

    // @private {Node}
    this.coinTermCreatorBox = new Carousel( creatorNodes.map( element => {
      return { createNode: tandem => element };
    } ), {
      itemsPerPage: options.itemsPerCarouselPage,
      spacing: options.itemSpacing,
      margin: 14,
      cornerRadius: options.cornerRadius
    } );
    this.addChild( this.coinTermCreatorBox );

    this.mutate( options );

    // add a dispose function
    this.disposeCoinTermCreatorBox = () => {
      creatorNodes.forEach( creatorNode => { creatorNode.dispose(); } );
    };
  }

  /**
   * @public
   */
  reset() {
    this.coinTermCreatorBox.reset && this.coinTermCreatorBox.reset();
  }

  /**
   * @public
   */
  dispose() {
    this.disposeCoinTermCreatorBox();
    super.dispose();
  }
}

expressionExchange.register( 'CoinTermCreatorBox', CoinTermCreatorBox );

export default CoinTermCreatorBox;