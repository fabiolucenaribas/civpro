import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { TemplateComponent } from '../template/template.component';
import { Formulario } from '../model/compra/formulario.model';
import { Cliente } from '../model/compra/cliente.model';
import { Utils } from '../utils/Utils';
import {
  ConfirmationService,
  MenuItem,
  MenuItemCommandEvent,
  MessageService,
  PrimeNGConfig
} from 'primeng/api';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Opcoes } from '../model/compra/opcoes.model';
import { AbstractComponent } from '../abstract.component';
import { TabViewCloseEvent } from 'primeng/tabview';
import { v4 as uuidv4 } from 'uuid';
import { SelectButtonOptionClickEvent } from 'primeng/selectbutton';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent extends AbstractComponent implements OnInit {

  static readonly formularioKey: string = 'formulario';

  @ViewChild('pdfTemplate', { static: false }) templateComponent: TemplateComponent;
  @ViewChild('formFormulario', { static: true }) formFormulario: NgForm;

  title = 'CIVPRO';
  items: MenuItem[];
  estadoCivilOpcoes: any[];
  estados: any[];
  formulario = new Formulario();
  showProgressSpinner = true;
  visibleConfigureView = false;

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
    this.estadoCivilOpcoes = Utils.getEstadosCivil();
    this.estados = Utils.getEstados();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigateByUrl('/');
    });
  }

  ngOnInit() {
    console.log(this.platform.platforms());
    this.primengConfig.ripple = true;
    this.carregarItemsMenu();
    this.recuperarEstadoFormulario();
    setTimeout(() => this.showProgressSpinner = false, 500);
  }

  recuperarEstadoFormulario() {
    const formulario = localStorage.getItem(HomeComponent.formularioKey);
    if (formulario != null) {
      this.formulario = JSON.parse(formulario);

      for (const cliente of this.formulario.dadosClientes) {
        cliente.id = cliente.id ? cliente.id : uuidv4();

        if (cliente.dados.dataNascimento) {
          cliente.dados.dataNascimento = new Date(cliente.dados.dataNascimento);
        }
      }

      if (!this.formulario.opcoes) {
        this.formulario.opcoes = new Opcoes();
      }
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
        cliente.id = cliente.id ? cliente.id : uuidv4();

        if (cliente.dados.dataNascimento) {
          cliente.dados.dataNascimento = new Date(cliente.dados.dataNascimento);
        }
      }

      if (!this.formulario.opcoes) {
        this.formulario.opcoes = new Opcoes();
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

        zip.generateAsync({ type: 'blob' })
          .then(function (content) {
            saveAs(content, dateFormated + '.zip');
          });
      }
    );
  }

  exportar() {
    // if (!this.formFormulario.form.valid) {
    // this.confirmarExporta();
    // } else {
    this.gerarPdf();
    // }
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
    }, async () => {}, this.platform, this.alertController, this.confirmationService);
  }

  async confirmarExporta() {
    await Utils.dialog('Atenção!', 'Ainda possui campos obrigatórios não preenchidos.\nDeseja continuar?', async () => {
      this.gerarPdf();
    }, async () => {},this.platform, this.alertController, this.confirmationService);
  }

  uploadLogo(files: FileList) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.formulario.imagem = 'data:image/png;base64, ' + btoa(fileReader.result.toString());
    };
    fileReader.readAsBinaryString(files.item(0));
  }

  async gerarConjuge(event: SelectButtonOptionClickEvent, index) {
    console.log(event)
    let clientes = this.formulario.dadosClientes;

    const cliente = clientes[index];
    delete cliente.dados.estadocivilespecifico;
    delete cliente.dados.regimeComunhao;

    const estadocivilAnterior = cliente.dados.estadocivil;
    cliente.dados.estadocivil = event.option?.value;
    let isConjuge = cliente.dados.estadocivil !== 'Solteiro';

    let clienteConjuge = clientes.filter(c => c.idRelacao == cliente.id && c.conjuge)

    if (isConjuge) {
      if (!clienteConjuge || clienteConjuge.length == 0) {
        clientes.splice(index + 1, 0, new Cliente({ idRelacao: cliente.id, conjuge: true }));
      }
    } else if (clienteConjuge && clienteConjuge.length > 0) {
      const nomeConjuge = this.nomeCurtoConjuge(clienteConjuge[0]?.dados?.nome)
      await Utils.dialog('Atenção!', 'O cliente "' + nomeConjuge + '" será removido.\nDeseja continuar?', async () => {
        clientes.splice(clientes.indexOf(clienteConjuge[0]), 1);
        await Utils.notificacao('O Cliente "' + nomeConjuge + '" removido.', this.platform, this.toastController, this.messageService);
      }, async () => {
        cliente.dados.estadocivil = estadocivilAnterior;
      }, this.platform, this.alertController, this.confirmationService);
    }
    console.log(clientes)
  }

  async adicionarCliente() {
    let clientes = this.formulario.dadosClientes;
    clientes.push(new Cliente());
    await Utils.notificacao('Novo cliente adicionado.', this.platform, this.toastController, this.messageService);
  }

  async removerCliente(event: TabViewCloseEvent) {
    let clientes = this.formulario.dadosClientes;
    const index = event.index;
    const cliente = clientes[index];

    let clienteConjuge = clientes.filter(c => c .idRelacao == cliente.id && c.conjuge);
    const possuiConjuge = clienteConjuge && clienteConjuge.length > 0;
    
    const nomeCliente = cliente?.dados?.nome ? this.nomeCurto(cliente.dados.nome) : 'Cliente ' + (index + 1)
    const nomeConjuge = this.nomeCurtoConjuge(clienteConjuge[0]?.dados?.nome)

    let mensagem;
    if (possuiConjuge){
      mensagem = 'O cliente "' + nomeCliente + ' e "' + nomeConjuge + '" serão removidos.\nDeseja continuar?'
    }else{
      mensagem = 'O cliente "' + nomeCliente + '" será removido.\nDeseja continuar?'
    }

    await Utils.dialog('Atenção!', mensagem, async () => {
      event.close();

      clientes.splice(index, 1);
      await Utils.notificacao('O Cliente "' + nomeCliente + '" removido.', this.platform, this.toastController, this.messageService);

      if (possuiConjuge){
        clientes.splice(clientes.indexOf(clienteConjuge[0]), 1);
        await Utils.notificacao('O Cliente "' + nomeConjuge + '" removido.', this.platform, this.toastController, this.messageService);
      }
    }, async () => {}, this.platform, this.alertController, this.confirmationService);

  }

  carregarItemsMenu() {

    const opcoes = {
      compra: {
        visible: false
      },
      captacao: {
        command: (event: MenuItemCommandEvent) => { this.router.navigateByUrl('captacao'); }
      },
      novo: {
        command: (event: MenuItemCommandEvent) => { this.confirmaNovoFormulario(); }
      },
      carregar: {
        command: (event: MenuItemCommandEvent) => { this.carregar(); }
      },
      salvar: {
        command: (event: MenuItemCommandEvent) => { this.baixarFormulario(); }
      },
      config: {
        command: (event: MenuItemCommandEvent) => { this.showConfigureView(); },
        visible: true
      },
      exportar: {
        command: (event: MenuItemCommandEvent) => { this.exportar(); }
      }
    }
    
    this.items = Utils.getMenuItems(opcoes)
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

  showConfigureView() {
    this.visibleConfigureView = true;
  }

  nomeCurtoConjuge(frase: string): string {
    return frase ? this.nomeCurto(frase) + ' (Conjuge)' : 'Conjuge'
  }

  nomeCurto(frase: string): string {
    const palavras = frase?.trim().split(" ");
    return palavras && palavras.length >= 2 ? `${palavras[0]} ${palavras[palavras.length - 1]}` : frase;
  }
}
