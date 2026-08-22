export class ActiveSensorsResponse {
  id!: number;
  type!: string;
  location!: string;
  uptime!: string;
  version!: string;
  unit!: string;
  value!: string;
  threshold!: number;
}

export class OfflineSensorsResponse {
  id!: number;
  type!: string;
  location!: string;
  version!: string;
  unit!: string;
  value!: string;
  threshold!: number;
}

export class SensorsStatsResponse {
  totalSensors!: number;
  activeSensors!: ActiveSensorsResponse[];
  offlineSensors!: OfflineSensorsResponse[];
}
