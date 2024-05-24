import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    darkModeQuery: MediaQueryList;

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) {
        this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    isDarkMode(): boolean {
        return this.darkModeQuery.matches;
    }

    getDarkModeQuery(): MediaQueryList {
        return this.darkModeQuery;
    }

    getTheme(): string {
        return this.isDarkMode() ? 'theme-dark' : 'theme-light';
    }

    switchTheme(theme: string) {
        const themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;

        if (themeLink) {
            themeLink.href = theme + '.css';
        }
    }
}
