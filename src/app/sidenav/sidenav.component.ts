import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ObjeniousDevice} from '../shared/objenious-device-model';
import {BalizDevice} from '../shared/baliz-device-model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output()
  objeniousDevicesUpdated = new EventEmitter<Array<ObjeniousDevice>>();

  @Input()
  objeniousDevices: Array<ObjeniousDevice>;

  @Output()
  balizDevicesUpdated = new EventEmitter<Array<BalizDevice>>();

  @Input()
  balizDevices: Array<BalizDevice>;

  selectedObjeniousDevices: Array<ObjeniousDevice>;
  selectedBalizDevices: Array<BalizDevice>;

  constructor() {
  }

  ngOnInit(): void {
  }

  onAreaListControlObjeniousChanged(list) {
    // Update markers.
    this.selectedObjeniousDevices = list.selectedOptions.selected.map(item => item.value);
    this.objeniousDevicesUpdated.next(this.selectedObjeniousDevices);
  }

  onAreaListControlBalizChanged(list) {
    // Update markers.
    this.selectedBalizDevices = list.selectedOptions.selected.map(item => item.value);
    this.balizDevicesUpdated.next(this.selectedBalizDevices);
  }
}
