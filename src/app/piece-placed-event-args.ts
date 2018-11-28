import { gamePiece } from "./game-piece";
import { gridCell } from "./grid-cell";

export class PiecePlacedEventArgs {
  gamePiece: gamePiece;
  gridCell: gridCell;
  hud: string;
}
