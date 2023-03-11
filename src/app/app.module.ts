import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';

import { NgxMaskModule, IConfig } from 'ngx-mask';

import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

import { DatePipe, registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';


import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TemplateComponent } from './template/template.component';
import { ViewerPdfComponent } from './viewer-pdf/viewer-pdf.component';
import { HomeComponent } from './home/home.component';

const maskConfig: Partial<IConfig> = {
  validation: true,
};

registerLocaleData(localePt);

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        TemplateComponent,
        ViewerPdfComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgxExtendedPdfViewerModule,
        HttpClientModule,
        FormsModule,
        InputTextModule,
        InputNumberModule,
        InputTextareaModule,
        ButtonModule,
        SelectButtonModule,
        CalendarModule,
        TableModule,
        TabViewModule,
        AccordionModule,
        CheckboxModule,
        MenubarModule,
        DialogModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ToastModule,
        MessagesModule,
        MessageModule,
        NgxMaskModule.forRoot(maskConfig),
        IonicModule.forRoot(),
        AppRoutingModule
    ],
    providers: [
        DatePipe,
        ConfirmationService,
        MessageService,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
