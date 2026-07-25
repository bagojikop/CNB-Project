import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  Input,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  booleanAttribute,
  computed,
  forwardRef,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { TooltipModule } from '@coreui/angular-pro';
import { DSS_HTTP_SERVICE } from '@shared-services/httpService';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';

@Component({
  selector: 'dss-ng-select',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectModule, TooltipModule],
  host: {
    '[style.display]': 'width ? "block" : null',
    '[style.width]': 'normalizedControlWidth()',
  },

  templateUrl: './ng-select.component.html',
  styleUrls: ['./ng-select.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgSelectModule,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgCustomSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgCustomSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  readonly displayBindLabel = '__dssCombinedLabel';

  @ViewChild('selectRef') selectRef!: NgSelectComponent;
  @ViewChild('selectRef', { read: ElementRef }) private selectHost?: ElementRef<HTMLElement>;
  @Input() addNewText: boolean = false;
  @Input() set items(value: any[] | null | undefined) {
    this.localItems = value ?? [];
    this.setItems(this.localItems);
  }
  @Input() ngModel: any;
  @Input() displayLabel: string[]= [];
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() change = new EventEmitter();

  @Input() bindLabel!: string;
  @Input() bindValue!: string;
  @Input() searchColumns: string | string[] = [];
  @Input() bindSubObj : any[] = [];
  @Input() name!: string;
  @Input() placeholder: string = '';
  @Input() sizing: 'sm' | 'md' | 'lg' = 'sm';
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.inputDisabled = value;
    this.cdr.markForCheck();
  }
  get disabled(): boolean {
    return this.inputDisabled || this.formDisabled;
  }
  @Input({ transform: booleanAttribute }) required: boolean = false;
  @Input() apiParams: any = {};
  @Input() multiple: boolean = false;
  @Input() nullableObject: any;
  @Input() defaultObject: any;
  @Output() defaultObjectChange = new EventEmitter<any>();
  @Input() comboPosition: 'auto' | 'top' | 'bottom' = 'auto';
  @Input() dropdownAppendTo: string | null = 'body';
  @Input('applyMargins') applyMargins: boolean = true;
  @Input('label') label: string = '';
  @Input() labelAlign: 'left' | 'center' | 'right' = 'left';
  @Input() labelBg: string | null = null;
  @Input() labelDarkBg: string | null = null;
  @Input() labelColor: string | null = null;
  @Input() labelDarkColor: string | null = null;
  @Input() width: string | number | null = null;
  @Input() addTagFn?: (name?: string) => any;

  @Input() url!: string;
  @Output() onSelect = new EventEmitter<any>();

  searchTextChanged = new Subject<string>();
  selectedItems = signal<any[]>([]);
  objectsArray = [];
  @Input() pageSize: number = 10;
  currentPage: number = 0;
  hasMore = true;
  searchValue = signal('');
  tooltipVisible = signal(false);
  validationTooltipVisible = signal(false);
  modelChanged: Subject<any> = new Subject<any>();
  loading = signal(false);
  selectedValue = signal<any>(null);
  readonly displayItems = computed(() => this.withSelectedFallbackItems(this.selectedItems(), this.selectedValue()));
  private _value: any = '';
  private localItems: any[] = [];
  private apiItemsCache: any[] = [];
  private searchKeys: any[] = [];
  private clearTabStopObserver?: MutationObserver;
  private lastTabWasShift = false;
  private inputDisabled = false;
  private formDisabled = false;
  private onChangeCallback: (value: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Inject(DSS_HTTP_SERVICE) private httpService: any
  ) {
    this.modelChanged
      .pipe(debounceTime(1000), distinctUntilChanged()) // debounce search input
      .subscribe((model) => this.SearchTextChanged(model));
  }

  ngAfterViewInit(): void {
    this.observeClearTabStop();
    this.disableClearTabStop();
  }

  ngOnDestroy(): void {
    this.clearTabStopObserver?.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ngModel']) {
        this.selectedValue.set(changes['ngModel'].currentValue);
    }

    if (changes['defaultObject']) {
      this.applyDefaultObject();
    } else if (changes['apiParams']?.currentValue) {
      this.apiItemsCache = [];
      this.resetPaging();
    }
  }

  // openAddModal() {
  //   if (!this.AddComponent) return;

  //   const modalRef = this.modalService.open(this.AddComponent, {
  //     backdrop: 'static',
  //     keyboard: false,
  //     animation: false,
  //     centered: true, // vertical center

  //   });

  //   modalRef.componentInstance.precityName = this.searchValue;

  //   // handle modal close
  //   modalRef.result
  //     .then((newItem) => {
  //       if (newItem) {
  //         // add to ng-select items
  //         this.items.push(newItem);
  //         this.writeValue(newItem[this.bindValue]);

  //       }
  //     })
  //     .catch(() => { });
  // }

  defaultAddTag() {
    // const newItem = { [this.bindValue]: this.items.length + 1, [this.bindLabel]: this.searchValue };
    // this.items.push(newItem);
    // // Set the new value as selected
    // return newItem;
    this.addTagFn?.(this.searchValue());
  }

  // addTagHandler() {
  //   return this.addTagFn ?? this.defaultAddTag;
  // }

  writeValue(value: any): void {
    this._value = value;
    this.selectedValue.set(value);
    this.ngModelChange.emit(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  OnSearch(text: any): void {
    this.modelChanged.next(text);
  }

  onModelChange(value: any): void {
    this.selectedValue.set(value);
    this.ngModelChange.emit(value);
    this.onChangeCallback(value);
    this.disableClearTabStop();
  }

  SearchTextChanged(e: any): void {
    const term = e?.term ?? '';

    this.searchValue.set(term);
    this.searchKeys = term ? this.getSearchPaths().map((key) => ({ key, value: term })) : [];
    if (!this.url) {
      this.filterLocalItems(term);
      return;
    }

    const matches = this.filterItems(this.apiItemsCache, term);
    if (!term || matches.length > 0) {
      this.setItems(matches);
      return;
    }

    this.resetPaging();
    this.loadMore();
  }

  onOpen() {
    this.hideSelectTooltip();
    this.disableClearTabStop();
    if (this.url && this.currentPage === 0) this.loadMore();
  }

  onClear(): void {
    this.defaultObject = null;
    this.defaultObjectChange.emit(null);
    this.onSelect.emit(null);
    this.hideSelectTooltip();
    this.disableClearTabStop();
    this.searchValue.set('');
    this.searchKeys = [];
    this.resetPaging();
    if (this.url) this.setItems(this.apiItemsCache);
    else this.setItems(this.localItems);
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore || !this.url) return;

    const pageNumber = this.currentPage + 1;
    const request: any = { pageNumber };

    if (this.searchKeys.length > 0) {
      request.keys = this.searchKeys;
    }

    this.loading.set(true);
    const params = this.apiParams ? { ...this.apiParams, orelse: true } : undefined;

    this.httpService
      .post(this.url, request, params, undefined, false)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data: apiResponse) => {
          const nextItems = this.extractItems(data);
          this.apiItemsCache = this.mergeUniqueItems(this.apiItemsCache, nextItems);
          const items = pageNumber === 1
            ? this.mergeUniqueItems([], nextItems)
            : this.mergeUniqueItems(this.selectedItems(), nextItems);

          this.setItems(items);
          this.currentPage = pageNumber;
          this.hasMore = nextItems.length >= this.pageSize;

          if (this.defaultObject && items.length > 0) {
            const x = items.find(
              (s) => this.valuesEqual(s[this.bindValue], this.defaultObject[this.bindValue])
            );

            if (x) {
              this.writeValue(x[this.bindValue]);
            }

            this.change.emit(this.defaultObject);
          }

          this.cdr.markForCheck();
        },
        error: (err: any) => {
          alert(err.message);
        },
      });
  }

  private resetPaging(): void {
    this.currentPage = 0;
    this.hasMore = true;
    this.setItems([]);
  }

  subRowObj(item: any, value: any) {
    if (!value || item == null) return null;

    const keys = String(value).split('.');
    const nestedValue = keys.reduce((obj: any, key: string) => this.readProperty(obj, key), item);

    if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
      return nestedValue;
    }

    return keys.length > 1 ? this.readProperty(item, keys[keys.length - 1]) : null;
  }

  ShowSeperator(curItem: any, currindex: number) {
    if (this.subRowObj(curItem, this.bindSubObj[currindex]?.value)) {
      let l = this.bindSubObj.length;
      if (currindex < l) return ',\u00A0';
    }
    return '';
  }

  showSubObjLabel(sub: any): boolean {
    return this.bindSubObj.length > 1 && !!String(sub?.key ?? '').trim();
  }

  titleCase(value: any): string {
    if (value === null || value === undefined) return '';

    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  onChange(event: any) {
    this.hideSelectTooltip();
    const value = this.bindValue && event ? event[this.bindValue] : event;
    this.selectedValue.set(value);
    this.ngModelChange.emit(value);
    this.change.emit(event); // Notify about the change
  }

  displayPlaceholder(): string {
    const value = this.selectedValue();
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== '';
    return hasValue ? '' : this.placeholder;
  }

  labelStyle(): Record<string, string> {
    return {
      display: 'block',
      textAlign: this.labelAlign,
      '--dss-label-bg': this.labelBg ?? 'transparent',
      '--dss-label-dark-bg': this.labelDarkBg ?? this.labelBg ?? 'transparent',
      '--dss-label-color': this.labelColor ?? 'inherit',
      '--dss-label-dark-color': this.labelDarkColor ?? this.labelColor ?? 'inherit',
      padding: this.labelBg || this.labelDarkBg ? '0 0.25rem' : '0',
    };
  }

  normalizedControlWidth(): string | null {
    if (this.width === null || this.width === undefined || this.width === '') return null;

    const normalizedWidth = typeof this.width === 'number' ? `${this.width}px` : this.width;

    return `min(100%, ${normalizedWidth})`;
  }

  showRequiredMark(invalid: boolean | null | undefined = false): boolean {
    const value = this.selectedValue();
    const isEmpty = Array.isArray(value) ? value.length === 0 : value === null || value === undefined || value === '';

    return this.required && (!!invalid || isEmpty);
  }

  toggleValidationTooltip(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.validationTooltipVisible.update((visible) => !visible);
  }

  hideValidationTooltip(): void {
    this.validationTooltipVisible.set(false);
  }

  validationMessage(invalid: boolean | null | undefined = false): string {
    const value = this.selectedValue();
    const isEmpty = Array.isArray(value) ? value.length === 0 : value === null || value === undefined || value === '';

    if (this.required && isEmpty) return `${this.label} is required.`;
    if (invalid) return `Enter a valid ${this.label.toLowerCase()}.`;

    return `${this.label} is required.`;
  }

  getPrimaryBindLabel(): string | undefined {
    return this.getLabelPaths()[0] || undefined;
  }

  getCombinedLabel(item: any): string {
    if (!this.bindLabel || item == null || typeof item !== 'object') return item ?? '';

    const labelParts = this.getLabelPaths()
      .map((label) => this.subRowObj(item, label))
      .filter((value) => value !== null && value !== undefined && value !== '');

    let combinedLabel = labelParts.length > 0 ? labelParts.join(' | ') : this.getFallbackLabel(item); // Start with the main bindLabel

    // Iterate over bindSubObj to build the additional values

    if (this.bindSubObj.length > 0) {
      if (this.displayLabel?.length)
        this.bindSubObj.forEach((sub: any) => {
          //@ts-ignore
          if (this.displayLabel.includes(sub.key)) {
            const subValue = this.subRowObj(item, sub.value); // Get the nested value
            combinedLabel += subValue ? `- ${subValue}` : ''; // Append the value to the label
          }
        });
      else {
        const sub: any = this.bindSubObj[0];
        const subValue = this.subRowObj(item, sub.value); // Get the nested value
        const alreadyBound = this.getLabelPaths().some(
          (label) => label.toLowerCase() === String(sub.value).toLowerCase()
        );
        combinedLabel += subValue && !alreadyBound ? `- ${subValue}` : '';
      }
    }
    return combinedLabel;
  }

  getOptionLabel(item: any): string {
    if (!this.bindLabel || item == null || typeof item !== 'object') return item ?? '';

    return this.subRowObj(item, this.getPrimaryBindLabel()) ?? '';
  }

  getTooltipLabel(item: any): string {
    if (item == null || typeof item !== 'object') return item ?? '';

    const subParts = this.bindSubObj
      .map((sub: any) => {
        const value = this.subRowObj(item, sub.value);
        if (!value) return '';

        return this.showSubObjLabel(sub) ? `${sub.key}: ${value}` : String(value);
      })
      .filter((value) => value);

    return [this.getCombinedLabel(item), ...subParts]
      .filter((value) => value)
      .join(' | ');
  }

  getSelectedTooltip(): string {
    const value = this.selectedValue();

    if (Array.isArray(value)) {
      return value
        .map((selectedValue) => this.findSelectedItem(selectedValue))
        .map((item) => this.getTooltipLabel(item))
        .filter((label) => label)
        .join(' | ');
    }

    return this.getTooltipLabel(this.findSelectedItem(value));
  }

  getSelectedTooltipRows(): { key: string; value: any }[] {
    const value = this.selectedValue();
    const item = Array.isArray(value) ? this.findSelectedItem(value[0]) : this.findSelectedItem(value);

    if (item == null || typeof item !== 'object') return [];

    const rows = [
      {
        key: 'Name',
        value: this.getOptionLabel(item),
      },
      ...this.bindSubObj.map((sub: any) => ({
        key: sub.key,
        value: this.subRowObj(item, sub.value),
      })),
    ];

    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
  }

  onSelectMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const isInputHover = !!target?.closest('.ng-select-container');

    this.tooltipVisible.set(isInputHover && this.getSelectedTooltipRows().length > 0);
  }

  hideSelectTooltip(): void {
    this.tooltipVisible.set(false);
  }

  onSelectKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.lastTabWasShift = event.shiftKey;
    }
  }

  onSelectFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const isClearFocus = !!target?.closest('.ng-clear-wrapper, .ng-clear, [title="Clear all"]');

    if (!isClearFocus) return;

    this.focusSiblingTabStop(this.lastTabWasShift ? 'previous' : 'next');
  }

  getSelectedLabel(item: any): string {
    const label = this.getCombinedLabel(item);
    return label.length > 100 ? `${label.slice(0, 100)}...` : label;
  }

  selectedDisplayText(): string {
    const value = this.selectedValue();

    if (Array.isArray(value)) {
      return value
        .map((selectedValue) => this.getSelectedLabel(this.findSelectedItem(selectedValue)))
        .filter((label) => label)
        .join(', ');
    }

    return this.getSelectedLabel(this.findSelectedItem(value));
  }

  private setItems(items: any[]): void {
    const nextItems = this.nullableObject ? this.withNullableObject(items) : items;

    this.selectedItems.set(nextItems.map((item) => this.withDisplayLabel(item)));
  }

  private withSelectedFallbackItems(items: any[], value: any): any[] {
    if (!this.bindValue || value === null || value === undefined || value === '') return items;

    const selectedValues = Array.isArray(value) ? value : [value];
    const missingItems = selectedValues
      .filter((selectedValue) => !items.some((item) => this.valuesEqual(item?.[this.bindValue], selectedValue)))
      .map((selectedValue) => this.createFallbackSelectedItem(selectedValue));

    return missingItems.length ? [...missingItems, ...items] : items;
  }

  private createFallbackSelectedItem(value: any): any {
    if (value !== null && typeof value === 'object') return this.withDisplayLabel(value);

    const fallbackItem: Record<string, any> = {
      [this.bindValue]: value,
      [this.displayBindLabel]: String(value),
    };

    const primaryBindLabel = this.getPrimaryBindLabel();
    if (primaryBindLabel && !primaryBindLabel.includes('.')) {
      fallbackItem[primaryBindLabel] = String(value);
    }

    return fallbackItem;
  }

  private valuesEqual(first: any, second: any): boolean {
    return String(first) === String(second);
  }

  private extractItems(response: apiResponse | any): any[] {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.records)) return data.records;
    if (Array.isArray(data?.rows)) return data.rows;

    return [];
  }

  private withDisplayLabel(item: any): any {
    if (item == null || typeof item !== 'object') return item;

    return {
      ...item,
      [this.displayBindLabel]: this.getCombinedLabel(item),
    };
  }

  private readProperty(item: any, key: string): any {
    if (item == null || typeof item !== 'object') return undefined;

    if (key in item) return  (item[key]);

    const itemKey = Object.keys(item).find((currentKey) =>
      currentKey.toLowerCase() === key.toLowerCase()
    );

    return itemKey ? item[itemKey] : undefined;
  }

  private getFallbackLabel(item: any): string {
    if (item == null || typeof item !== 'object') return item ?? '';

    const fallbackValue = this.readProperty(item, 'name')
      ?? this.readProperty(item, 'label')
      ?? this.readProperty(item, 'Branch_name')
      ?? this.readProperty(item, 'firm_name')
      ?? this.readProperty(item, this.bindValue);

    return fallbackValue === null || fallbackValue === undefined ? '' : String(fallbackValue);
  }

  private withNullableObject(items: any[]): any[] {
    const hasNullableObject = items.some((s) =>
      this.valuesEqual(s?.[this.bindValue], this.nullableObject?.[this.bindValue])
    );
    return hasNullableObject ? items : [this.nullableObject, ...items];
  }

  private filterLocalItems(term: string): void {
    const normalizedTerm = term.toLowerCase();

    if (!normalizedTerm) {
      this.setItems(this.localItems);
      return;
    }

    this.setItems(this.filterItems(this.localItems, normalizedTerm));
  }

  private filterItems(items: any[], term: string): any[] {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) return items;
    return items.filter((item) =>
      this.getSearchPaths().some((path) =>
        String(this.subRowObj(item, path) ?? '').toLowerCase().includes(normalizedTerm)
      )
    );
  }

  private mergeUniqueItems(existing: any[], incoming: any[]): any[] {
    const merged = [...existing];
    for (const item of incoming) {
      const duplicate = this.bindValue
        ? merged.some((current) => this.valuesEqual(current?.[this.bindValue], item?.[this.bindValue]))
        : merged.includes(item);
      if (!duplicate) merged.push(item);
    }
    return merged;
  }
  private getLabelPaths(): string[] {
    return (this.bindLabel ?? '')
      .split(',')
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
  }

  private getSearchPaths(): string[] {
    const configuredColumns = Array.isArray(this.searchColumns)
      ? this.searchColumns
      : this.searchColumns.split(',');
    const paths = configuredColumns.map((column) => column.trim()).filter(Boolean);
    return paths.length > 0 ? paths : this.getLabelPaths();
  }
  private findSelectedItem(value: any): any {
    if (value == null || typeof value === 'object' || !this.bindValue) return value;

    return this.selectedItems().find((item) => item?.[this.bindValue] === value) ?? value;
  }

  private applyDefaultObject(): void {
    if (!this.defaultObject || typeof this.defaultObject !== 'object') return;

    this.setItems([this.defaultObject]);
    this.writeValue(this.defaultObject[this.bindValue]);
    this.change.emit(this.defaultObject);
  }

  private disableClearTabStop(): void {
    setTimeout(() => {
      const host = this.selectHost?.nativeElement;
      if (!host) return;

      host
        .querySelectorAll<HTMLElement>('.ng-clear-wrapper, .ng-clear, [title="Clear all"]')
        .forEach((element) => {
          element.setAttribute('tabindex', '-1');
        });
    });
  }

  private observeClearTabStop(): void {
    const host = this.selectHost?.nativeElement;
    if (!host) return;

    this.clearTabStopObserver = new MutationObserver(() => this.disableClearTabStop());
    this.clearTabStopObserver.observe(host, {
      attributes: true,
      attributeFilter: ['tabindex', 'class', 'title'],
      childList: true,
      subtree: true,
    });
  }

  private focusSiblingTabStop(direction: 'next' | 'previous'): void {
    setTimeout(() => {
      const host = this.selectHost?.nativeElement;
      if (!host) return;

      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => this.isVisibleTabStop(element));

      const hostIndex = focusableElements.findIndex((element) => element === host || host.contains(element));
      const nextIndex = direction === 'next' ? hostIndex + 1 : hostIndex - 1;
      const nextElement = focusableElements[nextIndex];

      nextElement?.focus();
    });
  }

  private isVisibleTabStop(element: HTMLElement): boolean {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  OnBlur(): void {
    // this.ngModelChange.emit(this.ngModel); // Emit the updated model
    this.onSelect.emit((this.selectRef.selectedItems.map((s) => s.value) as any[])[0]);
  }

  onAddTag(event: any) {
    const newTag = event;
    // Close the dropdown first
    if (this.selectRef) this.selectRef.close();
    // Call parent function
    if (this.addTagFn) {
      this.addTagFn(newTag);
    }
  }
}
/*
 * DSS-NG-SELECT DEVELOPER REFERENCE
 *
 * Value and forms
 * - Implements ControlValueAccessor; use formControlName, ngModel, or writeValue.
 * - bindValue is the property stored in the form. Without bindValue, the object is stored.
 * - onSelect emits the selected object on blur/selection; change emits the ng-select change object.
 *
 * Labels
 * - bindLabel accepts one or more comma-separated property paths.
 *   Example: bindLabel="emp_name,emp_uni_id" displays "Name | Employee ID" in the input.
 * - The dropdown heading uses only the first bindLabel field.
 * - bindSubObj renders additional rows below each dropdown heading and in the tooltip.
 * - displayLabel optionally selects bindSubObj keys to append to the input label.
 * - A bindSubObj value already present in bindLabel is not appended twice.
 * - Property paths may be nested, for example mst414_01.mst407.Dept_name.
 *
 * Searching
 * - searchColumns accepts a comma-separated string or string array.
 * - If searchColumns is omitted, all bindLabel paths are searched.
 * - Cached API items are searched first; the API is called only when the cache has no match.
 * - Local [items] use the same searchColumns/bindLabel rules without calling an API.
 *
 * Data source (one is required)
 * - Use either url or [items]. Do not configure both for the same selector.
 * - url: dss-ng-select calls the endpoint with POST and sends a paginated request containing
 *   pageNumber and, during search, keys. apiParams are sent as query parameters.
 * - [items]: the parent component owns and supplies the array; dss-ng-select performs local
 *   display, selection, and filtering only, with no API request.
 *
 * API loading and paging
 * - url enables API mode; apiParams are copied into every request with orelse: true.
 * - Assigning apiParams, defaultObject, or nullableObject does not eagerly call the API.
 * - Opening the dropdown (mouse or keyboard) loads page 1 when nothing has been loaded.
 * - Scrolling to the end loads the next page.
 * - API rows are cached and deduplicated by bindValue; numeric/string versions of an ID match.
 * - Changing apiParams clears the API cache and paging state; the next open performs the request.
 *
 * Defaults and nullable rows
 * - defaultObject supplies the initial selected object/value without an eager API request.
 * - nullableObject inserts an ALL/None row without an eager API request.
 * - Use a non-empty sentinel (for example -1) when ALL must appear selected; an empty string is
 *   treated as no selection by ng-select. Convert the sentinel before sending report/API params.
 *
 * Common example
 * <dss-ng-select
 *   url="employeeInfo/list"
 *   [apiParams]="{ branch_id: branchId }"
 *   bindLabel="emp_name,emp_uni_id"
 *   bindValue="emp_code"
 *   searchColumns="emp_name,emp_uni_id"
 *   [bindSubObj]="[{ key: 'Department', value: 'department.name' }]"
 *   formControlName="emp_code"
 * />
 */
