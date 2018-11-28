import { gridRow } from "./grid-row";
import { gridCell } from "./grid-cell";
import { gamePiece } from "./game-piece";
import { HitStatus } from "./enums";

export abstract class gameGrid {
  rowCount: number;
  cellCount: number;
  rows: gridRow[];

  constructor() {
    this.rowCount = 11;
    this.cellCount = 11;

    this.setupGrid();
  }

  setupGrid() {
    this.rows = [];
    for (var i: number = 0; i < this.rowCount; i++) {
      var newRow = new gridRow();

      for (var j: number = 0; j < this.cellCount; j++) {
        var newCell = new gridCell();
        newCell.cell = j;
        newCell.row = i;
        if (i == 0) {
          switch (j) {
            case 1: newCell.text = 'A'; break;
            case 2: newCell.text = 'B'; break;
            case 3: newCell.text = 'C'; break;
            case 4: newCell.text = 'D'; break;
            case 5: newCell.text = 'E'; break;
            case 6: newCell.text = 'F'; break;
            case 7: newCell.text = 'G'; break;
            case 8: newCell.text = 'H'; break;
            case 9: newCell.text = 'I'; break;
            case 10: newCell.text = 'J'; break;
          }
        } else {
          if (j > 0) {
            newCell.cssClass = 'pieceCell';
          }
        }
        if (i > 0) {
          if (j == 0) {
            newCell.text = i.toString();
          }
        }
        newRow.cells.push(newCell);
      }
      this.rows.push(newRow);
    }
  }

  reset() {
    for (let i: number = 1; i < this.rowCount; i++) {
      for (let j: number = 1; j < this.cellCount; j++) {
        this.rows[i].cells[j].unsetCell();
      }
    }
  }
}
