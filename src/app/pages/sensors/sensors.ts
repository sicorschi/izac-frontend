import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

interface Sensor {
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

@Component({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
  ],
  templateUrl: './sensors.html',
  styleUrls: ['./sensors.css'],
})
export class SensorsComponent {
  sensors: Sensor[] = [
    {
      id: 1,
      name: 'Temperature Probe T12',
      type: 'Temperature',
      status: 'online',
      location: 'Boiler Room',
      unit: '°C',
      value: '23.8',
      threshold: '28.0',
      lastUpdate: '2 min ago',
    },
    {
      id: 2,
      name: 'Pressure Gauge P08',
      type: 'Pressure',
      status: 'warning',
      location: 'Production Line 2',
      unit: 'bar',
      value: '2.4',
      threshold: '2.1',
      lastUpdate: '6 min ago',
    },
    {
      id: 3,
      name: 'Humidity Node H19',
      type: 'Humidity',
      status: 'online',
      location: 'Storage Hall',
      unit: '%',
      value: '41',
      threshold: '55',
      lastUpdate: '1 min ago',
    },
    {
      id: 4,
      name: 'Air Quality A04',
      type: 'Air Quality',
      status: 'offline',
      location: 'Assembly Bay',
      unit: 'AQI',
      value: '82',
      threshold: '70',
      lastUpdate: '18 min ago',
    },
  ];

  newSensor = {
    name: '',
    type: 'Temperature',
    status: 'online' as Sensor['status'],
    location: '',
    unit: '',
    value: '',
    threshold: '',
    lastUpdate: '',
  };

  addSensor(): void {
    if (!this.newSensor.name.trim() || !this.newSensor.location.trim() || !this.newSensor.unit.trim()) {
      return;
    }

    this.sensors.unshift({
      id: Date.now(),
      name: this.newSensor.name.trim(),
      type: this.newSensor.type,
      status: this.newSensor.status,
      location: this.newSensor.location.trim(),
      unit: this.newSensor.unit.trim(),
      value: this.newSensor.value || '0',
      threshold: this.newSensor.threshold || '0',
      lastUpdate: this.newSensor.lastUpdate || 'just now',
    });

    this.newSensor = {
      name: '',
      type: 'Temperature',
      status: 'online',
      location: '',
      unit: '',
      value: '',
      threshold: '',
      lastUpdate: '',
    };
  }

  getStatusClass(status: Sensor['status']): string {
    return `status status-${status}`;
  }
}
