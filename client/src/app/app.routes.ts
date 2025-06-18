import { Routes } from '@angular/router';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/vending-machine/vending-machine.component').then(m => m.VendingMachineComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  }
];
