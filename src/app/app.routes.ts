import { Routes } from '@angular/router';
import { AuthGuard } from './components/shared/guard/auth.guard';
import { SetupGuard } from './components/shared/guard/setup.guard';
import { MainLayoutComponent } from './components/shared/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'welcome',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/welcome/welcome.component').then((m) => m.WelcomeComponent),
  },
  {
    path: 'setup',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./components/setup/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: 'subscription',
    loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  {
    path: 'payment/success',
    loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent) // Reuse component or create result page? Re-using for now to show success message.
  },
  {
    path: 'payment/failure',
    loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  {
    path: 'payment/pending',
    loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  // Public booking route (no auth required)
  {
    path: 'agendar/:slug',
    loadComponent: () =>
      import('./components/booking/booking.component').then((m) => m.BookingComponent),
  },
  // Magic link login
  {
    path: 'demo/:token',
    loadComponent: () =>
      import('./components/auth/magic-link/magic-link.component').then((m) => m.MagicLinkComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, SetupGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./components/initial/initial.component').then(m => m.InitialComponent)
      },
      {
        path: 'settings/hours',
        loadComponent: () => import('./components/settings/schedule-hours/schedule-hours.component').then(m => m.ScheduleHoursComponent)
      },
      {
        path: 'settings/holidays',
        loadComponent: () => import('./components/settings/special-days/special-days.component').then(m => m.SpecialDaysComponent)
      },
      {
        path: 'settings/whatsapp',
        loadComponent: () => import('./components/settings/whatsapp/whatsapp.component').then(m => m.WhatsappComponent)
      },
      {
        path: 'settings/services',
        loadComponent: () => import('./components/settings/services-settings/services-settings.component').then(m => m.ServicesSettingsComponent)
      },
      {
        path: 'settings/professionals',
        loadComponent: () => import('./components/settings/professional-settings/professional-settings.component').then(m => m.ProfessionalSettingsComponent)
      },
      {
        path: 'settings/account',
        loadComponent: () => import('./components/settings/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
      },
      {
        path: 'settings/reports',
        loadComponent: () => import('./components/settings/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings/reports/appointments',
        loadComponent: () => import('./components/settings/reports/appointment-reports/appointment-reports.component').then(m => m.AppointmentReportsComponent)
      },
      {
        path: 'settings/reports/sales',
        loadComponent: () => import('./components/settings/reports/sale-reports/sale-reports.component').then(m => m.SaleReportsComponent)
      },
      {
        path: 'settings/products',
        loadComponent: () => import('./components/settings/product-settings/product-settings.component').then(m => m.ProductSettingsComponent)
      },
      {
        path: 'settings/sales',
        loadComponent: () => import('./components/settings/sales/sales.component').then(m => m.SalesComponent)
      },
      // Keep offering route for backwards compatibility but redirect to setup
      {
        path: 'offering',
        redirectTo: 'settings/hours'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
