// Copyright 2017, University of Colorado Boulder
/**
 * The reward that is displayed when all levels have been correctly completed.  For testing, the simulation can be run
 * with the 'reward' query parameter to show the reward each time a level is successfully completed.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RewardNode = require( 'VEGAS/RewardNode' );
  var StarNode = require( 'SCENERY_PHET/StarNode' );

  // constants
  var NUMBER_OF_NODES = 75;
  var FACE_DIAMETER = 50;
  var COIN_RADIUS = 30;
  var STAR_OUTER_RADIUS = 20;
  var STAR_INNER_RAIDUS = STAR_OUTER_RADIUS / 2;

  /**
   * @constructor
   */
  function EERewardNode() {
    var nodes = [];
    nodes.push( new FaceNode( FACE_DIAMETER ) );
    nodes.push( new StarNode( { outerRadius: STAR_OUTER_RADIUS, innerRadius: STAR_INNER_RAIDUS } ) );
    _.values( CoinTermTypeID ).forEach( function( coinTermTypeId ) {
      if ( coinTermTypeId !== CoinTermTypeID.CONSTANT ) {
        nodes.push( CoinNodeFactory.createImageNode( coinTermTypeId, COIN_RADIUS, 'front' ) );
      }
    } );
    RewardNode.call( this, { nodes: RewardNode.createRandomNodes( nodes, NUMBER_OF_NODES ) } );
  }

  expressionExchange.register( 'EERewardNode', EERewardNode );

  return inherit( RewardNode, EERewardNode );
} );
