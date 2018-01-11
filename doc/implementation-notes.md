Implementation Notes
====================

This simulation uses the Model-View-Controller architecture, but because there was no great need to maintain accurate
model units, there is no Model View Transform used.  In other words, model positions are essentially in view
coordinates.

There are four screens, and the first three use much of the same code with options and parameters being used to make
them look and behave differently.  The fourth screen is a game, and while it looks quite a bit different from the other
screens, there is still a fair amount of reuse at the high levels between this and the other screens.

The main "big picture" common code types are the ExpressionManipulationModel and the ExpressionManipulationView. Each
of the first three screens has one of each of these classes, and the game screen has one of each of these for each
game level.  These classes handle the basics of creating and working with expressions.

There are two primary low-level classes that are used withing the model: CoinTerm and Expression.

A CoinTerm is a fundamental model element, and it represents a thing that can either appear to be a coin or a
mathematical term.  The name is used a lot throughout the code, so it's important to have a clear idea of what it is.
In a nutshell, it is a model object with a position, a coin radius, a type ID, and a value.  The corresponding view
element, which is an AbstractCoinTermNode and its descendants, takes care of presenting the coin term to the user based
on the various view options chosen by the user.

The CoinTerm model element tracks its bounds in the view relative to its position.  This breaks strict MVC practices,
but worked well for the needs of the sim.

The other primary low-level type is Expression.  An expression is a combination of coin terms.  The user creates
expressions, moves them around, combines them, breaks them apart, and so forth.  Expression and its associated view
classes ExpressionNode and ExpressionOverlayNode, provide the view to the user.

There is a control that exists on every screen where the user creates and manipulates expressions that allows the user
to create coin terms by clicking and dragging.  This is similar to what has been called a "toolbox" in other PhET
simulations, but since it doesn't create tools, this name didn't seem appropriate.  The term "coin term creator box"
was a bit verbose, so the boxes are referred to in most places simply as a "creator box", e.g. the factory method
"createExploreScreenCreatorBox".

The interactions between coin terms and expressions gets fairly complicated, which results in a fair amount of code to
enforce the behavioral rules, update the various visual cues that indicate what will combine with what when released.
Some of this code had to be hooked to properties, while some of it was implemented in step functions.  The interactions
can be complicated, so it will be important to have a good understanding of such interactions if some of these
behavioral rules need to be changed or fixed.

A decision was made that if a user-controlled coin term overlaps multiple expressions, the one with the most overlap 
should have its hints activated.  This means that the main model has to compare them and decide which one to activate,
which means that this decision must be centralized in the main model rather than leaving it to the coin terms or
expressions.

The sim supports an "edit mode" for expressions where the coin terms within an expression can be combined or
rearranged.  Only one expression can be edited at a time.

Late in the implementation process, several new requirements came into being.  One was to support constants.  For the
most part, the CoinTerm class supported the desired behavior.  However, the primary view class - CoinTermNode - did not,
since it depicted CoinTerms in a number of ways that assumed an underlying variable.  To handle this, the view was
divided into two classes, VariableCoinTermNode and ConstantCoinTermNode.  This worked out quite well in the
implementation, but may be a little confusing to anyone coming in to maintain this simulation because there is a single
model element, i.e. CoinTerm, that can map to one of two view elements, i.e. VariableCoinTermNode and
ConstantCoinTermNode.  Not a huge deal, but probably worth a "heads up" here in this document.

In the explore screens (as opposed to the game screen), coin terms can always be broken down into 'atomic' elements, for
instance, a 2x can always be broken down into 2 separate coin terms of 1x each.  This is not true in the game screen -
if a 2x is moved into the play area from the creator box, it can't be broken apart.  If it is then combined with a 3x to
form a 5x, and then broken apart, it will go back into a 2x and 3x.  Because of this, the coin terms have to track their
composition.  For the non-game screen, composite coin terms are always composed of individual coin terms, e.g. a single
x, whereas on the game screen the coin terms can be composed of pre-combined values that can't be further decomposed.


