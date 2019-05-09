import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {DeviceService} from '../shared/device.service';
import * as L from 'leaflet';
import 'leaflet.markercluster';
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
  _devices: Array<Device>;
  private markers = L.markerClusterGroup();

  @Input()
  set devices(devices: Array<Device>) {
    this._devices = devices;
    this.updateDevicesMarkers();
  }

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([48.09842, -1.797293], 12);

    L.tileLayer(TILES_URL, {
      attribution: 'Map',
      maxZoom: 19
    }).addTo(this.map);

    this.map.addLayer(this.markers);

    this.updateDevicesMarkers();
  }

  private updateDevicesMarkers() {
    this.markers.clearLayers();
    const myIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/marker-icon.png'
    });

    if (this._devices !== undefined) {
      this._devices.forEach(device => {
        this.deviceService.findStateForDevice(device.id).subscribe(
          (deviceState: DeviceState) => {
            L.marker([deviceState.lat, deviceState.lng], {icon: myIcon})
              .bindPopup(deviceState.id.toString())
              .addTo(this.markers).openPopup();
          },
          error => console.log(error)
        );
      });
    }
  }
}
