import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DssLocaleService {
  private readonly localeSignal = signal('en-IN');
  private readonly dateFormatSignal = signal<'dd/mm/yyyy' | 'mm/dd/yyyy'>('dd/mm/yyyy');

  readonly locale = this.localeSignal.asReadonly();
  readonly dateFormat = this.dateFormatSignal.asReadonly();

  setLocale(locale: string): void {
    this.localeSignal.set(locale);
  }

  setDateFormat(dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy'): void {
    this.dateFormatSignal.set(dateFormat);
  }
}

@Injectable({
  providedIn: 'root',
})
export class NavbarActions {
  fieldsetDisabled = true;
  newBtnDisabled = false;
  editBtnDisabled = false;
  saveBtnDisabled = true;
  undoBtnDisabled = true;
  printBtnDisabled = false;

  navaction(action: string | null | undefined): void {
    switch ((action ?? '').toLowerCase()) {
      case 'new':
        this.fieldsetDisabled = false;
        this.newBtnDisabled = true;
        this.editBtnDisabled = true;
        this.saveBtnDisabled = false;
        this.undoBtnDisabled = false;
        this.printBtnDisabled = false;
        break;

      case 'edit':
        this.fieldsetDisabled = false;
        this.newBtnDisabled = true;
        this.editBtnDisabled = true;
        this.saveBtnDisabled = false;
        this.undoBtnDisabled = false;
        this.printBtnDisabled = false;
        break;

      default:
        this.fieldsetDisabled = true;
        this.newBtnDisabled = false;
        this.editBtnDisabled = false;
        this.saveBtnDisabled = true;
        this.undoBtnDisabled = true;
        this.printBtnDisabled = false;
        break;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserPermissions {
  private info: any = { a: 1, e: 1 };

  getInfo(): any {
    return this.info;
  }

  setInfo(info: any): void {
    this.info = info;
  }
}
