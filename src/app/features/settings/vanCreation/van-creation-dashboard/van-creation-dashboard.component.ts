import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { Router } from '@angular/router';
import {
  CreateVANRequest,
  EncryptData,
} from '@shared-interfaces/settings/van-creation';
import { vanCreationService } from '@shared-services/user.service';
import { DialogsService } from '@shared-services/messageBox';

@Component({
  selector: 'app-van-creation-dashboard',
  imports: [CommonModule, DSS_FORM_CONTROLS],
  templateUrl: './van-creation-dashboard.component.html',
  styleUrl: './van-creation-dashboard.component.scss',
})
export class VanCreationDashboardComponent implements OnInit {
  private readonly crudSrc = inject(vanCreationService);
  private readonly dialog = inject(DialogsService);

  handleAdd = () => this.addVanCreation();

  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);
  private router = inject(Router);

  dashboardTitle: string = 'VAN Creation';

  jsonData = <CreateVANRequest[]>[];
  columns: any[] = [
    {
      key: 'Request.body.encryptData.accountNo',
      label: 'Account No.',
      type: 'string',
      _style: { width: '20%' },
    },
    {
      key: 'Request.body.encryptData.startDate',
      label: 'Start Date',
      type: 'string',
      _style: { width: '20%' },
    },
    {
      key: 'Request.body.encryptData.endDate',
      label: 'End Date',
      type: 'string',
      _style: { width: '20%' },
    },
    {
      key: 'Request.body.encryptData.countVAN',
      label: 'Count of VANs',
      type: 'string',
      _style: { width: '20%' },
    },
  ];

  ngOnInit(): void {
    this.crudSrc.getAll().subscribe({
      next: (response) => {
        this.jsonData = response;
      },
      error: (error) => {
        this.dialog.swal({
          dialog: 'error',
          message: error.message,
        });
      },
    });
  }

  addVanCreation = () =>
    this.router.navigate(['/settings-form/vanCreationEdit']);

  onGridEdit = (item: any) => {
    console.log('Edit item:', item);
    const id = item.id;

    this.router.navigate(['/settings-form/vanCreationEdit'], {
      state: { id },
    });
  };

  onGridDelete = (item: any) => {
    this.dialog
      .swal({
        dialog: 'confirm',
        message: 'Do you want to Delete this record !',
      })
      .then((res) => {
        if (res) {
          const index = this.jsonData.findIndex((x) => x.id === item.id);
          if (index !== -1) {
            this.crudSrc.delete(item.id).subscribe({
              next: () => {
                this.jsonData.splice(index, 1);
                this.dialog.swal({
                  dialog: 'success',
                  message: 'Record deleted successfully',
                });
              },
              error: (error) => {
                this.dialog.swal({
                  dialog: 'error',
                  message: error.message,
                });
              },
            });
          }
        }
      });
  };
}
