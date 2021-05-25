// Copyright 2017-2021, University of Colorado Boulder

/**
 * an array of static objects that describe the Expression Exchange challenges, organized by game level
 *
 * @author John Blanco
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionDescription from './ExpressionDescription.js';

// The challenge set, organized as a 2D array where the first dimension is level, the second is challenge number.
// The challenge descriptions are organized as a set of expressions that the user should construct and collect and
// a description of the contents of the coin term box.
const challengeSets = [

  // level 1 challenges
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '2x + y' ),
        new ExpressionDescription( '2x + 2y' ),
        new ExpressionDescription( 'x + 2y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x + y + z' ),
        new ExpressionDescription( '2x + y' ),
        new ExpressionDescription( '2y + 2z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '3x + 2y' ),
        new ExpressionDescription( 'y + 2z' ),
        new ExpressionDescription( '2x + 2y + 2z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 4 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x + y + z' ),
        new ExpressionDescription( '2x + z' ),
        new ExpressionDescription( 'x + 2y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x + y' ),
        new ExpressionDescription( '2x + 2z' ),
        new ExpressionDescription( '2y + z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 3 }
      ]
    }
  ],

  // level 2
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '3x' ),
        new ExpressionDescription( '2x + y' ),
        new ExpressionDescription( 'x + 2y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x + y' ),
        new ExpressionDescription( '2x + 2y' ),
        new ExpressionDescription( 'x + 3y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2x + 2z' ),
        new ExpressionDescription( '3x + 3y' ),
        new ExpressionDescription( '3y + 2z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 1 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 2, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4y + 4z' ),
        new ExpressionDescription( '2y + z' ),
        new ExpressionDescription( 'y + 3z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 1 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 2, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4x' ),
        new ExpressionDescription( 'x + 2y' ),
        new ExpressionDescription( '2x + 2y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 1 }
      ]
    }
  ],

  // level 3
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '5x' ),
        new ExpressionDescription( '5x' ),
        new ExpressionDescription( '5x' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 7 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 4, creationLimit: 1 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4x' ),
        new ExpressionDescription( '4x' ),
        new ExpressionDescription( '4x' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 1 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '5y' ),
        new ExpressionDescription( '5y' ),
        new ExpressionDescription( '5y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '6y' ),
        new ExpressionDescription( '6y' ),
        new ExpressionDescription( '6y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 4, creationLimit: 1 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '5z' ),
        new ExpressionDescription( '5z' ),
        new ExpressionDescription( '5z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 8 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 3, creationLimit: 1 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 4, creationLimit: 1 }
      ]
    }
  ],

  // level 4
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '3x' ),
        new ExpressionDescription( '2x + x^2' ),
        new ExpressionDescription( 'x + 2x^2' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x + y' ),
        new ExpressionDescription( '2x + 2y' ),
        new ExpressionDescription( 'x + 3y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2x + 2z' ),
        new ExpressionDescription( '3x + 3y' ),
        new ExpressionDescription( '3y + 2z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 1 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 2, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4y + 4z' ),
        new ExpressionDescription( '2y + z' ),
        new ExpressionDescription( 'y + 3z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 1 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 2, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4y' ),
        new ExpressionDescription( 'y + 2y^2' ),
        new ExpressionDescription( '2y + 2y^2' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: 2, creationLimit: 1 }
      ]
    }
  ],

  // level 5
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '2x - 3' ),
        new ExpressionDescription( 'x - 2' ),
        new ExpressionDescription( '-x + 2' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 2 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 5 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '5x^2 + y' ),
        new ExpressionDescription( '4x^2 - 2y' ),
        new ExpressionDescription( '3x^2 + 4y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 2, creationLimit: 3 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 3, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'y - 2x' ),
        new ExpressionDescription( '2xy' ),
        new ExpressionDescription( '3x + 2y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -2, creationLimit: 1 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.X_TIMES_Y, minimumDecomposition: 1, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '-y + 2xy' ),
        new ExpressionDescription( '2y + xy' ),
        new ExpressionDescription( '2xy - 3y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X_TIMES_Y, minimumDecomposition: 1, creationLimit: 5 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2y^2 - 2' ),
        new ExpressionDescription( '2 - 2y^2' ),
        new ExpressionDescription( '2y^2 + 2' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: -1, creationLimit: 2 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 2 }
      ]
    }
  ],

  // level 6
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '-3x' ),
        new ExpressionDescription( '-3x' ),
        new ExpressionDescription( '-3x' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: -4, creationLimit: 1 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -2, creationLimit: 1 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 1 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '3x - y' ),
        new ExpressionDescription( '3x - y' ),
        new ExpressionDescription( '3x - y' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 1 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '-5z' ),
        new ExpressionDescription( '-5z' ),
        new ExpressionDescription( '-5z' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Z, minimumDecomposition: -1, creationLimit: 7 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: -2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: -4, creationLimit: 1 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '3y - 2' ),
        new ExpressionDescription( '3y - 2' ),
        new ExpressionDescription( '3y - 2' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 4 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 1 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -2, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '4y - 1' ),
        new ExpressionDescription( '4y - 1' ),
        new ExpressionDescription( '4y - 1' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 1 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 3 }
      ]
    }
  ],

  // level 7
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( '2(x - 1)' ),
        new ExpressionDescription( '1(2x - 2)' ),
        new ExpressionDescription( '2(x + 3)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 6 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 4 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2(2x + y)' ),
        new ExpressionDescription( '1(3y - x)' ),
        new ExpressionDescription( '2(2x + y)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 1 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 7 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2(y + 3)' ),
        new ExpressionDescription( '3(y - 1)' ),
        new ExpressionDescription( '2(1 + y)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 7 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 3, creationLimit: 2 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 3 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '1(3y - z)' ),
        new ExpressionDescription( '2(y + 2z)' ),
        new ExpressionDescription( '3(y - z)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 3, creationLimit: 1 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Z, minimumDecomposition: -1, creationLimit: 4 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2(x - 2y)' ),
        new ExpressionDescription( '3(x + y)' ),
        new ExpressionDescription( '2(2x - y)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 6 }
      ]
    }
  ],

  // level 8
  [
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x(x + 1) + 1' ),
        new ExpressionDescription( '3(x^2 + 1)' ),
        new ExpressionDescription( '2(x - 2)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 5 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 4 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '2x - (x + 1)' ),
        new ExpressionDescription( 'x + 2(x - 1)' ),
        new ExpressionDescription( 'x(x + 1)' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 3 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '-1(x - 2)' ),
        new ExpressionDescription( '3 + x(x - 2)' ),
        new ExpressionDescription( '3(x^2 + 1) ' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 3 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 4 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 8 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( '-2(x^2 - 1)' ),
        new ExpressionDescription( '3(x^2 + x)' ),
        new ExpressionDescription( 'x(x + 2) + 1' )
      ],
      carouselContents: [
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 3 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 6 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: -1, creationLimit: 2 }
      ]
    },
    {
      expressionsToCollect: [
        new ExpressionDescription( 'x - (x + 2)' ),
        new ExpressionDescription( 'x(2x + 1)' ),
        new ExpressionDescription( '2(x^2 - 1)' )
      ],
      carouselContents: [ { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 2 },
        { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 3 },
        { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 4 },
        { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 4 }
      ]
    }
  ]
];

/**
 * static object with methods for accessing the challenge descriptors defined above
 */
const EEChallengeDescriptors = {

  /**
   * get a challenge descriptor for the specified level
   * @param {number} level
   * @param {number} challengeNumber
   * @returns {EEChallengeDescriptor}
   * @public
   */
  getChallengeDescriptor( level, challengeNumber ) {
    return challengeSets[ level ][ challengeNumber ];
  },

  /**
   * randomize the challenge sets
   * @public
   */
  shuffleChallenges() {
    for ( let i = 0; i < challengeSets.length; i++ ) {
      challengeSets[ i ] = dotRandom.shuffle( challengeSets[ i ] );
    }
  },

  //@public
  CHALLENGES_PER_LEVEL: 5
};

expressionExchange.register( 'EEChallengeDescriptors', EEChallengeDescriptors );

export default EEChallengeDescriptors;