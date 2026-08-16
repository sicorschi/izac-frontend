import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './components/header/header';
import { HeaderTitles } from './constants/header-titles';
import { HeaderIcons } from './constants/header-icons';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  showHeader = signal(false);
  icon = signal('home');
  headerTitle = signal('Time is not important, only life important.');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
        const hiddenRoutes = ['/login', '/not-found'];
        this.showHeader.set(!hiddenRoutes.includes(url));
        this.changeHeaderIcon(url);
        this.changeHeaderTitle(url);
      });
  }

  changeHeaderTitle(url: string): void {
    let newTitle = '';
    switch (url) {
      case '/':
        newTitle = HeaderTitles.Home;
        break;
      case '/devices':
        newTitle = HeaderTitles.Devices;
        break;
      case '/sensors':
        newTitle = HeaderTitles.Sensors;
        break;
      case '/infrastructures':
        newTitle = HeaderTitles.Infrastructures;
        break;
      case '/builders':
        newTitle = HeaderTitles.Builders;
        break;
      default:
        newTitle = 'This is the day that you almost capture captain Jack Sparrow';
    }
    this.headerTitle.set(newTitle);
  }

  changeHeaderIcon(url: string): void {
    let newIcon = '';
    switch (url) {
      case '/':
        newIcon = HeaderIcons.Home;
        break;
      case '/devices':
        newIcon = HeaderIcons.Devices;
        break;
      case '/sensors':
        newIcon = HeaderIcons.Sensors;
        break;
      case '/infrastructures':
        newIcon = HeaderIcons.Infrastructures;
        break;
      case '/builders':
        newIcon = HeaderIcons.Builders;
        break;
      default:
        newIcon = 'help';
    }
    this.icon.set(newIcon);
  }
}
