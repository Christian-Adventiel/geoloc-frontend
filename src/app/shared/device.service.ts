import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DeviceLocation} from './device-location.model';
import {Device} from './device-model';
import {DeviceState} from './device-state.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<Array<Device>> {
    return this.http.get<Array<Device>>('http://localhost:8080/devices');
  }

  findStateForDevice(deviceId: string): Observable<DeviceState> {
    console.log(deviceId);
    return this.http.get<DeviceState>('http://localhost:8080/device/' + deviceId + '/state');
  }

  findAllLocationsForDevice(deviceId: string): Observable<Array<DeviceLocation>> {
    return this.http.get<Array<DeviceLocation>>('http://localhost:8080/device/' + deviceId + '/locations');
  }
}
