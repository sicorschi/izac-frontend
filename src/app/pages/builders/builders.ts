import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

interface BuilderMetric {
  label: string;
  value: string;
  delta: string;
  accent: 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
}

interface Printer {
  id: number;
  name: string;
  model: string;
  status: 'printing' | 'idle' | 'maintenance';
  material: string;
  temp: string;
  progress: number;
  job: string;
  queue: number;
}

@Component({
  selector: 'app-builders',
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
  templateUrl: './builders.html',
  styleUrls: ['./builders.css'],
})
export class BuildersComponent {
  metrics: BuilderMetric[] = [
    { label: 'Active printers', value: '18', delta: '+3 this week', accent: 'blue', icon: 'precision_manufacturing' },
    { label: 'Printing now', value: '7', delta: '+1 today', accent: 'green', icon: 'print' },
    { label: 'Maintenance', value: '3', delta: '2 due soon', accent: 'amber', icon: 'build_circle' },
    { label: 'Queue load', value: '72%', delta: 'Stable', accent: 'purple', icon: 'pending_actions' },
  ];

  printers: Printer[] = [
    {
      id: 1,
      name: 'Builder A1',
      model: 'FDM 3D Pro X',
      status: 'printing',
      material: 'PLA',
      temp: '208°C',
      progress: 78,
      job: 'V2 Housing',
      queue: 3,
    },
    {
      id: 2,
      name: 'Builder B2',
      model: 'Resin Lite MkII',
      status: 'idle',
      material: 'Resin',
      temp: '96°C',
      progress: 12,
      job: 'Idle',
      queue: 2,
    },
    {
      id: 3,
      name: 'Builder C3',
      model: 'SLS Core X',
      status: 'maintenance',
      material: 'Nylon',
      temp: '180°C',
      progress: 42,
      job: 'Calibration',
      queue: 1,
    },
    {
      id: 4,
      name: 'Builder D4',
      model: 'FDM 3D Pro X',
      status: 'printing',
      material: 'PETG',
      temp: '226°C',
      progress: 63,
      job: 'Jig Assembly',
      queue: 4,
    },
  ];

  newPrinter = {
    name: '',
    model: '',
    status: 'idle' as Printer['status'],
    material: '',
    temp: '',
    progress: 0,
    job: '',
    queue: 0,
  };

  addPrinter(): void {
    if (!this.newPrinter.name.trim() || !this.newPrinter.model.trim()) {
      return;
    }

    this.printers.unshift({
      id: Date.now(),
      name: this.newPrinter.name.trim(),
      model: this.newPrinter.model.trim(),
      status: this.newPrinter.status,
      material: this.newPrinter.material || 'PLA',
      temp: this.newPrinter.temp || '180°C',
      progress: this.newPrinter.progress || 0,
      job: this.newPrinter.job || 'Queued',
      queue: this.newPrinter.queue || 0,
    });

    this.newPrinter = {
      name: '',
      model: '',
      status: 'idle',
      material: '',
      temp: '',
      progress: 0,
      job: '',
      queue: 0,
    };
  }

  getStatusClass(status: Printer['status']): string {
    return `status status-${status}`;
  }
}
