import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface RoomDevice {
  name: string;
  type: string;
  status: 'online' | 'warning' | 'offline';
  ip: string;
  location: string;
  x: number;
  y: number;
}

interface RoomSensor {
  name: string;
  type: string;
  status: 'healthy' | 'warning' | 'offline';
  value: string;
  x: number;
  y: number;
}

interface InfrastructureRoom {
  id: number;
  name: string;
  description: string;
  status: 'online' | 'warning' | 'offline';
  occupancy: string;
  devices: RoomDevice[];
  sensors: RoomSensor[];
}

@Component({
  selector: 'app-infrastructures',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './infrastructures.html',
  styleUrls: ['./infrastructures.css'],
})
export class InfrastructuresComponent {
  selectedDeviceByRoom: Record<number, string> = {
    1: 'Main gateway',
    2: 'Climate node',
    3: 'Energy panel',
  };

  selectedSensorByRoom: Record<number, string> = {};

  readonly rooms: InfrastructureRoom[] = [
    {
      id: 1,
      name: 'Living room',
      description: 'Main aggregation zone',
      status: 'online',
      occupancy: '4 active endpoints',
      devices: [
        {
          name: 'Main gateway',
          type: 'Gateway',
          status: 'online',
          ip: 'Private LAN',
          location: 'Wall panel',
          x: 72,
          y: 150,
        },
        {
          name: 'Smart TV hub',
          type: 'Controller',
          status: 'online',
          ip: 'Private LAN',
          location: 'Media stand',
          x: 142,
          y: 90,
        },
        {
          name: 'Ambient light cluster',
          type: 'Edge device',
          status: 'warning',
          ip: 'Private LAN',
          location: 'Ceiling ring',
          x: 226,
          y: 120,
        },
      ],
      sensors: [
        {
          name: 'Temperature',
          type: 'Climate',
          status: 'healthy',
          value: '21.8°C',
          x: 86,
          y: 82,
        },
        {
          name: 'Air quality',
          type: 'Air',
          status: 'healthy',
          value: 'Good',
          x: 206,
          y: 52,
        },
        {
          name: 'Motion',
          type: 'Presence',
          status: 'warning',
          value: 'Low traffic',
          x: 240,
          y: 170,
        },
      ],
    },
    {
      id: 2,
      name: 'Bedroom',
      description: 'Sleep and comfort zone',
      status: 'warning',
      occupancy: '3 active endpoints',
      devices: [
        {
          name: 'Bedside controller',
          type: 'Controller',
          status: 'online',
          ip: 'Private LAN',
          location: 'Nightstand',
          x: 82,
          y: 120,
        },
        {
          name: 'Climate node',
          type: 'Edge device',
          status: 'warning',
          ip: 'Private LAN',
          location: 'Window side',
          x: 180,
          y: 82,
        },
        {
          name: 'Security camera',
          type: 'Camera',
          status: 'offline',
          ip: 'Private LAN',
          location: 'North wall',
          x: 235,
          y: 150,
        },
      ],
      sensors: [
        {
          name: 'Humidity',
          type: 'Climate',
          status: 'healthy',
          value: '45%',
          x: 86,
          y: 64,
        },
        {
          name: 'Night light',
          type: 'Lighting',
          status: 'warning',
          value: 'Low battery',
          x: 205,
          y: 162,
        },
      ],
    },
    {
      id: 3,
      name: 'Kitchen',
      description: 'Energy and appliance monitoring',
      status: 'online',
      occupancy: '5 active endpoints',
      devices: [
        {
          name: 'Energy panel',
          type: 'Gateway',
          status: 'online',
          ip: 'Private LAN',
          location: 'Cabinet wall',
          x: 76,
          y: 120,
        },
        {
          name: 'Smart oven',
          type: 'Appliance',
          status: 'online',
          ip: 'Private LAN',
          location: 'Countertop',
          x: 150,
          y: 100,
        },
        {
          name: 'Water leak monitor',
          type: 'Sensor hub',
          status: 'online',
          ip: 'Private LAN',
          location: 'Sink unit',
          x: 230,
          y: 150,
        },
      ],
      sensors: [
        {
          name: 'Temperature',
          type: 'Thermal',
          status: 'healthy',
          value: '23.4°C',
          x: 86,
          y: 58,
        },
        {
          name: 'Water flow',
          type: 'Utility',
          status: 'healthy',
          value: 'Stable',
          x: 212,
          y: 60,
        },
        {
          name: 'Gas level',
          type: 'Safety',
          status: 'warning',
          value: 'Check valve',
          x: 242,
          y: 166,
        },
      ],
    },
  ];

  getTotalDevices(): number {
    return this.rooms.reduce((total, room) => total + room.devices.length, 0);
  }

  getTotalSensors(): number {
    return this.rooms.reduce((total, room) => total + room.sensors.length, 0);
  }

  getAlertsCount(): number {
    const warningDevices = this.rooms.reduce(
      (total, room) => total + room.devices.filter((device) => device.status === 'warning').length,
      0,
    );
    const warningSensors = this.rooms.reduce(
      (total, room) => total + room.sensors.filter((sensor) => sensor.status === 'warning').length,
      0,
    );
    return warningDevices + warningSensors;
  }

  getSelectedAsset(
    room: InfrastructureRoom,
  ): { name: string; type: string; status: string; location?: string; value?: string } | undefined {
    const selectedSensor = this.selectedSensorByRoom[room.id];
    if (selectedSensor) {
      const sensor = room.sensors.find((item) => item.name === selectedSensor);
      if (sensor) {
        return {
          name: sensor.name,
          type: sensor.type,
          status: sensor.status,
          value: sensor.value,
        };
      }
    }

    const selectedDevice = this.selectedDeviceByRoom[room.id];
    const device = room.devices.find((item) => item.name === selectedDevice) ?? room.devices[0];
    if (!device) {
      return undefined;
    }

    return {
      name: device.name,
      type: device.type,
      status: device.status,
      location: device.location,
    };
  }

  getSelectedDevice(room: InfrastructureRoom): RoomDevice | undefined {
    return (
      room.devices.find((device) => device.name === this.selectedDeviceByRoom[room.id]) ??
      room.devices[0]
    );
  }

  selectDevice(roomId: number, deviceName: string): void {
    delete this.selectedSensorByRoom[roomId];
    this.selectedDeviceByRoom[roomId] = deviceName;
  }

  selectSensor(roomId: number, sensorName: string): void {
    delete this.selectedDeviceByRoom[roomId];
    this.selectedSensorByRoom[roomId] = sensorName;
  }

  isSelectedDevice(room: InfrastructureRoom, deviceName: string): boolean {
    return this.selectedDeviceByRoom[room.id] === deviceName && !this.selectedSensorByRoom[room.id];
  }

  isSelectedSensor(room: InfrastructureRoom, sensorName: string): boolean {
    return this.selectedSensorByRoom[room.id] === sensorName;
  }
}
