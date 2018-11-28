import { Injectable } from '@angular/core';
import { PiecePlacedEventArgs } from './piece-placed-event-args';
import { Subject } from 'rxjs';
import { CellDropErrorEventArgs } from './cell-drop-error-event-args';
import { PlayerReadyEventArgs } from './player-ready-event-args';
import { FireEventArgs } from './fire-event-args';
import { TurnPlayedEventArgs } from './turn-played-event-args';
import { DamageReportEventArgs } from './damage-report-event-args';
import { LoadGameEventArgs } from './load-game-event-args';

@Injectable()
export class HudServiceBus {
  private loadHudHandler = new Subject<LoadGameEventArgs>();
  private piecePlacedHandler = new Subject<PiecePlacedEventArgs>();
  private pieceNotPlacedHandler = new Subject<CellDropErrorEventArgs>();
  private hudReadyHandler = new Subject<PlayerReadyEventArgs>();
  private fireHandler = new Subject<FireEventArgs>();
  private defendHandler = new Subject<TurnPlayedEventArgs>();
  private damageHandler = new Subject<DamageReportEventArgs>();
  private damageReportHandler = new Subject<DamageReportEventArgs>();
  private pieceSunkHandler = new Subject<DamageReportEventArgs>();
  private pieceReturnedHandler = new Subject<PiecePlacedEventArgs>();
  private allPiecesSunkHandler = new Subject<PlayerReadyEventArgs>();

  loadHudHandlers$ = this.loadHudHandler.asObservable();
  piecePlaceHandlers$ = this.piecePlacedHandler.asObservable();
  pieceNotPlacedHandlers$ = this.pieceNotPlacedHandler.asObservable();
  hudReadyHandlers$ = this.hudReadyHandler.asObservable();
  attackHandlers$ = this.fireHandler.asObservable();
  defendHandlers$ = this.defendHandler.asObservable();
  damageHandlers$ = this.damageHandler.asObservable();
  damageReportHandlers$ = this.damageReportHandler.asObservable();
  pieceSunkHandlers$ = this.pieceSunkHandler.asObservable();
  pieceReturnedHandlers$ = this.pieceReturnedHandler.asObservable();
  allPiecesSunkHandlers$ = this.allPiecesSunkHandler.asObservable();

  /// Set this hud to an initial state
  onHudLoaded(eventArgs: LoadGameEventArgs) {
    this.loadHudHandler.next(eventArgs);
  }

  /// Player has placed a piece onto their playing board
  onPiecePlaced(eventArgs: PiecePlacedEventArgs) {
    this.piecePlacedHandler.next(eventArgs);
  }

  /// If the piece is moved off the ship board, notify other components
  onPieceReturned(eventArgs: PiecePlacedEventArgs) {
    this.pieceReturnedHandler.next(eventArgs);
  }

  /// The piece did not go onto the playing board
  onPieceNotPlaced(eventArgs: CellDropErrorEventArgs) {
    this.pieceNotPlacedHandler.next(eventArgs);
  }

  onHudReady(eventArgs: PlayerReadyEventArgs) {
    this.hudReadyHandler.next(eventArgs);
  }

  /// A move from the attack grid took place
  onFire(eventArgs: FireEventArgs) {
    this.fireHandler.next(eventArgs);
  }

  /// When an attack from another player occurs, let all components know of the attack
  onDefend(eventArgs: TurnPlayedEventArgs) {
    this.defendHandler.next(eventArgs);
  }

  /// When the components had absorbed their damage, report back out to everyone what the damage was
  onDamageReport(eventArgs: DamageReportEventArgs) {
    this.damageHandler.next(eventArgs);
  }
  /// When the game bus tells the hud about the damage reported from another player, disseminate to all of this hud's components
  onHandleDamageReport(eventArgs: DamageReportEventArgs) {
    this.damageReportHandler.next(eventArgs);
  }

  /// When a piece is completely sunk, announce it to the hud
  onHandlePieceSunk(eventArgs: DamageReportEventArgs) {
    this.pieceSunkHandler.next(eventArgs);
  }

  /// When all the player's pieces are sunk, notify the HUD
  onAllPiecesSunk(eventArgs: PlayerReadyEventArgs) {
    this.allPiecesSunkHandler.next(eventArgs);
  }
}
