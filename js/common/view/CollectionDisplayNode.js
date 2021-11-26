// Copyright 2016-2021, University of Colorado Boulder

/**
 * a node that monitors the coin terms in the model and displays a summary of what has been created (a.k.a. "collected")
 * by the user
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import CoinTermIconNode from './CoinTermIconNode.js';

// constants
const DEFAULT_WIDTH = 200; // empirically determined
const MAX_COIN_TERMS_PER_ROW = 4;
const MAX_COINS_TERMS_PER_TYPE = 8;
const COIN_CENTER_INSET = 12; // empirically determined
const SAME_TYPE_VERTICAL_SPACING = 2;
const DIFFERENT_TYPE_VERTICAL_SPACING = 8;

class CollectionDisplayNode extends Node {

  /**
   * @param {ExpressionManipulationModel} model
   * @param {Array.<CoinTermTypeID>} displayList - a list of the coin terms types to display in the desired order
   * @param {Object} [options]
   */
  constructor( model, displayList, options ) {

    options = merge( {

      // width of the panel, adjustable to accommodate different sites of coin terms whose individual widths can vary
      width: DEFAULT_WIDTH,

      // flag that controls whether negative coin terms should be shown on the panel
      showNegatives: false
    }, options );

    super();

    // number of sections in which the icons will appear
    const numberOfDisplaySections = options.showNegatives ? displayList.length * 2 : displayList.length;

    // variables used in the loop that creates the icons shown in the display
    let bottomOfPreviousRow;
    let coinTermTypeID = null;

    // add icon display sections in the order in which they are listed
    _.times( numberOfDisplaySections, displaySectionIndex => {

      if ( options.showNegatives ) {
        coinTermTypeID = displayList[ Math.floor( displaySectionIndex / 2 ) ];
      }
      else {
        coinTermTypeID = displayList[ displaySectionIndex ];
      }

      // create a single instance of the icon
      const coinTermIcon = new CoinTermIconNode(
        model.coinTermFactory.createCoinTerm( coinTermTypeID, {
          // set initial count to +1 or -1 based on whether this icon is meant to display positive or negative values
          initialCount: options.showNegatives && displaySectionIndex % 2 === 1 ? -1 : 1
        } ),
        model.viewModeProperty,
        model.showCoinValuesProperty,
        model.showVariableValuesProperty
      );

      if ( !bottomOfPreviousRow ) {
        bottomOfPreviousRow = COIN_CENTER_INSET - coinTermIcon.height / 2;
      }

      // calculate the values used to position the coin term nodes
      const interCoinTermHorizontalSpacing = ( options.width - ( 2 * COIN_CENTER_INSET ) ) / ( MAX_COIN_TERMS_PER_ROW - 1 );

      // wrap the icon in separate nodes so that it can appear in multiple places, and set the position of each
      const wrappedIconNodes = [];
      for ( let j = 0; j < MAX_COINS_TERMS_PER_TYPE / MAX_COIN_TERMS_PER_ROW; j++ ) {
        let wrappedIconNode = null;
        for ( let k = 0; k < MAX_COIN_TERMS_PER_ROW; k++ ) {
          wrappedIconNode = new Node( {
            children: [ coinTermIcon ],
            centerX: COIN_CENTER_INSET + k * interCoinTermHorizontalSpacing,
            top: j === 0 ? bottomOfPreviousRow + DIFFERENT_TYPE_VERTICAL_SPACING : bottomOfPreviousRow + SAME_TYPE_VERTICAL_SPACING
          } );
          this.addChild( wrappedIconNode );
          wrappedIconNodes.push( wrappedIconNode );
        }
        bottomOfPreviousRow = wrappedIconNode.bottom;
      }

      // Get a property from the model that tracks the number of this type of coin term and use it to update the
      // visibility of the icons in the display section.
      model.getCoinTermCountProperty(
        coinTermTypeID,
        options.showNegatives && displaySectionIndex % 2 === 1 ? -1 : 1,
        true
      ).link( count => {
        wrappedIconNodes.forEach( ( wrappedIconNode, index ) => {
          wrappedIconNode.visible = index < count;
        } );
      } );
    } );
  }
}

expressionExchange.register( 'CollectionDisplayNode', CollectionDisplayNode );

export default CollectionDisplayNode;