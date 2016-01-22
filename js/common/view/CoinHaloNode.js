// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents the 'halo' that is used to indicate when coins can be combined
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // constants
  var RADIUS_ADDER = 4; // empirically determined
  var HALO_COLOR = '#29ABE2';

  /**
   * @param {Coin} coin - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @constructor
   */
  function CoinHaloNode( coin, viewModeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin halo
    var halo = new Circle( coin.termInfo.coinDiameter / 2, { stroke: HALO_COLOR, lineWidth: RADIUS_ADDER * 2 } );
    this.addChild( halo );

    // control halo visibility
    var haloVisibleProperty = new DerivedProperty(
      [
        viewModeProperty,
        coin.combineHaloActiveProperty
      ],
      function( viewMode, combineHaloActive ){
        return viewMode === ViewMode.COINS && combineHaloActive;
      } );
    haloVisibleProperty.linkAttribute( this, 'visible' );

    // move this node as the model representation moves
    coin.positionProperty.link( function( position ) {
      self.center = position;
    } );
  }

  return inherit( Node, CoinHaloNode );
} );