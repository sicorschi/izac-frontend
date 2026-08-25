import { Component, computed, inject, OnInit } from '@angular/core';
import type { ApexOptions } from 'apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly devicesStats = this.dashboardService.devicesStats;
  readonly devicesDetailStats = this.dashboardService.devicesDetailStats;
  readonly botMessages = [
    { from: 'iZac', text: 'Good morning. I am monitoring 248 devices and 14 active print jobs.' },
    { from: 'user', text: 'Check the pressure trend in Barcelona Edge.' },
    {
      from: 'iZac',
      text: 'Barcelona Edge pressure is 2.4 bar, slightly above nominal. Recommend a short inspection window.',
    },
  ];
  readonly quickActions = ['Check alerts', 'Restart cycle', 'Print status', 'Schedule maintenance'];
  readonly deviceStatsCards = computed(() => {
    const stats = this.devicesStats();
    if (!stats) {
      return [];
    }
    return [
      {
        label: 'Total',
        value: stats.totalDevices,
        delta: 'All units',
        icon: 'devices',
        accent: 'blue',
      },
      {
        label: 'Active',
        value: stats.activeDevices,
        delta: 'Online',
        icon: 'check_circle',
        accent: 'green',
      },
      {
        label: 'Offline',
        value: stats.offlineDevices,
        delta: 'Needs attention',
        icon: 'signal_cellular_connected_no_internet_4_bar',
        accent: 'red',
      },
    ];
  });

  readonly deviceStatusChart = computed<ApexOptions>(() => {
    const stats = this.devicesStats();
    const hasData =
      (stats?.totalDevices ?? 0) > 0 ||
      (stats?.activeDevices ?? 0) > 0 ||
      (stats?.offlineDevices ?? 0) > 0;
    return {
      series: hasData
        ? [stats?.totalDevices ?? 0, stats?.activeDevices ?? 0, stats?.offlineDevices ?? 0]
        : [1],
      chart: {
        type: 'donut',
        height: 260,
        toolbar: {
          show: false,
        },
      },
      labels: hasData ? ['Total devices', 'Active devices', 'Offline devices'] : ['No device data'],
      colors: hasData ? ['#3b82f6', '#22c55e', '#f59e0b'] : ['#cbd5e1'],
      legend: {
        position: 'bottom',
      },
      dataLabels: {
        enabled: hasData,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
          },
        },
      },
    };
  });

  readonly deviceChartLegend = computed(() => {
    const stats = this.devicesStats();
    return [
      { label: 'Total devices', value: stats?.totalDevices ?? 0, color: '#3b82f6' },
      { label: 'Active devices', value: stats?.activeDevices ?? 0, color: '#22c55e' },
      { label: 'Offline devices', value: stats?.offlineDevices ?? 0, color: '#f59e0b' },
    ];
  });

  readonly activeDeviceHighlights = computed(() => {
    return (this.devicesDetailStats()?.activeDevices ?? []).slice(0, 4).map((device) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      ip: device.ip,
      uptime: (Number.parseFloat(device.uptime) / 3600).toFixed(2), // Convert uptime from seconds to hours
      version: device.version,
      status: device.status,
    }));
  });

  readonly offlineDeviceHighlights = computed(() => {
    return (this.devicesDetailStats()?.offlineDevices ?? []).slice(0, 4).map((device) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location,
      ip: device.ip,
      uptime: (Number.parseFloat(device.uptime) / 3600).toFixed(2), // Convert uptime from seconds to hours
      version: device.version,
      status: device.status,
    }));
  });

  readonly onlineDeviceTypesChart = computed<ApexOptions>(() => {
    const activeDevices = this.devicesDetailStats()?.activeDevices ?? [];
    const byType = this.groupDevicesByType(activeDevices);
    const labels = byType.map((item) => item.type);
    const series = byType.map((item) => item.count);
    return {
      series: series.length > 0 ? series : [1],
      chart: {
        type: 'donut',
        height: 260,
        toolbar: { show: false },
      },
      labels: labels.length > 0 ? labels : ['No online devices'],
      colors:
        labels.length > 0 ? ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6'] : ['#cbd5e1'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: labels.length > 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
          },
        },
      },
    };
  });

  readonly offlineDeviceTypesChart = computed<ApexOptions>(() => {
    const offlineDevices = this.devicesDetailStats()?.offlineDevices ?? [];
    const byType = this.groupDevicesByType(offlineDevices);
    const labels = byType.map((item) => item.type);
    const series = byType.map((item) => item.count);
    return {
      series: series.length > 0 ? series : [1],
      chart: {
        type: 'donut',
        height: 260,
        toolbar: { show: false },
      },
      labels: labels.length > 0 ? labels : ['No offline devices'],
      colors:
        labels.length > 0 ? ['#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#a78bfa'] : ['#cbd5e1'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: labels.length > 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
          },
        },
      },
    };
  });

  readonly onlineDeviceTypesLegend = computed(() => {
    const entries = this.groupDevicesByType(this.devicesDetailStats()?.activeDevices ?? []);
    return entries.map((item, index) => ({
      label: item.type,
      value: item.count,
      color: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6'][index % 5],
    }));
  });

  readonly offlineDeviceTypesLegend = computed(() => {
    const entries = this.groupDevicesByType(this.devicesDetailStats()?.offlineDevices ?? []);
    return entries.map((item, index) => ({
      label: item.type,
      value: item.count,
      color: ['#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#a78bfa'][index % 5],
    }));
  });

  private groupDevicesByType<T extends { type: string }>(devices: T[] | undefined) {
    const grouped = new Map<string, number>();
    for (const device of devices ?? []) {
      const current = grouped.get(device.type) ?? 0;
      grouped.set(device.type, current + 1);
    }
    return Array.from(grouped.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  ngOnInit(): void {
    this.dashboardService.loadDevicesStats().subscribe();
    this.dashboardService.loadDevicesDetailStats().subscribe();
  }
}
