import { Component, OnInit, OnDestroy } from '@angular/core';
import { gameGrid } from '../game-grid';
import { HudServiceBus } from '../hud-service-bus';
import { PlayerReadyEventArgs } from '../player-ready-event-args';
import { Subscription } from 'rxjs';
import { FireEventArgs } from '../fire-event-args';
import { gridCell } from '../grid-cell';
import { DamageReportEventArgs } from '../damage-report-event-args';
import { gamePiece } from '../game-piece';
import { HitStatus } from '../enums';
import { LoadGameEventArgs } from '../load-game-event-args';
@Component({
  selector: 'app-attack-grid',
  templateUrl: './attack-grid.component.html',
  styleUrls: ['./attack-grid.component.css']
})

export class AttackGridComponent extends gameGrid implements OnInit, OnDestroy {
  public disabled: boolean;
  loadHudSubscription: Subscription;
  hudReadySubscription: Subscription;
  handleDamagesubscription: Subscription;
  sunkenShips: gamePiece[];

  public hitStatuses = HitStatus;

  constructor(private hudServiceBus: HudServiceBus) {
    super();
    this.loadInitialState();
    this.loadHudSubscription = this.hudServiceBus.loadHudHandlers$.subscribe(eventArgs => { this.onHudLoad(eventArgs); });
    this.hudReadySubscription = this.hudServiceBus.hudReadyHandlers$.subscribe(eventArgs => { this.onPlayerReady(eventArgs); });
    this.handleDamagesubscription = this.hudServiceBus.damageReportHandlers$.subscribe(eventArgs => { this.onHandleDamageReport(eventArgs); });
  }

  ngOnInit() { }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.loadHudSubscription.unsubscribe();
    this.hudReadySubscription.unsubscribe();
    this.handleDamagesubscription.unsubscribe();
  }

  loadInitialState() {
    this.disabled = true;
    this.sunkenShips = [];
    this.reset();
  }

  /// The hud is reporting to this component that an initial state should be set.
  onHudLoad(eventArgs: LoadGameEventArgs) {
    this.loadInitialState();
  }

  /// The hud has told us that the player has locked their board in place and is ready to play
  onPlayerReady(eventArgs: PlayerReadyEventArgs) {
    for (var i: number = 1; i < this.rowCount; i++) {
      for (var j: number = 1; j < this.cellCount; j++) {
        this.rows[i].cells[j].cssClass = 'hoverable';
        this.rows[i].cells[j].occupied = false;
        this.rows[i].cells[j].hitStatus = 0;
      }
    }
  }

  /// Make a move against an oppenent
  onFire(eventArgs, targetCell: gridCell) {
    if (targetCell.row == 0 || targetCell.cell == 0) {
      return;
    }
    if (targetCell.occupied) {
      return;
    }

    let fireArgs = new FireEventArgs();
    fireArgs.gridCell = targetCell;

    this.hudServiceBus.onFire(fireArgs);

    targetCell.occupied = true;
  }

  /// When an attack is made, this method will be called to determine the result of the attack
  onHandleDamageReport(eventArgs: DamageReportEventArgs) {
    var targetCell = eventArgs.targetCell;
    this.rows[eventArgs.targetCell.row].cells[eventArgs.targetCell.cell].hitStatus = targetCell.hitStatus;
    if (targetCell.hitStatus == 1) {
      if (targetCell.gamePiece.hitParts.length == targetCell.gamePiece.length) {
        this.sunkenShips.push(targetCell.gamePiece);
      }
    }
  }
}
