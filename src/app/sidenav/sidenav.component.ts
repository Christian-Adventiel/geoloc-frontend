import {Component, OnInit} from '@angular/core';
import {Device} from '../shared/device-model';
import {DeviceService} from '../shared/device.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  devices: Array<Device>;

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
}
