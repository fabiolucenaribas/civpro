import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TemplateComponent } from './template/template.component';
import { DomSanitizer } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Platform, ToastController, AlertController } from '@ionic/angular';

import {
  ConfirmationService,
  MenuItem,
  MessageService,
  PrimeNGConfig
} from 'primeng/api';
import { Formulario } from './model/formulario.model';
import { Cliente } from './model/cliente.model';
import { Utils } from './utils/Utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @ViewChild('pdfTemplate', { static: false }) templateComponent: TemplateComponent;
  @ViewChild('formFormulario', { static: true }) formFormulario: NgForm;

  title = 'CIVPRO';
  items: MenuItem[];
  estadoCivilOpcoes: any[];
  formulario = new Formulario();

  constructor(
    public domSanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    public toastController: ToastController,
    public platform: Platform,
    public datepipe: DatePipe,
    public alertController: AlertController
  ) {
    this.estadoCivilOpcoes = [
      { label: 'Solteiro', value: 'Solteiro' },
      { label: 'Casado', value: 'Casado' },
      { label: 'Outros', value: 'Outros' }
    ];
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
    console.log(this.formulario);

    this.items = [
      {
        id: 'novo',
        label: 'Novo',
        icon: 'pi pi-fw pi-plus',
        command: (event: Event) => { this.confirmaNovoFormulario(event); }
      },
      {
        id: 'carregar',
        label: 'Carregar',
        icon: 'pi pi-fw pi-upload',
      },
      {
        id: 'salvar',
        label: 'Salvar',
        icon: 'pi pi-fw pi-save',
        command: (event: Event) => { this.baixarFormulario(); }
      },
      {
        id: 'exportar',
        label: 'Exportar',
        icon: 'pi pi-fw pi-file-pdf',
        target: 'file',
        command: (event: Event) => { this.exportar(event); }
      }
    ];
  }

  activeMenu(event) {
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
      this.formulario = JSON.parse(fileReader.result.toString());

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

  exportar(event: Event) {
    if (!this.formFormulario.form.valid) {
      this.confirmarExporta(event);
    } else {
      this.gerarPdf();
    }
  }

  gerarPdf() {
    console.log(this.formulario);
    this.templateComponent.gerarPdf();
  }

  async confirmaNovoFormulario(event: Event) {
    await Utils.dialog('Atenção!', 'Tem certeza de que deseja continuar? \nO formulário atual será descartado.', async () => {
      this.formulario = new Formulario();
      await Utils.notificacao('Um novo formulario foi gerado.', this.platform, this.toastController, this.messageService);
    }, this.platform, this.alertController, this.confirmationService);
  }

  async confirmarExporta(event: Event) {
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

  validarCpf(event: any) {
    const name = event.target.attributes['ng-reflect-name'].value;

    if (Utils.validateCPF(event.target.value)) {
      this.formFormulario.form.controls[name].setErrors(null);
    } else {
      this.formFormulario.form.controls[name].setErrors({ incorrect: true });
    }
  }

  isPlataformMobile(): boolean {
    return this.platform.is('ios') || this.platform.is('android');
  }
}
