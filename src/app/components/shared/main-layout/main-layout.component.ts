import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { PwaService } from '../../../services/pwa.service';
import { IosInstallTutorialComponent } from '../ios-install-tutorial/ios-install-tutorial.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        AsyncPipe,
        IosInstallTutorialComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    isAdmin: boolean = false;
    public pwaService = inject(PwaService);

    constructor(private router: Router, private breakpointObserver: BreakpointObserver) {
        this.checkRole();
    }

    private checkRole() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    // Try multiple possible role claim names
                    const role = payload['role'] ||
                        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                        payload['roles'];

                    if (Array.isArray(role)) {
                        this.isAdmin = role.includes('Admin');
                    } else {
                        this.isAdmin = role === 'Admin';
                    }
                } catch (e) {
                    console.error('Error decoding token', e);
                    this.isAdmin = false;
                }
            }
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('professionalId');
        this.router.navigate(['/login']);
    }
}
