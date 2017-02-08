// Copyright 2017, University of Colorado Boulder

/**
 * an array of static objects that describe the Expression Exchange challenges, organized by game level
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionDescription = require( 'EXPRESSION_EXCHANGE/game/model/ExpressionDescription' );

  /*
   * two-dimensional array of game challenge descriptors, organized as a 2D array where the first dimension corresponds
   * to the game level and the 2nd is the available challenges within that level
   *
   * TODO: document challenge descriptor format when finalized
   */
  var EEChallengeDescriptors = [

    // level 1 challenges
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '2x + y' ),
          new ExpressionDescription( '2x + 2y' ),
          new ExpressionDescription( 'x + 2y' )

        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( 'x + y + z' ),
          new ExpressionDescription( '2x + y' ),
          new ExpressionDescription( '2y + 2z' )
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 4 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '3x + 2y' ),
          new ExpressionDescription( 'y + 2z' ),
          new ExpressionDescription( '2x + 2y + 2z' )
        ]
      }
    ],

    // level 2
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '2x + y' ),
          new ExpressionDescription( '2x + 2y' ),
          new ExpressionDescription( 'x + 2y' )
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( 'x + y' ),
          new ExpressionDescription( '2x + 2y' ),
          new ExpressionDescription( 'x + 3y' )
        ]
      }
    ],

    // level 3
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 7 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 4, creationLimit: 1 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '5x' ),
          new ExpressionDescription( '5x' ),
          new ExpressionDescription( '5x' )
        ]
      }
    ],

    // level 4
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '3x' ),
          new ExpressionDescription( '2x + y' ),
          new ExpressionDescription( 'x + 2y' )
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( 'x + y' ),
          new ExpressionDescription( '2x + 2y' ),
          new ExpressionDescription( 'x + 3y' )
        ]
      }
    ],

    // level 5
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '2x - y' ),
          new ExpressionDescription( 'x - 2y' ),
          new ExpressionDescription( '-x + y' )
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '5x + y' ),
          new ExpressionDescription( '4x - 2y' ),
          new ExpressionDescription( '3x + 4y' )
        ]
      }
    ],

    // level 6
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: -4, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -2, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 1 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '3x' ),
          new ExpressionDescription( '3x' ),
          new ExpressionDescription( '3x' )
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 1 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( '3x + y' ),
          new ExpressionDescription( '3x + y' ),
          new ExpressionDescription( '3x + y' )
        ]
      }
    ],

    // level 7
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
          { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 6 },
          { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 4 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( 'x^2 + y^2' ),
          new ExpressionDescription( 'y^2 + z' ),
          new ExpressionDescription( 'x^2 + z' )
        ]
      }
    ],

    // level 8
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          new ExpressionDescription( 'x^2 + y^2' ),
          new ExpressionDescription( 'y^2 + z' ),
          new ExpressionDescription( 'x^2 + 1' )
        ]
      }
    ]
  ];

  expressionExchange.register( 'EEChallengeDescriptors', EEChallengeDescriptors );

  return EEChallengeDescriptors;

} );