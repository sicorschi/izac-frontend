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
        formatter: (value: number, { seriesIndex, w }: any) => {
          const label = w?.config?.labels?.[seriesIndex] ?? 'Device';
          return `${label}: ${value.toFixed(1)}%`;
        },
        style: {
          fontSize: '12px',
          fontWeight: 700,
          colors: ['#0f172a'],
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '55%',
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
    const activeDevices = this.devicesDetailStats()?.activeDevices ?? [];

    if (!activeDevices.length) {
      return [
        {
          id: 'no-active-devices',
          name: 'No active devices',
          type: 'Waiting for telemetry',
          location: '—',
          ip: '—',
          uptime: '0.00',
          version: '—',
          status: 'pending',
        },
      ];
    }

    return activeDevices.slice(0, 4).map((device) => ({
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
    const offlineDevices = this.devicesDetailStats()?.offlineDevices ?? [];

    if (!offlineDevices.length) {
      return [
        {
          id: 'no-offline-devices',
          name: 'No offline devices',
          type: 'All systems healthy',
          location: '—',
          ip: '—',
          uptime: '0.00',
          version: '—',
          status: 'healthy',
        },
      ];
    }

    return offlineDevices.slice(0, 4).map((device) => ({
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
    const activeDevices = (this.devicesDetailStats()?.activeDevices ?? []).slice(0, 6);
    const chartEntries = activeDevices.map((device, index) => ({
      name: device.name,
      ip: device.ip,
      type: device.type,
      value: 1,
      color: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6', '#06b6d4'][index % 6],
    }));

    return {
      series: chartEntries.length > 0 ? chartEntries.map((entry) => entry.value) : [1],
      chart: {
        type: 'donut',
        height: 260,
        toolbar: { show: false },
      },
      labels:
        chartEntries.length > 0 ? chartEntries.map((entry) => entry.name) : ['No online devices'],
      colors: chartEntries.length > 0 ? chartEntries.map((entry) => entry.color) : ['#cbd5e1'],
      legend: { show: false },
      dataLabels: {
        enabled: chartEntries.length > 0,
        formatter: (value: number, { seriesIndex, w }: any) => {
          const label = w?.config?.labels?.[seriesIndex] ?? 'Device';
          const pct = w?.globals?.seriesTotals?.[seriesIndex] ?? 0;
          const total =
            w?.globals?.seriesTotals?.reduce((sum: number, item: number) => sum + item, 0) ?? 0;
          const percent = total > 0 ? ((pct / total) * 100).toFixed(0) : '0';
          return `${label} \n(${percent}%)`;
        },
        style: {
          fontSize: '12px',
          fontWeight: 700,
          colors: ['#0f172a'],
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
          },
        },
      },
    };
  });

  readonly offlineDeviceTypesChart = computed<ApexOptions>(() => {
    const offlineDevices = (this.devicesDetailStats()?.offlineDevices ?? []).slice(0, 6);
    const chartEntries = offlineDevices.map((device, index) => ({
      name: device.name,
      type: device.type,
      value: 1,
      color: ['#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#a78bfa', '#f43f5e'][index % 6],
    }));

    return {
      series: chartEntries.length > 0 ? chartEntries.map((entry) => entry.value) : [1],
      chart: {
        type: 'donut',
        height: 260,
        toolbar: { show: false },
      },
      labels:
        chartEntries.length > 0 ? chartEntries.map((entry) => entry.name) : ['No offline devices'],
      colors: chartEntries.length > 0 ? chartEntries.map((entry) => entry.color) : ['#cbd5e1'],
      legend: { show: false },
      dataLabels: {
        enabled: chartEntries.length > 0,
        formatter: (value: number, { seriesIndex, w }: any) => {
          const label = w?.config?.labels?.[seriesIndex] ?? 'Device';
          const pct = w?.globals?.seriesTotals?.[seriesIndex] ?? 0;
          const total =
            w?.globals?.seriesTotals?.reduce((sum: number, item: number) => sum + item, 0) ?? 0;
          const percent = total > 0 ? ((pct / total) * 100).toFixed(0) : '0';
          return `${label}\n(${percent}%)`;
        },
        style: {
          fontSize: '12px',
          fontWeight: 700,
          colors: ['#0f172a'],
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '55%',
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

  formatUptime(uptime: string | number | null | undefined): string {
    const seconds = Number(uptime ?? 0);
    if (!Number.isFinite(seconds)) {
      return '0.00 h';
    }
    return `${(seconds / 3600).toFixed(2)} h`;
  }

  ngOnInit(): void {
    this.dashboardService.loadDevicesStats().subscribe();
    this.dashboardService.loadDevicesDetailStats().subscribe();
  }
}
