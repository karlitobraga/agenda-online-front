import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    let tenantId = localStorage.getItem("tenantId");

    if (token && tenantId) {
      /* 
      // Check subscription status
      const subscriptionStatus = localStorage.getItem('subscriptionStatus');

      // If status is 'EXPIRED' and not navigating to subscription/payment pages
      if (subscriptionStatus === 'EXPIRED') {
        // Allow access to subscription and payment output pages
        if (!state.url.includes('subscription') && !state.url.includes('payment/')) {
          router.navigate(['/subscription']);
          return false;
        }
      }
      */
      // If status is 'true' and trying to access subscription (optional: redirect to home? No, maybe they want to update payment)

      return true;
    }

    localStorage.removeItem('token')
    localStorage.removeItem('tenantId')

    router.navigate(['/login']);
    return false;
  }

  return false;
};
