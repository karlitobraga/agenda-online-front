import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AdminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem("tenantId");

        // Simple check: if there's a token and we are trying to access admin, 
        // we assume it's valid for now. The API will return 401/403 if it's not a SuperAdmin token.
        if (token && tenantId) {
            return true;
        }

        localStorage.removeItem('token')
        localStorage.removeItem('tenantId')

        router.navigate(['/admin/login']);
        return false;
    }

    return false;
};
