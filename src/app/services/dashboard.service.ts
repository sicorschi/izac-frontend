import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DevicesStatsResponse } from '../models/dashboard/devices-stats-response.types';
import { SensorsStatsResponse } from '../models/dashboard/sensors-stats-response.types';
import { DevicesDetailStatsResponse } from '../models/dashboard/devices-detail-stats-response.types';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly host = `${environment.apiUrl}/dashboard`;
  readonly devicesStats = signal<DevicesStatsResponse | null>(null);
  readonly devicesDetailStats = signal<DevicesDetailStatsResponse | null>(null);
  readonly sensorsStats = signal<SensorsStatsResponse | null>(null);
  constructor(private readonly http: HttpClient) {}

  loadDevicesStats(): Observable<DevicesStatsResponse> {
    return this.http
      .get<DevicesStatsResponse>(`${this.host}/devices/stats`)
      .pipe(tap((data) => this.devicesStats.set(data)));
  }

  loadDevicesDetailStats(): Observable<DevicesDetailStatsResponse> {
    return this.http
      .get<DevicesDetailStatsResponse>(`${this.host}/devices`)
      .pipe(tap((data) => this.devicesDetailStats.set(data)));
  }
}
