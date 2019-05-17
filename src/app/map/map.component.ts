import {AfterViewInit, Component, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-draw';
import 'leaflet-routing-machine';
import {ObjeniousDevice} from '../shared/objenious-device-model';
import {BalizDevice} from '../shared/baliz-device-model';
import {DeviceService} from '../shared/device.service';
import {BalizDeviceData} from '../shared/baliz-device-data-model';
import {ObjeniousDeviceState} from '../shared/objenious-device-state.model';
import {environment} from '../../environments/environment';
import {MatSidenav} from '@angular/material';
import {SidenavService} from '../shared/sidenav.service';

const TILES_URL = environment.tilesUrl;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  // Main map component.
  map: L.Map;
  router = L.Routing.osrmv1({serviceUrl: 'http://localhost:5000/route/v1'});
  routing: L.Routing.Control;
  waypoints: Array<L.LatLng> = [];
  objeniousDevices: Array<ObjeniousDevice> = [];
  balizDevices: Array<BalizDevice> = [];
  selectedObjeniousDevices: Array<ObjeniousDevice>;
  selectedBalizDevices: Array<BalizDevice>;
  private objeniousMarkers;
  private balizMarkers;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(private deviceService: DeviceService, private sidenavService: SidenavService) {
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);

    // Creates the map with tiles.
    this.map = L.map('map').setView([48.09842, -1.797293], 12);

    L.tileLayer(TILES_URL, {
      attribution: 'Map',
      maxZoom: 19
    }).addTo(this.map);


    const polygonsLayer = new L.FeatureGroup();
    const drawPluginOptions = {
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Hummmmm....<strong> Bien tenté'
          },
          shapeOptions: {
            color: '#97009c'
          }
        },
        polyline: {},
        circle: {},
        rectangle: {},
        marker: {}
      },
      edit: {
        featureGroup: polygonsLayer,
        remove: true
      }
    };

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw(drawPluginOptions);
    this.map.addControl(drawControl);

    this.map.addLayer(polygonsLayer);


    // Creates markers groups.
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

    // Get all devices.
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
    this.updateDevicesRoute();

    // Polygon creation callback.
    this.map.on('draw:created', function (e) {
      const type = (e as any).layerType;
      const layer = (e as any).layer;

      if (type === 'polygon') {
        const polygonCoordinates = layer._latlngs;
        console.log(polygonCoordinates);

        const popup = L.popup()
          .setLatLng(polygonCoordinates)
          .setContent('<span><b>Nombre de devices</b></span><br/><input id="shapeName" type="text" value="3"/><br/><br/><span><b>Temps passé dans la zone<b/></span><br/><textarea id="shapeDesc" cols="25" rows="5">12 minutes</textarea><br/><br/>');
        layer.bindPopup(popup);

        polygonsLayer.addLayer(layer);
      }
    });
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

  private updateDevicesRoute() {
    if (this.routing === undefined) {
      this.routing = L.Routing.control({
        router: this.router,
        lineOptions: {
          styles: [{color: 'yellow', opacity: 1, weight: 5}]
        },


      }).addTo(this.map);
    }

    this.waypoints = [];

    if (this.selectedBalizDevices !== undefined) {
      this.selectedBalizDevices.forEach(device => {
        this.deviceService.findDataForBalizDevice(device.id).subscribe(
          (deviceData: BalizDeviceData[]) => {
            const lastData = deviceData[deviceData.length - 1];
            if (lastData !== undefined) {
              this.waypoints.push(L.latLng(lastData.latitude, lastData.longitude));
            }
            console.log(this.waypoints);
            this.routing.setWaypoints(this.waypoints);
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
    this.updateDevicesRoute();
  }
}
