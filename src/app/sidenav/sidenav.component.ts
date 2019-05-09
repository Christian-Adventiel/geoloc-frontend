import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Device} from '../shared/device-model';
import {DeviceService} from '../shared/device.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output()
  devicesUpdated = new EventEmitter<Array<Device>>();

  devices: Array<Device>;
  selectedDevices: Array<Device>;

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.deviceService.findAll().subscribe(
      (data: Array<Device>) => {
        this.devices = data;
      },
      error => console.log(error)
    );
  }

  onAreaListControlChanged(list) {
    // Update markers.
    this.selectedDevices = list.selectedOptions.selected.map(item => item.value);
    this.devicesUpdated.next(this.selectedDevices);
  }
}
