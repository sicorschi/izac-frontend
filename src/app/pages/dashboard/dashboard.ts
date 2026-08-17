import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  accent: 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
}

interface DeviceItem {
  name: string;
  zone: string;
  status: 'online' | 'warning' | 'offline';
  value: string;
}

interface SensorItem {
  name: string;
  reading: string;
  trend: string;
  status: 'stable' | 'attention' | 'critical';
}

interface InfrastructureItem {
  name: string;
  uptime: string;
  load: string;
  status: 'online' | 'warning' | 'offline';
}

interface BuilderItem {
  name: string;
  job: string;
  progress: number;
  temp: string;
  status: 'printing' | 'idle' | 'maintenance';
}

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  metrics: DashboardMetric[] = [
    { label: 'Devices', value: '248', delta: '+12.4%', accent: 'blue', icon: 'devices' },
    { label: 'Sensors', value: '86', delta: '+5.2%', accent: 'green', icon: 'thermostat' },
    { label: 'Alerts', value: '9', delta: '-4.8%', accent: 'amber', icon: 'notifications_active' },
    { label: 'Print jobs', value: '14', delta: '+2 today', accent: 'purple', icon: 'precision_manufacturing' },
  ];

  devices: DeviceItem[] = [
    { name: 'Thermal Sensor A15', zone: 'Zone A', status: 'online', value: '23.8°C' },
    { name: 'Water Meter M12', zone: 'Zone B', status: 'warning', value: '1.4 m³/h' },
    { name: 'Security Camera C07', zone: 'Zone C', status: 'online', value: 'HD active' },
    { name: 'Battery Bank B04', zone: 'Zone D', status: 'offline', value: '42%' },
  ];

  sensors: SensorItem[] = [
    { name: 'Temperature', reading: '23.8°C', trend: '+1.3°', status: 'stable' },
    { name: 'Pressure', reading: '2.4 bar', trend: '+0.6', status: 'attention' },
    { name: 'Humidity', reading: '41%', trend: '-3%', status: 'stable' },
    { name: 'Air quality', reading: '82 AQI', trend: '+12', status: 'critical' },
  ];

  infrastructures: InfrastructureItem[] = [
    { name: 'Madrid Hub', uptime: '99.8%', load: '74%', status: 'online' },
    { name: 'Barcelona Edge', uptime: '96.2%', load: '63%', status: 'warning' },
    { name: 'Lisbon Gateway', uptime: '98.7%', load: '58%', status: 'online' },
    { name: 'Seville Node', uptime: '74.1%', load: '89%', status: 'offline' },
  ];

  builders: BuilderItem[] = [
    { name: 'Printer 01', job: 'V2 Housing', progress: 78, temp: '208°C', status: 'printing' },
    { name: 'Printer 02', job: 'Idle', progress: 12, temp: '96°C', status: 'idle' },
    { name: 'Printer 03', job: 'Calibration', progress: 42, temp: '180°C', status: 'maintenance' },
  ];

  botMessages = [
    { from: 'iZac', text: 'Good morning. I am monitoring 248 devices and 14 active print jobs.' },
    { from: 'user', text: 'Check the pressure trend in Barcelona Edge.' },
    { from: 'iZac', text: 'Barcelona Edge pressure is 2.4 bar, slightly above nominal. Recommend a short inspection window.' },
  ];

  quickActions = ['Check alerts', 'Restart cycle', 'Print status', 'Schedule maintenance'];
}
