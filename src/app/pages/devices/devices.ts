import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import type { CreateDeviceRequest } from '../../models/devices/create-request.types';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Device } from '../../models/devices/device.types';
import { DeviceService } from '../../services/device.service';

@Component({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
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
  private readonly dialog = inject(MatDialog);
  readonly devices = this.deviceService.devices;
  @ViewChild('drawer') private readonly drawer!: MatDrawer;
  isEditing = false;
  selectedDeviceId: number | null = null;
  newDevice: CreateDeviceRequest = {
    name: '',
    type: 'Gateway',
  };

  readonly deviceTypeOptions = [
    { value: 'Gateway', label: 'Gateway', icon: 'router' },
    { value: 'Edge Device', label: 'Edge device', icon: 'memory' },
    { value: 'Controller', label: 'Controller', icon: 'tune' },
    { value: 'Cluster', label: 'Cluster', icon: 'hub' },
    { value: 'Edge AI', label: 'Edge AI', icon: 'smart_toy' },
  ];

  openAddDrawer(): void {
    this.isEditing = false;
    this.selectedDeviceId = null;
    this.resetDeviceForm();
    this.drawer.open();
  }

  openEditDrawer(device: Device): void {
    this.isEditing = true;
    this.selectedDeviceId = device.id;
    this.newDevice = {
      name: device.name,
      type: device.type,
    };
    this.drawer.open();
  }

  saveDevice(): void {
    if (!this.newDevice.name.trim() || !this.newDevice.type.trim()) {
      return;
    }
    const payload = {
      name: this.newDevice.name.trim(),
      type: this.newDevice.type,
    };

    const request =
      this.isEditing && this.selectedDeviceId !== null
        ? this.deviceService.updateDevice(this.selectedDeviceId, payload)
        : this.deviceService.addDevice(payload);

    request.subscribe(() => {
      this.resetDeviceForm();
      this.drawer.close();
    });
  }

  openDeleteDialog(device: Device, templateRef: TemplateRef<unknown>): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '420px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.deviceService.deleteDevice(device.id).subscribe();
      }
    });
  }

  private resetDeviceForm(): void {
    this.isEditing = false;
    this.selectedDeviceId = null;
    this.newDevice = {
      name: '',
      type: 'Gateway',
    };
  }

  getStatusClass(status: Device['status']): string {
    return `status status-${status}`;
  }

  getDeviceTypeClass(type: string): string {
    const normalized = type.toLowerCase();

    if (normalized.includes('cluster')) {
      return 'device-badge-cluster';
    }

    if (normalized.includes('gateway')) {
      return 'device-badge-gateway';
    }

    if (normalized.includes('controller')) {
      return 'device-badge-controller';
    }

    if (normalized.includes('edge ai')) {
      return 'device-badge-edge-ai';
    }

    if (normalized.includes('edge')) {
      return 'device-badge-edge';
    }

    return 'device-badge-default';
  }

  getDeviceTypeIcon(type: string): string {
    const normalized = type.toLowerCase();

    if (normalized.includes('cluster')) {
      return 'hub';
    }

    if (normalized.includes('gateway')) {
      return 'router';
    }

    if (normalized.includes('controller')) {
      return 'tune';
    }

    if (normalized.includes('edge ai')) {
      return 'smart_toy';
    }

    if (normalized.includes('edge')) {
      return 'memory';
    }

    return 'devices';
  }

  formatUptime(uptime: string | number | null | undefined): string {
    const seconds = Number(uptime ?? 0);
    if (!Number.isFinite(seconds)) {
      return '0.00 h';
    }
    return `${(seconds / 3600).toFixed(2)} h`;
  }

  ngOnInit(): void {
    this.deviceService.loadDevices().subscribe();
  }
}
