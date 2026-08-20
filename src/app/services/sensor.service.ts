import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Sensor } from '../models/sensor.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private readonly host = `${environment.apiUrl}/sensors`;
  readonly sensors = signal<Sensor[]>([]);

  constructor(private readonly http: HttpClient) {}

  loadSensors(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(this.host).pipe(tap((data) => this.sensors.set(data)));
  }

  addSensor(sensor: Omit<Sensor, 'id'>): Observable<Sensor> {
    return this.http.post<Sensor>(this.host, sensor).pipe(
      tap((newSensor) => {
        this.sensors.update((currentSensors) => [newSensor, ...currentSensors]);
      }),
    );
  }

  updateSensor(id: number, sensor: Partial<Omit<Sensor, 'id'>>): Observable<Sensor> {
    return this.http.put<Sensor>(`${this.host}/${id}`, sensor).pipe(
      tap((updatedSensor) => {
        this.sensors.update((currentSensors) =>
          currentSensors.map((s) => (s.id === id ? updatedSensor : s)),
        );
      }),
    );
  }

  deleteSensor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`).pipe(
      tap(() => {
        this.sensors.update((currentSensors) => currentSensors.filter((s) => s.id !== id));
      }),
    );
  }

  fetchSensorById(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.host}/${id}`);
  }
}
