import { Platform, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
  selector: 'app-viewer-pdf',
  templateUrl: './viewer-pdf.component.html',
  styleUrls: ['./viewer-pdf.component.scss'],
})
export class ViewerPdfComponent implements OnInit {
  title = 'CIVPRO';
  data: any;
  pdfSrc: any;

  constructor(
    private router: Router,
    private platform: Platform,
    private toastController: ToastController
  ) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras?.state?.data;
  }

  ngOnInit() {
    this.pdfSrc = this.data?.base64;
  }

  exportarPDF() {
    const filename = this.data.name;
    const base64 = this.data.base64;

    Utils.salvarArquivo(filename, 'application/pdf', base64,
      this.platform, async () => {
        await Utils.notificacao('Formulario exportado com sucesso.', this.platform, this.toastController);
      });
  }
}
