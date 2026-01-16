import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    showInstallButton = signal(false);
    isIos = signal(false);
    showIosTutorial = signal(false);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            // Detect iOS
            const userAgent = window.navigator.userAgent.toLowerCase();
            const ios = /iphone|ipad|ipod/.test(userAgent);
            this.isIos.set(ios);

            // Detect if already in standalone mode (installed)
            const isStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) ||
                window.matchMedia('(display-mode: standalone)').matches;

            if (ios && !isStandalone) {
                this.showIosTutorial.set(true);
            }

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
