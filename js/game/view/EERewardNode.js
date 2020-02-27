// Copyright 2017-2019, University of Colorado Boulder
/**
 * The reward that is displayed when all levels have been correctly completed.  For testing, the simulation can be run
 * with the 'reward' query parameter to show the reward each time a level is successfully completed.
 *
 * @author John Blanco
 */

import inherit from '../../../../phet-core/js/inherit.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import Text from '../../../../scenery/js/nodes/Text.js';
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

/**
 * @constructor
 */
function EERewardNode() {

  const nodes = [];

  // add nodes that look like smiley faces, stars, and variables
  nodes.push( new FaceNode( FACE_DIAMETER ) );
  nodes.push( new StarNode( { outerRadius: STAR_OUTER_RADIUS, innerRadius: STAR_INNER_RADIUS } ) );
  nodes.push( new Text( 'x', { font: VARIABLE_FONT } ) );
  nodes.push( new Text( 'y', { font: VARIABLE_FONT } ) );
  nodes.push( new Text( 'z', { font: VARIABLE_FONT } ) );

  // add coin images
  CoinTermTypeID.VALUES.forEach( function( coinTermTypeID ) {
    if ( coinTermTypeID !== CoinTermTypeID.CONSTANT ) {
      nodes.push( CoinNodeFactory.createImageNode( coinTermTypeID, COIN_RADIUS, true ) );
    }
  } );
  RewardNode.call( this, { nodes: RewardNode.createRandomNodes( nodes, NUMBER_OF_NODES ) } );
}

expressionExchange.register( 'EERewardNode', EERewardNode );

inherit( RewardNode, EERewardNode );
export default EERewardNode;