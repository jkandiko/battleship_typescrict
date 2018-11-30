import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlayerReadyEventArgs } from './player-ready-event-args';
import { GameStartedEventArgs } from './game-started-event-args';
import { TurnPlayedEventArgs } from './turn-played-event-args';
import { TurnEndedEventArgs } from './turn-ended-event-args';
import { DamageReportEventArgs } from './damage-report-event-args';
import { GameEndedEventArgs } from './game-ended-event-args';
import { LoadGameEventArgs } from './load-game-event-args';
import { ServerSideGameService } from './server-side-game-service';

@Injectable()
export class GameServiceBus {
  private gameId = '';
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

  constructor(private serverSideGameService: ServerSideGameService) {
    this.serverSideGameService.requestGameId().subscribe((data) => {
      this.gameId = data.toString()
    });
  }
  /// Set the game to its initial state
  onGameLoad(eventArgs: LoadGameEventArgs) {
    this.serverSideGameService.requestGameId().subscribe((data) => {
      this.gameId = data.toString()
    });
    this.gameLoadHandler.next(eventArgs);
    this.recordServerSideEvent('onGameLoad', 'A new game has been loaded').subscribe(() => { console.log('Call Occurred.'); });
    
  }

  /// Player states that their board is locked and redy
  onPlayerReady(eventArgs: PlayerReadyEventArgs) {
    this.playerReadyHandler.next(eventArgs);

    this.recordServerSideEvent('onPlayerReady', eventArgs.playerId + ' is ready.').subscribe(() => { ; });
  }

  /// All players have locked their boards
  onGameStarted(eventArgs: GameStartedEventArgs) {
    this.gameStartedHandler.next(eventArgs);

    this.recordServerSideEvent('onGameStarted', eventArgs.currentPlayerId + ' is the current player.').subscribe(() => { ; });
  }

  /// Player 
  onPlayerMove(eventArgs: TurnPlayedEventArgs) {
    this.playerMoveHandler.next(eventArgs);

    this.recordServerSideEvent('onPlayerMove', eventArgs.currentPlayedId + ' moved.').subscribe(() => { ; });
  }

  onTurnPlayed(eventArgs: TurnPlayedEventArgs) {
    this.turnPlayHandler.next(eventArgs);

    this.recordServerSideEvent('onPlayerMove', eventArgs.currentPlayedId + ' moved.').subscribe(() => { ; });
  }

  onTurnEnded(eventArgs: TurnEndedEventArgs) {
    this.turnEndHandler.next(eventArgs);

    this.recordServerSideEvent('onTurnEnded', eventArgs.currentPlayerId + ' is the new player.').subscribe(() => { ; });
  }

  onDamageHandled(eventArgs: DamageReportEventArgs) {
    this.damageHandler.next(eventArgs);

    this.recordServerSideEvent('onDamageHandled', eventArgs.targetPlayerId + ' is handling the damage.').subscribe(() => { ; });
  }

  /// A player has lost the game.  Annouce results
  onGameEnded(eventArgs: GameEndedEventArgs) {
    this.gameEndedHandler.next(eventArgs);

    this.recordServerSideEvent('onGameEnded', eventArgs.winnerId + ' won the game.').subscribe(() => { ; });
  }

  recordServerSideEvent(name: string, message: string) {
    return this.serverSideGameService.recordEvent(this.gameId, name, message);
  }
}
