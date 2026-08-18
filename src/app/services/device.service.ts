import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Device } from '../models/device.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly host = `${environment.apiUrl}/devices`;
  readonly devices = signal<Device[]>([]);

  constructor(private readonly http: HttpClient) {}

  loadDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.host).pipe(tap((data) => this.devices.set(data)));
  }

  addDevice(device: Omit<Device, 'id'>): Observable<Device> {
    return this.http.post<Device>(this.host, device).pipe(
      tap((newDevice) => {
        this.devices.update((currentDevices) => [newDevice, ...currentDevices]);
      }),
    );
  }

  fetchDeviceById(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.host}/${id}`);
  }
}
