export class gamePiece {
  length: number;
  name: String;
  vertical: boolean;
  id: number;
  hitParts: number[];
  constructor(id: number, theName: string, theLength: number, isVertical: boolean) {
    this.id = id;
    this.length = theLength;
    this.name = theName;
    this.vertical = isVertical;
    this.hitParts = [];
  }
}

