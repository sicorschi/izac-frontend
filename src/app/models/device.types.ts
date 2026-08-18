export interface Device {
  id: number;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  location: string;
  ip: string;
  uptime: string;
  temperature: string;
  version: string;
}
