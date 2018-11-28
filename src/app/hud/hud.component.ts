import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { HudServiceBus } from '../hud-service-bus';
import { PlayerReadyEventArgs } from '../player-ready-event-args';
import { Subscription } from 'rxjs';
import { GameServiceBus } from '../game-service-bus';
import { GameStartedEventArgs } from '../game-started-event-args';
import { TurnPlayedEventArgs } from '../turn-played-event-args';
import { FireEventArgs } from '../fire-event-args';
import { TurnEndedEventArgs } from '../turn-ended-event-args';
import { ShipGridComponent } from '../ship-grid/ship-grid.component';
import { PieceBinComponent } from '../piece-bin/piece-bin.component';
import { DamageReportEventArgs } from '../damage-report-event-args';
import { GameEndedEventArgs } from '../game-ended-event-args';
import { LoadGameEventArgs } from '../load-game-event-args';
import { AttackGridComponent } from '../attack-grid/attack-grid.component';
import { PlayerNames } from '../player-names';

@Component({
  selector: 'app-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.css'],
  providers: [HudServiceBus]
})
export class HudComponent implements OnInit, OnDestroy{
  pieceBinHidden: boolean;
  @Input() hudId: string;
  currentTurn: boolean;
  inProcess: boolean;

  loadGameSubscription: Subscription;
  playerReadySubscription: Subscription;
  gameStartSubscription: Subscription;
  fireSubscription: Subscription;
  handlePlayerMoveSubscription: Subscription;
  turnEndedSubscription: Subscription;
  damageSubscription: Subscription;
  handleDamageSubscription: Subscription;
  handleAllSunkSubscription: Subscription;
  gameEndedSubscription: Subscription;

  gameMessage: string;
  placeAllVisible: boolean;

  @ViewChild('pieceBin') localPieceBin : PieceBinComponent;
  @ViewChild('shipGrid') localShipGrid: ShipGridComponent;
  @ViewChild('attackGrid') localAttackGrid: AttackGridComponent;

  constructor(private hudServiceBus: HudServiceBus, private gameServiceBus: GameServiceBus) {
    this.pieceBinHidden = false;
    this.placeAllVisible = true;

    // Events on the hud service bus
    this.playerReadySubscription = this.hudServiceBus.hudReadyHandlers$.subscribe(eventArgs => { this.onPlayerReady(eventArgs); });
    this.fireSubscription = this.hudServiceBus.attackHandlers$.subscribe(eventArgs => { this.onAttack(eventArgs); });
    this.damageSubscription = this.hudServiceBus.damageHandlers$.subscribe(eventArgs => { this.onDamageReported(eventArgs); });
    this.handleAllSunkSubscription = this.hudServiceBus.allPiecesSunkHandlers$.subscribe(eventArgs => { this.onAllSunk(eventArgs); });

    // Events on the game service bux
    this.loadGameSubscription = this.gameServiceBus.loadGameHandlers$.subscribe(eventArgs => { this.onGameLoaded(eventArgs); });
    this.gameStartSubscription = this.gameServiceBus.gameStartedHandlers$.subscribe(eventArgs => { this.onGameStarted(eventArgs); });
    this.handlePlayerMoveSubscription = this.gameServiceBus.playerMoveHandlers$.subscribe(eventArgs => { this.onHandlePlayerMove(eventArgs); });
    this.handleDamageSubscription = this.gameServiceBus.damageHandlers$.subscribe(eventArgs => { this.onHandleDamageReport(eventArgs); });
    this.turnEndedSubscription = this.gameServiceBus.turnEndedHandlers$.subscribe(eventArgs => { this.onTurnEnded(eventArgs); });
    this.gameEndedSubscription = this.gameServiceBus.gameEndedHandlers$.subscribe(eventArgs => { this.onGameEnded(eventArgs); });
  }

  ngOnInit() { }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.playerReadySubscription.unsubscribe();
    this.gameStartSubscription.unsubscribe();
    this.fireSubscription.unsubscribe();
    this.damageSubscription.unsubscribe();
    this.handleAllSunkSubscription.unsubscribe();

    this.loadGameSubscription.unsubscribe();
    this.gameStartSubscription.unsubscribe();
    this.handlePlayerMoveSubscription.unsubscribe();
    this.handleDamageSubscription.unsubscribe();
    this.turnEndedSubscription.unsubscribe();
    this.gameEndedSubscription.unsubscribe();
  }

  placeAll() {
    while (this.localPieceBin.gamePieces.length > 0) {
      let rowNum: number;
      let cellNum: number;
      let orientation: number;

      orientation = this.getRandomInt(1, 2);
      rowNum = this.getRandomInt(1, 10);
      cellNum = this.getRandomInt(1, 10);

      this.localPieceBin.gamePieces[0].vertical = (orientation == 2);
      this.localShipGrid.addShip(this.localPieceBin.gamePieces[0], this.localShipGrid.rows[rowNum].cells[cellNum], null);
    }
    this.placeAllVisible = false;
  }

  setReady() {
    this.localPieceBin.playerReady();
  }

  getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /// The game board has reported the hud to set its state to the inital game state
  onGameLoaded(args: LoadGameEventArgs) {
    this.inProcess = false;
    this.currentTurn = false;
    this.pieceBinHidden = false;
    this.gameMessage = '';
    this.placeAllVisible = true;
    // Notify all the hud components that they should set their initial state
    this.hudServiceBus.onHudLoaded(args);
  }

  /// When the player locks their ship board into place
  onPlayerReady(args: PlayerReadyEventArgs) {
    this.pieceBinHidden = true;
    this.gameServiceBus.onPlayerReady(args);
  }

  /// When the game is reported to have started, all players have locked in their boards
  onGameStarted(args: GameStartedEventArgs) {
    this.inProcess = true;
    this.currentTurn = args.currentPlayerId == this.hudId;
    this.gameMessage = '';
  }

  /// When the attack board triggers a fire
  onAttack(args: FireEventArgs) {
    console.log(this.hudId + ' is attacking.');
    let turnEventArgs = new TurnPlayedEventArgs();
    turnEventArgs.currentPlayedId = this.hudId;
    turnEventArgs.targetCell = args.gridCell;
    this.gameServiceBus.onPlayerMove(turnEventArgs);  // Let the game know the target cell and player making the move
  }

  /// Receiving an event from the game that a player performed a move
  onHandlePlayerMove(args: TurnPlayedEventArgs) {
    if (args.currentPlayedId != this.hudId) {
      this.hudServiceBus.onDefend(args);  // Let the hud's grids receive an attack
    }
  }

  /// When the ship board reports the result of the move
  onDamageReported(args: DamageReportEventArgs) {
    args.targetPlayerId = this.hudId;
    if (args.targetCell.hitStatus == 1) {
      if (args.targetCell.gamePiece.hitParts.length == args.targetCell.gamePiece.length) {
        this.hudServiceBus.onHandlePieceSunk(args);
      }
    }
    this.gameServiceBus.onDamageHandled(args);  // Let the game know of the damage that occurred
  }

  /// Receiving an event from the game what a turn ended up doing
  onHandleDamageReport(args: DamageReportEventArgs) {
    if (args.targetPlayerId != this.hudId) {
      this.hudServiceBus.onHandleDamageReport(args);

      // let the game know who the new current player is
      let turnEventArgs = new TurnEndedEventArgs();
      turnEventArgs.currentPlayerId = args.targetPlayerId;
      this.gameServiceBus.onTurnEnded(turnEventArgs);
    }
  }

  /// Receiving an event from the game that the players move is over
  onTurnEnded(args: TurnEndedEventArgs) {
    this.currentTurn = args.currentPlayerId == this.hudId;
  }

  /// All ships were sunk from the ship grid
  onAllSunk(args: PlayerReadyEventArgs) {
    if (args.playerId == this.hudId) {
      this.gameMessage = "You lost all your ships!";

      let gameEndedArgs = new GameEndedEventArgs();
      
      gameEndedArgs.loserId = this.hudId;
      if (this.hudId == PlayerNames.PLAYER_1) {
        gameEndedArgs.winnerId = PlayerNames.PLAYER_2;
      } else {
        gameEndedArgs.winnerId = PlayerNames.PLAYER_1;
      }
      this.inProcess = false;
      this.gameServiceBus.onGameEnded(gameEndedArgs);
    }
  }

  /// The game service bus reports that a winner has been confirmed
  onGameEnded(args: GameEndedEventArgs) {
    if (args.winnerId == this.hudId) {
      this.gameMessage = "You won the game!";
    }
  }
}
