import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ObjeniousDeviceLocation} from './objenious-device-location.model';
import {ObjeniousDevice} from './objenious-device-model';
import {ObjeniousDeviceState} from './objenious-device-state.model';
import {BalizDeviceData} from './baliz-device-data-model';
import {BalizDevice} from './baliz-device-model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  devicesUrl = 'http://localhost:8080/devices';

  constructor(private http: HttpClient) {
  }

  findAllObjeniousDevices(): Observable<Array<ObjeniousDevice>> {
    return this.http.get<Array<ObjeniousDevice>>(this.devicesUrl + '/objenious');
  }

  findStateForObjeniousDevice(deviceId: string): Observable<ObjeniousDeviceState> {
    return this.http.get<ObjeniousDeviceState>(this.devicesUrl + '/objenious/' + deviceId + '/state');
  }

  findAllLocationsForObjeniousDevice(deviceId: string): Observable<Array<ObjeniousDeviceLocation>> {
    return this.http.get<Array<ObjeniousDeviceLocation>>(this.devicesUrl + '/objenious/' + deviceId + '/locations');
  }

  findAllBalizDevices(): Observable<Array<BalizDevice>> {
    return this.http.get<Array<BalizDevice>>(this.devicesUrl + '/baliz');
  }

  findDataForBalizDevice(deviceId: string): Observable<Array<BalizDeviceData>> {
    return this.http.get<Array<BalizDeviceData>>(this.devicesUrl + '/baliz/' + deviceId + '/data');
  }
}
