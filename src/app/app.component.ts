import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LoaderComponent } from './components/shared/loader/loader.component';
import { IosInstallTutorialComponent } from './components/shared/ios-install-tutorial/ios-install-tutorial.component';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, LoaderComponent, IosInstallTutorialComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tinypet';
  public pwaService = inject(PwaService);
  private router = inject(Router);

  showInstallButton() {
    return this.pwaService.showInstallButton() && !this.router.url.startsWith('/agendar');
  }

  showIosTutorial() {
    return this.pwaService.showIosTutorial() && !this.router.url.startsWith('/agendar');
  }

  constructor() {
    // Just injecting it is enough to start listening
  }
}
