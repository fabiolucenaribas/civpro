import { Platform } from "@ionic/angular";

export abstract class AbstractComponent {

    constructor(
        protected platform: Platform,
    ) { }

    isPlataformMobile(): boolean {
        return this.isPlataformMobileIos() || this.isPlataformMobileAndroid();
    }

    isPlataformMobileIos(): boolean {
        return this.platform.is('ios');
    }

    isPlataformMobileAndroid(): boolean {
        return this.platform.is('android');
    }
}