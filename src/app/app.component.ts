import {Component, OnInit} from '@angular/core';
import {ObjeniousDevice} from './shared/objenious-device-model';
import {DeviceService} from './shared/device.service';
import {BalizDevice} from './shared/baliz-device-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'geoloc-frontend';
  objeniousDevices: Array<ObjeniousDevice> = [];
  balizDevices: Array<BalizDevice> = [];
  selectedObjeniousDevices: Array<ObjeniousDevice>;
  selectedBalizDevices: Array<BalizDevice>;

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.deviceService.findAllObjeniousDevices().subscribe(
      (data: Array<ObjeniousDevice>) => {
        data.forEach(objeniousDevice => this.objeniousDevices.push(objeniousDevice));
      },
      error => console.log(error)
    );
    this.deviceService.findAllBalizDevices().subscribe(
      (data: Array<BalizDevice>) => {
        data.forEach(balizDevice => this.balizDevices.push(balizDevice));
      }
    );
  }

  onObjeniousDevicesUpdated(devices: Array<ObjeniousDevice>) {
    this.selectedObjeniousDevices = devices;
  }

  onBalizDevicesUpdated(devices: Array<BalizDevice>) {
    this.selectedBalizDevices = devices;
  }
}
