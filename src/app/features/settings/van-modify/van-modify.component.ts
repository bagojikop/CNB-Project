import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { vanCreationService } from '@shared-services/user.service';
import { ModalModule } from '@coreui/angular-pro';

@Component({
  selector: 'app-van-modify',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DSS_FORM_CONTROLS,
    HttpClientModule,
    ModalModule,
  ],
  templateUrl: './van-modify.component.html',
  styleUrl: './van-modify.component.scss',
})
export class VanModifyComponent implements OnInit {
  vanForm!: FormGroup;
  editForm!: FormGroup;
  isLoading = false;
  isFetching = false;
  responseData: any = null;
  errorMessage: string = '';
  apiUrl = 'YOUR_API_ENDPOINT_HERE';
  showResult: boolean = false;
  selectedVan: any = null;
  showEditModal: boolean = false;

  // VAN data
  vanList: any[] = [];
  groupedVanList: any[] = []; // Grouped by account number
  originalVanRecords: any[] = []; // Full API records with id

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  extendCheckbox: boolean = false;
  selectedVanNumbers: any[] = []; // Multiple VANs for selected account

  private vanCreationService = inject(vanCreationService);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.vanForm = this.fb.group({
      accountNo: ['6025253000001', [Validators.required]],
      vanNo: ['00792000000471289', [Validators.required]],
      endDate: ['01-01-2035', [Validators.required]],
    });

    this.editForm = this.fb.group({
      newExpDate: ['', [Validators.required]],
    });

    // Fetch VAN data on component load
    this.fetchVanList();
  }

  // Fetch VAN list from service
  fetchVanList(): void {
    this.isFetching = true;
    this.errorMessage = '';

    this.vanCreationService.getAll().subscribe({
      next: (data: any[]) => {
        // Store original records with their IDs
        this.originalVanRecords = data;

        // Flatten all VANs from all records
        const allVans: any[] = [];
        data.forEach((item: any) => {
          const encryptData = item.Request?.body?.encryptData;
          if (encryptData) {
            // Check if virtualAccountDetails exists (multiple VANs)
            if (
              encryptData.virtualAccountDetails &&
              Array.isArray(encryptData.virtualAccountDetails)
            ) {
              encryptData.virtualAccountDetails.forEach((van: any) => {
                allVans.push({
                  id: item.id, // Store the record ID
                  accountNo: encryptData.accountNo,
                  vanNo: van.vanNumber || van.vanNo,
                  customerName: encryptData.customerName || '',
                  expDate: encryptData.endDate || encryptData.ExpDate || '',
                  startDate: encryptData.startDate || '',
                });
              });
            } else {
              // Single VAN (fallback)
              allVans.push({
                id: item.id, // Store the record ID
                accountNo: encryptData.accountNo,
                vanNo: encryptData.vanNo || encryptData.vanNumber,
                customerName: encryptData.customerName || '',
                expDate: encryptData.endDate || encryptData.ExpDate || '',
                startDate: encryptData.startDate || '',
              });
            }
          }
        });

        this.vanList = allVans;
        this.groupVanListByAccount();
        this.isFetching = false;
        this.totalPages = Math.ceil(this.groupedVanList.length / this.pageSize);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load VAN data. Please try again.';
        console.error('Error fetching VAN list:', error);
        this.isFetching = false;
      },
    });
  }

  // Group VANs by account number
  groupVanListByAccount(): void {
    const grouped: { [key: string]: any[] } = {};
    this.vanList.forEach((van) => {
      if (!grouped[van.accountNo]) {
        grouped[van.accountNo] = [];
      }
      grouped[van.accountNo].push(van);
    });

    this.groupedVanList = Object.keys(grouped).map((accountNo) => ({
      accountNo: accountNo,
      customerName: grouped[accountNo][0]?.customerName || '',
      vans: grouped[accountNo],
    }));
  }

  // Get paginated list (grouped by account)
  get paginatedList(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.groupedVanList.slice(startIndex, endIndex);
  }

  // Change page
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  // Get page numbers for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Get earliest expiry date from a list of VANs
  getEarliestExpiry(vans: any[]): string {
    if (!vans || vans.length === 0) return '';
    const dates = vans.map((v) => new Date(v.expDate).getTime());
    const minDate = Math.min(...dates);
    return new Date(minDate).toISOString().split('T')[0];
  }

  // Check if expiry date is within 15 days
  // isExpiringSoon(expDate: string): boolean {
  //   if (!expDate) return false;
  //   const today = new Date();
  //   const expiry = new Date(expDate);
  //   const diffTime = expiry.getTime() - today.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays <= 15 && diffDays >= 0;
  // }

  isExpiringSoon(expDate: string): boolean {
    if (!expDate) return false;

    const today = new Date();
    const expiry = new Date(expDate);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log({
      expDate,
      today,
      expiry,
      diffDays,
    });

    return diffDays <= 15 && diffDays >= 0;
  }

  // Open edit modal with all VANs for the account
  openEditModal(group: any): void {
    this.selectedVan = group;
    this.showEditModal = true;
    // Get the original record to fetch individual VAN expiry dates
    const recordId = group.vans[0]?.id;
    const originalRecord = this.originalVanRecords.find(
      (item) => item.id === recordId,
    );

    // Get individual VAN expiry dates from the original record
    const vanExpiryMap: { [key: string]: string } = {};
    if (originalRecord?.Request?.body?.encryptData?.virtualAccountDetails) {
      originalRecord.Request.body.encryptData.virtualAccountDetails.forEach(
        (van: any) => {
          vanExpiryMap[van.vanNumber] = van.endDate || '';
        },
      );
    }

    this.selectedVanNumbers = group.vans.map((van: any) => ({
      ...van,
      checked: false,
      newExpDate: van.expDate,
      // Use individual endDate from original record if available, otherwise fallback to expDate
      individualEndDate: vanExpiryMap[van.vanNo] || van.expDate,
    }));
    // Set first VAN's expiry date as default
    if (this.selectedVanNumbers.length > 0) {
      this.editForm.patchValue({
        newExpDate:
          this.selectedVanNumbers[0].individualEndDate ||
          this.selectedVanNumbers[0].expDate,
      });
    }
  }

  // Close edit modal
  closeEditModal(): void {
    console.log('abcd');
    this.showEditModal = false;
    this.selectedVan = null;
    this.selectedVanNumbers = [];
    this.extendCheckbox = false;
  }

  // Update expiry date for selected VANs
  updateExpiryDate(): void {
    if (this.editForm.invalid || !this.selectedVan) {
      return;
    }

    const newDate = this.editForm.value.newExpDate;
    const selectedVans = this.selectedVanNumbers.filter((v: any) => v.checked);

    if (selectedVans.length === 0) {
      alert('Please select at least one VAN to update.');
      return;
    }

    // Get the ID from the first selected VAN (all VANs in the same account share the same record ID)
    const firstSelectedVan = selectedVans[0];
    const recordId = firstSelectedVan.id;

    if (!recordId) {
      alert('Unable to find the record ID. Please refresh the data.');
      return;
    }

    // Get the original record to preserve all fields
    const originalRecord = this.originalVanRecords.find(
      (item) => item.id === recordId,
    );

    if (!originalRecord) {
      alert('Unable to find the original record. Please refresh the data.');
      return;
    }

    // Get the startDate from the original record
    const startDate =
      originalRecord.Request?.body?.encryptData?.startDate ||
      new Date().toISOString().split('T')[0];

    // Get all VANs from the original record (preserve all, update only selected ones)
    const allVansFromRecord =
      originalRecord.Request?.body?.encryptData?.virtualAccountDetails || [];

    // ✅ Update ONLY the selected (checked) VANs with the new expiry date
    // ✅ All unselected VANs remain completely unchanged
    const updatedVanDetails = allVansFromRecord.map((van: any) => {
      // Check if this VAN is selected (checked)
      const isSelected = selectedVans.some(
        (selected: any) => selected.vanNo === (van.vanNumber || van.vanNo),
      );

      if (isSelected) {
        // ✅ SELECTED VAN: Update expiry date only
        return {
          ...van,
          vanNumber: van.vanNumber || van.vanNo,
          endDate: newDate, // Only this field changes
        };
      }

      // ✅ UNSELECTED VAN: Return unchanged, preserve all original data
      return {
        ...van,
        vanNumber: van.vanNumber || van.vanNo,
        // No endDate field added - preserves original data
      };
    });

    // Prepare update payload with all required fields
    const updatePayload: any = {
      id: recordId,
      Request: {
        body: {
          encryptData: {
            accountNo: firstSelectedVan.accountNo,
            startDate: startDate,
            endDate: newDate,
            countVAN: String(allVansFromRecord.length),
            virtualAccountDetails: updatedVanDetails,
          },
        },
      },
    };

    console.log(updatePayload);
    // Send update to API
    this.vanCreationService.update(updatePayload).subscribe({
      next: (response) => {
        // Update local state for selected VANs only
        selectedVans.forEach((selectedVan: any) => {
          const index = this.vanList.findIndex(
            (item) =>
              item.vanNo === selectedVan.vanNo &&
              item.accountNo === selectedVan.accountNo,
          );
          if (index !== -1) {
            this.vanList[index].expDate = newDate;
            this.vanList[index].endDate = newDate;
          }
        });

        // Refresh the grouped list
        this.groupVanListByAccount();

        alert(
          `Expiry date updated successfully for ${selectedVans.length} VAN(s)!`,
        );
      },
      error: (error) => {
        console.error('Error updating expiry date:', error);
        alert('Failed to update expiry date. Please try again.');
      },
    });
  }

  // Toggle checkbox for individual VAN
  toggleVanSelection(index: number): void {
    this.selectedVanNumbers[index].checked =
      !this.selectedVanNumbers[index].checked;
  }

  // Toggle all VANs in the list
  toggleAllVans(event: any): void {
    const checked = event.target.checked;
    this.selectedVanNumbers.forEach((van: any) => (van.checked = checked));
  }

  // Check if all VANs are selected
  isAllVansSelected(): boolean {
    if (!this.selectedVanNumbers || this.selectedVanNumbers.length === 0) {
      return false;
    }
    return this.selectedVanNumbers.every((van: any) => van.checked);
  }

  // Check if any VAN is selected
  hasSelectedVans(): boolean {
    return this.selectedVanNumbers?.some((van: any) => van.checked) || false;
  }

  // Handle checkbox for date extension
  onExtendCheckboxChange(event: any): void {
    this.extendCheckbox = event.target.checked;
    if (this.extendCheckbox && this.selectedVanNumbers.length > 0) {
      // Extend by 30 days for all selected VANs
      const currentDate = this.editForm.value.newExpDate;
      if (currentDate) {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 30);
        this.editForm.patchValue({
          newExpDate: newDate.toISOString().split('T')[0],
        });
      }
    }
  }

  onSubmit(): void {
    if (this.vanForm.invalid) {
      this.vanForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.responseData = null;
    this.showResult = true;

    const payload = {
      Request: {
        body: {
          encryptData: this.vanForm.value,
        },
      },
    };

    // === EXAMPLE RESPONSE DATA ===
    // Simulate API call with example response
    setTimeout(() => {
      this.responseData = {
        Response: {
          body: {
            encryptData: {
              responseCode: '0',
              responseMessage: 'VAN modified successfully',
              modifiedDetails: {
                accountNo: this.vanForm.value.accountNo,
                vanNo: this.vanForm.value.vanNo,
                endDate: this.vanForm.value.endDate,
                modifiedDate: new Date().toISOString().split('T')[0],
                status: 'Modified',
              },
            },
          },
        },
      };
      this.isLoading = false;
    }, 1500);

    /* === REAL API CALL (uncomment to use) ===
    this.http.post(this.apiUrl, payload).subscribe({
      next: (response) => {
        this.responseData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.message || 'An error occurred while modifying VAN.';
        this.isLoading = false;
      },
    });
    */
  }

  closeResult(): void {
    this.showResult = false;
    this.responseData = null;
    this.errorMessage = '';
  }

  resetForm(): void {
    this.vanForm.patchValue({
      accountNo: '6025253000001',
      vanNo: '00792000000471289',
      endDate: '20350101',
    });
    this.errorMessage = '';
    this.responseData = null;
    this.showResult = false;
  }
}
