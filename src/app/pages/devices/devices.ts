import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

interface Device {
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

@Component({
  selector: 'app-devices',
  standalone: true,
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
  templateUrl: './devices.html',
  styleUrls: ['./devices.css'],
})
export class DevicesComponent {
  devices: Device[] = [
    {
      id: 1,
      name: 'Edge Gateway A01',
      type: 'Gateway',
      status: 'online',
      location: 'Server Room 01',
      ip: '192.168.10.12',
      uptime: '99.8%',
      temperature: '34°C',
      version: 'v3.2.1',
    },
    {
      id: 2,
      name: 'Smart Sensor P08',
      type: 'Sensor',
      status: 'warning',
      location: 'Warehouse North',
      ip: '192.168.10.38',
      uptime: '94.2%',
      temperature: '42°C',
      version: 'v2.6.0',
    },
    {
      id: 3,
      name: 'Access Panel X9',
      type: 'Controller',
      status: 'offline',
      location: 'Main Entrance',
      ip: '192.168.10.44',
      uptime: '71.3%',
      temperature: '31°C',
      version: 'v1.9.7',
    },
    {
      id: 4,
      name: 'Energy Meter M21',
      type: 'Meter',
      status: 'online',
      location: 'Plant Floor 02',
      ip: '192.168.10.56',
      uptime: '98.9%',
      temperature: '29°C',
      version: 'v4.0.3',
    },
  ];

  newDevice = {
    name: '',
    type: 'Gateway',
    status: 'online' as Device['status'],
    location: '',
    ip: '',
    uptime: '',
    temperature: '',
    version: '',
  };

  addDevice(): void {
    if (!this.newDevice.name.trim() || !this.newDevice.location.trim() || !this.newDevice.ip.trim()) {
      return;
    }

    this.devices.unshift({
      id: Date.now(),
      name: this.newDevice.name.trim(),
      type: this.newDevice.type,
      status: this.newDevice.status,
      location: this.newDevice.location.trim(),
      ip: this.newDevice.ip.trim(),
      uptime: this.newDevice.uptime || '98.0%',
      temperature: this.newDevice.temperature || '32°C',
      version: this.newDevice.version || 'v1.0.0',
    });

    this.newDevice = {
      name: '',
      type: 'Gateway',
      status: 'online',
      location: '',
      ip: '',
      uptime: '',
      temperature: '',
      version: '',
    };
  }

  getStatusClass(status: Device['status']): string {
    return `status status-${status}`;
  }
}
