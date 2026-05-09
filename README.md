# Ball_X_Evolution

BallXPit Evolution & Relic tool

## TODO List (Any order)

- Unlock requirements
  - Backend already done, all we have to do is add HTML elements to display it on the tooltip
    - Maybe have it be a "click to show" thing, it might get messy otherwise
- Base Ball combination
  - Shows the base combination of balls required for an evolution
    - made backend: getBaseBallsForBall(deconstructBall: Ball, allBalls: Array<Ball>, upgradePath: number = 0);
- Loadout Builder
  - Lets users set a list of items so they can have a build guide generated for them
- Completion checklist
  - Lets users mark what they have and be able to see a little tick to the items on the page
    - made backend: utils/completion
- Relic Chart
  - Need to build out json for it
- Complex evolution build
  - Show stuff that require 3 or more things to evolve
    - made backend: getBaseBallsForBall(deconstructBall: Ball, allBalls: Array<Ball>, upgradePath: number = 0);
- Progression filter
  - Show only things that the user can make

Lowest Priority:

- Split things into components
- Damage type filter
