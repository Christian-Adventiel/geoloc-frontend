import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BalizData} from './baliz-data-model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BalizDataService {
  constructor(private http: HttpClient) {
  }

  findDataForDevice(deviceId: string): Observable<Array<BalizData>> {
    return this.http.get<Array<BalizData>>('http://localhost:8080/devices/baliz/' + deviceId + '/data');
  }
}
