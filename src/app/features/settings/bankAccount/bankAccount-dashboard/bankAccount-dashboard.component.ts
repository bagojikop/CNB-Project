import { AfterViewInit, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { bankAccount } from '@shared-interfaces/settings/bankAccount';
import { otpForm } from '@shared-directives/dss-otp-dialog/otp-dialog.component';

import { ConfigService } from '@shared-services/user.service';
import { DialogsService } from '@shared-services/messageBox';
import { MyProvider } from '@shared-services/provider';
import { DataRefreshService } from '@shared-services/data-refresh.service';
import { Http } from '@shared-services/httpService';

@Component({
  selector: 'app-bank-accout-dashboard',
  imports: [DSS_FORM_CONTROLS, otpForm],
  templateUrl: './bankAccount-dashboard.component.html',
  styleUrl: './bankAccount-dashboard.component.scss',
})
export class BankAccountDashboardComponent implements AfterViewInit {
  private readonly router = inject(Router);
  dashboardTitle: string = 'Account Details';
  private http = inject(Http);
  private readonly dialogSrc = inject(DialogsService);
  private readonly refreshService = inject(DataRefreshService);
  readonly provider = inject(MyProvider);
  readonly handleAdd = () => this.newCred();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);
  readonly isFilterVisible = false;
  varifyOtp: boolean = false;
  Credtials = <bankAccount>{};
  jsonData: bankAccount[] = [];
  actions: string = '';
  idx: number = -1;
  columns: any[] = [
    {
      key: 'accountNo',
      label: 'Account No.',
      type: 'string',
      _style: { width: '10%' },
    },
    {
      key: 'customerId',
      label: 'Customer ID',
      type: 'string',
      _style: { width: '10%' },
    },

    {
      key: 'firmId',
      label: 'Firm ID',
      type: 'string',
      _style: { width: '8%' },
    },
    {
      key: 'branchId',
      label: 'Branch ID',
      type: 'string',
      _style: { width: '8%' },
    },
    {
      key: 'branchCode',
      label: 'Branch Code',
      type: 'string',
      _style: { width: '8%' },
    },

    {
      key: 'accountName',
      label: 'Account Name',
      type: 'string',
      _style: { width: '39%' },
    },
    {
      key: 'credDate',
      label: 'Created Date',
      type: 'date',
      dateFormat: 'dd/MM/yyyy',
      frozen: true,
      _style: { width: '10%' },
      sort: 'desc',
    },
    {
      key: 'credUser',
      label: 'Created User',
      type: 'date',
      dateFormat: 'dd/MM/yyyy',
      frozen: true,
      _style: { width: '10%' },
      sort: 'desc',
    },
  ];

  newCred() {
    this.router.navigate(['settings-form/bankAccountDetails']);
  }

  ngAfterViewInit(): void {
    console.log(this.provider.companyInfo);
    this.loadData();

    this.refreshService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  private loadData(): void {
    this.http.get("bankAccount/all").subscribe({
      next: (res) => {
        this.jsonData = res as bankAccount[];
      },
      error: (err) => {
        this.dialogSrc.swal({
          dialog: 'error',
          message: err.message,
        });
      },
    });
  }

  onGridEdit(item: bankAccount) {
    this.Credtials = item;
    this.varifyOtp = true;
    this.actions = 'view';
  }

  onGridDelete(item: bankAccount) {
    this.Credtials = item;
    this.varifyOtp = true;
    this.actions = 'delete';
    this.idx = this.jsonData.findIndex(
      (x) => x.id === (item as bankAccount).id,
    );
  }

  verifyOtp(otp: string) {
    if (this.actions == 'view') {
      this.router.navigate(['settings-form/bankAccountDetails'], {
        state: { action: 'view', id: this.Credtials.id },
      });
    } else {
      this.http.delete('bankAccount/delete', { id: this.Credtials.id }).subscribe({
        next: (res) => {
          this.dialogSrc.swal({
            dialog: 'success',
            message: 'record Delete Successfully',
          });
        },
        error: (err) => {
          this.dialogSrc.swal({
            dialog: 'error',
            message: err.message,
          });
        },
      });
    }
  }
}
