import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OfferingService } from '../../offering/offering.service';
import { ProfessionalService } from '../../../services/professional.service';
import { of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Guard that checks if the initial setup (Services and Professionals) is complete.
 * If something is missing, redirects to /welcome.
 */
export const SetupGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const offeringService = inject(OfferingService);
    const professionalService = inject(ProfessionalService);

    if (!isPlatformBrowser(platformId)) {
        return false;
    }

    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

    if (!token || !tenantId) {
        router.navigate(['/login']);
        return false;
    }

    // Check for services AND professionals
    return forkJoin({
        offerings: offeringService.GetAll(tenantId),
        professionals: professionalService.getByTenantId(tenantId)
    }).pipe(
        map(({ offerings, professionals }) => {
            const hasServices = offerings && offerings.length > 0;
            const hasProfessionals = professionals && professionals.length > 0;

            if (!hasServices || !hasProfessionals) {
                // Setup incomplete - redirect to welcome
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
