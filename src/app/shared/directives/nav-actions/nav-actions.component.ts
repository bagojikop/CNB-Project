import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  inject,
  AfterViewInit,
  OnChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  SimpleChanges,
} from '@angular/core';
import { NavbarActions, UserPermissions } from '@shared-services/common';
import { MyProvider } from '@shared-services/provider';
import { Router } from '@angular/router';
import { AbstractControl, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NavType } from './navTypes';
import { DialogsService } from '@shared-services/messageBox';

@Component({
  selector: 'dss-nav-actions',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './nav-actions.component.html',
  styleUrls: ['./nav-actions.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavactionsComponent implements OnInit, AfterViewInit, OnChanges {
  dropdownOpen = false;
  menuOpen = false;

  @Input() navType: string = NavType.T;
  @Input() PrintPrv = false;
  @Input() title = '';
  @Input() isDoc: boolean = false;
  @Input() docInfo?: any = {};
  @Input() entityFormGroup?: FormGroup;
  @Input() enableFormGroups: FormGroup[] = [];
  @Input() keepDisabledControls: AbstractControl[] = [];

  @Input() handleNew: () => Promise<boolean> = async () => true;
  @Input() handleEdit: () => Promise<boolean> = async () => true;
  @Input() handlePrint: () => Promise<boolean> = async () => true;
  @Input() handleSave: () => Promise<boolean> = async () => true;
  @Input() handleUndo: () => Promise<boolean> = async () => true;
  @Input() handleAttach: () => Promise<boolean> = async () => true;
  @Input() handleEInv: () => Promise<boolean> = async () => true;
  @Input() handleEEway: () => Promise<boolean> = async () => true;
  @Input() handleClose: () => Promise<boolean> = async () => true;

  @Output() sendAction = new EventEmitter();
  @Output() sendDocument = new EventEmitter<any>();
  @Output() sendEInv = new EventEmitter<any>();
  @Output() sendEWay = new EventEmitter<any>();
  @Output() sendPrint = new EventEmitter<any>();
  
  @Input() PrintButtonEnabled: boolean = (this.navType == "T");
  @Input() AttachButtonEnabled: boolean = (this.navType == "T");
  
  
  @Input() MoreButtonEnabled: boolean = false;
  

  get currentEntity(): any {
    return this.entityFormGroup?.getRawValue();
  }
  userAccess: any = {};
  userAccessCtrl = inject(UserPermissions);
  private accessDeniedDialogOpen = false;
  saveInProgress = false;

  constructor(
    public navactions: NavbarActions,
    private router: Router,
    private cd: ChangeDetectorRef,
    public provider: MyProvider,
    private elementRef: ElementRef<HTMLElement>,
    private dialogs: DialogsService
  ) { }

  @HostListener('document:click', ['$event'])
  closeDropdownOnOutsideClick(event: MouseEvent): void {
    if (!this.dropdownOpen) return;

    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) return;

    this.dropdownOpen = false;
    this.cd.markForCheck();
  }

  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const shortcut = this.getShortcutAction(key, event);

    if (!shortcut) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.repeat) return;

    if (!this.hasActionPermission(shortcut)) {
      void this.showAccessDenied(shortcut);
      return;
    }

    if (!this.canRunShortcut(shortcut)) return;

    void this.toDo(shortcut);
  }

  ngOnInit(): void {
    if (!this.navType) this.navType = NavType.T;
    if (this.isDoc === undefined) this.isDoc = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['entityFormGroup'] ||
      changes['enableFormGroups'] ||
      changes['keepDisabledControls']
    ) {
      this.syncFormGroupDisabled();
    }
  }

  ngAfterViewInit(): void {
    this.userAccess = this.userAccessCtrl.getInfo();
    this.syncFormGroupDisabled();
  }

  async toDo(action: string, event?: any) {
    if (!this.hasActionPermission(action)) {
      await this.showAccessDenied(action);
      return;
    }

    switch (action) {
      case 'new': {
        const success = await this.handleNew();
        if (success) {
          const permission = (this.userAccess ? this.userAccess.a : 1) || 1;
          this.navactions.fieldsetDisabled = permission ? false : true;
          this.syncFormGroupDisabled();

          this.navactions.newBtnDisabled = permission ? true : false;
          this.navactions.editBtnDisabled = permission ? true : false;

          this.navactions.saveBtnDisabled = permission ? false : true;
          this.navactions.undoBtnDisabled = permission ? false : true;

          this.navactions.printBtnDisabled = false;

          this.cd.markForCheck();
        }
        break;
      }
      case 'edit': {
        const success = await this.handleEdit();
        if (success) {
          const permission = (this.userAccess ? this.userAccess.e : 1) || 1;
          this.navactions.fieldsetDisabled = permission ? false : true;
          this.syncFormGroupDisabled();

          this.navactions.newBtnDisabled = permission ? true : false;
          this.navactions.editBtnDisabled = permission ? true : false;

          this.navactions.saveBtnDisabled = permission ? false : true;
          this.navactions.undoBtnDisabled = permission ? false : true;
          this.cd.markForCheck();
        }

        break;
      }
      case 'save': {
        if (this.saveInProgress) return;

        this.saveInProgress = true;
        this.cd.markForCheck();

        try {
          const success = await this.handleSave();
          if (success) {
            this.navactions.fieldsetDisabled = true;
            this.syncFormGroupDisabled();

            this.navactions.newBtnDisabled = false;
            this.navactions.editBtnDisabled = false;

            this.navactions.saveBtnDisabled = true;
            this.navactions.undoBtnDisabled = true;

            this.navactions.printBtnDisabled = false;
          }
        } catch (error) {
          if (this.isHttpServerFailure(error)) {
            await this.undoAfterFailedSave();
          }
          return;
        } finally {
          this.saveInProgress = false;
          this.cd.markForCheck();
        }
        break;
      }
      case 'undo':
        const success = await this.handleUndo();
        if (success) {
          this.navactions.fieldsetDisabled = true;
          this.syncFormGroupDisabled();

          this.navactions.newBtnDisabled = false;
          this.navactions.editBtnDisabled = false;

          this.navactions.saveBtnDisabled = true;
          this.navactions.undoBtnDisabled = true;

          this.cd.markForCheck();
          const entity = this.currentEntity;
          const isValid = entity && Object.keys(entity).length > 0;

          this.navactions.printBtnDisabled = !isValid;
        }
        break;
      case 'Attach':
        {
          const success = await this.handleAttach();
          if (success) this.sendDocument.emit(event);
        }
        break;
      case 'print':
        {
          const success = await this.handlePrint();
          if (success) this.sendPrint.emit(event);
        }
        break;
      case 'eInv': {
        const success = await this.handleEInv();
        if (success) this.sendEInv.emit(event);
        break;
      }
      case 'eWay':
        {
          const success = await this.handleEEway();
          if (success) this.sendEWay.emit(event);
        }
        break;
      case 'close':
        await this.handleClose();
        break;
      default: {
        this.navactions.fieldsetDisabled = true;
        this.syncFormGroupDisabled();
        const permission1 = this.userAccess ? (action === 'new' ? this.userAccess.a : 0) : 1;
        const permission2 = this.userAccess ? (action === 'edit' ? this.userAccess.e : 0) : 1;

        this.navactions.newBtnDisabled = permission1 ? false : true;
        this.navactions.editBtnDisabled = permission2 ? true : false;

        this.navactions.saveBtnDisabled = true;
        this.navactions.undoBtnDisabled = true;
        if (this.cd) this.cd.markForCheck();
        break;
      }
    }

    this.sendAction.emit(action);
  }

  toggleDropdown(event: Event) {
    event.preventDefault(); // prevent page jump
    this.dropdownOpen = !this.dropdownOpen;
  }

  private getShortcutAction(key: string, event: KeyboardEvent): string | null {
    if (event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
      switch (key) {
        case 'a':
          return 'new';
        case 'e':
          return 'edit';
        case 's':
          return 'save';
        case 'z':
          return 'undo';
        case 'p':
          return 'print';
      }
    }

    if (key === 'escape') return 'close';

    return null;
  }

  private canRunShortcut(action: string): boolean {
    switch (action) {
      case 'new':
        return !this.navactions.newBtnDisabled;
      case 'edit':
        return !this.navactions.editBtnDisabled;
      case 'save':
        return !this.navactions.saveBtnDisabled && !this.saveInProgress;
      case 'undo':
        return !this.navactions.undoBtnDisabled;
      case 'print':
        return this.navType === NavType.T && !this.navactions.printBtnDisabled;
      case 'close':
        return true;
      default:
        return false;
    }
  }

  private hasActionPermission(action: string): boolean {
    switch (action) {
      case 'new':
        return this.userAccess.a !== 0;
      case 'edit':
        return this.userAccess.e !== 0;
      case 'print':
        return this.userAccess.p !== 0;
      default:
        return true;
    }
  }

  private async showAccessDenied(action: string): Promise<void> {
    if (this.accessDeniedDialogOpen) return;

    this.accessDeniedDialogOpen = true;
    try {
      await this.dialogs.swal({
        dialog: 'warning',
        title: 'Access denied',
        message: `You do not have permission to ${this.getActionLabel(action)}.`,
      });
    } finally {
      this.accessDeniedDialogOpen = false;
    }
  }

  private getActionLabel(action: string): string {
    switch (action) {
      case 'new':
        return 'create a new record';
      case 'edit':
        return 'edit this record';
      case 'print':
        return 'print this record';
      default:
        return 'perform this action';
    }
  }

  private async undoAfterFailedSave(): Promise<void> {
    const success = await this.handleUndo();
    if (!success) return;

    this.navactions.fieldsetDisabled = true;
    this.syncFormGroupDisabled();

    this.navactions.newBtnDisabled = false;
    this.navactions.editBtnDisabled = false;

    this.navactions.saveBtnDisabled = true;
    this.navactions.undoBtnDisabled = true;

    const entity = this.currentEntity;
    const isValid = entity && Object.keys(entity).length > 0;
    this.navactions.printBtnDisabled = !isValid;

    this.sendAction.emit('undo');
  }

  private isHttpServerFailure(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 0;
    }

    const status = Number((error as { status?: unknown } | null)?.status);
    return status === 0;
  }

  private syncFormGroupDisabled(): void {
    const formGroups = this.getFormGroups();

    if (formGroups.length === 0) return;

    const options = { emitEvent: false };

    if (this.navactions.fieldsetDisabled) {
      formGroups.forEach((formGroup) => formGroup.disable(options));
    } else {
      formGroups.forEach((formGroup) => formGroup.enable(options));
      this.keepDisabledControls.forEach((control) => control.disable(options));
    }
  }

  private getFormGroups(): FormGroup[] {
    const formGroups = [
      this.entityFormGroup,
      ...this.enableFormGroups,
    ].filter((formGroup): formGroup is FormGroup => !!formGroup);

    return [...new Set(formGroups)];
  }
}
