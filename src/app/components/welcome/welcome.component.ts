import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

    constructor(private router: Router) { }

    startConfiguration() {
        // Navigate to Setup wizard component
        this.router.navigate(['/setup']);
    }
}
