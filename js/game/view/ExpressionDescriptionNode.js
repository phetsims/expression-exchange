// Copyright 2017, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COIN_TO_COIN_SPACING = 10; // empirically determined
  var EXPRESSION_FONT = new PhetFont( 22 );

  /**
   * @param {ExpressionDescription} expressionDescription
   * @param {ViewMode} viewMode
   * @param {Object} options
   * @constructor
   */
  function ExpressionDescriptionNode( expressionDescription, viewMode, options ) {
    var self = this;
    Node.call( this );

    var nextXPos = 0;

    if ( viewMode === ViewMode.COINS ) {
      expressionDescription.termsArray.forEach( function( expressionTerm, termIndex ) {

        // add the coin icons for this term
        _.times( expressionTerm.coefficient, function( coefficientIndex ) {
          // TODO: Use real, scaled radii
          var coinIconNode = CoinNodeFactory.createIconNode( expressionTerm.coinTermTypeID, 10, { left: nextXPos } );
          self.addChild( coinIconNode );
          nextXPos += coinIconNode.width + COIN_TO_COIN_SPACING;
        } );
      } );
    }
    else if ( viewMode === ViewMode.VARIABLES ) {

      // TODO: I'm assuming that the check box for conosolidating negatives doesn't apply to the expression description.  True?
      var expressionText = new Text( expressionDescription.expressionString, { font: EXPRESSION_FONT } );
      this.addChild( expressionText );
    }
    else {
      assert && assert( false, 'unrecognized representation type' );
    }

    this.mutate( options );
  }

  expressionExchange.register( 'ExpressionDescriptionNode', ExpressionDescriptionNode );

  return inherit( Node, ExpressionDescriptionNode );
} );