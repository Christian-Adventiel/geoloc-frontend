import {Component, OnInit} from '@angular/core';
import {Device} from './shared/device-model';
import {DeviceService} from './shared/device.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'geoloc-frontend';
  allDevices: Array<Device>;
  selectedDevices: Array<Device>;

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.deviceService.findAll().subscribe(
      (data: Array<Device>) => {
        this.allDevices = data;
      },
      error => console.log(error)
    );
  }

  onDevicesUpdated(devices: Array<Device>) {
    this.selectedDevices = devices;
  }
}
