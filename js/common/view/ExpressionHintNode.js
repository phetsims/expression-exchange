// Copyright 2016-2017, University of Colorado Boulder

/**
 * This type represents a Scenery node that represents a hint that is presented to the user when two coins can be
 * combined into an expression.  The hint looks like a rectangle with a rip in the middle, and the coins are enclosed
 * on either side of the rip.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var HINT_BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
  var INSET = 10; // in screen coordinates
  var NUM_ZIG_ZAGS = 5;
  var ZIG_ZAG_AMPLITUDE = 2;

  /**
   * @param {ExpressionHint} expressionHint - model of an expression hint
   * @constructor
   */
  function ExpressionHintNode( expressionHint ) {
    Node.call( this, { pickable: false } );
    var self = this;

    var boundsUpdateMultilink = Property.multilink(
      [
        expressionHint.anchorCoinTerm.localViewBoundsProperty,
        expressionHint.movingCoinTerm.localViewBoundsProperty
      ],
      function() {

        // convenience vars
        var anchorCTBounds = expressionHint.anchorCoinTerm.localViewBoundsProperty.get();
        var movingCTBounds = expressionHint.movingCoinTerm.localViewBoundsProperty.get();

        // clear out any previous hint
        self.removeAllChildren();

        // the hint can be on the left or right side of the 'anchor coin', depending upon where the moving coin term is
        var anchorCoinTermOnLeft = expressionHint.movingCoinTerm.positionProperty.get().x >
                                   expressionHint.anchorCoinTerm.positionProperty.get().x;

        // calculate size and position for each half of the hint
        var height = Math.max( anchorCTBounds.height, movingCTBounds.height ) + 2 * INSET;
        var top = expressionHint.anchorCoinTerm.positionProperty.get().y - height / 2;
        var leftHalfWidth;
        var rightHalfWidth;
        var leftHalfCenterX;
        if ( anchorCoinTermOnLeft ) {
          leftHalfWidth = anchorCTBounds.width + 2 * INSET;
          rightHalfWidth = movingCTBounds.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.positionProperty.get().x + anchorCTBounds.centerX;
        }
        else { // anchor coin term is on the right
          leftHalfWidth = movingCTBounds.width + 2 * INSET;
          rightHalfWidth = anchorCTBounds.width + 2 * INSET;
          leftHalfCenterX =                                                                 expressionHint.anchorCoinTerm.positionProperty.get().x + anchorCTBounds.centerX
                            - anchorCTBounds.width / 2 - INSET - movingCTBounds.width / 2 - INSET;
        }

        // draw rectangle on three sides with zig-zag line on remaining side
        var leftHalfShape = new Shape()
          .moveTo( leftHalfWidth, 0 )
          .lineTo( 0, 0 )
          .lineTo( 0, height )
          .lineTo( leftHalfWidth, height );
        leftHalfShape.zigZagTo( leftHalfWidth, 0, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        leftHalfShape.close();

        var leftHalf = new Path( leftHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          centerX: leftHalfCenterX,
          top: top
        } );
        self.addChild( leftHalf );

        // draw rectangle on three sides with zig-zag line on remaining side
        var rightHalfShape = new Shape()
          .moveTo( 0, 0 )
          .lineTo( rightHalfWidth, 0 )
          .lineTo( rightHalfWidth, height )
          .lineTo( 0, height );
        rightHalfShape.zigZagTo( 0, 0, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        rightHalfShape.close();

        self.addChild( new Path( rightHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          left: leftHalf.right,
          top: top
        } ) );
      } );

    // define dispose function
    this.expressionHintNodeDispose = function() {
      boundsUpdateMultilink.dispose();
    };
  }

  expressionExchange.register( 'ExpressionHintNode', ExpressionHintNode );

  return inherit( Node, ExpressionHintNode, {

    // @public
    dispose: function() {
      this.expressionHintNodeDispose();
      Node.prototype.dispose.call( this );
    }
  } );
} );