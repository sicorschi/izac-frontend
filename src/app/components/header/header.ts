import { Component, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

export enum HeaderIcons {
  Home = 'category',
  Devices = 'devices',
  Sensors = 'wifi_tethering',
  Infrastructures = 'device_hub',
  Builders = 'memory',
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, RouterLink, RouterLinkActive],
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
    { label: 'Sensors', route: '/sensors', icon: HeaderIcons.Sensors },
    { label: 'Infrastructures', route: '/infrastructures', icon: HeaderIcons.Infrastructures },
    { label: 'Builders', route: '/builders', icon: HeaderIcons.Builders },
  ];

  closeDrawer(): void {
    this.drawer?.close();
  }

  toggleDrawer(): void {
    this.drawer?.toggle();
  }
}

