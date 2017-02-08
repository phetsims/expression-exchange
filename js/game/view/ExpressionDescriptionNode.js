// Copyright 2017, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var CoinTermFactory = require( 'EXPRESSION_EXCHANGE/common/model/CoinTermFactory' );
  var CoinTermIconNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermIconNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COIN_TO_COIN_SPACING = 10; // empirically determined
  var VARIABLE_TO_OPERATOR_SPACING = 10;
  var OPERATOR_FONT = new PhetFont( 22 );
  var COEFFICIENT_FONT = new PhetFont( 20 );
  var ALWAYS_FALSE_PROPERTY = new Property( false );
  var ALWAYS_VARIABLE_MODE_PROPERTY = new Property( ViewMode.VARIABLES );

  // create an instance of the coin term factory that will be used by all instances of this class
  var COIN_TERM_FACTORY = new CoinTermFactory( new Property( 2 ), new Property( 5 ), new Property( 10 ) );

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
      expressionDescription.termsArray.forEach( function( expressionTerm, termIndex ) {

        // TODO: The following code to create the expression description as variable and operators is ugly and should
        // not be retained.  Originally, I thought I could use the coin term icons that were done for the collection
        // display in the first three screens and, while I was able to get it working, I had to cobble it together
        // with a number of workaround.  This should be redone in a better way.

        // add the coefficient if needed
        if ( Math.abs( expressionTerm.coefficient ) > 1 ) {
          var coefficientValue = termIndex === 0 ? expressionTerm.coefficient : Math.abs( expressionTerm.coefficient );
          var coefficientNode = new Text( coefficientValue, {
            font: COEFFICIENT_FONT,
            left: nextXPos,
            centerY: 0
          } );
          self.addChild( coefficientNode );
          nextXPos += coefficientNode.width;
        }
        else if ( expressionTerm.coefficient === -1 && termIndex === 0 ) {

          // add the leading minus sign
          var leadingMinusSign = new Text( '-', {
            font: COEFFICIENT_FONT,
            left: nextXPos,
            centerY: 0
          } );
          self.addChild( leadingMinusSign );
          nextXPos += leadingMinusSign.width;
        }

        // add the variable that represents this term
        var coinTerm = COIN_TERM_FACTORY.createCoinTerm( expressionTerm.coinTermTypeID );

        // TODO: I'll need to hook up the property that consolidates negatives into this description
        coinTerm.showMinusSignWhenNegativeProperty.set( termIndex === 0 && expressionTerm.coefficient === -1 );
        var coinTermIcon = new CoinTermIconNode(
          coinTerm,
          ALWAYS_VARIABLE_MODE_PROPERTY,
          ALWAYS_FALSE_PROPERTY,
          ALWAYS_FALSE_PROPERTY,
          { left: nextXPos }
        );

        self.addChild( coinTermIcon );

        if ( termIndex + 1 < expressionDescription.termsArray.length ) {
          nextXPos += coinTermIcon.width + VARIABLE_TO_OPERATOR_SPACING;
          var operatorText;
          if ( expressionDescription.termsArray[ termIndex + 1 ].coefficient > 0 ) {
            operatorText = '+';
          }
          else {
            operatorText = '-';
          }
          var operator = new Text( operatorText, { font: OPERATOR_FONT, centerY: 0, left: nextXPos } );
          self.addChild( operator );
          nextXPos += operator.width + VARIABLE_TO_OPERATOR_SPACING;
        }
      } );
    }
    else {
      assert && assert( false, 'unrecognized representation type' );
    }

    this.mutate( options );
  }

  expressionExchange.register( 'ExpressionDescriptionNode', ExpressionDescriptionNode );

  return inherit( Node, ExpressionDescriptionNode );
} );