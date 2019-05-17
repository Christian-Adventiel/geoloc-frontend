import {Injectable} from '@angular/core';
import * as L from 'leaflet';

@Injectable()
export class MapService {
  public map: L.Map;
}
