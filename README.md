# BattleShip

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Overall architecture:
There are two service buses that emit events.  One is the game bus.  This bus tells all the other players what is going on.  The 
other is the hud service bus.  This bus allows components on the player's hud to communicate while not needing to directly know
of each other.

Gameplay:
The game is started by each player placing their pieces on their ship grid.  You can drag the piece and drop it on your board.  
The piece can be further dragged on the board or it an be returned to the piece bin.  If you'd like, you can 'Play All' to have
the items randomly placed onto the board.  After placing all pieces, a 'Ready' button becomes visible.  Clicking this button locks
the board into play.  

When all players have submitted their boards, the game randomly decides you goes first.  As each turn is played, the opposing
player's board is locked.  Moves are published as the opposing hud is responsible for notifying its components of the event.  


Autoplay:
To see a game played completely with random numbers, hit the 'Random Play' button.  It will place the parts, set the hud ready,
and begin playing each player against eachother.  
