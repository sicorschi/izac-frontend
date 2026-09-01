import { Component, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

export enum HeaderIcons {
  Home = 'dashboard',
  Devices = 'devices',
  Sensors = 'thermostat',
  Infrastructures = 'device_hub',
  Builders = 'precision_manufacturing',
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  @Input() icon: string = 'home';
  @Input() headerTitle: string = 'Time is not important, only life important.';

  @ViewChild('drawer') drawer?: MatDrawer;

  navItems = [
    { label: 'Dashboard', route: '/', icon: HeaderIcons.Home },
    { label: 'Devices', route: '/devices', icon: HeaderIcons.Devices },
    { label: 'Infrastructures', route: '/infrastructures', icon: HeaderIcons.Infrastructures },
    { label: 'Builders', route: '/builders', icon: HeaderIcons.Builders },
  ];

  currentNavItem = this.navItems[0];

  constructor(private readonly router: Router) {
    this.updateCurrentRoute(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentRoute(event.urlAfterRedirects);
      }
    });
  }

  closeDrawer(): void {
    this.drawer?.close();
  }

  toggleDrawer(): void {
    this.drawer?.toggle();
  }

  private updateCurrentRoute(url: string): void {
    const normalizedUrl = url.split('?')[0].split('#')[0] || '/';
    const match = this.navItems.find((item) => {
      if (item.route === '/' && (normalizedUrl === '/' || normalizedUrl === '')) {
        return true;
      }

      return item.route === normalizedUrl;
    });

    this.currentNavItem = match ?? this.navItems[0];
  }
}
