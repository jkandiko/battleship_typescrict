import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GamePieceBin } from '../game-piece-bin';
import { gamePiece } from '../game-piece';
import { PiecePlacedEventArgs } from '../piece-placed-event-args';
import { CellDropErrorEventArgs } from '../cell-drop-error-event-args';
import { HudServiceBus } from '../hud-service-bus';
import { Subscription } from 'rxjs';
import { PlayerReadyEventArgs } from '../player-ready-event-args';
import { gridCell } from '../grid-cell';
import { LoadGameEventArgs } from '../load-game-event-args';

@Component({
  selector: 'app-piece-bin',
  templateUrl: './piece-bin.component.html',
  styleUrls: ['./piece-bin.component.css']
})

export class PieceBinComponent extends GamePieceBin implements OnInit, OnDestroy {
  selectedOrientation: string;
  gameBinMessage: string;
  loadHudSubscription: Subscription;
  playerReadySubscription: Subscription;
  pieceNotPlacedSubscription: Subscription;
  @Input() playerId: string;
  @Input() hudId: string;

  constructor(private hudServiceBus: HudServiceBus) {
    super();
    this.loadHudSubscription = this.hudServiceBus.loadHudHandlers$.subscribe(eventArgs => { this.onHudLoad(eventArgs); });
    this.playerReadySubscription = this.hudServiceBus.piecePlaceHandlers$.subscribe(eventArgs => { this.onPiecePlaced(eventArgs); });
    this.pieceNotPlacedSubscription = this.hudServiceBus.pieceNotPlacedHandlers$.subscribe(eventArgs => { this.onGamePieceNotPlace(eventArgs); });
    this.selectedOrientation = "Horizontal";
  }

  ngOnInit() {  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.loadHudSubscription.unsubscribe();
    this.playerReadySubscription.unsubscribe();
    this.pieceNotPlacedSubscription.unsubscribe();
  }

  onHudLoad(eventArgs: LoadGameEventArgs) {
    this.selectedOrientation = "Horizontal";
    this.loadPieces();
  }

  drag(ev, gamePiece: gamePiece) {
    this.gameBinMessage = '';
    ev.dataTransfer.setData("hudId", this.hudId);
    gamePiece.vertical = (this.selectedOrientation == "Vertical");
    ev.dataTransfer.setData("gamePiece", JSON.stringify(gamePiece));
  }

  onPiecePlaced(eventArgs: PiecePlacedEventArgs) {
    var index = this.gamePieces.findIndex(function (element) { return element.id == eventArgs.gamePiece.id });
    this.gamePieces.splice(index, 1);
  }

  onGamePieceNotPlace(eventArgs: CellDropErrorEventArgs) {
    this.gameBinMessage = eventArgs.message;
  }

  playerReady() {
    var args = new PlayerReadyEventArgs();
    args.playerId = this.hudId;
    this.hudServiceBus.onHudReady(args);
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.getData("hudId") != this.hudId) {
      return;
    }
    if (!event.dataTransfer.getData("gamePiece") || !event.dataTransfer.getData("sourceCell")) {
      return;
    }
    let targetCell = JSON.parse(event.dataTransfer.getData("sourceCell")) as gridCell;
    if (targetCell.row == 0 || targetCell.cell == 0) {
      return;
    }
    let gamePiece = JSON.parse(event.dataTransfer.getData("gamePiece")) as gamePiece;
    this.gamePieces.push(gamePiece);

    let pieceReturnedArgs = new PiecePlacedEventArgs();
    pieceReturnedArgs.gamePiece = gamePiece;
    pieceReturnedArgs.gridCell = targetCell;
    pieceReturnedArgs.hud = this.hudId;
    this.hudServiceBus.onPieceReturned(pieceReturnedArgs);
  }

  onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }
}
