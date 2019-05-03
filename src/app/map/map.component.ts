import {Component, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {DeviceService} from '../shared/device.service';
import * as L from 'leaflet';
import {Device} from '../shared/device-model';
import {DeviceState} from '../shared/device-state.model';

const TILES_URL = environment.tilesUrl;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  // Main map component.
  map: L.Map;
  devices: Array<Device>;

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([48.09842, -1.797293], 12);

    L.tileLayer(TILES_URL, {
      attribution: 'Map',
      maxZoom: 19
    }).addTo(this.map);

    this.deviceService.findAll().subscribe(
      (data: Array<Device>) => {
        this.devices = data;
        this.initDevicesMarkers();
      },
      error => console.log(error)
    );
  }

  private initDevicesMarkers() {
    const myIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/marker-icon.png'
    });

    if (this.devices !== undefined) {
      this.devices.forEach(device => {
        console.log('init marker for device: ' + device.id);

        this.deviceService.findStateForDevice(device.id).subscribe(
          (deviceState: DeviceState) => {
            L.marker([deviceState.lat, deviceState.lng], {icon: myIcon}).bindPopup(deviceState.id.toString()).addTo(this.map).openPopup();
          },
          error => console.log(error)
        );

        console.log('Marker added!');
      });
    }
  }
}
