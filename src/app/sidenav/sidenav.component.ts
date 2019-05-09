import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Device} from '../shared/device-model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output()
  devicesUpdated = new EventEmitter<Array<Device>>();

  @Input()
  devices: Array<Device>;

  selectedDevices: Array<Device>;

  constructor() {
  }

  ngOnInit(): void {
  }

  onAreaListControlChanged(list) {
    // Update markers.
    this.selectedDevices = list.selectedOptions.selected.map(item => item.value);
    this.devicesUpdated.next(this.selectedDevices);
  }
}
