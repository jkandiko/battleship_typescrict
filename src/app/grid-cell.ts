import { gamePiece } from "./game-piece";
import { HitStatus } from './enums';

export class gridCell {
  text: string;
  cssClass: string;
  row: number;
  cell: number;
  occupied: boolean;
  gamePiece: gamePiece;
  gamePieceIndex: number;
  hitStatus: HitStatus; // 0 - clear, 1 - hit, 2 missed
  constructor() {
    this.occupied = false;
  }

  unsetCell() {
    this.text = '';
    this.occupied = false;
    this.gamePiece = null;
    this.gamePieceIndex = -1;
    this.hitStatus = HitStatus.Clear;
  }
}
