export class DeviceState {
  id: string;
  status: string;
  uplink_count: number;
  last_uplink: Date;
  downlink_count: number;
  last_downlink: Date;
  lat: number;
  lng: number;
  geolocation_type: string;
}
