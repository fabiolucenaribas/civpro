import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { TemplateComponent } from '../template/template.component';
import { Formulario } from '../model/formulario.model';
import { Cliente } from '../model/cliente.model';
import { Utils } from '../utils/Utils';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  PrimeIcons,
  PrimeNGConfig
} from 'primeng/api';

import { saveAs } from "file-saver";
import JSZip from "jszip";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  static readonly formularioKey: string = 'formulario';

  @ViewChild('pdfTemplate', { static: false }) templateComponent: TemplateComponent;
  @ViewChild('formFormulario', { static: true }) formFormulario: NgForm;

  title = 'CIVPRO';
  items: MenuItem[];
  estadoCivilOpcoes: any[];
  formulario = new Formulario();

  constructor(
    public domSanitizer: DomSanitizer,
    private router: Router,
    private platform: Platform,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private toastController: ToastController,
    private datepipe: DatePipe,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {
    this.estadoCivilOpcoes = [
      { label: 'Solteiro', value: 'Solteiro' },
      { label: 'Casado', value: 'Casado' },
      { label: 'Outros', value: 'Outros' }
    ];

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigateByUrl('home');
    });
  }

  ngOnInit() {
    console.log(this.platform.platforms());
    this.primengConfig.ripple = true;
    this.carregarItemsMenu();
    this.recuperarEstadoFormulario();
  }

  recuperarEstadoFormulario() {
    const formulario = localStorage.getItem(HomeComponent.formularioKey);
    if (formulario != null) {
      this.formulario = JSON.parse(formulario);
    }
  }

  activeMenu(event: any) {
    if (event.target.id === 'carregar') {
      this.carregar();
    }
  }

  carregar() {
    const file = document.getElementById('file');
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: false
    });
    file.dispatchEvent(clickEvent);
  }

  carregarFormulario(files: FileList) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const result = fileReader.result.toString();
      localStorage.setItem(HomeComponent.formularioKey, result);
      this.formulario = JSON.parse(result);
      for (const cliente of this.formulario.dadosClientes) {
        cliente.dados.dataNascimento = new Date(cliente.dados.dataNascimento);
      }
    };
    fileReader.readAsText(files.item(0));
  }

  async baixarFormulario() {

    const dateFormated = this.datepipe.transform(new Date(), 'dd_MM_yyyy HH_mm_ss');
    const filename = dateFormated + '.json';
    const json = JSON.stringify(this.formulario);
    const base64 = Utils.b64EncodeUnicode(json);

    await Utils.salvarArquivo(filename, 'text/plain', base64,
      this.platform, async () => {
        await Utils.notificacao('Formulario baixado com sucesso.', this.platform, this.toastController);
      });
  }

  gerarArquivoZipado() {
    const zip = new JSZip();

    const dateFormated = this.datepipe.transform(new Date(), 'dd_MM_yyyy HH_mm_ss');
    const filenameJson = dateFormated + '.json';

    const json = JSON.stringify(this.formulario);
    const base64Json = Utils.b64EncodeUnicode(json);
    zip.file(filenameJson, base64Json, { base64: true });

    const filenamePDF = dateFormated + '.pdf';

    this.templateComponent.gerarPdfBase64().then(
      result => {
        zip.file(filenamePDF, result, { base64: true });

        zip.generateAsync({ type: "blob" })
          .then(function (content) {
            saveAs(content, dateFormated + '.zip');
          });
      }
    );
  }

  exportar() {
    if (!this.formFormulario.form.valid) {
      this.confirmarExporta();
    } else {
      this.gerarPdf();
    }
  }

  gerarPdf() {
    console.log(this.formulario);

    localStorage.setItem(HomeComponent.formularioKey, JSON.stringify(this.formulario));
    this.templateComponent.gerarPdf();
  }

  async confirmaNovoFormulario() {
    await Utils.dialog('Atenção!', 'Tem certeza de que deseja continuar? \nO formulário atual será descartado.', async () => {
      localStorage.removeItem(HomeComponent.formularioKey);
      this.formulario = new Formulario();
      await Utils.notificacao('Um novo formulario foi gerado.', this.platform, this.toastController, this.messageService);
    }, this.platform, this.alertController, this.confirmationService);
  }

  async confirmarExporta() {
    await Utils.dialog('Atenção!', 'Ainda possui campos obrigatórios não preenchidos.\nDeseja continuar?', async () => {
      this.gerarPdf();
    }, this.platform, this.alertController, this.confirmationService);
  }

  uploadLogo(files: FileList) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.formulario.imagem = 'data:image/png;base64, ' + btoa(fileReader.result.toString());
    };
    fileReader.readAsBinaryString(files.item(0));
  }

  gerarCliente2() {
    const clientes = this.formulario.dadosClientes;

    const primeiroCliente = clientes[0];
    delete primeiroCliente.dados.estadocivilespecifico;
    delete primeiroCliente.dados.regimeComunhao;

    if (clientes.length > 1) {
      clientes.splice(2, 1);
    } else {
      clientes.push(new Cliente());
    }
  }

  carregarItemsMenu() {
    this.items = [
      {
        id: 'novo',
        label: 'Novo',
        icon: PrimeIcons.PLUS,
        command: (event: Event) => { this.confirmaNovoFormulario(); }
      },
      {
        id: 'carregar',
        label: 'Carregar',
        icon: PrimeIcons.UPLOAD,
      },
      {
        id: 'salvar',
        label: 'Salvar',
        icon: PrimeIcons.SAVE,
        command: (event: Event) => { this.baixarFormulario(); }
      },
      {
        id: 'exportar',
        label: 'Exportar',
        icon: PrimeIcons.FILE_PDF,
        target: 'file',
        command: (event: Event) => { this.exportar(); }
      }
    ];
  }

  validarCpf(event: any) {
    const name = event.target.attributes['ng-reflect-name'].value;

    if (Utils.validateCPF(event.target.value)) {
      this.formFormulario.form.controls[name].setErrors(null);
    } else {
      this.formFormulario.form.controls[name].setErrors({ incorrect: true });
    }
  }

  async presentOptionsActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções',
      buttons: [{
        text: 'Novo',
        role: 'novo',
        icon: this.isPlataformMobileAndroid() ? 'add-circle-outline' : '',
        handler: () => {
          this.confirmaNovoFormulario();
        }
      }, {
        text: 'Carregar',
        icon: this.isPlataformMobileAndroid() ? 'push-outline' : '',
        handler: () => {
          this.carregar();
        }
      }, {
        text: 'Salvar',
        icon: this.isPlataformMobileAndroid() ? 'save-outline' : '',
        handler: () => {
          this.baixarFormulario();
        }
      }, 
      {
        text: 'Exportar',
        icon: this.isPlataformMobileAndroid() ? 'document-text-outline' : '',
        handler: () => {
          this.exportar();
        }
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
