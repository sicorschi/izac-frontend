import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  newDevice: {
    name: string;
    type: string;
    ip: string;
  } = {
    name: '',
    type: 'Gateway',
    ip: '',
  };

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
      ip: device.ip,
    };
    this.drawer.open();
  }

  saveDevice(): void {
    if (!this.newDevice.name.trim() || !this.newDevice.type.trim() || !this.newDevice.ip.trim()) {
      return;
    }

    const payload = {
      name: this.newDevice.name.trim(),
      type: this.newDevice.type,
      ip: this.newDevice.ip.trim(),
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
      ip: '',
    };
  }

  getStatusClass(status: Device['status']): string {
    return `status status-${status}`;
  }

  ngOnInit(): void {
    this.deviceService.loadDevices().subscribe();
  }
}
