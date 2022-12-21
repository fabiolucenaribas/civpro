import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform, ToastController, AlertController } from '@ionic/angular';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';

export class Utils {

  public static async notificacao(mensagem: string, platform: Platform,
    toastController?: ToastController, messageService?: MessageService) {
    if (platform.is('ios') || platform.is('android')) {
      if (toastController !== undefined) {
        const toast = await toastController.create({
          message: mensagem,
          duration: 2000
        });
        toast.present();
      }
    } else {
      if (messageService !== undefined) {
        messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: mensagem
        });
      }
    }
  }

  public static async dialog(titulo: string, mensagem: string, handlerAccept: any,
    platform: Platform, alertController: AlertController, confirmationService: ConfirmationService) {
    if (platform.is('ios') || platform.is('android')) {
      const alert = await alertController.create({
        header: titulo,
        message: mensagem,
        buttons: [
          {
            text: 'Cancelar',
            role: 'Cancelar',
            cssClass: 'secondary',
            id: 'cancel-button',
          }, {
            text: 'Ok',
            id: 'confirm-button',
            handler: () => {
              handlerAccept();
            }
          }
        ]
      });

      await alert.present();
    } else {
      const confirmation: Confirmation = {
        header: titulo,
        message: mensagem,
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Não',
        rejectIcon: 'pi pi-times',
        acceptLabel: 'Sim',
        acceptIcon: 'pi pi-check',
        defaultFocus: 'reject',
        acceptButtonStyleClass: 'p-button-text p-button-secondary',
        accept: () => {
          handlerAccept();
        }
      };

      confirmationService.confirm(confirmation);
    }
  }

  public static async salvarArquivo(filename: string, filetype: string,
    base64: string, platform: Platform, callbackSucesso?: any,) {
    if (!platform.is('mobileweb') && (platform.is('ios') || platform.is('android'))) {
      try {
        await Filesystem.writeFile({
          path: filename,
          data: 'data:' + filetype + ';base64,' + base64,
          directory: Directory.Documents
        });
      } catch (e) {
        console.error('Erro ao salvar arquivo: ' + filename, e);
      }
    } else {
      
      const a = document.createElement('a');
      const dataURI = 'data:' + filetype + ';base64,' + base64;
      a.href = dataURI;
      a.download = filename;

      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      a.dispatchEvent(clickEvent);
      a.remove();
    }

    if (callbackSucesso !== undefined) {
      callbackSucesso();
    }
  };

  public static validateCPF(value: string): boolean {
    const cpf = value.replace(/[^\d]+/g, '');
    let i = 0;
    let add = 0;
    let rev = 0;
    if (cpf === '') {
      return false;
    }
    if (cpf.length !== 11 ||
      cpf === '00000000000' ||
      cpf === '11111111111' ||
      cpf === '22222222222' ||
      cpf === '33333333333' ||
      cpf === '44444444444' ||
      cpf === '55555555555' ||
      cpf === '66666666666' ||
      cpf === '77777777777' ||
      cpf === '88888888888' ||
      cpf === '99999999999') {
      return false;
    }

    for (i = 0; i < 9; i++) {
      add += +cpf.charAt(i) * (10 - i);
    }

    rev = 11 - (add % 11);

    if (rev === 10 || rev === 11) {
      rev = 0;
    }

    if (rev !== +cpf.charAt(9)) {
      return false;
    }

    add = 0;

    for (i = 0; i < 10; i++) {
      add += +cpf.charAt(i) * (11 - i);
    }

    rev = 11 - (add % 11);

    if (rev === 10 || rev === 11) {
      rev = 0;
    }

    if (rev !== +cpf.charAt(10)) {
      return false;
    }

    return true;
  }

  public static b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      const charset = '0x' + p1;
      return String.fromCharCode(parseInt(charset, 16));
    }));
  }
}
