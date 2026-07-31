import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective, IItem, ModalModule } from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { DialogsService } from '@shared-services/messageBox';
import { MyProvider } from '@shared-services/provider';
import { DssTableGridComponent } from '../dss-table-grid/dss-table-grid';
import { DssTableDashboardStateService } from './dss-table-dashboard-state.service';

export type DssTableDashboardScope = 'me' | 'public';
export type DssTableDashboardFilterMode = 'range' | 'transactionNo';
export type DssTableDashboardActionHandler = (
  item?: any,
) => boolean | void | Promise<boolean | void>;

export interface DssTableDashboardActions {
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  record?: boolean;
  print?: boolean;
}

@Component({
  selector: 'dss-table-dashboard',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    DssTableGridComponent,
    ButtonDirective,
    IconDirective,
    ModalModule,
  ],
  templateUrl: './dss-table-dashboard.html',
  styleUrl: './dss-table-dashboard.scss',
})
export class DssTableDashboardComponent implements AfterViewInit {
  @ViewChild('grid') private grid?: DssTableGridComponent;

  viewInitialized = false;

  private readonly fb = inject(FormBuilder);
  private readonly provider = inject(MyProvider);
  private readonly dialogs = inject(DialogsService);
  private readonly router = inject(Router);
  private readonly dashboardState = inject(DssTableDashboardStateService);

  readonly company = { ...this.provider.companyInfo?.company };
  readonly user = { ...this.provider.companyInfo?.user };

  @HostBinding('class.dss-dashboard-filter-hidden')
  get filterHiddenClass(): boolean {
    return !this.filterVisible;
  }

  @Input() dashboardTitle = '';
  @Input() dashboardBodyStyle = 'padding: 0 0 0 8px;';
  @Input() filterVisible = true;
  @Input() set title(value: string) {
    this.dashboardTitle = value ?? '';
  }
  @Input() set isFilterVisible(value: boolean) {
    this.filterVisible = value;
  }
  @Input() scope: DssTableDashboardScope = 'me';
  @Input() showNewButton = true;
  @Input() showShowButton = false;
  @Input() newButtonLabel = 'New';
  @Input() filterButtonLabel = 'Filter';
  @Input() filterTitle = '';
  @Input() handleAdd?: DssTableDashboardActionHandler;
  @Input() handleEdit?: DssTableDashboardActionHandler;
  @Input() handleDelete?: DssTableDashboardActionHandler;
  @Input() handleRecord?: DssTableDashboardActionHandler;
  @Input() handlePrint?: DssTableDashboardActionHandler;
  @Input() set actions(
    value: DssTableDashboardActions | boolean | null | undefined,
  ) {
    if (typeof value === 'boolean') {
      this.showNewButton = value;
      this.showActions = value;
      this.showEdit = value;
      this.showDelete = value;
      return;
    }

    if (!value) return;

    this.showNewButton = value.add ?? this.showNewButton;
    this.showActions =
      (value.edit ?? this.showEdit) ||
      (value.delete ?? this.showDelete) ||
      (value.record ?? this.showRecord) ||
      (value.print ?? this.showPrint);
    this.showEdit = value.edit ?? this.showEdit;
    this.showDelete = value.delete ?? this.showDelete;
    this.showRecord = value.record ?? this.showRecord;
    this.showPrint = value.print ?? this.showPrint;
  }
  @Input() url = '';
  @Input() apiParams: Record<string, unknown> | null = null;
  @Input() pageNumber = 1;
  @Input() itemsPerPage: number | string = 50;
  @Input() itemsPerPageOptions = [10, 20, 50, 100];
  @Input() paginated = true;
  @Input() autoLoad: boolean | null = false;
  @Input() rememberAutoLoad = true;
  @Input() header = true;
  @Input() columnFilter = true;
  @Input() columnSorter = true;
  @Input() bordered = false;
  @Input() borderColor: string | undefined;
  @Input() striped = true;
  @Input() hover = true;
  @Input() searchDebounceTime = 500;
  @Input() bodyHeight: string | null = null;
  @Input() showActions = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showRecord = false;
  @Input() showPrint = false;
  @Input() clickableRows = false;
  @Input() frozenColumns: number | string = 0;
  @Input() columns: any;
  @Input() items: IItem[] | null = null;
  @Input() emptyMessage = '';
  @Input() emptyActionLabel = '';

  @Output() scopeChange = new EventEmitter<DssTableDashboardScope>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() newClick = new EventEmitter<void>();
  @Output() showClick = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() record = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() emptyAction = new EventEmitter<void>();
  // @Output() filterData= new EventEmitter<void>();

  modalVisible = false;
  hasLoaded = false;
  dashboardApiParams = {} as Record<string, unknown>;

  readonly dashboardForm = this.fb.group({
    filterMode:
      this.fb.nonNullable.control<DssTableDashboardFilterMode>('range'),
    fromDate: this.fb.nonNullable.control(
      this.toInputDate(this.addMonths(new Date(), -3)),
    ),
    toDate: this.fb.nonNullable.control(this.toInputDate(new Date())),
    challan: this.fb.control<string | null>({ value: null, disabled: true }),
    isComboInv: this.fb.nonNullable.control(false),
    isApproval: this.fb.nonNullable.control(false),
    vchType: this.fb.control<number | null>(4),
    salesType: this.fb.control<number | null>(1),
  });

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewInitialized = true;

      if (this.shouldAutoLoad()) {
        this.loadData(false);
        return;
      }

      this.clearData();
    });
  }

  get usersData(): IItem[] {
    return this.grid?.usersData ?? [];
  }

  set usersData(value: IItem[]) {
    if (this.grid) {
      this.grid.usersData = value;
    }
  }

  get loading(): boolean {
    return !!this.grid?.loading;
  }

  get showEmptyMessage(): boolean {
    return this.viewInitialized && !this.loading && this.usersData.length === 0;
  }

  get resolvedEmptyMessage(): string {
    if (this.emptyMessage) return this.emptyMessage;
    if (this.hasLoaded) return 'No data found';

    return this.filterVisible
      ? 'No data loaded. Click the Filter button and submit to fetch default last 3 months data, or change filter values and fetch data.'
      : 'No data loaded. Click Fetch Data to load default last 3 months data.';
  }

  get resolvedEmptyActionLabel(): string {
    return this.emptyActionLabel || (this.hasLoaded ? '' : 'Fetch Data');
  }

  get resolvedFilterTitle(): string {
    return this.filterTitle || `Filter ${this.dashboardTitle || 'Data'}`;
  }

  async loadData(remember = true): Promise<void> {
    this.dashboardApiParams = this.buildApiParams();
    this.hasLoaded = true;

    if (remember) {
      this.rememberDashboardLoaded();
    }

    if (this.grid) {
      this.grid.pageNumber = this.pageNumber;
      this.grid.apiParams = this.dashboardApiParams;
    }

    this.grid?.loadData();
  }

  loadMore(pageNumber?: number): void {
    this.pageNumber = Number(pageNumber) || this.pageNumber;
    this.grid?.loadMore(this.pageNumber);
  }

  resetPagination(): void {
    this.pageNumber = 1;
    this.grid?.resetPagination();
  }

  openFilter(): void {
    this.modalVisible = true;
    this.filterClick.emit();
  }

  closeFilter(): void {
    this.modalVisible = false;
  }

  onModalVisibleChange(visible: boolean): void {
    this.modalVisible = visible;
  }

  setScope(scope: DssTableDashboardScope): void {
    if (this.scope !== scope) {
      this.scope = scope;
    }

    this.scopeChange.emit(scope);

    if (this.hasLoaded) {
      this.loadData();
    }
  }

  onRecord(item: any): void {
    this.handleRecord?.(item);
    this.record.emit(item);
  }

  onPrint(item: any): void {
    this.handlePrint?.(item);
    this.print.emit(item);
  }

  onEmptyAction(): void {
    this.loadData();
    this.emptyAction.emit();
  }

  async submitFilter(): Promise<void> {
    if (
      this.dashboardForm.controls.filterMode.value === 'transactionNo' &&
      !this.dashboardForm.controls.challan.value?.trim()
    ) {
      await this.dialogs.swal({
        dialog: 'warning',
        title: 'Transaction No Required',
        message: 'Please enter transaction no.',
      });
      return;
    }

    this.loadData();
    this.closeFilter();
  }

  setFilterMode(mode: DssTableDashboardFilterMode): void {
    this.dashboardForm.controls.filterMode.setValue(mode);
    this.updateFilterControlState();

    if (mode === 'range') {
      this.dashboardForm.controls.challan.setValue(null);
    }
  }

  resetFilter(): void {
    this.dashboardForm.patchValue({
      filterMode: 'range',
      fromDate: this.toInputDate(this.addMonths(new Date(), -3)),
      toDate: this.toInputDate(new Date()),
      challan: null,
    });
    this.updateFilterControlState();
  }

  async onAdd(): Promise<void> {
    this.rememberDashboardLoaded();

    const handled = await this.runHandler(this.handleAdd);

    if (!handled) {
      this.newClick.emit();
    }
  }

  onShow(event: any): void {
    this.showClick.emit(event);
  }

  async onEdit(item: any): Promise<void> {
    const handled = await this.runHandler(this.handleEdit, item);

    if (!handled) {
      this.edit.emit(item);
    }
  }

  async onDelete(item: any): Promise<void> {
    const handled = await this.runHandler(this.handleDelete, item);

    if (!handled) {
      this.delete.emit(item);
    }
  }

  private updateFilterControlState(): void {
    const isRangeFilter =
      this.dashboardForm.controls.filterMode.value === 'range';
    const options = { emitEvent: false };

    if (isRangeFilter) {
      this.dashboardForm.controls.fromDate.enable(options);
      this.dashboardForm.controls.toDate.enable(options);
      this.dashboardForm.controls.challan.disable(options);
      return;
    }

    this.dashboardForm.controls.fromDate.disable(options);
    this.dashboardForm.controls.toDate.disable(options);
    this.dashboardForm.controls.challan.enable(options);
  }
  private buildApiParams(): Record<string, unknown> {
    const value = this.dashboardForm?.getRawValue?.() ?? {
      filterMode: 'range',
      fromDate: this.toInputDate(this.addMonths(new Date(), -3)),
      toDate: this.toInputDate(new Date()),
      challan: '',
    };

    const isRangeFilter = value.filterMode === 'range';
    const transactionNo = value.challan?.trim() ?? '';

    return {
      ...(this.apiParams || {}),
      firm_id: Number(this.company?.firm_id ?? 0),
      branch_id: String(this.company?.branch_id ?? ''),
      div_id: Number(this.company?.div_id ?? 0),
      from_date: isRangeFilter ? value.fromDate : '',
      to_date: isRangeFilter ? value.toDate : '',
      challan: isRangeFilter ? '' : transactionNo,
      username: this.scope === 'me' ? (this.user?.username ?? '') : '',
    };
  }

  private clearData(): void {
    if (!this.grid || this.loading || this.items?.length) return;

    this.grid.usersData = [];
  }

  private shouldAutoLoad(): boolean {
    return this.autoLoad || this.wasDashboardLoaded();
  }

  private rememberDashboardLoaded(): void {
    if (!this.rememberAutoLoad) return;

    this.dashboardState.markLoaded(this.autoLoadStateKey);
  }

  private wasDashboardLoaded(): boolean {
    if (!this.rememberAutoLoad) return false;

    return this.dashboardState.hasLoaded(this.autoLoadStateKey);
  }

  private get autoLoadStateKey(): string {
    const routeKey = this.router.url.split('?')[0] || 'dashboard';
    const dashboardKey = this.url || this.dashboardTitle || 'default';

    return 'dss-table-dashboard:auto-load:' + routeKey + ':' + dashboardKey;
  }

  private async runHandler(
    handler: DssTableDashboardActionHandler | undefined,
    item?: any,
  ): Promise<boolean> {
    if (!handler) return false;

    await handler(item);
    return true;
  }

  private addMonths(date: Date, months: number): Date {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
