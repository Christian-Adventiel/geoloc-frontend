import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {DeviceService} from '../shared/device.service';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import {ObjeniousDevice} from '../shared/objenious-device-model';
import {ObjeniousDeviceState} from '../shared/objenious-device-state.model';
import {BalizDevice} from '../shared/baliz-device-model';
import {BalizDeviceData} from '../shared/baliz-device-data-model';
import {last} from 'rxjs/operators';

const TILES_URL = environment.tilesUrl;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  // Main map component.
  map: L.Map;
  _objeniousDevices: Array<ObjeniousDevice> = [];
  _balizDevices: Array<BalizDevice> = [];
  private objeniousMarkers = L.markerClusterGroup();
  private balizMarkers = L.markerClusterGroup();

  @Input()
  set objeniousDevices(devices: Array<ObjeniousDevice>) {
    this._objeniousDevices = devices;
    this.objeniousMarkers.clearLayers();
    this.updateObjeniousMarkers();
  }

  @Input()
  set balizDevices(devices: Array<BalizDevice>) {
    this._balizDevices = devices;
    this.balizMarkers.clearLayers();
    this.updateBalizMarkers();
  }

  constructor(private deviceService: DeviceService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([48.09842, -1.797293], 12);

    L.tileLayer(TILES_URL, {
      attribution: 'Map',
      maxZoom: 19
    }).addTo(this.map);

    this.map.addLayer(this.objeniousMarkers);
    this.map.addLayer(this.balizMarkers);

    this.updateDevicesMarkers();
  }

  private updateDevicesMarkers() {
    this.objeniousMarkers.clearLayers();
    this.balizMarkers.clearLayers();
    this.updateObjeniousMarkers();
    this.updateBalizMarkers();
  }

  private updateBalizMarkers() {
    const balizIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
    });

    if (this._balizDevices !== undefined) {
      this._balizDevices.forEach(device => {
        this.deviceService.findDataForBalizDevice(device.id).subscribe(
          (deviceData: BalizDeviceData[]) => {
            const lastData = deviceData[deviceData.length - 1];
            if (lastData !== undefined) {
              L.marker([lastData.latitude, lastData.longitude], {icon: balizIcon, title: 'balizDevice'})
                .bindPopup(device.id.toString())
                .addTo(this.balizMarkers).openPopup();
            }
          },
          error => console.log(error)
        );
      });
    }
  }

  private updateObjeniousMarkers() {
    const objeniousIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/marker-icon.png'
    });

    if (this._objeniousDevices !== undefined) {
      this._objeniousDevices.forEach(device => {
        this.deviceService.findStateForObjeniousDevice(device.id).subscribe(
          (deviceState: ObjeniousDeviceState) => {
            L.marker([deviceState.lat, deviceState.lng], {icon: objeniousIcon, title: 'objeniousDevice'})
              .bindPopup(deviceState.id.toString())
              .addTo(this.objeniousMarkers).openPopup();
          },
          error => console.log(error)
        );
      });
    }
  }
}
