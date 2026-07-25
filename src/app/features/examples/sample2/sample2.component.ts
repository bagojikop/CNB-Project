import { Component, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IColumn } from '@coreui/angular-pro';
import { DssTableDashboardComponent } from '@shared-directives/dss-table-dashboard/dss-table-dashboard';
import { DssViewportHeightDirective } from '@shared-directives/dss-viewport-height/dss-viewport-height.directive';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { Http } from '@shared-services/httpService';
import { DialogsService } from '@shared-services/messageBox';
import { firstValueFrom } from 'rxjs';

type DashboardColumn = IColumn & {
  type?: 'date' | 'number';
  dateFormat?: string;
  fraction?: number;
  frozen?: boolean;
  sort?: 'asc' | 'desc';
};

@Component({
  selector: 'app-sample2',
  standalone: true,
  imports: [DssViewportHeightDirective, DssTableDashboardComponent],
  templateUrl: './sample2.component.html',
  styleUrl: './sample2.component.scss'
})
export class Sample2Component {
  @ViewChild('dashboardGrid') private dashboardGrid?: DssTableDashboardComponent;

  private readonly router = inject(Router);
  private readonly http = inject(Http);
  private readonly dialogs = inject(DialogsService);

  readonly dashboardTitle = 'Sales Invoice Dashboard';
  readonly isFilterVisible = true;
  readonly dashboardActions = { add: true, edit: true, delete: true };
  readonly handleAdd = () => this.newInvoice();
  readonly handleEdit = (item?: unknown) => this.onGridEdit(item);
  readonly handleDelete = (item?: unknown) => this.onGridDelete(item);

  readonly columns: (DashboardColumn | string)[] = [
    {
      key: 'vch_date',
      label: 'Date',
      type: 'date',
      dateFormat: 'dd/MM/yyyy',
      frozen: true,
      _style: { width: '8%' },
      sort: 'desc'
    },
    {
      key: 'challan_no',
      label: 'Bill No',
      frozen: true,
      _style: { width: '12%' },
      _colClass: 'text-start',
      sort: 'desc'
    },
    {
      key: 'mst011.Acc_name',
      label: 'Consignee',
      _style: { width: '30%' },
      _colClass: 'text-start'
    },
    {
      key: 'mst006.City_name',
      label: 'Shipped To',
      _style: { width: '15%' },
      _colClass: 'text-start'
    },
    {
      key: 'torder_nm',
      label: 'Sales Type',
      _style: { width: '8%' },
      _colClass: 'text-start'
    },
    {
      key: 'netAmt',
      label: 'Bill Amount',
      type: 'number',
      fraction: 2,
      _style: { width: '10%' },
      _colClass: 'text-end'
    },
    {
      key: 'e_inv_status',
      label: 'E-Invoice',
      _style: { width: '10%' },
      _colClass: 'text-start'
    },
    {
      key: 'ewaybillno',
      label: 'E-Way Bill',
      _style: { width: '12%' },
      _colClass: 'text-start'
    }
  ];

  newInvoice(): void {
    void this.router.navigate(['sales/SalesInvoiceEdit'], {
      state: { action: 'new' }
    });
  }

  onGridEdit(item: unknown): void {
    const voucherId = this.getVoucherId(item);

    if (!voucherId) return;

    void this.router.navigate(['sales/SalesInvoiceEdit'], {
      state: {
        action: 'view',
        vch_id: voucherId
      }
    });
  }

  async onGridDelete(item: unknown): Promise<void> {
    const voucherId = this.getVoucherId(item);

    if (!voucherId) return;

    const confirmed = await this.dialogs.swal({
      dialog: 'confirm',
      title: 'Delete Sales Invoice',
      message: 'Do you want to delete this sales invoice?'
    });

    if (!confirmed) return;

    try {
      const response = await firstValueFrom(
        this.http.delete('SalesInvoice/Delete', { id: voucherId })
      ) as apiResponse;

      if (response?.status_cd !== 1) {
        await this.dialogs.swal({
          dialog: 'error',
          title: 'Delete Failed',
          message: response?.errors?.message ?? 'Sales invoice could not be deleted.'
        });
        return;
      }

      this.removeDeletedInvoice(voucherId);

      await this.dialogs.swal({
        dialog: 'success',
        title: 'Deleted',
        message: 'Sales invoice deleted successfully.'
      });
    } catch (err: any) {
      await this.dialogs.swal({
        dialog: 'error',
        title: 'Delete Failed',
        message: err?.message ?? 'Sales invoice could not be deleted.'
      });
    }
  }

  private getVoucherId(item: unknown): number | null {
    if (!item || typeof item !== 'object') return null;

    const voucherId = Number((item as { vch_id?: unknown }).vch_id);

    return Number.isFinite(voucherId) && voucherId > 0 ? voucherId : null;
  }

  private removeDeletedInvoice(voucherId: number): void {
    if (!this.dashboardGrid) return;

    this.dashboardGrid.usersData = this.dashboardGrid.usersData.filter(
      (item) => Number(item?.['vch_id']) !== voucherId
    );
  }
}
