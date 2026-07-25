import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DialogsService } from './messageBox';
import { CompanyInfo } from '@shared-interfaces/commans/company-report-navs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyProvider {
  
  apiServer: string = environment.apiServer;
  reportServer: string = environment.reportServer;
  tokenBased: boolean = true;

  companyInfo?: CompanyInfo = <CompanyInfo>{};

  ShareData: any = {
    audit: {},
  };

  constructor(private dialog: DialogsService) {}

  validForm(form: NgForm, prefixes: string[] = ['th_']): Promise<boolean> {
    return new Promise((resolve) => {
      const invalidControls: { Field: string; Errors: any }[] = [];

      Object.keys(form.controls)
        .filter((key) => !prefixes.some((p) => key.startsWith(p)))
        .forEach((key) => {
          const control = form.controls[key];

          if (control.invalid) {
            control.markAsTouched({ onlySelf: true });

            console.log('Invalid Field:', key);
            console.log('Value:', control.value);
            console.log('Errors:', control.errors);

            invalidControls.push({
              Field: key,
              Errors: control.errors,
            });
          }
        });

      if (invalidControls.length > 0) {
        this.dialog
          .swal({
            dialog: 'error',
            title: 'Required / Invalid',
            message: JSON.stringify(invalidControls, null, 2),
          })
          .then(() => resolve(false));
      } else {
        resolve(true);
      }
    });
  }

  

  validThead(form: NgForm, prefix: string = 'th_'): boolean {
    const controls = Object.keys(form.controls)
      .filter((k) => k.startsWith(prefix))
      .map((k) => form.controls[k]);

    const invalid = controls.some((c) => c.invalid);
    // if (invalid) controls.forEach((c) => c.markAsTouched());
    return invalid;
  }
  resetThead(form: NgForm, prefix: string = 'th_') {
    const controls = Object.keys(form.controls)
      .filter((k) => k.startsWith(prefix))
      .map((k) => form.controls[k]);

    controls.forEach((c) => c.reset());
  }

  private formatValidationErrors(invalidControls: { Field: string; Errors: any }[]): string {
    const errorMessages: string[] = [];

    invalidControls.forEach((control) => {
      const fieldName = this.formatFieldName(control.Field);
      const errors = control.Errors;

      if (errors.required) {
        errorMessages.push(`• ${fieldName} is required`);
      }

      if (errors.email) {
        errorMessages.push(`• ${fieldName} must be a valid email address`);
      }

      if (errors.pattern) {
        errorMessages.push(`• ${fieldName} has an invalid format`);
      }

      if (errors.minlength) {
        errorMessages.push(
          `• ${fieldName} must be at least ${errors.minlength.requiredLength} characters`
        );
      }

      if (errors.maxlength) {
        errorMessages.push(
          `• ${fieldName} cannot exceed ${errors.maxlength.requiredLength} characters`
        );
      }

      if (errors.min) {
        errorMessages.push(`• ${fieldName} must be at least ${errors.min.min}`);
      }

      if (errors.max) {
        errorMessages.push(`• ${fieldName} cannot exceed ${errors.max.max}`);
      }

      // Handle any other custom errors
      const handledErrors = [
        'required',
        'email',
        'pattern',
        'minlength',
        'maxlength',
        'min',
        'max',
      ];
      Object.keys(errors).forEach((errorKey) => {
        if (!handledErrors.includes(errorKey)) {
          errorMessages.push(`• ${fieldName} is invalid`);
        }
      });
    });

    return errorMessages.join('\n');
  }

  private formatFieldName(fieldName: string): string {
    // Convert camelCase or snake_case to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  currentDate() {
    const { fdt, tdt } = this.companyInfo?.finYear;
    const today = new Date();

    if (!fdt || !tdt) {
      return today; // fallback
    }
    const finYearStart = new Date(fdt);
    const finYearEnd = new Date(tdt);

    if (today >= finYearStart && today <= finYearEnd) {
      return today;
    } else if (today < finYearStart) {
      return finYearStart;
    }
    return finYearEnd;
  }

  isCurrFirmgstregistered(): boolean {
    return (
      this.companyInfo?.company?.mst00409?.gstTyp == 0 && this.companyInfo?.company?.mst00409?.gstNo
    );
  }
  formatDateDDMMYYYY(date: string | Date | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  toDateTimeLocal(original: string): string {
    // original = "08/01/2026 06:45:00 PM"
    const [datePart, timePart, ampm] = original.split(' ');
    const [day, month, year] = datePart.split('/');
    let [hoursStr, minutes, seconds] = timePart.split(':');

    let hours = Number(hoursStr || 12);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hours).padStart(
      2,
      '0'
    )}:${minutes || '00'}:${seconds || '00'}`;
  }

  toOriginalFormat(dtLocal: string): string {
    const d = new Date(dtLocal);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 0-based month
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0'); // seconds
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert 24-hour to 12-hour
    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
  }
}
