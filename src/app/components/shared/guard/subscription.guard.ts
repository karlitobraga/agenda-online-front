import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const subscriptionGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const status = localStorage.getItem('subscriptionStatus');

    if (status === 'EXPIRED' && !state.url.includes('/subscription') && !state.url.includes('/payment')) {
        router.navigate(['/subscription']);
        return false;
    }

    return true;
};
