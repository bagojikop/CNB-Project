import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { CreateVANRequest } from '@shared-interfaces/settings/van-creation';
import { DialogsService } from '@shared-services/messageBox';
import { MyProvider } from '@shared-services/provider';
import { vanCreationService } from '@shared-services/user.service';

@Component({
  selector: 'app-vanexpiry-status',
  imports: [CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  templateUrl: './vanexpiry-status.component.html',
  styleUrl: './vanexpiry-status.component.scss',
})
export class VANExpiryStatusComponent implements OnInit {
  readonly provider = inject(MyProvider);
  private configSrc = inject(vanCreationService);
  private dialog = inject(DialogsService);
  private fb = inject(FormBuilder);

  expiringSoonList: any[] = [];
  expiryForm!: FormGroup;
  isModalVisible = false;
  selectedRowIndex = -1;
  editForm!: FormGroup;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  Math = Math;

  // Column-specific search filters
  searchFilters = {
    accountNo: '',
    empName: '',
    vanNumber: '',
    startDate: '',
    endDate: '',
  };

  get filteredData(): any[] {
    return this.expiringSoonList.filter((item) => {
      const matchAccount =
        !this.searchFilters.accountNo ||
        item.accountNo
          ?.toLowerCase()
          .includes(this.searchFilters.accountNo.toLowerCase().trim());
      const matchEmp =
        !this.searchFilters.empName ||
        item.empName
          ?.toLowerCase()
          .includes(this.searchFilters.empName.toLowerCase().trim());
      const matchVan =
        !this.searchFilters.vanNumber ||
        item.vanNumber
          ?.toLowerCase()
          .includes(this.searchFilters.vanNumber.toLowerCase().trim());
      const matchStart =
        !this.searchFilters.startDate ||
        item.startDate?.includes(this.searchFilters.startDate.trim());
      const matchEnd =
        !this.searchFilters.endDate ||
        item.endDate?.includes(this.searchFilters.endDate.trim());

      return matchAccount && matchEmp && matchVan && matchStart && matchEnd;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  get paginatedRows(): FormArray {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const controls = this.expiryRows.controls.slice(start, end);
    const formArray = new FormArray(controls);
    return formArray;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get expiryRows(): FormArray {
    return this.expiryForm.get('rows') as FormArray;
  }

  // this.expiringSoonList = res.flatMap((response: any) => {
  //   const encryptData: any = response?.Request?.body?.encryptData;
  //   const virtualAccountDetails =
  //     encryptData?.virtualAccountDetails ?? [];

  //   return virtualAccountDetails
  //     .filter((van: any) => {
  //       const expiryDate = new Date(van.endDate);
  //       return expiryDate >= today && expiryDate <= next15Days;
  //     })
  //     .map((van: any) => ({
  //       id: response.id, // Preserve parent ID
  //       accountNo: encryptData.accountNo,
  //       startDate: encryptData.startDate,
  //       endDate: van.endDate,
  //       vanNumber: van.vanNumber,
  //       empName: encryptData.empName ?? '',
  //       // Keep original data for reference
  //       originalResponse: response,
  //     }));
  // });

  ngOnInit(): void {
    this.configSrc.getAll().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const next15Days = new Date(today);
          next15Days.setDate(today.getDate() + 13);
          next15Days.setHours(23, 59, 59, 999);

          this.expiringSoonList = res.flatMap((response: any) => {
            const encryptData = response?.Request?.body?.encryptData;
            const virtualAccountDetails =
              encryptData?.virtualAccountDetails ?? [];

            return virtualAccountDetails
              .filter((van: any) => {
                const endDate = van.endDate || encryptData.endDate;

                if (!endDate) {
                  return false;
                }

                const expiryDate = new Date(endDate);
                expiryDate.setHours(0, 0, 0, 0);

                return expiryDate >= today && expiryDate <= next15Days;
              })
              .map((van: any) => ({
                id: response.id,
                accountNo: encryptData.accountNo,
                startDate: encryptData.startDate,
                endDate: van.endDate || encryptData.endDate,
                vanNumber: van.vanNumber,
                empName: encryptData.empName ?? '',
                originalResponse: response,
              }));
          });

          // this.expiringSoonList = res.flatMap((response: any) => {
          //   const encryptData = response?.Request?.body?.encryptData;

          //   if (!encryptData) {
          //     return [];
          //   }

          //   const expiryDate = new Date(encryptData.endDate);
          //   expiryDate.setHours(0, 0, 0, 0);

          //   if (expiryDate < today || expiryDate > next15Days) {
          //     return [];
          //   }

          //   return (encryptData.virtualAccountDetails || []).map(
          //     (van: any) => ({
          //       id: response.id,
          //       accountNo: encryptData.accountNo,
          //       startDate: encryptData.startDate,
          //       endDate: encryptData.endDate,
          //       vanNumber: van.vanNumber,
          //       empName: encryptData.empName,
          //     }),
          //   );
          // });

          console.log(this.expiringSoonList);

          this.expiryForm = this.fb.group({
            rows: this.fb.array(
              this.expiringSoonList.map((item) =>
                this.fb.group({
                  accountNo: [item.accountNo],
                  empName: [item.empName],
                  vanNumber: [item.vanNumber],
                  startDate: [item.startDate],
                  endDate: [item.endDate],
                }),
              ),
            ),
          });
        }
      },
      error: (err) => {
        this.dialog.swal({
          dialog: 'error',
          message: err.message,
        });
      },
    });
  }

  openEditModal(index: number): void {
    this.selectedRowIndex = index;
    const rowData = this.expiryRows.at(index).value;

    this.editForm = this.fb.group({
      accountNo: [{ value: rowData.accountNo, disabled: true }],
      empName: [{ value: rowData.empName, disabled: true }],
      vanNumber: [{ value: rowData.vanNumber, disabled: true }],
      startDate: [{ value: rowData.startDate, disabled: true }],
      endDate: [rowData.endDate],
    });

    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedRowIndex = -1;
  }

  saveEdit(): void {
    if (this.editForm && this.selectedRowIndex >= 0) {
      const formValue = this.editForm.getRawValue();
      const rowGroup = this.expiryRows.at(this.selectedRowIndex) as FormGroup;
      const selectedItem = this.expiringSoonList[this.selectedRowIndex];

      console.log('Selected item:', selectedItem);
      console.log('Raw form values:', formValue);

      // 1. Update local form (keep empName for UI)
      rowGroup.patchValue({
        accountNo: formValue.accountNo,
        empName: formValue.empName,
        vanNumber: formValue.vanNumber,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
      });

      // 2. Get the original response data using the preserved ID
      const originalResponse = selectedItem?.originalResponse;
      if (!originalResponse) {
        console.error('Original response not found for item:', selectedItem);
        this.dialog.swal({
          dialog: 'error',
          message: 'Could not find original data for update.',
        });
        return;
      }

      const originalEncryptData = originalResponse?.Request?.body?.encryptData;

      // 3. Update only the specific VAN entry that matches the vanNumber
      const updatedVirtualAccountDetails =
        originalEncryptData?.virtualAccountDetails?.map((van: any) => {
          if (van.vanNumber === formValue.vanNumber) {
            return { ...van, endDate: formValue.endDate };
          }
          return van;
        }) || [];

      // 4. Build update payload with the correct ID from the preserved data
      const updatePayload: CreateVANRequest = {
        id: selectedItem.id, // Use the preserved ID
        Request: {
          body: {
            encryptData: {
              accountNo: originalEncryptData?.accountNo || formValue.accountNo,
              startDate: originalEncryptData?.startDate || formValue.startDate,
              endDate: originalEncryptData?.endDate || '',
              countVAN: originalEncryptData?.countVAN || '1',
              virtualAccountDetails: updatedVirtualAccountDetails,
            },
          },
        },
      };

      console.log('Update payload:', updatePayload);
      console.log('Updating ID:', selectedItem.id);

      // 5. Call API update
      this.configSrc.update(updatePayload).subscribe({
        next: () => {
          this.dialog.swal({
            dialog: 'success',
            message: 'VAN expiry date updated successfully!',
          });
          this.closeModal();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.dialog.swal({
            dialog: 'error',
            message: err.message || 'Failed to update VAN expiry date.',
          });
        },
      });
    }
  }
}
