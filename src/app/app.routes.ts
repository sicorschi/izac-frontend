import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    },
     {
        path: 'devices',
        loadComponent: () => import('./pages/devices/devices').then((m) => m.DevicesComponent),
    },
     {
        path: 'sensors',
        loadComponent: () => import('./pages/sensors/sensors').then((m) => m.SensorsComponent),
    },
     {
        path: 'infrastructures',
        loadComponent: () => import('./pages/infrastructures/infrastructures').then((m) => m.InfrastructuresComponent),
    },
     {
        path: 'builders',
        loadComponent: () => import('./pages/builders/builders').then((m) => m.BuildersComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    },
    {
        path: 'not-found',
        loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
    },
    {
        path: '**',
        redirectTo: 'not-found',
    }
];
