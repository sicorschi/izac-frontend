import { Component, computed, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import type { ApexOptions } from 'apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
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
    NgApexchartsModule,
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

  countByStatus(status: Device['status']): number {
    return this.devices().filter((device) => device.status === status).length;
  }

  getOnlineCount(): number {
    return this.countByStatus('online');
  }

  getOfflineCount(): number {
    return this.countByStatus('offline');
  }

  getWarningCount(): number {
    return this.countByStatus('warning');
  }

  getTypeBreakdown(
    status: Device['status'] | 'total',
  ): Array<{ type: string; count: number; icon: string }> {
    const relevantDevices =
      status === 'total'
        ? this.devices()
        : this.devices().filter((device) => device.status === status);

    const counts = new Map<string, number>();

    relevantDevices.forEach((device) => {
      counts.set(device.type, (counts.get(device.type) ?? 0) + 1);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([type, count]) => ({
        type,
        count,
        icon: this.getDeviceTypeIcon(type),
      }));
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

  private parseMetricValue(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getTemperatureMetric(device: Device): number {
    return this.parseMetricValue(device.temperature);
  }

  getMemoryMetric(device: Device): number {
    return this.parseMetricValue(device.memory);
  }

  getAverageTemperature(): number {
    const devices = this.devices();
    if (devices.length === 0) {
      return 0;
    }

    const total = devices.reduce((sum, device) => sum + this.getTemperatureMetric(device), 0);
    return Number((total / devices.length).toFixed(1));
  }

  getAverageMemory(): number {
    const devices = this.devices();
    if (devices.length === 0) {
      return 0;
    }

    const total = devices.reduce((sum, device) => sum + this.getMemoryMetric(device), 0);
    return Number((total / devices.length).toFixed(1));
  }

  readonly temperatureOverviewChart = computed<ApexOptions>(() => {
    const devices = this.devices();
    const labels = devices.map((device) => device.name);
    const values = devices.map((device) => this.getTemperatureMetric(device));

    return {
      series: [{ name: 'Temperature', data: values }],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        background: 'transparent',
        sparkline: { enabled: false },
        animations: { enabled: true, speed: 500 },
        parentHeightOffset: 0,
      },
      colors: ['#f97316'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.35,
          gradientToColors: ['#fb923c'],
          opacityFrom: 0.95,
          opacityTo: 0.75,
          stops: [0, 100],
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 14,
          borderRadiusApplication: 'around',
          barHeight: '52%',
          distributed: false,
          dataLabels: {
            position: 'right',
          },
        },
      },
      xaxis: {
        categories: labels.length > 0 ? labels : ['No devices'],
        min: 0,
        max: 100,
        labels: { style: { colors: '#475569', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: '#475569', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => `${value}°C`,
        style: {
          colors: ['#0f172a'],
          fontSize: '10px',
          fontWeight: 700,
        },
        offsetX: 0,
        textAnchor: 'middle',
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        y: { formatter: (value: number) => `${value}°C` },
      },
    };
  });

  readonly memoryOverviewChart = computed<ApexOptions>(() => {
    const devices = this.devices();
    const labels = devices.map((device) => device.name);
    const values = devices.map((device) => this.getMemoryMetric(device));

    return {
      series: [{ name: 'Memory', data: values }],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        background: 'transparent',
        sparkline: { enabled: false },
        animations: { enabled: true, speed: 500 },
        parentHeightOffset: 0,
      },
      colors: ['#4f46e5'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#6366f1'],
          opacityFrom: 0.95,
          opacityTo: 0.78,
          stops: [0, 100],
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 14,
          borderRadiusApplication: 'around',
          barHeight: '52%',
          distributed: false,
          dataLabels: {
            position: 'right',
          },
        },
      },
      xaxis: {
        categories: labels.length > 0 ? labels : ['No devices'],
        min: 0,
        max: 100,
        labels: { style: { colors: '#475569', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: '#475569', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => `${value.toFixed(2)}%`,
        style: {
          colors: ['#0f172a'],
          fontSize: '10px',
          fontWeight: 700,
        },
        offsetX: 0,
        textAnchor: 'middle',
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        y: { formatter: (value: number) => `${value.toFixed(2)}%` },
      },
    };
  });

  ngOnInit(): void {
    this.deviceService.loadDevices().subscribe((data) => {
      console.log(data);
    });
  }
}
