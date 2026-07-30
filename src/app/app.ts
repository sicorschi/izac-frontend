import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('izac-frontend');
  protected readonly description = signal('platform to manage your izac');
  protected readonly keywords = signal('izac, izac-frontend, izac-frontend-angular, izac-frontend-angular-vite');
}
