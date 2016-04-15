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
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var ViewModeEnum = require( 'EXPRESSION_EXCHANGE/common/model/ViewModeEnum' );

  // constants
  var COIN_HALO_COLOR = 'rgba( 255, 255, 0, 0.8 )';
  var COIN_HALO_EDGE_COLOR = 'rgba( 255, 255, 0, 0 )';
  var TERM_HALO_COLOR_CENTER = 'yellow';
  var TERM_HALO_EDGE_COLOR = 'rgba( 255, 255, 0, 0 )';

  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @constructor
   */
  function CoinTermHaloNode( coinTerm, viewModeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin halo
    var coinHalo = new Circle( coinTerm.coinDiameter / 2, {
      stroke: new RadialGradient( 0, 0, coinTerm.coinDiameter / 2, 0, 0, coinTerm.coinDiameter * 0.75 ).
      addColorStop( 0, COIN_HALO_COLOR ).
      addColorStop( 1, COIN_HALO_EDGE_COLOR ),
      lineWidth: 16 // empirically determined
    } );
    this.addChild( coinHalo );

    // control coin halo visibility
    var coinHaloVisibleProperty = new DerivedProperty( [ viewModeProperty, coinTerm.combineHaloActiveProperty ],
      function( viewMode, combineHaloActive ){
        return ( viewMode === ViewModeEnum.COINS ) && combineHaloActive;
      } );
    coinHaloVisibleProperty.linkAttribute( coinHalo, 'visible' );

    // add the term halo
    var termHalo = new Circle( EESharedConstants.TERM_COMBINE_RADIUS, {
      fill: new RadialGradient( 0, 0, 0, 0, 0, EESharedConstants.TERM_COMBINE_RADIUS ).
        addColorStop( 0, TERM_HALO_COLOR_CENTER ).
        addColorStop( 0.5, TERM_HALO_COLOR_CENTER ).
        addColorStop( 1, TERM_HALO_EDGE_COLOR )
    } );
    this.addChild( termHalo );

    // control term halo visibility
    var termHaloVisibleProperty = new DerivedProperty( [ viewModeProperty, coinTerm.combineHaloActiveProperty ],
      function( viewMode, combineHaloActive ){
        return ( viewMode === ViewModeEnum.VARIABLES ) && combineHaloActive;
      } );
    termHaloVisibleProperty.linkAttribute( termHalo, 'visible' );

    // move this node as the model representation moves
    coinTerm.positionProperty.link( function( position ) {
      self.center = position;
    } );
  }

  return inherit( Node, CoinTermHaloNode );
} );