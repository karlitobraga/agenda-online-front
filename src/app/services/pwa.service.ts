import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    showInstallButton = signal(false);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                // Update UI notify the user they can install the PWA
                this.showInstallButton.set(true);
            });

            window.addEventListener('appinstalled', (evt) => {
                // Log install to analytics
                console.log('INSTALL: Success');
                this.deferredPrompt = null;
                this.showInstallButton.set(false);
            });
        }
    }

    installPwa() {
        if (!this.deferredPrompt) {
            return;
        }
        // Show the install prompt
        this.deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            this.deferredPrompt = null;
            this.showInstallButton.set(false);
        });
    }
}
