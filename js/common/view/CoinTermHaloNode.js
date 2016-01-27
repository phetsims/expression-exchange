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
  var ExpressionExchangeSharedConstants = require( 'EXPRESSION_EXCHANGE/common/ExpressionExchangeSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // constants
  var RADIUS_ADDER = 4; // empirically determined
  var COIN_HALO_COLOR = '#29ABE2';
  var TERM_HALO_COLOR_CENTER = 'yellow';
  var TERM_HALO_COLOR_EDGE = 'rgba( 255, 255, 0, 0 )';

  /**
   * @param {CoinTerm} coin - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @constructor
   */
  function CoinTermHaloNode( coin, viewModeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin halo
    var coinHalo = new Circle( coin.termInfo.coinDiameter / 2, { stroke: COIN_HALO_COLOR, lineWidth: RADIUS_ADDER * 2 } );
    this.addChild( coinHalo );

    // control coin halo visibility
    var coinHaloVisibleProperty = new DerivedProperty( [ viewModeProperty, coin.combineHaloActiveProperty ],
      function( viewMode, combineHaloActive ){
        return ( viewMode === ViewMode.COINS ) && combineHaloActive;
      } );
    coinHaloVisibleProperty.linkAttribute( coinHalo, 'visible' );

    // add the term halo
    var termHalo = new Circle( ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS, {
      fill: new RadialGradient( 0, 0, 0, 0, 0, ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS ).
        addColorStop( 0, TERM_HALO_COLOR_CENTER ).
        addColorStop( 0.5, TERM_HALO_COLOR_CENTER ).
        addColorStop( 1, TERM_HALO_COLOR_EDGE )
    } );
    this.addChild( termHalo );

    // control term halo visibility
    var termHaloVisibleProperty = new DerivedProperty( [ viewModeProperty, coin.combineHaloActiveProperty ],
      function( viewMode, combineHaloActive ){
        return ( viewMode === ViewMode.VARIABLES ) && combineHaloActive;
      } );
    termHaloVisibleProperty.linkAttribute( termHalo, 'visible' );

    // move this node as the model representation moves
    coin.positionProperty.link( function( position ) {
      self.center = position;
    } );
  }

  return inherit( Node, CoinTermHaloNode );
} );