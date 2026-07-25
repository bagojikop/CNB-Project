import { AfterViewInit, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { configuration } from '@shared-interfaces/settings/configuration';
import { otpForm } from '@shared-directives/dss-otp-dialog/otp-dialog.component';
import { crudService } from '@shared-services/crudService';

@Component({
  selector: 'app-conf-dashboard',
  imports: [DSS_FORM_CONTROLS, otpForm],
  templateUrl: './conf-dashboard.component.html',
  styleUrl: './conf-dashboard.component.scss',
})
export class ConfDashboardComponent implements AfterViewInit {
  private readonly router = inject(Router);
  dashboardTitle: string = 'Account Details';
  private configService = inject(crudService);
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
      key: 'credDate',
      label: 'Created User',
      type: 'date',
      dateFormat: 'dd/MM/yyyy',
      frozen: true,
      _style: { width: '10%' },
      sort: 'desc',
    },
  ];

  ngOnInit(): void {
    this.configService.STORAGE_KEY.set('jsonData');
  }

  newCred() {
    this.router.navigate(['settings-form/confDetails']);
  }

  ngAfterViewInit(): void {
    const data = this.configService.getAll();
    this.jsonData = data ? (data as configuration[]) : [];
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
      (x) => x.batchId === (item as configuration).batchId,
    );
  }

  verifyOtp(otp: string) {
    if (this.actions == 'view') {
      this.router.navigate(['settings-form/confDetails'], {
        state: { action: 'view', data: this.Credtials },
      });
    } else {
      this.configService.delete(this.Credtials.batchId);
    }
  }
}
