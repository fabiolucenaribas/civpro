import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Platform, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Formulario } from '../model';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
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
    private router: Router,
    public domSanitizer: DomSanitizer,
    public toastController: ToastController,
    public platform: Platform,
    public datepipe: DatePipe
  ) { }

  gerarPdf() {
    const pdfDocGenerator = this.createPDF();

    if (this.platform.is('ios') || this.platform.is('android')) {
      pdfDocGenerator.getBase64((data: any) => {
        const dateFormated = this.datepipe.transform(new Date(), 'dd_MM_yyyy HH_mm_ss');
        const filename = dateFormated + '.pdf';

        this.router.navigateByUrl('viewer', {
          state: { data: { name: filename, base64: data } }
        });
      });
    } else {
      pdfDocGenerator.open();
    }
  }

  gerarPdfBase64(): Promise<any> {
    const pdfDocGenerator = this.createPDF();

    return new Promise(function(resolve) {
      pdfDocGenerator.getBase64((data: any) => {
        resolve(data);
      });
    });
  }

  createPDF(): any {
    const innerHTML = this.pdfTemplate.nativeElement.innerHTML;

    const options = {
      tableAutoSize: true,
      defaultStyles: {
        table: { margin: [-5, 0, 0, 0] }
      }
    };

    const html = htmlToPdfmake(innerHTML, options);
    html[0].table.widths = '*';

    console.log(html);
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

    return pdfMake.createPdf(documentDefinition);
  }
}
