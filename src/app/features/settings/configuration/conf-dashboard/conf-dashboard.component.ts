import { AfterViewInit, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { configuration } from '@shared-interfaces/settings/configuration';
import { otpForm } from '@shared-directives/dss-otp-dialog/otp-dialog.component';

import { ConfigService } from '@shared-services/user.service';
import { DialogsService } from '@shared-services/messageBox';
import { MyProvider } from '@shared-services/provider';
import { DataRefreshService } from '@shared-services/data-refresh.service';

@Component({
  selector: 'app-conf-dashboard',
  imports: [DSS_FORM_CONTROLS, otpForm],
  templateUrl: './conf-dashboard.component.html',
  styleUrl: './conf-dashboard.component.scss',
})
export class ConfDashboardComponent implements AfterViewInit {
  private readonly router = inject(Router);
  dashboardTitle: string = 'Account Details';
  private configSrc = inject(ConfigService);
  private readonly dialogSrc = inject(DialogsService);
  private readonly refreshService = inject(DataRefreshService);
  readonly provider = inject(MyProvider);
  readonly handleAdd = () => this.newCred();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);
  readonly isFilterVisible = false;
  varifyOtp: boolean = false;
  Credtials = <configuration>{};
  jsonData: configuration[] = [];
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
    this.router.navigate(['settings-form/confDetails']);
  }

  ngAfterViewInit(): void {
    this.loadData();

    this.refreshService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  private loadData(): void {
    this.configSrc.getAll().subscribe({
      next: (res) => {
        this.jsonData = res as configuration[];
      },
      error: (err) => {
        this.dialogSrc.swal({
          dialog: 'error',
          message: err.message,
        });
      },
    });
  }

  onGridEdit(item: configuration) {
    this.Credtials = item;
    this.varifyOtp = true;
    this.actions = 'view';
  }

  onGridDelete(item: configuration) {
    this.Credtials = item;
    this.varifyOtp = true;
    this.actions = 'delete';
    this.idx = this.jsonData.findIndex(
      (x) => x.id === (item as configuration).id,
    );
  }

  verifyOtp(otp: string) {
    if (this.actions == 'view') {
      this.router.navigate(['settings-form/confDetails'], {
        state: { action: 'view', data: this.Credtials },
      });
    } else {
      this.configSrc.delete(this.Credtials.id).subscribe({
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
