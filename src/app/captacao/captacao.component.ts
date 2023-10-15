import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { TemplateComponent } from '../template/template.component';
import { Utils } from '../utils/Utils';
import {
  ConfirmationService,
  MenuItem,
  MenuItemCommandEvent,
  MessageService,
  PrimeNGConfig
} from 'primeng/api';
import { AbstractComponent } from '../abstract.component';


@Component({
  selector: 'app-home',
  templateUrl: './captacao.component.html',
  styleUrls: ['./captacao.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CaptacaoComponent extends AbstractComponent implements OnInit {

  static readonly formularioKey: string = 'formulario';

  @ViewChild('pdfTemplate', { static: false }) templateComponent: TemplateComponent;
  @ViewChild('formFormulario', { static: true }) formFormulario: NgForm;

  title = 'CIVPRO';
  items: MenuItem[];
  showProgressSpinner = true;

  constructor(
    public domSanitizer: DomSanitizer,
    private router: Router,
    protected platform: Platform,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private toastController: ToastController,
    private datepipe: DatePipe,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {
    super(platform)
    this.showProgressSpinner = true;

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigateByUrl('/');
    });
  }

  ngOnInit() {
    console.log(this.platform.platforms());
    this.primengConfig.ripple = true;
    this.carregarItemsMenu();
    setTimeout(() => this.showProgressSpinner = false, 500);
  }

  carregarItemsMenu() {

    const opcoes = {
      compra: {
        command: (event: MenuItemCommandEvent) => { this.router.navigateByUrl('/'); }
      },
      captacao: {
        visible: false
      }
    }

    this.items = Utils.getMenuItems(opcoes)
  }

  async presentOptionsActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções',
      buttons: [{
        text: 'Novo',
        role: 'novo',
        icon: this.isPlataformMobileAndroid() ? 'add-circle-outline' : '',
        handler: () => { }
      }, {
        text: 'Carregar',
        icon: this.isPlataformMobileAndroid() ? 'push-outline' : '',
        handler: () => { }
      }, {
        text: 'Salvar',
        icon: this.isPlataformMobileAndroid() ? 'save-outline' : '',
        handler: () => { }
      },
      {
        text: 'Exportar',
        icon: this.isPlataformMobileAndroid() ? 'document-text-outline' : '',
        handler: () => { }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancelar',
        handler: () => { }
      }]
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }
}
