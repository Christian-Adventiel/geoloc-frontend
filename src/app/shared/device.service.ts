import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DeviceState} from './device-state.model';
import {DeviceLocation} from './device-location.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<Array<DeviceState>> {
    return this.http.get<Array<DeviceState>>('http://localhost:8080/device-state');
  }

  findAllLocationForDevice(deviceId: number): Observable<Array<DeviceLocation>> {
    return this.http.get<Array<DeviceLocation>>('http://localhost:8080/device');
  }
}
