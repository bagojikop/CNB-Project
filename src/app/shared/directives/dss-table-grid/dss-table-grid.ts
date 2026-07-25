import { NgClass, NgStyle } from '@angular/common';
import {
  booleanAttribute,
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconDirective } from '@coreui/icons-angular';
import usersData from './data';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  IColumn,
  IColumnFilterValue,
  IItem,
  SmartPaginationComponent,
  SmartTableComponent,
  TemplateIdDirective,
} from '@coreui/angular-pro';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { DSS_HTTP_SERVICE } from '@shared-services/httpService';
import { DssInputNumPipe } from '../dss-input-num/dss-input-num.pipe';
import { Subject, debounce, distinctUntilChanged, timer } from 'rxjs';

type DssTableGridColumn =
  | IColumn
  | string
  | {
      key: string;
      value: string;
      width?: string | number;
      frozen?: boolean;
      [key: string]: any;
    };
type DssTableGridColumns = DssTableGridColumn[] | Record<string, string>;
type DssColumnFilterEvent =
  | IColumnFilterValue
  | { column: string; value: any; type?: string };

@Component({
  selector: 'dss-table-grid',
  templateUrl: './dss-table-grid.html',
  styleUrl: './dss-table-grid.scss',
  standalone: true,
  providers: [DssInputNumPipe],
  imports: [
    BadgeComponent,
    ButtonDirective,
    CardBodyComponent,
    IconDirective,

    NgClass,
    NgStyle,
    SmartPaginationComponent,
    SmartTableComponent,
    TemplateIdDirective,
  ],
})
export class DssTableGridComponent {
  @Input() url = '';
  @Input() apiParams: any = {};
  @Input() pageNumber = 1;
  @Input()
  set itemsPerPage(value: number | string) {
    this._itemsPerPage = Number(value) || 50;
  }
  get itemsPerPage(): number {
    return this._itemsPerPage;
  }
  @Input() itemsPerPageOptions = [10, 20, 50, 100];
  @Input() paginated = true;
  @Input() autoLoad = true;
  @Input() header = true;
  @Input() columnFilter = true;
  @Input() columnSorter = true;
  @Input() bordered = false;
  @Input() borderColor: string | undefined;
  @Input() striped = true;
  @Input() hover = true;
  @Input() searchDebounceTime = 500;
  @Input() bodyHeight: string | null = null;
  @Input() noItemsLabel = '';
  @Input() showActions = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showRecord = false;
  @Input() showPrint = false;
  @Input({ transform: booleanAttribute }) clickableRows = false;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() record = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Input() set frozenColumns(value: number | string) {
    this._frozenColumns = Number(value) || 0;
    if (this.rawColumns) {
      this.tableColumns = this.normalizeColumns(this.rawColumns);
    }
  }
  @Input() set columns(value: DssTableGridColumns | null | undefined) {
    if (this.hasColumns(value)) {
      this.hasCustomColumns = true;
      this.rawColumns = value;
      this.tableColumns = this.normalizeColumns(value);
    }
  }
  @Input() set items(value: IItem[] | null | undefined) {
    this.hasItemsInput = true;
    this.localItems = value ?? [];

    if (this.initialized && !this.url) {
      this.syncLocalItems();
    }
  }

  usersData: IItem[] = usersData;
  loading = false;
  columnFilterValue: IColumnFilterValue = {};
  scrollbarWidth = 0;
  totalPages = 1;
  private searchKeys: any[] = [];
  private columnFilterChanged = new Subject<DssColumnFilterEvent>();
  private hasCustomColumns = false;
  private initialized = false;
  private _itemsPerPage = 50;
  private rawColumns?: DssTableGridColumns;
  private _frozenColumns = 0;
  private tokenRetryCount = 0;
  private readonly maxTokenRetries = 25;
  private hasItemsInput = false;
  private localItems: IItem[] = usersData;

  tableColumns: (IColumn | string)[] = [
    {
      key: 'name',
      _style: { width: '40%' },
      _props: { color: 'danger', class: 'fw-bold' },
      _colClass: 'text-center fw-bold',
    },
    'registered',
    {
      key: 'role',
      filter: false,
      sorter: false,
      _style: { width: '15%' },
      _classes: 'text-muted small',
    },
    { key: 'status', _style: { width: '15%' } },
    {
      key: 'show',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  get columns(): (IColumn | string)[] {
    return this.tableColumns;
  }

  get tableProps() {
    return {
      hover: this.hover,
      responsive: true,
      striped: this.striped,
      bordered: this.bordered || undefined,
      borderColor: this.borderColor,
    };
  }

  get showPagination(): boolean {
    return this.paginated && this.totalPages > 1;
  }

  constructor(
    @Optional() @Inject(DSS_HTTP_SERVICE) private httpService: any,
    private destroyRef: DestroyRef,
    private dssInputNumPipe: DssInputNumPipe,
  ) {
    this.columnFilterChanged
      .pipe(
        debounce(() => timer(this.searchDebounceTime)),
        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous) === JSON.stringify(current),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((columnFilterValue) =>
        this.applyColumnFilter(columnFilterValue),
      );
  }

  ngOnInit(): void {
    this.scrollbarWidth = this.getScrollbarWidth();
    this.initialized = true;
    if (this.autoLoad) {
      this.loadData();
    } else if (this.initialized && !this.url) {
      this.syncLocalItems();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rawColumns && changes['showActions']) {
      this.tableColumns = this.normalizeColumns(this.rawColumns);
    }

    if (
      this.initialized &&
      (changes['url'] || changes['apiParams'] || changes['items'])
    ) {
      if (changes['url'] || changes['apiParams']) {
        this.resetPagination();
      }

      if (this.url) {
        this.loadData();
      } else {
        this.syncLocalItems();
      }
    }
  }

  loadData(): void {
    if (!this.url) {
      this.syncLocalItems();
      return;
    }

    if (!this.httpService) {
      alert('DSS HTTP service is not available.');
      return;
    }

    if (this.shouldWaitForToken()) {
      this.tokenRetryCount++;
      setTimeout(() => this.loadData(), 200);
      return;
    }

    this.tokenRetryCount = 0;
    this.loading = true;
    const requestUrl = this.url;
    const request: any = this.paginated
      ? {
          pageNumber: this.pageNumber,
          pageSize: this.itemsPerPage,
        }
      : {};

    if (this.searchKeys.length > 0) {
      request.keys = this.searchKeys;
    }

    const apiParams = this.apiParams
      ? { ...this.apiParams, orelse: true }
      : undefined;

    this.httpService
      .post(this.url, request, apiParams, undefined, false)
      .subscribe({
        next: (response: apiResponse) => {
          if (this.url !== requestUrl) {
            this.loading = false;
            return;
          }

          this.setUsersData(response.data ?? []);
          this.totalPages = this.getTotalPages(response);
          if (!this.hasCustomColumns) {
            this.tableColumns = this.getColumnsFromItems(this.usersData);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          alert(err.message);
        },
      });
  }

  onPageChange(pageNumber: number): void {
    this.loadMore(pageNumber);
  }

  loadMore(pageNumber: number = this.pageNumber): void {
    this.pageNumber = Number(pageNumber) || 1;

    if (this.url) {
      this.loadData();
    }
  }

  onItemsPerPageChange(itemsPerPage: number | string): void {
    this.itemsPerPage = Number(itemsPerPage) || this.itemsPerPage;
    this.pageNumber = 1;

    if (this.url) {
      this.loadData();
    }
  }

  SearchTextChanged(columnFilterValue: DssColumnFilterEvent): void {
    this.columnFilterChanged.next(columnFilterValue);
  }

  private applyColumnFilter(columnFilterValue: DssColumnFilterEvent): void {
    this.columnFilterValue = this.getColumnFilterValue(columnFilterValue);
    this.searchKeys = Object.entries(this.columnFilterValue)
      .filter(
        ([, value]) =>
          value !== null && value !== undefined && String(value).trim() !== '',
      )
      .map(([key, value]) => ({ key, value }));

    this.pageNumber = 1;

    if (this.url) {
      this.loadData();
    } else {
      this.filterLocalItems();
    }
  }

  private getColumnFilterValue(
    columnFilterValue: DssColumnFilterEvent,
  ): IColumnFilterValue {
    if (!columnFilterValue) return {};

    if ('column' in columnFilterValue && 'value' in columnFilterValue) {
      return {
        ...this.columnFilterValue,
        [columnFilterValue.column]: columnFilterValue.value,
      };
    }

    return columnFilterValue;
  }

  private filterLocalItems(): void {
    if (this.searchKeys.length === 0) {
      this.syncLocalItems();
      return;
    }

    this.usersData = this.localItems.filter((item) =>
      this.searchKeys.some(({ key, value }) =>
        String(this.getCellValue(item, key, '') ?? '')
          .toLowerCase()
          .includes(String(value).toLowerCase()),
      ),
    );
  }

  private syncLocalItems(): void {
    this.setUsersData(this.hasItemsInput ? this.localItems : usersData);
    this.totalPages = 1;

    if (!this.hasCustomColumns) {
      this.tableColumns = this.getColumnsFromItems(this.usersData);
    }
  }

  private setUsersData(items: IItem[]): void {
    this.usersData = this.reuseStableItemReferences(items);
  }

  resetPagination(): void {
    this.pageNumber = 1;
    this.totalPages = 1;
  }

  private reuseStableItemReferences(items: IItem[]): IItem[] {
    const previousItems = new Map<string, IItem>();

    for (const item of this.usersData) {
      const key = this.getStableItemKey(item);

      if (key) {
        previousItems.set(key, item);
      }
    }

    return items.map((item) => {
      const key = this.getStableItemKey(item);
      const previousItem = key ? previousItems.get(key) : undefined;

      if (!previousItem || previousItem === item) {
        return item;
      }

      Object.assign(previousItem, item);
      return previousItem;
    });
  }

  private getStableItemKey(item: unknown): string | null {
    if (!item || typeof item !== 'object') return null;

    const record = item as Record<string, unknown>;
    const preferredKeys = [
      'detl_id',
      'detail_id',
      'emp_code',
      'id',
      'Id',
      'ID',
      'acc_code',
      'vch_id',
      'vch_no',
      'challan_no',
      'code',
      'Code',
    ];

    for (const key of preferredKeys) {
      if (this.hasStableValue(record[key])) {
        return `${key}:${String(record[key])}`;
      }
    }

    const fallbackKey = Object.keys(record).find(
      (key) => /(_id|_code)$/i.test(key) && this.hasStableValue(record[key]),
    );

    return fallbackKey ? `${fallbackKey}:${String(record[fallbackKey])}` : null;
  }

  private hasStableValue(value: unknown): boolean {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }
  private shouldWaitForToken(): boolean {
    if (
      !this.httpService?.token ||
      this.tokenRetryCount >= this.maxTokenRetries
    )
      return false;
    return !this.httpService.token();
  }

  private getTotalPages(response: any): number {
    if (!this.paginated) return 1;

    const pageDetails =
      response?.pageDetails ??
      response?.PageDetails ??
      response?.pageDetail ??
      response?.PageDetail ??
      response?.page ??
      response?.Page ??
      {};

    const totalPages = this.toNumber(
      pageDetails.totalPages ??
        pageDetails.TotalPages ??
        pageDetails.totalPage ??
        pageDetails.TotalPage ??
        pageDetails.pageCount ??
        pageDetails.PageCount,
    );

    if (totalPages > 0) return totalPages;

    const totalCount = this.toNumber(
      pageDetails.totalCount ??
        pageDetails.TotalCount ??
        pageDetails.count ??
        pageDetails.Count ??
        response?.totalCount ??
        response?.TotalCount,
    );

    return totalCount > 0
      ? Math.ceil(totalCount / this.itemsPerPage)
      : Math.max(this.totalPages, 1);
  }

  private toNumber(value: any): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  private getColumnsFromItems(items: IItem[]): (IColumn | string)[] {
    const firstItem = items.find((item) => item && typeof item === 'object');

    if (!firstItem) return this.tableColumns;

    return Object.keys(firstItem)
      .filter((key) => !key.startsWith('_'))
      .map((key) => ({ key }));
  }

  private hasColumns(
    value: DssTableGridColumns | null | undefined,
  ): value is DssTableGridColumns {
    if (!value) return false;
    return Array.isArray(value)
      ? value.length > 0
      : Object.keys(value).length > 0;
  }

  private normalizeColumns(columns: DssTableGridColumns): (IColumn | string)[] {
    let normalizedColumns: (IColumn | string)[];

    if (!Array.isArray(columns)) {
      normalizedColumns = Object.entries(columns).map(([label, key]) => ({
        key,
        label,
      }));
    } else {
      normalizedColumns = columns.map((column) => {
        if (typeof column === 'string') {
          return column;
        }

        if (!('value' in column)) {
          return this.normalizeColumnWidth(column);
        }

        const { key: label, value, ...columnProps } = column;
        return this.normalizeColumnWidth({
          ...columnProps,
          key: value,
          label,
        });
      });
    }

    if (this.showActions) {
      normalizedColumns = [
        ...normalizedColumns,
        {
          key: '__actions',
          label: 'Action',
          filter: false,
          sorter: false,
          _style: { width: '76px' },
          _classes: 'dss-table-actions-cell',
        },
      ];
    }

    return this.applyFrozenColumns(normalizedColumns);
  }

  private normalizeColumnWidth(
    column: IColumn & { width?: string | number; frozen?: boolean },
  ): IColumn & { frozen?: boolean } {
    const { width, frozen, ...columnProps } = column;

    if (width === undefined || width === null || width === '') {
      return this.normalizeColumnSorter({ ...columnProps, frozen });
    }

    return this.normalizeColumnSorter({
      ...columnProps,
      frozen,
      _style: {
        ...columnProps._style,
        width: typeof width === 'number' ? `${width}px` : width,
      },
    });
  }

  private normalizeColumnSorter(
    column: IColumn & { frozen?: boolean },
  ): IColumn & { frozen?: boolean } {
    if (!('key' in column) || typeof column.key !== 'string') {
      return column;
    }

    if (!column.key.includes('.') || column.sorter !== undefined) {
      return column;
    }

    return {
      ...column,
      sorter: (firstItem, secondItem) =>
        this.compareValues(
          this.getNestedValue(firstItem, column.key),
          this.getNestedValue(secondItem, column.key),
        ),
    };
  }

  private compareValues(firstValue: unknown, secondValue: unknown): number {
    const first = firstValue ?? '';
    const second = secondValue ?? '';

    if (typeof first === 'number' && typeof second === 'number') {
      return first - second;
    }

    return String(first).localeCompare(String(second), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private getNestedValue(item: unknown, key: string): unknown {
    return key
      .split('.')
      .reduce((obj: any, keyPart: string) => obj?.[keyPart], item);
  }

  private applyFrozenColumns(
    columns: (IColumn | string)[],
  ): (IColumn | string)[] {
    let left = '0px';

    return columns.map((column, index) => {
      if (typeof column === 'string') {
        return column;
      }

      const isFrozen =
        index < this._frozenColumns ||
        (column as IColumn & { frozen?: boolean }).frozen === true;

      if (!isFrozen) {
        return column;
      }

      const width = this.getColumnWidth(column);
      const frozenColumn = {
        ...column,
        _style: {
          ...column._style,
          width,
          left,
          position: 'sticky',
          zIndex: '3',
        },
      };

      left = this.addCssSizes(left, width);
      return frozenColumn;
    });
  }

  private getColumnWidth(column: IColumn): string {
    const width = column._style?.['width'];
    if (typeof width === 'number') return `${width}px`;
    if (typeof width === 'string' && width.trim()) return width;
    return '160px';
  }

  private addCssSizes(left: string, width: string): string {
    if (left === '0px') return width;
    return `calc(${left} + ${width})`;
  }

  getCellValue(
    item: any,
    columnName: string,
    tdContent: any,
    column?: IColumn | string,
  ) {
    const value = this.getNestedValue(item, columnName) ?? tdContent;

    if (value === null || value === undefined || value === '') {
      return value ?? '';
    }

    if (typeof column !== 'string') {
      const columnConfig = column as IColumn & {
        type?: string;
        dateFormat?: string;
        fraction?: number;
      };

      if (columnConfig.type === 'date') {
        return this.formatDate(value);
      }

      if (columnConfig.type === 'number') {
        return this.formatNumber(value, columnConfig.fraction ?? 2);
      }
    }

    return value;
  }

  private formatDate(value: unknown): string {
    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value ?? '');
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private formatNumber(value: unknown, fraction: number): string {
    const formattedValue = this.dssInputNumPipe.transform(
      value as number | string | null | undefined,
      fraction,
    );

    return formattedValue || String(value ?? '');
  }

  getColumnLabel(column: IColumn | string, columnName: string): string {
    if (columnName === '__actions') return 'Action';

    if (typeof column === 'string') {
      return this.toTitleLabel(column);
    }

    const label = column.label ?? columnName;
    return this.toTitleLabel(String(label));
  }

  private toTitleLabel(value: string): string {
    return value
      .split('.')
      .pop()!
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  getCellStyles(column: IColumn | string): Record<string, string> {
    if (typeof column === 'string') return {};

    return (column._style ?? {}) as Record<string, string>;
  }

  getCellClasses(
    column: IColumn | string,
    columnName: string,
    item?: IItem,
  ): string {
    const classes = [];

    if (columnName === 'status') {
      classes.push('text-center');
    }

    if (typeof column !== 'string') {
      const headerProps = column._props as Record<string, unknown> | undefined;
      const columnProps = column._colProps as
        | Record<string, unknown>
        | undefined;

      this.addCssClasses(classes, column._classes);
      this.addCssClasses(classes, column._colClass);
      this.addCssClasses(classes, headerProps?.['class']);
      this.addCssClasses(classes, columnProps?.['class']);

      const color = columnProps?.['color'] ?? headerProps?.['color'];
      if (typeof color === 'string' && color.trim()) {
        classes.push(`table-${color.trim()}`);
      }

      const align = columnProps?.['align'] ?? headerProps?.['align'];
      if (typeof align === 'string' && align.trim()) {
        classes.push(`align-${align.trim()}`);
      }
    }

    const cellProps = item?.['_cellProps']?.[columnName] as
      | Record<string, unknown>
      | undefined;
    this.addCssClasses(classes, cellProps?.['class']);

    return classes.join(' ');
  }

  private addCssClasses(classes: string[], value: unknown): void {
    if (!value) return;

    if (typeof value === 'string') {
      classes.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => this.addCssClasses(classes, item));
      return;
    }

    if (value instanceof Set) {
      value.forEach((item) => this.addCssClasses(classes, item));
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>)
        .filter(([, enabled]) => !!enabled)
        .forEach(([className]) => classes.push(className));
    }
  }

  onEdit(item: any): void {
    this.edit.emit(item);
  }

  onDelete(item: any): void {
    this.delete.emit(item);
  }

  onRecord(item: any): void {
    this.record.emit(item);
  }

  onPrint(item: any): void {
    this.print.emit(item);
  }

  onRowClick(event: { item?: any } | any): void {
    if (!this.clickableRows) return;

    this.rowClick.emit(event?.item ?? event);
  }

  private getScrollbarWidth(): number {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return 0;

    return window.innerWidth - document.documentElement.clientWidth;
  }

  getBadge(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'secondary';
      case 'Pending':
        return 'warning';
      case 'Banned':
        return 'danger';
      default:
        return 'primary';
    }
  }

  getItem(item: any) {
    return Object.keys(item);
  }

  details_visible = Object.create({});

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }
}
