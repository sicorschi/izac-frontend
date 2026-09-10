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
  memory: string;
  humidity: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
}
