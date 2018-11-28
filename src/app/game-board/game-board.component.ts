import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlayerReadyEventArgs } from '../player-ready-event-args';
import { Subscription, Observable, Subject } from 'rxjs';
import { GameServiceBus } from '../game-service-bus';
import { GameStartedEventArgs } from '../game-started-event-args';
import { TurnPlayedEventArgs } from '../turn-played-event-args';
import { TurnEndedEventArgs } from '../turn-ended-event-args';
import { GameEndedEventArgs } from '../game-ended-event-args';
import { LoadGameEventArgs } from '../load-game-event-args';
import { HudComponent } from '../hud/hud.component';
import { HitStatus } from '../enums';
import { PlayerNames } from '../string-constants';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
  providers: [GameServiceBus]
})

export class GameBoardComponent implements OnInit, OnDestroy{
  player1Ready: boolean;
  player2Ready: boolean;
  inProcess: boolean;
  currentPlayerTurn: string;
  gameWinner: string;
  hideGameMessage: boolean;
  autoPlay: boolean;
  @ViewChild('hud1') hud1: HudComponent;
  @ViewChild('hud2') hud2: HudComponent;

  playerReadySubscription: Subscription;
  gameEndedSubscription: Subscription;
  turnEndedSubscription: Subscription;

  randomGameTimer: NodeJS.Timer;

  constructor(private gameServiceBus: GameServiceBus) {
    this.playerReadySubscription = this.gameServiceBus.playerReadyHandlers$.subscribe(eventArgs => { this.onPlayerReady(eventArgs); });
    this.turnEndedSubscription = this.gameServiceBus.turnEndedHandlers$.subscribe(eventArgs => { this.onTurnEnded(eventArgs); });
    this.gameEndedSubscription = this.gameServiceBus.gameEndedHandlers$.subscribe(eventArgs => { this.onGameEnded(eventArgs); });
    this.loadInitialState();
  }
  ngOnInit() { }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.playerReadySubscription.unsubscribe();
    this.gameEndedSubscription.unsubscribe();
    this.turnEndedSubscription.unsubscribe();
  }

  loadInitialState() {
    this.hideGameMessage = false;
    this.gameWinner = '';
    this.player1Ready = false;
    this.player2Ready = false;
    this.inProcess = false;
    this.currentPlayerTurn = '';
    this.gameWinner = '';
  }

  /// when a player's hud notifies us that they have locked in their board.
  onPlayerReady(eventArgs: PlayerReadyEventArgs) {
    if (eventArgs.playerId == PlayerNames.PLAYER_1) {
      this.player1Ready = true;
    }
    if (eventArgs.playerId == PlayerNames.PLAYER_2) {
      this.player2Ready = true;
    }

    if (this.player1Ready && this.player2Ready) {
      this.inProcess = true;

      let startArgs = new GameStartedEventArgs();
      if (this.getRandomInt(1,100) % 2 == 0) {
        startArgs.currentPlayerId = PlayerNames.PLAYER_1;
      } else {
        startArgs.currentPlayerId = PlayerNames.PLAYER_2;
      }
      this.currentPlayerTurn = startArgs.currentPlayerId;
      this.gameServiceBus.onGameStarted(startArgs);
    }
  }
  
  /// After a turn has been completed by the player's hud
  onTurnEnded(eventArgs: TurnEndedEventArgs) {
    this.currentPlayerTurn = eventArgs.currentPlayerId;
  }

  /// When a hud has notified us that their ships are all sunk.
  onGameEnded(eventArgs: GameEndedEventArgs) {
    this.inProcess = false;
    
    this.gameWinner = eventArgs.winnerId;
    this.hideGameMessage = false;
    if (this.randomGameTimer) {
      clearTimeout(this.randomGameTimer);
    }
  }

  startNewGame() {
    this.loadInitialState();
    this.hideGameMessage = true;
    this.gameServiceBus.onGameLoad(new LoadGameEventArgs());
  }

  randomGame() {
    this.hideGameMessage = true;
    this.autoPlay = true;
    this.hud1.placeAll();
    this.hud2.placeAll();

    this.hud1.setReady();
    this.hud2.setReady();
    
    this.randomGameTimer = setInterval(() => {
      console.log('Current player turn during interval: ' + this.currentPlayerTurn);
      this.onStartRandomGame(this.currentPlayerTurn);
    }, 100);
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onStartRandomGame(currentPlayerId: string) {
    let fireEventArgs = new TurnPlayedEventArgs();
    let randomRow = -1;
    let randomCell = -1;

    console.log(currentPlayerId + ' is attacking from the game-board.');
    fireEventArgs.currentPlayedId = currentPlayerId;

    while (fireEventArgs.targetCell == null) {
      randomRow = this.getRandomInt(1, 10);
      randomCell = this.getRandomInt(1, 10);
      
      switch (currentPlayerId) {
        case PlayerNames.PLAYER_1:
          if (this.hud1.localAttackGrid.rows[randomRow].cells[randomCell].hitStatus == HitStatus.Clear) {
            fireEventArgs.targetCell = this.hud1.localAttackGrid.rows[randomRow].cells[randomCell];
          } else {
            console.log('occupied player 1 cell....skipping.');
          }
          break;
        case PlayerNames.PLAYER_2:
          if (this.hud2.localAttackGrid.rows[randomRow].cells[randomCell].hitStatus == HitStatus.Clear) {
           fireEventArgs.targetCell = this.hud2.localAttackGrid.rows[randomRow].cells[randomCell];
          } else {
            console.log('occupied player 2 cell....skipping.');
          }
          break;
      }
    }
    console.log(currentPlayerId + ' is attacking row ' + randomRow + ', cell ' + randomCell);

    this.gameServiceBus.onPlayerMove(fireEventArgs);
  }
}
