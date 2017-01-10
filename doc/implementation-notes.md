Implementation Notes
====================

TODO: This is a collection of thoughts recorded during the implementation process, and will need to be edited into a
coherent document before the simulation development can be considered complete.

There is no MVT.

CoinTerm is a fundamental model element, and it represents a thing that can either appear to be a coin or a
mathematical term.  The name is used a lot throughout the code, so it's important to have a clear idea of what it is.
It is a model object with a position, a front and back image to be used for the coin representation, and formula (which
may be as simple as 'x' or as complex as 'x squared times y squared', and several other attributes that define its
behavior and appearance.

The CoinTerm model element tracks its bounds in the view relative to its position.  This break strict MVC practices,
but worked well for the needs of the sim.

A decision was made that if a coin term overlaps multiple expressions, on the one with the most overlap should have its
hints activated.  This means that the main model has to compare them and decide which one to activate, which means that
this decision must be centralized in the main model rather than leaving it to the coin terms or expressions.

Term: "join zone".

The interactions between coin terms and expressions gets fairly complicated, which results in a fair amount of code to
enforce the behavioral rules, update the various visual cues that indicate what will combine with what when released.
Some of this code had to be hooked to properties, while some of it was implemented in step functions.  The interactions
can be complicated, so it will be important to have a good understanding of such interactions if some of these
behavioral rules need to be changed or fixed.

Only one expression can be edited at a time.

Late in the implementation process, several new requirements came into being.  One was to support constants.  For the
most part, the CoinTerm class supported the desired behavior.  However, the primary view class - CoinTermNode - did not,
since it depicted CoinTerms in a number of ways that assumed an underlying variable.  To handle this, the view was
divided into two classes, VariableCoinTermNode and ConstantCoinTermNode.  This worked out quite well in the
implementation, but may be a little confusing to anyone coming in to maintain this simulation because there is a single
model element, i.e. CoinTerm, that can map to one of two view elements, i.e. VariableCoinTermNode and
ConstantCoinTermNode.  Not a huge deal, but probably worth a "heads up" here in this document.

In the non-game screens, coin terms can always be broken down into 'atomic' elements, for instance, a 2x can always be
broken down into 2 separate coin terms of 1x each.  This is not true in the game screen - if a 2x moved into the play
area, it can't be broken apart.  If it is then combined with a 3x to form a 5x, and then broken apart, it will go back
into a 2x and 3x.  Because of this, the coin terms have to track their composition.  For the non-game screen, composite
coin terms are always composed of individual coin terms, e.g. a single x, whereas on the game screen the coin terms can
be composed of pre-combined values that can't be further decomposed.

Note to self (jbphet): I sent myself a snapshot of my whiteboard on 7/22/2016.  When finalizing this document, look it
over see if it inspires thoughts on other things to add to this doc.  Something about the expression overlay node
would probably be good, for instance.


