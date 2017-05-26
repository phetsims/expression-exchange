// Copyright 2016, University of Colorado Boulder

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
  var ExpressionNode = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  // constants
  var HINT_BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
  var INSET = 10; // in screen coordinates

  /**
   * @param {ExpressionHint} expressionHint - model of an expression hint
   * @constructor
   */
  function ExpressionHintNode( expressionHint ) {
    Node.call( this, { pickable: false } );
    var self = this;

    var boundsUpdateMultilink = Property.multilink(
      [
        expressionHint.anchorCoinTerm.relativeViewBoundsProperty,
        expressionHint.movingCoinTerm.relativeViewBoundsProperty
      ],
      function() {

        // convenience vars
        var anchorCTBounds = expressionHint.anchorCoinTerm.relativeViewBoundsProperty.get();
        var movingCTBounds = expressionHint.movingCoinTerm.relativeViewBoundsProperty.get();

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
          leftHalfCenterX = expressionHint.anchorCoinTerm.positionProperty.get().x +
                            ( anchorCTBounds.minX + anchorCTBounds.maxX ) / 2; //REVIEW: bounds.centerX?
        }
        else { // anchor coin term is on the right
          leftHalfWidth = movingCTBounds.width + 2 * INSET;
          rightHalfWidth = anchorCTBounds.width + 2 * INSET;
          //REVIEW: use bounds.centerX
          leftHalfCenterX = expressionHint.anchorCoinTerm.positionProperty.get().x + ( anchorCTBounds.minX + anchorCTBounds.maxX ) / 2 - anchorCTBounds.width / 2 - INSET - movingCTBounds.width / 2 - INSET;
        }

        //REVIEW: Looks like a rectangle. Any reason why we can't use the shortcuts?
        var leftHalfShape = new Shape()
          .moveTo( leftHalfWidth, 0 )
          .lineTo( 0, 0 )
          .lineTo( 0, height )
          .lineTo( leftHalfWidth, height );
        ExpressionNode.addVerticalZigZagLine( leftHalfShape, leftHalfWidth, height, leftHalfWidth, 0, true );
        leftHalfShape.close();

        var leftHalf = new Path( leftHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          centerX: leftHalfCenterX,
          top: top
        } );
        self.addChild( leftHalf );

        // add right half
        //REVIEW: Looks like a rectangle. Any reason why we can't use the shortcuts?
        var rightHalfShape = new Shape()
          .moveTo( 0, 0 )
          .lineTo( rightHalfWidth, 0 )
          .lineTo( rightHalfWidth, height )
          .lineTo( 0, height );
        ExpressionNode.addVerticalZigZagLine( rightHalfShape, 0, height, 0, 0, true );
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