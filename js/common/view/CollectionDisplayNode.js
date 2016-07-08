// Copyright 2016, University of Colorado Boulder

/**
 * a node that monitors the coin terms in the model and displays a summary of what has been created (a.k.a. "collected")
 * by the user
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermIconNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermIconNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var DEFAULT_WIDTH = 200; // empirically determined
  var MAX_COIN_TERMS_PER_ROW = 4;
  var MAX_COINS_TERMS_PER_TYPE = 8;
  var COIN_CENTER_INSET = 12; // empirically determined
  var SAME_TYPE_VERTICAL_SPACING = 2;
  var DIFFERENT_TYPE_VERTICAL_SPACING = 8;

  /**
   * {ExpressionManipulationModel} model
   * {Array.<CoinTermTypeID>} displayList - a list of the coin terms to display in the desired order
   * {Object} options
   * @constructor
   */
  function CollectionDisplayNode( model, displayList, options ) {

    options = _.extend( {

      // width of the panel, adjustable to accommodate different sites of coin terms whose individual widths can vary
      width: DEFAULT_WIDTH,

      // flag that controls whether negative coin terms should be shown on the panel
      showNegatives: false
    }, options );

    Node.call( this );
    var self = this;

    // a list of the icons
    var iconList = [];

    // number of sections in which the icons will appear
    var numberOfDisplaySections = options.showNegatives ? displayList.length * 2 : displayList.length;
    
    // variables used in the loop that creates the icons shown in the display
    var bottomOfPreviousRow;
    var coinTermTypeID = null;
    
    // add icon display sections in the order in which they are listed
    for( var i = 0; i < numberOfDisplaySections; i++ ){

      if ( options.showNegatives ){
        coinTermTypeID = displayList[ Math.floor( i / 2 ) ];
      }
      else{
        coinTermTypeID = displayList[ i ];
      }

      // create a single instance of the icon
      var coinTermIcon = new CoinTermIconNode(
        model.coinTermFactory.createCoinTerm( coinTermTypeID, {
          // set initial count to +1 or -1 based on whether this icon is meant to display positive or negative values
          initialCount: options.showNegatives && i % 2 === 1 ? -1 : 1
        } ),
        model.viewModeProperty,
        model.showCoinValuesProperty,
        model.showVariableValuesProperty
      );

      if ( !bottomOfPreviousRow ) {
        bottomOfPreviousRow = COIN_CENTER_INSET - coinTermIcon.height / 2;
      }

      // calculate the values used to position the coin term nodes
      var interCoinTermHorizontalSpacing = ( options.width - ( 2 * COIN_CENTER_INSET ) ) / ( MAX_COIN_TERMS_PER_ROW - 1 );

      // wrap the icon in separate nodes (so that it can appear in multiple places) and position it
      for ( var j = 0; j < MAX_COINS_TERMS_PER_TYPE / MAX_COIN_TERMS_PER_ROW; j++ ) {
        for ( var k = 0; k < MAX_COIN_TERMS_PER_ROW; k++ ) {
          var wrappedIconNode = new Node( {
            children: [ coinTermIcon ],
            centerX: COIN_CENTER_INSET + k * interCoinTermHorizontalSpacing,
            top: j === 0 ? bottomOfPreviousRow + DIFFERENT_TYPE_VERTICAL_SPACING : bottomOfPreviousRow + SAME_TYPE_VERTICAL_SPACING
          } );
          self.addChild( wrappedIconNode );
          iconList.push( wrappedIconNode );
        }
        bottomOfPreviousRow = wrappedIconNode.bottom;
      }
    }

    // function that will update the visibility of the icons based on the number of corresponding coin types
    function updateIconVisibility() {
      displayList.forEach( function( coinTermTypeID, index ) {

        // find the first icon node for this coin term type
        var nodeIndex = index * MAX_COINS_TERMS_PER_TYPE;
        if ( options.showNegatives ){
          nodeIndex *= 2;
        }

        // update the icon visibility to match the count of positive terms of this type
        var count = model.getPositiveCoinTermCount( coinTermTypeID );
        for ( var i = 0; i < MAX_COINS_TERMS_PER_TYPE; i++ ) {
          iconList[ nodeIndex++ ].visible = i < count;
        }

        // if negatives are being shown, update the icons that correspond to those
        if ( options.showNegatives ){
          count = model.getNegativeCoinTermCount( coinTermTypeID );
          for ( i = 0; i < MAX_COINS_TERMS_PER_TYPE; i++ ) {
            iconList[ nodeIndex++ ].visible = i < count;
          }
        }
      } );
    }

    // do the initial update
    updateIconVisibility();

    // listen to the model for any coin terms coming or going and update the icon visibility when they do
    model.coinTerms.addItemAddedListener( updateIconVisibility );
    model.coinTerms.addItemRemovedListener( updateIconVisibility );
  }

  expressionExchange.register( 'CollectionDisplayNode', CollectionDisplayNode );

  return inherit( Node, CollectionDisplayNode );
} );