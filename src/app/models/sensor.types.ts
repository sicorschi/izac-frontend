export interface Sensor {
  id: number;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  location: string;
  unit: string;
  value: string;
  threshold: string;
  lastUpdate: string;
}
