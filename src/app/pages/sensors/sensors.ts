import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sensor } from '../../models/sensor.types';
import { SensorService } from '../../services/sensor.service';

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
export class SensorsComponent implements OnInit {
  private readonly sensorService = inject(SensorService);
  readonly sensors = this.sensorService.sensors;

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
    if (
      !this.newSensor.name.trim() ||
      !this.newSensor.location.trim() ||
      !this.newSensor.unit.trim()
    ) {
      return;
    }

    this.sensorService
      .addSensor({
        name: this.newSensor.name,
        type: this.newSensor.type,
        status: this.newSensor.status,
        location: this.newSensor.location,
        unit: this.newSensor.unit,
        value: this.newSensor.value,
        threshold: this.newSensor.threshold,
        lastUpdate: this.newSensor.lastUpdate,
      })
      .subscribe(() => {
        this.resetNewSensorForm();
      });
  }

  private resetNewSensorForm(): void {
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

  ngOnInit(): void {
    this.sensorService.loadSensors().subscribe();
  }
}
