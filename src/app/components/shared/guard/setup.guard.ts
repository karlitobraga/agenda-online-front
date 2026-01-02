import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OfferingService } from '../../offering/offering.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Guard that checks if the initial setup (Services) is complete.
 * If services are missing, redirects to /welcome.
 */
export const SetupGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const offeringService = inject(OfferingService);

    if (!isPlatformBrowser(platformId)) {
        return false;
    }

    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

    if (!token || !tenantId) {
        router.navigate(['/login']);
        return false;
    }

    // Only check for services now (WhatsApp/Evolution API removed)
    return offeringService.GetAll(tenantId).pipe(
        map(offerings => {
            const hasServices = offerings && offerings.length > 0;
            if (!hasServices) {
                // Services missing - redirect to welcome
                router.navigate(['/welcome']);
                return false;
            }
            return true;
        }),
        catchError(() => {
            // On error, redirect to welcome for safety
            router.navigate(['/welcome']);
            return of(false);
        })
    );
};
