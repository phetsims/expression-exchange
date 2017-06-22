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
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var RewardNode = require( 'VEGAS/RewardNode' );
  var StarNode = require( 'SCENERY_PHET/StarNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var NUMBER_OF_NODES = 60;
  var FACE_DIAMETER = 50;
  var COIN_RADIUS = 22;
  var STAR_OUTER_RADIUS = 20;
  var STAR_INNER_RADIUS = STAR_OUTER_RADIUS / 2;
  var VARIABLE_FONT = new MathSymbolFont( 36 );

  /**
   * @constructor
   */
  function EERewardNode() {

    var nodes = [];

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

  return inherit( RewardNode, EERewardNode );
} );
