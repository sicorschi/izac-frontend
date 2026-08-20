import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { Sensor } from '../../models/sensors/sensor.types';
import { SensorService } from '../../services/sensor.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule,
  ],
  templateUrl: './sensors.html',
  styleUrls: ['./sensors.css'],
})
export class SensorsComponent implements OnInit {
  private readonly sensorService = inject(SensorService);
  readonly sensors = this.sensorService.sensors;
  private readonly dialog = inject(MatDialog);
  @ViewChild('drawer') private readonly drawer!: MatDrawer;
  isEditing = false;
  selectedSensorId: number | null = null;
  newSensor: {
    name: string;
    type: string;
    unit: string;
    threshold: number;
  } = {
    name: '',
    type: 'Temperature',
    unit: '',
    threshold: 0,
  };

  openAddDrawer(): void {
    this.isEditing = false;
    this.selectedSensorId = null;
    this.resetNewSensorForm();
    this.drawer.open();
  }

  openEditDrawer(sensor: Sensor): void {
    this.isEditing = true;
    this.selectedSensorId = sensor.id;
    this.newSensor = {
      name: sensor.name,
      type: sensor.type,
      unit: sensor.unit,
      threshold: sensor.threshold,
    };
    this.drawer.open();
  }

  saveSensor(): void {
    if (!this.newSensor.name.trim() || !this.newSensor.type.trim() || !this.newSensor.unit.trim()) {
      return;
    }

    const payload = {
      name: this.newSensor.name.trim(),
      type: this.newSensor.type,
      unit: this.newSensor.unit.trim(),
      threshold: this.newSensor.threshold,
    };

    const request =
      this.isEditing && this.selectedSensorId !== null
        ? this.sensorService.updateSensor(this.selectedSensorId, payload)
        : this.sensorService.addSensor(payload);

    request.subscribe(() => {
      this.resetNewSensorForm();
      this.drawer.close();
    });
  }

  openDeleteDialog(sensor: Sensor, templateRef: TemplateRef<unknown>): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '420px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.sensorService.deleteSensor(sensor.id).subscribe();
      }
    });
  }

  private resetNewSensorForm(): void {
    this.newSensor = {
      name: '',
      type: 'Temperature',
      unit: '',
      threshold: 0,
    };
  }

  getStatusClass(status: Sensor['status']): string {
    return `status status-${status}`;
  }

  ngOnInit(): void {
    this.sensorService.loadSensors().subscribe();
  }
}
