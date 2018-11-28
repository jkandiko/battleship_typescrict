import { gridCell } from "./grid-cell";

export class TurnPlayedEventArgs {
  currentPlayedId: string;
  targetCell: gridCell;
}
