import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { gameGrid } from '../game-grid';
import { gamePiece } from '../game-piece';
import { gridCell } from '../grid-cell';
import { PiecePlacedEventArgs } from '../piece-placed-event-args';
import { CellDropErrorEventArgs } from '../cell-drop-error-event-args';
import { HudServiceBus } from '../hud-service-bus';
import { Subscription } from 'rxjs';
import { PlayerReadyEventArgs } from '../player-ready-event-args';
import { TurnPlayedEventArgs } from '../turn-played-event-args';
import { DamageReportEventArgs } from '../damage-report-event-args';
import { LoadGameEventArgs } from '../load-game-event-args';

@Component({
  selector: 'app-ship-grid',
  templateUrl: './ship-grid.component.html',
  styleUrls: ['./ship-grid.component.css']
})

export class ShipGridComponent extends gameGrid implements OnInit, OnDestroy {
  @Input() hudId: string;
  boardDraggable: boolean;
  sunkShips: gamePiece[];
  shipCount: number;

  loadHudSubscription: Subscription;
  playerReadySubscription: Subscription;
  defendSubscription: Subscription;
  pieceSunkSubscription: Subscription;
  pieceReturnedSubscription: Subscription;

  constructor(private hudServiceBus: HudServiceBus) {
    super();
    this.boardDraggable = true;
    this.sunkShips = [];
    this.shipCount = 0;

    this.loadHudSubscription = this.hudServiceBus.loadHudHandlers$.subscribe(eventArgs => { this.onHudLoad(eventArgs); });
    this.playerReadySubscription = this.hudServiceBus.hudReadyHandlers$.subscribe(eventArgs => { this.onPlayerReady(eventArgs); });
    this.defendSubscription = this.hudServiceBus.defendHandlers$.subscribe(eventArgs => { this.onDefend(eventArgs); });
    this.pieceSunkSubscription = this.hudServiceBus.pieceSunkHandlers$.subscribe(eventArgs => { this.onPieceSunk(eventArgs); });
    this.pieceReturnedSubscription = this.hudServiceBus.pieceReturnedHandlers$.subscribe(eventArgs => { this.onPieceReturned(eventArgs); });
  }

  ngOnInit() { }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.playerReadySubscription.unsubscribe();
    this.defendSubscription.unsubscribe();
    this.pieceSunkSubscription.unsubscribe();
    this.pieceReturnedSubscription.unsubscribe();
  }

  onHudLoad(eventArgs: LoadGameEventArgs) {
    this.boardDraggable = true;
    this.sunkShips = [];
    this.shipCount = 0;
    this.reset();
  }

  onDrop(event, targetCell : gridCell) {
    event.preventDefault();
    event.stopPropagation();

    if (!event.dataTransfer.getData("gamePiece")) {
      return;
    }
    if (event.dataTransfer.getData("hudId") != this.hudId) {
      return;
    }
    if (targetCell.row == 0 || targetCell.cell == 0) {
      return;
    }
    var gamePiece = JSON.parse(event.dataTransfer.getData("gamePiece")) as gamePiece;
    let sourceCell = null;
    if (event.dataTransfer.getData("sourceCell")) {
      sourceCell = JSON.parse(event.dataTransfer.getData("sourceCell")) as gridCell;
    }
    
    this.addShip(gamePiece, targetCell, sourceCell);
    
  }

  addShip(gamePiece: gamePiece, targetCell: gridCell, _sourceCell: gridCell) {
    let sourceCell: gridCell = null;
    if (_sourceCell) {
      sourceCell = _sourceCell;
    }
    // is the target drop cell already occupied
    if (targetCell.occupied) {
      if (sourceCell == null) {
        this.raisePieceNotPlaced("Cell already occupied", targetCell);
        return;
      } else {
        if (sourceCell.gamePiece.id != targetCell.gamePiece.id) {
          this.raisePieceNotPlaced("Cell already occupied", targetCell);
          return;
        }
      }
    }

    let startIndex: number = -1;
    let endIndex: number = -1;
    if (gamePiece.vertical) {
      startIndex = targetCell.row;
      endIndex = targetCell.row + gamePiece.length;
    } else {
      startIndex = targetCell.cell;
      endIndex = targetCell.cell + gamePiece.length;
    }
    let length: number = gamePiece.length;
    let gamePieceIndex: number = 0;

    if (sourceCell) {
      startIndex = startIndex - sourceCell.gamePieceIndex;
      endIndex = gamePiece.length + startIndex;
      length = gamePiece.length;
    }
    if (gamePiece.vertical) {
      // is the piece too long to fit
      if (endIndex > this.rowCount) {
        this.raisePieceNotPlaced("Piece is too long", targetCell);
        return;
      }

      for (var i: number = startIndex; i < endIndex; i++) {
        if (this.rows[i].cells[targetCell.cell].occupied) {
          if (sourceCell == null) {
            this.raisePieceNotPlaced("Piece overlaps other pieces", targetCell);
            return;
          } else {
            if (sourceCell.gamePiece.id != this.rows[i].cells[targetCell.cell].gamePiece.id) {
              this.raisePieceNotPlaced("Piece overlaps other pieces", targetCell);
              return;
            }
          }
        }
      }

      if (sourceCell) {
        // We moved the piece, but let's remove the occupation before placing anew
        this.onPieceMoved(sourceCell);
      }
      // if we have passed validation, drop the piece onto the board
      for (var i: number = startIndex; i < endIndex; i++) {
        this.rows[i].cells[targetCell.cell].occupied = true;
        this.rows[i].cells[targetCell.cell].gamePiece = gamePiece;
        this.rows[i].cells[targetCell.cell].gamePieceIndex = gamePieceIndex;
        gamePieceIndex++;
      }
    } else {
      // is the piece too long to fit
      if (endIndex > this.cellCount) {
        this.raisePieceNotPlaced("Piece is too long", targetCell);
        return;
      }

      for (var i: number = startIndex; i < endIndex; i++) {
        if (this.rows[targetCell.row].cells[i].occupied) {
          if (sourceCell == null) {
            this.raisePieceNotPlaced("Piece overlaps other pieces", targetCell);
            return;
          } else {
            if (sourceCell.gamePiece.id != this.rows[targetCell.row].cells[i].gamePiece.id) {
              this.raisePieceNotPlaced("Piece overlaps other pieces", targetCell);
              return;
            }
          }
        }
      }

      if (sourceCell) {
        // We moved the piece, but let's remove the occupation before placing anew
        this.onPieceMoved(sourceCell);
      }
      // if we have passed validation, drop the piece onto the board
      for (var i: number = startIndex; i < endIndex; i++) {
        this.rows[targetCell.row].cells[i].occupied = true;
        this.rows[targetCell.row].cells[i].gamePiece = gamePiece;
        this.rows[targetCell.row].cells[i].gamePieceIndex = gamePieceIndex;
        gamePieceIndex++;
      }
    }

    if (!sourceCell) {
      var eventArgs = new PiecePlacedEventArgs();
      eventArgs.gamePiece = gamePiece;
      eventArgs.gridCell = targetCell;
      this.hudServiceBus.onPiecePlaced(eventArgs);
      this.shipCount++;
    }
  }

  onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  onDrag(ev, targetCell: gridCell) {
    ev.stopPropagation();
    if (!this.boardDraggable) {
      return;
    }
    if (targetCell.gamePiece) {
      var gamePieceJson = JSON.stringify(targetCell.gamePiece);
      var cellJson = JSON.stringify(targetCell);
      ev.dataTransfer.setData("gamePiece", gamePieceJson);
      ev.dataTransfer.setData("sourceCell", cellJson);
      ev.dataTransfer.setData("hudId", this.hudId);
    }
  }

  raisePieceNotPlaced(message: string, targetCell: gridCell) {
    var ret = new CellDropErrorEventArgs();
    ret.gridCell = targetCell;
    ret.message = message;
    this.hudServiceBus.onPieceNotPlaced(ret);
  }

  onPieceMoved(sourceCell: gridCell) {
    var initial = sourceCell.gamePieceIndex;
    var end = sourceCell.gamePiece.length - initial;
    
    if (sourceCell.gamePiece.vertical) {
      for (var i: number = sourceCell.gamePieceIndex; i > 0; i--) {
        this.rows[sourceCell.row - i].cells[sourceCell.cell].unsetCell();
      }

      this.rows[sourceCell.row].cells[sourceCell.cell].unsetCell();

      for (var i: number = 1; i < sourceCell.gamePiece.length - sourceCell.gamePieceIndex; i++) {
        this.rows[sourceCell.row + i].cells[sourceCell.cell].unsetCell();
      }
    } else {
      for (var i: number = sourceCell.gamePieceIndex; i > 0; i--) {
        this.rows[sourceCell.row].cells[sourceCell.cell - i].unsetCell();
      }
      this.rows[sourceCell.row].cells[sourceCell.cell].unsetCell();
      for (var i: number = 1; i < sourceCell.gamePiece.length - sourceCell.gamePieceIndex; i++) {
        this.rows[sourceCell.row].cells[sourceCell.cell + i].unsetCell();
      }
    }
    
  }

  onPlayerReady(eventArgs: PlayerReadyEventArgs) {
    this.boardDraggable = false;
  }

  onDefend(eventArgs: TurnPlayedEventArgs) {
    for (let i: number = 1; i < this.rowCount; i++) {
      for (let j: number = 1; j < this.cellCount; j++) {
        if (eventArgs.targetCell.row == i && eventArgs.targetCell.cell == j) {
          let cell = this.rows[i].cells[j];
          if (cell.occupied) {
            cell.hitStatus = 1;
            cell.gamePiece.hitParts.push(cell.gamePieceIndex);
          } else {
            cell.hitStatus = 2;
          }

          let damageReport = new DamageReportEventArgs();
          damageReport.targetCell = this.rows[i].cells[j];
          this.hudServiceBus.onDamageReport(damageReport);
        }
      }
    }
  }

  onPieceSunk(eventArgs: DamageReportEventArgs) {
    this.sunkShips.push(eventArgs.targetCell.gamePiece);

    if (this.shipCount == this.sunkShips.length) {
      let allSunkArgs = new PlayerReadyEventArgs();
      allSunkArgs.playerId = this.hudId;
      this.hudServiceBus.onAllPiecesSunk(allSunkArgs);
    }
  }

  onPieceReturned(eventArgs: PiecePlacedEventArgs) {
    if (eventArgs.hud != this.hudId) {
      return;
    }
    let sourceCell = eventArgs.gridCell;
    if (sourceCell.gamePiece.vertical) {
      for (var i: number = sourceCell.gamePieceIndex; i > 0; i--) {
        this.rows[sourceCell.row - i].cells[sourceCell.cell].unsetCell();
      }

      this.rows[sourceCell.row].cells[sourceCell.cell].unsetCell();

      for (var i: number = 1; i < sourceCell.gamePiece.length - sourceCell.gamePieceIndex; i++) {
        this.rows[sourceCell.row + i].cells[sourceCell.cell].unsetCell();
      }
    } else {
      for (var i: number = sourceCell.gamePieceIndex; i > 0; i--) {
        this.rows[sourceCell.row].cells[sourceCell.cell - i].unsetCell();
      }
      this.rows[sourceCell.row].cells[sourceCell.cell].unsetCell();
      for (var i: number = 1; i < sourceCell.gamePiece.length - sourceCell.gamePieceIndex; i++) {
        this.rows[sourceCell.row].cells[sourceCell.cell + i].unsetCell();
      }
    }
  }

}
