import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { DatePipe } from '@angular/common'
import { Platform, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Formulario } from '../model';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
import { Utils } from '../utils/Utils';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent {

  @Input() formulario: Formulario;

  @ViewChild('pdfTemplate') pdfTemplate: ElementRef;

  constructor(
    public domSanitizer: DomSanitizer,
    public toastController: ToastController,
    public platform: Platform,
    public datepipe: DatePipe
  ) { }

  gerarPdf() {
    const innerHTML = this.pdfTemplate.nativeElement.innerHTML;

    const options = {
      defaultStyles: {
        table: { margin: [-5, 0, 0, 0] }
      }
    };

    const html = htmlToPdfmake(innerHTML, options);

    const documentDefinition = {
      content: html,

      // a string or { width: number, height: number }
      pageSize: 'B4',

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'portrait',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [35, 30, 30, 25],

      pageNumbers: [1]
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    if (this.platform.is('ios') || this.platform.is('android')) {
      pdfDocGenerator.getBase64((data) => {
        let dateFormated = this.datepipe.transform(new Date(), 'dd_MM_yyyy HH_mm_ss');
        const filename = dateFormated + '.pdf';
        Utils.salvarArquivo(filename, 'application/pdf', data,
          this.platform, async () => {
            await Utils.notificacao('Formulario exportado com sucesso.', this.platform, this.toastController)
          });
      });
    } else {
      pdfDocGenerator.open();
    }
  }
}
