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
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // constants
  var RADIUS_ADDER = 10; // empirically determined

  /**
   * @param {Coin} coin - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @constructor
   */
  function CoinHaloNode( coin, viewModeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin halo
    var halo = new Circle( coin.termInfo.coinDiameter / 2 + RADIUS_ADDER, { fill: '#33adff' } );
    this.addChild( halo );

    // control halo visibility
    viewModeProperty.link( function( representationMode ){
      halo.visible = representationMode === ViewMode.COINS;
    } );

    // move this node as the model representation moves
    coin.positionProperty.link( function( position ) {
      self.center = position;
    } );
  }

  return inherit( Node, CoinHaloNode );
} );