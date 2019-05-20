import {AfterViewInit, Component, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import {ObjeniousDevice} from '../shared/objenious-device-model';
import {BalizDevice} from '../shared/baliz-device-model';
import {DeviceService} from '../shared/device.service';
import {BalizDeviceData} from '../shared/baliz-device-data-model';
import {ObjeniousDeviceState} from '../shared/objenious-device-state.model';
import {environment} from '../../environments/environment';
import {MatSidenav} from '@angular/material';
import {SidenavService} from '../shared/sidenav.service';
import {ObjeniousDeviceLocation} from '../shared/objenious-device-location.model';

const TILES_URL = environment.tilesUrl;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  // Main map component.
  map: L.Map;
  objeniousDevices: Array<ObjeniousDevice> = [];
  balizDevices: Array<BalizDevice> = [];
  selectedObjeniousDevices: Array<ObjeniousDevice>;
  selectedBalizDevices: Array<BalizDevice>;
  histoEnabled: boolean;
  polyline: L.Polyline;
  private objeniousMarkers;
  private balizMarkers;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(private deviceService: DeviceService, private sidenavService: SidenavService) {
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);

    this.map = L.map('map').setView([48.09842, -1.797293], 12);

    L.tileLayer(TILES_URL, {
      attribution: 'Map',
      maxZoom: 19
    }).addTo(this.map);

    this.objeniousMarkers = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        return L.divIcon({html: '' + cluster.getChildCount(), className: 'objenious-cluster', iconSize: null});
      }
    });

    this.balizMarkers = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        return L.divIcon({html: '' + cluster.getChildCount(), className: 'baliz-cluster', iconSize: null});
      }
    });

    this.map.addLayer(this.objeniousMarkers);
    this.map.addLayer(this.balizMarkers);

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

    if (this.selectedBalizDevices !== undefined) {
      this.selectedBalizDevices.forEach(device => {
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

    if (this.selectedObjeniousDevices !== undefined) {
      this.selectedObjeniousDevices.forEach(device => {
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

  onAreaListControlObjeniousChanged(list) {
    // Update markers.
    this.selectedObjeniousDevices = list.selectedOptions.selected.map(item => item.value);
    this.objeniousMarkers.clearLayers();
    this.updateObjeniousMarkers();
  }

  onAreaListControlBalizChanged(list) {
    // Update markers.
    this.selectedBalizDevices = list.selectedOptions.selected.map(item => item.value);
    this.balizMarkers.clearLayers();
    this.updateBalizMarkers();
  }

  toggleHisto() {
    this.histoEnabled = !this.histoEnabled;

    if (!this.histoEnabled) {
      this.polyline.remove();
    } else {
      this.selectedObjeniousDevices.forEach(device => {
        this.deviceService.findAllLocationsForObjeniousDevice(device.id).subscribe(
          (locations: Array<ObjeniousDeviceLocation>) => {
            const pointList = [];
            locations.forEach(location => {
              const point = new L.LatLng(location.latitude, location.longitude);
              pointList.push(point);
            });
            this.polyline = new L.Polyline(pointList, {
              color: 'red',
              weight: 3,
              opacity: 0.5,
              smoothFactor: 1
            });
            this.polyline.addTo(this.map);
          });
      });
    }
  }
}
