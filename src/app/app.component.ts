import {Component} from '@angular/core';
import {Device} from './shared/device-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'geoloc-frontend';
  devices: Array<Device>;

  onDevicesUpdated(devices: Array<Device>) {
    this.devices = devices;
  }
}
