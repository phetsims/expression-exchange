// Copyright 2016, University of Colorado Boulder

/**
 * This type represents an expression in the view, which basically looks like a rectangle with two or more coin terms
 * in it and plus signs between them.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeSharedConstants = require( 'EXPRESSION_EXCHANGE/common/ExpressionExchangeSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BACKGROUND_COLOR = ExpressionExchangeSharedConstants.EXPRESSION_BACKGROUND_COLOR;
  var INSET = 10; // in screen coordinates
  var NUM_ZIG_ZAGS = 10;
  var ZIG_ZAG_X_SIZE = 2; // empirically determined

  // TODO: Need to consolidate this with duplicated function in ExpressionHintNode
  // utility function for drawing a zig zag line on a shape between two endpoints
  function addZigZagLine( shape, x1, y1, x2, y2, zigRightFirst ) {
    assert && assert( x1 === x2, 'this function is not general enough to handle non-vertical zig-zag lines' );
    shape.moveTo( x1, y1 );
    var segmentYLength = ( y2 - y1 ) / NUM_ZIG_ZAGS;
    _.times( NUM_ZIG_ZAGS - 1, function( index ) {
      var zig = index % 2 === 0 ? ZIG_ZAG_X_SIZE : -ZIG_ZAG_X_SIZE;
      if ( !zigRightFirst ) {
        zig = -zig;
      }
      shape.lineTo( x1 + zig, y1 + ( index + 1 ) * segmentYLength );
    } );
    shape.lineTo( x2, y2 );
  }

  /**
   * @param {Expression} expression - model of an expression
   * @constructor
   */
  function ExpressionNode( expression ) {

    Node.call( this, { pickable: false } );
    var self = this;

    // layer where the plus symbols go
    var plusSymbolsLayer = new Node();
    this.addChild( plusSymbolsLayer );

    // shape and path used to define and display the background
    var backgroundShape;
    var backgroundPath = null;

    // function to update the background and the plus symbols
    function update() {

      // plus symbols are recreated each time to keep things simple
      plusSymbolsLayer.removeAllChildren();

      if ( expression.coinTerms.length > 0 ) {

        var coinTermsLeftToRight = expression.coinTerms.getArray().slice().sort( function( ct1, ct2 ) {
          return ct1.position.x - ct2.position.x;
        } );

        var height = 0;
        coinTermsLeftToRight.forEach( function( coinTerm, index ) {
          height = Math.max( height, coinTerm.relativeViewBounds.height + 2 * INSET );
        } );

        var leftEdge = coinTermsLeftToRight[ 0 ].position.x + coinTermsLeftToRight[ 0 ].relativeViewBounds.minX - INSET;
        var rightmostCoinTerm = coinTermsLeftToRight[ coinTermsLeftToRight.length - 1 ];
        var rightEdge = rightmostCoinTerm.position.x + rightmostCoinTerm.relativeViewBounds.maxX + INSET;
        var width = rightEdge - leftEdge;

        backgroundShape = new Shape.rect( 0, 0, width, height );
        if ( backgroundPath === null ) {
          backgroundPath = new Path( backgroundShape, { fill: BACKGROUND_COLOR } );
          self.addChild( backgroundPath );
          plusSymbolsLayer.moveToFront();
        }
        else {
          backgroundPath.shape = backgroundShape;
        }

        // position the path node
        backgroundPath.left = leftEdge;
        backgroundPath.centerY = expression.coinTerms.get( 0 ).position.y;

        // add the plus signs
        for ( var i = 0; i < coinTermsLeftToRight.length - 1; i++ ) {
          var plusSign = new Text( '+', {
            font: new PhetFont( 32 ),
            centerY: coinTermsLeftToRight[ i ].position.y,
            centerX: ( coinTermsLeftToRight[ i ].position.x + coinTermsLeftToRight[ i ].relativeViewBounds.maxX +
                       coinTermsLeftToRight[ i + 1 ].position.x + coinTermsLeftToRight[ i + 1 ].relativeViewBounds.minX ) / 2
          } );
          plusSymbolsLayer.addChild( plusSign );
        }
      }
      else {
        // no terms in this expression, so no background should be shown
        if ( backgroundPath !== null ) {
          self.removeChild( backgroundPath );
          backgroundPath = null;
        }
      }
    }

    // update whenever coin terms are added or removed
    expression.coinTerms.addItemAddedListener( update );
    expression.coinTerms.addItemRemovedListener( update );

    // do the initial update
    update();
  }

  return inherit( Node, ExpressionNode );
} );