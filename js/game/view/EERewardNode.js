// Copyright 2017-2022, University of Colorado Boulder

/**
 * The reward that is displayed when all levels have been correctly completed.  For testing, the simulation can be run
 * with the 'showRewardNodeEveryLevel' query parameter to show the reward each time a level is successfully completed.
 *
 * @author John Blanco
 */

import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { Text } from '../../../../scenery/js/imports.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import CoinNodeFactory from '../../common/view/CoinNodeFactory.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const NUMBER_OF_NODES = 60;
const FACE_DIAMETER = 50;
const COIN_RADIUS = 22;
const STAR_OUTER_RADIUS = 20;
const STAR_INNER_RADIUS = STAR_OUTER_RADIUS / 2;
const VARIABLE_FONT = new MathSymbolFont( 36 );

class EERewardNode extends RewardNode {

  constructor() {

    // add nodes that look like smiley faces, stars, and variables
    const nodes = [
      new FaceNode( FACE_DIAMETER ),
      new StarNode( { starShapeOptions: { outerRadius: STAR_OUTER_RADIUS, innerRadius: STAR_INNER_RADIUS } } ),
      new Text( 'x', { font: VARIABLE_FONT } ),
      new Text( 'y', { font: VARIABLE_FONT } ),
      new Text( 'z', { font: VARIABLE_FONT } )
    ];

    // add a node for each coin type
    CoinTermTypeID.VALUES.forEach( coinTermTypeID => {
      if ( coinTermTypeID !== CoinTermTypeID.CONSTANT ) {
        nodes.push( CoinNodeFactory.createImageNode( coinTermTypeID, COIN_RADIUS, true ) );
      }
    } );

    super( { nodes: RewardNode.createRandomNodes( nodes, NUMBER_OF_NODES ) } );
  }
}

expressionExchange.register( 'EERewardNode', EERewardNode );
export default EERewardNode;