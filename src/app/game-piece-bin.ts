import { gamePiece } from "./game-piece";

export class GamePieceBin {
  gamePieces: gamePiece[];
  orientations: string[];

  constructor() {
    this.orientations = ['Horizontal', 'Vertical'];
    this.gamePieces = [];
  }

  loadPieces() {
    this.gamePieces.push(new gamePiece(0, "Aircraft Carrier", 5, false));
    this.gamePieces.push(new gamePiece(1, "Battleship", 4, false));
    this.gamePieces.push(new gamePiece(2, "Cruiser", 3, false));
    this.gamePieces.push(new gamePiece(3, "Destroyer", 2, false));
    this.gamePieces.push(new gamePiece(4, "Destroyer", 2, false));
    this.gamePieces.push(new gamePiece(5, "Submarine", 1, false));
    this.gamePieces.push(new gamePiece(6, "Submarine", 1, false));
  }
}
