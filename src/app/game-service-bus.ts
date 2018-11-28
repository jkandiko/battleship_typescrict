import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlayerReadyEventArgs } from './player-ready-event-args';
import { GameStartedEventArgs } from './game-started-event-args';
import { TurnPlayedEventArgs } from './turn-played-event-args';
import { TurnEndedEventArgs } from './turn-ended-event-args';
import { DamageReportEventArgs } from './damage-report-event-args';
import { GameEndedEventArgs } from './game-ended-event-args';
import { LoadGameEventArgs } from './load-game-event-args';

@Injectable()
export class GameServiceBus {
  private gameLoadHandler = new Subject<LoadGameEventArgs>();
  private playerReadyHandler = new Subject<PlayerReadyEventArgs>();
  private gameStartedHandler = new Subject<GameStartedEventArgs>();
  private playerMoveHandler = new Subject<TurnPlayedEventArgs>();
  private turnPlayHandler = new Subject<TurnPlayedEventArgs>();
  private turnEndHandler = new Subject<TurnEndedEventArgs>();
  private damageHandler = new Subject<DamageReportEventArgs>();
  private gameEndedHandler = new Subject<GameEndedEventArgs>();

  loadGameHandlers$ = this.gameLoadHandler.asObservable();
  playerReadyHandlers$ = this.playerReadyHandler.asObservable();
  gameStartedHandlers$ = this.gameStartedHandler.asObservable();
  playerMoveHandlers$ = this.playerMoveHandler.asObservable();
  turnPlayHandlers$ = this.turnPlayHandler.asObservable();
  turnEndedHandlers$ = this.turnEndHandler.asObservable();
  damageHandlers$ = this.damageHandler.asObservable();
  gameEndedHandlers$ = this.gameEndedHandler.asObservable();

  /// Set the game to its initial state
  onGameLoad(eventArgs: LoadGameEventArgs) {
    this.gameLoadHandler.next(eventArgs);
  }

  /// Player states that their board is locked and redy
  onPlayerReady(eventArgs: PlayerReadyEventArgs) {
    this.playerReadyHandler.next(eventArgs);
  }

  /// All players have locked their boards
  onGameStarted(eventArgs: GameStartedEventArgs) {
    this.gameStartedHandler.next(eventArgs);
  }

  /// Player 
  onPlayerMove(eventArgs: TurnPlayedEventArgs) {
    this.playerMoveHandler.next(eventArgs);
  }

  onTurnPlayed(eventArgs: TurnPlayedEventArgs) {
    this.turnPlayHandler.next(eventArgs);
  }

  onTurnEnded(eventArgs: TurnEndedEventArgs) {
    this.turnEndHandler.next(eventArgs);
  }

  onDamageHandled(eventArgs: DamageReportEventArgs) {
    this.damageHandler.next(eventArgs);
  }

  /// A player has lost the game.  Annouce results
  onGameEnded(eventArgs: GameEndedEventArgs) {
    this.gameEndedHandler.next(eventArgs);
  }
}
