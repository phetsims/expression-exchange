// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery node that represents the 'halo' that is used to indicate when coins can be combined
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { Circle, Node, RadialGradient } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import ViewMode from '../enum/ViewMode.js';

// constants
const COIN_HALO_COLOR = 'rgba( 255, 255, 0, 0.8 )';
const COIN_HALO_EDGE_COLOR = 'rgba( 255, 255, 0, 0 )';
const TERM_HALO_COLOR_CENTER = 'yellow';
const TERM_HALO_EDGE_COLOR = 'rgba( 255, 255, 0, 0 )';

class CoinTermHaloNode extends Node {

  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   */
  constructor( coinTerm, viewModeProperty ) {
    super( { pickable: true, cursor: 'pointer' } );

    // add the coin halo
    const coinHalo = new Circle( coinTerm.coinRadius, {
      stroke: new RadialGradient( 0, 0, coinTerm.coinRadius, 0, 0, coinTerm.coinRadius * 1.5 ).addColorStop( 0, COIN_HALO_COLOR ).addColorStop( 1, COIN_HALO_EDGE_COLOR ),
      lineWidth: 16 // empirically determined
    } );
    this.addChild( coinHalo );

    // control coin halo visibility
    const coinHaloVisibleProperty = new DerivedProperty( [ viewModeProperty, coinTerm.combineHaloActiveProperty ],
      ( viewMode, combineHaloActive ) => ( viewMode === ViewMode.COINS ) && combineHaloActive );
    const coinHaloVisibilityObserver = visible => {coinHalo.visible = visible;};
    coinHaloVisibleProperty.link( coinHaloVisibilityObserver );

    // add the term halo
    const termHalo = new Circle( EESharedConstants.TERM_COMBINE_DISTANCE, {
      fill: new RadialGradient( 0, 0, 0, 0, 0, EESharedConstants.TERM_COMBINE_DISTANCE ).addColorStop( 0, TERM_HALO_COLOR_CENTER ).addColorStop( 0.5, TERM_HALO_COLOR_CENTER ).addColorStop( 1, TERM_HALO_EDGE_COLOR )
    } );
    this.addChild( termHalo );

    // control term halo visibility
    const termHaloVisibleMultilink = Multilink.multilink(
      [ viewModeProperty, coinTerm.combineHaloActiveProperty ],
      ( viewMode, combineHaloActive ) => {
        termHalo.visible = viewMode === ViewMode.VARIABLES && combineHaloActive;
      }
    );

    // move this node as the model representation moves
    const handlePositionChanged = position => {
      this.center = position;
    };

    coinTerm.positionProperty.link( handlePositionChanged );

    this.disposeCoinTermHaloNode = () => {
      coinHaloVisibleProperty.unlink( coinHaloVisibilityObserver );
      coinHaloVisibleProperty.dispose();
      termHaloVisibleMultilink.dispose();
      coinTerm.positionProperty.unlink( handlePositionChanged );
    };
  }

  // @public
  dispose() {
    this.disposeCoinTermHaloNode();
    super.dispose();
  }
}

expressionExchange.register( 'CoinTermHaloNode', CoinTermHaloNode );

export default CoinTermHaloNode;