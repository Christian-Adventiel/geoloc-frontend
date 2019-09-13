import {AfterViewInit, Component, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import {LatLng, LeafletMouseEvent} from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-draw';
import 'leaflet-routing-machine';
import {ObjeniousDevice} from '../shared/objenious-device-model';
import {BalizDevice} from '../shared/baliz-device-model';
import {DeviceService} from '../shared/device.service';
import {BalizDeviceData} from '../shared/baliz-device-data-model';
import {ObjeniousDeviceState} from '../shared/objenious-device-state.model';
import {environment} from '../../environments/environment';
import {MatSidenav, MatSnackBar} from '@angular/material';
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
  router = L.Routing.osrmv1({serviceUrl: 'http://localhost:5000/route/v1'});
  routing: L.Routing.Control;
  waypoints: Array<L.LatLng> = [];
  objeniousDevices: Array<ObjeniousDevice> = [];
  balizDevices: Array<BalizDevice> = [];
  selectedObjeniousDevices: Array<ObjeniousDevice>;
  selectedBalizDevices: Array<BalizDevice>;
  private routeDisplayed: Boolean = false;
  private departureMarker: L.Marker;
  histoEnabled: boolean;
  polyline: L.Polyline;
  private objeniousMarkers;
  private balizMarkers;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(private deviceService: DeviceService, private sidenavService: SidenavService, private snackBar: MatSnackBar) {
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

    // Polygon creation callback.
    this.map.on('draw:created', function (e) {
      const type = (e as any).layerType;
      const layer = (e as any).layer;

      if (type === 'polygon') {
        const polygonCoordinates = layer._latlngs;
        console.log(polygonCoordinates);

        const popup = L.popup()
          .setLatLng(polygonCoordinates)
          .setContent('<span><b>Nombre de devices</b></span><br/><input id="shapeName" type="text" value="2"/><br/><br/><span><b>Temps passé dans la zone<b/></span><br/><textarea id="shapeDesc" cols="25" rows="5">8 heures et 12 minutes</textarea><br/><br/>');
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

  private deleteRoute() {
    if (this.routing !== undefined) {
      this.map.removeControl(this.routing);
      this.removeDepartureMarker();
      this.routing = undefined;
      this.routeDisplayed = false;
    }
  }

  private generateRoute() {
    if (this.selectedBalizDevices !== undefined && this.selectedBalizDevices.length >= 1) {
      this.snackBar.open('Cliquez sur la carte pour sélectionner le point de départ.', 'Ok');
      this.map.on('click', (e: LeafletMouseEvent) => {
        if (this.departureMarker === undefined) {
          this.departureMarker = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
          this.updateDevicesRoute();
          this.snackBar.dismiss();
        }
      });
    } else {
      this.snackBar.open('Sélectionnez au moins 1 capteur.', 'Ok', {
        duration: 3000,
      });
    }
  }

  private removeDepartureMarker() {
    this.map.removeLayer(this.departureMarker);
    this.departureMarker = undefined;
  }

  private updateDevicesRoute() {

    if (this.routing === undefined) {
      this.routing = L.Routing.control({
        router: this.router,
        lineOptions: {
          styles: [{color: 'blue', opacity: 1, weight: 5}]
        },
        plan: L.Routing.plan(null, {
          createMarker: function (i, wp) {
            return null;
          },
          routeWhileDragging: false
        }),
      }).addTo(this.map);
      this.waypoints = [];
      this.waypoints.push(this.departureMarker.getLatLng());

      let itemsProcessed = 0;

      this.selectedBalizDevices.forEach(device => {
        this.deviceService.findDataForBalizDevice(device.id).subscribe(
          (deviceData: BalizDeviceData[]) => {
            const lastData = deviceData[deviceData.length - 1];
            if (lastData !== undefined) {
              const latLng = L.latLng(lastData.latitude, lastData.longitude);
              this.waypoints.push(latLng);
              itemsProcessed++;
              if (this.selectedBalizDevices.length === itemsProcessed) {
                this.routing.setWaypoints(this.reorderProperlyWaypoints(this.waypoints));
                this.routeDisplayed = true;
              }
            }
          },
          error => console.log(error)
        );
      });
    }
  }

  reorderProperlyWaypoints(waypoints: LatLng[]) {
    let wayPointsAndDistance = [];
    const numberOfWayPoints = waypoints.length;
    const waypointsCopy = Object.assign([], waypoints);
    const start = waypoints[0];
    const newWayPoints = [];
    newWayPoints.push(start);
    waypointsCopy.splice(0, 1);

    let previousWayPoint = start;
    while (newWayPoints.length !== numberOfWayPoints) {
      // First we fill the waypoints and distance array
      waypointsCopy.forEach(waypoint => {
        const distance = previousWayPoint.distanceTo(waypoint);
        wayPointsAndDistance.push({waypoint: waypoint, distance: distance});
      });
      // After that, we sort it by the distance, thus the first element will be the nearest waypoint
      wayPointsAndDistance.sort(function (a, b) {
        return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
      });
      // We assign it, as it is the previously used way point
      previousWayPoint = wayPointsAndDistance[0].waypoint;
      // We push it through the new way points array
      newWayPoints.push(previousWayPoint);
      // We remove it from the first way points array
      waypointsCopy.splice(waypointsCopy.indexOf(previousWayPoint), 1);
      // We pop the array containing way points and distance in order to do the job again
      wayPointsAndDistance = [];
    }

    return newWayPoints;
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
