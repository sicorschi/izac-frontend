export class ActiveDevicesResponse {
  id!: number;
  type!: string;
  ip!: string;
  uptime!: string;
  version!: string;
}

export class OfflineDevicesResponse {
  id!: number;
  type!: string;
  ip!: string;
  version!: string;
}

export class DevicesDetailStatsResponse {
  totalDevices!: number;
  activeDevices!: ActiveDevicesResponse[];
  offlineDevices!: OfflineDevicesResponse[];
}
