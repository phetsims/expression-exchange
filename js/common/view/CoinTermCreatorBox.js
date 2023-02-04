// Copyright 2016-2023, University of Colorado Boulder

/**
 * Scenery node that holds a set of creator nodes.
 *
 * This is somewhat specific to the Expression Exchange simulation, but could easily be turned into a base class and
 * used more generally.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import { Shape } from '../../../../kite/js/imports.js';
import Vector2 from '../../../../dot/js/Vector2.js';
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
      itemSpacing: 5, // empirically determined to work for most cases in this sim
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
      return {
        createNode: tandem => {

          // Pick bounds that fit every single thing in the sim.
          const H = 90;
          const W = 140;

          // Could be a Node, but this helps with debugging if you want to see the bounds.
          const panel = new Rectangle( 0, 0, W, H, {
            fill: 'transparent',
            children: [ element ]
          } );
          element.center = new Vector2( W / 2, H / 2 );

          // Prevent resizing when elements bounds want to go outside the rectangle
          panel.clipArea = Shape.rect( 0, 0, W, H );

          return panel;
        }
      };
    } ), {
      itemsPerPage: options.itemsPerCarouselPage,
      spacing: 5,
      margin: 5,
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