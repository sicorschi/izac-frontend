import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Device } from '../../models/device.types';
import { DeviceService } from '../../services/device.service';

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
  templateUrl: './devices.html',
  styleUrls: ['./devices.css'],
})
export class DevicesComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);
  readonly devices = this.deviceService.devices;

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
    if (
      !this.newDevice.name.trim() ||
      !this.newDevice.location.trim() ||
      !this.newDevice.ip.trim()
    ) {
      return;
    }

    this.deviceService
      .addDevice({
        name: this.newDevice.name,
        type: this.newDevice.type,
        status: this.newDevice.status,
        location: this.newDevice.location,
        ip: this.newDevice.ip,
        uptime: this.newDevice.uptime,
        temperature: this.newDevice.temperature,
        version: this.newDevice.version,
      })
      .subscribe();

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

  ngOnInit(): void {
    this.deviceService.loadDevices().subscribe();
  }
}
