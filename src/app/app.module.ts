import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HudComponent } from './hud/hud.component';
import { ShipGridComponent } from './ship-grid/ship-grid.component';
import { AttackGridComponent } from './attack-grid/attack-grid.component';
import { PieceBinComponent } from './piece-bin/piece-bin.component';
import { GameBoardComponent } from './game-board/game-board.component';


@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    HudComponent,
    ShipGridComponent,
    AttackGridComponent,
    PieceBinComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
