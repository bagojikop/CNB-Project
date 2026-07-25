import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconDirective } from '@coreui/icons-angular';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
// import { IModules } from '@shared-interfaces/masters/firm-branch-unit/modules';
import { AuthService } from '@shared-services/auth.service';
import { Http } from '@shared-services/httpService';
import { filter, take } from 'rxjs';
import {
  BorderDirective,
  ButtonCloseDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarToggleDirective,
} from '@coreui/angular-pro';
import { environment } from 'src/environments/environment.development';

interface AsideMenuModule {
  id: string;
  mode: string;
  label: string;
  icon: string;
  color: 'success' | 'warning';
  aliases: string[];
}

@Component({
  selector: 'app-default-aside',
  templateUrl: './default-aside.component.html',
  styleUrls: ['./default-aside.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    IconDirective,
    ButtonCloseDirective,
    SidebarToggleDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    BorderDirective,
  ],
})
export class DefaultAsideComponent implements AfterViewInit, OnInit {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private http = inject(Http);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  @Output() moduleSelected = new EventEmitter<string>();

  public modules: any[] = [];
  public modulesLoading = false;
  public modulesError = '';
  public activeMode = 'Admin';

  public menuModules: AsideMenuModule[] = [
    {
      id: '1',
      mode: 'Admin',
      label: 'Settings',
      icon: 'cilSettings',
      color: 'success',
      aliases: ['settings'],
    },
  ];

  public get enabledMenuModules(): AsideMenuModule[] {
    if (this.modules.length === 0) {
      return this.menuModules;
    }

    const enabledModuleNames = new Set<string>();

    this.modules.forEach((module) => {
      if (module.id) {
        enabledModuleNames.add(module.id.toString());
      }

      if (module.modulename) {
        enabledModuleNames.add(this.normalizeModuleName(module.modulename));
      }
    });

    return this.menuModules.filter(
      (menuModule) =>
        enabledModuleNames.has(menuModule.id) ||
        menuModule.aliases.some((alias) =>
          enabledModuleNames.has(this.normalizeModuleName(alias)),
        ),
    );
  }

  ngOnInit(): void {
    // this.auth.isAuthenticated$
    //   .pipe(filter(Boolean), take(1), takeUntilDestroyed(this.destroyRef))
    //   .subscribe(() => this.getModules());
  }

  ngAfterViewInit(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
  }

  private getModules(): void {
    this.modulesLoading = true;
    this.modulesError = '';

    // this.http
    //   .get('moduleusers/modules')
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res: apiResponse | IModules[]) => {
    //       const data = Array.isArray(res) ? res : res?.data;
    //       this.modules = Array.isArray(data) ? data : [];
    //       this.modulesLoading = false;
    //       this.selectDefaultModule();
    //     },
    //     error: () => {
    //       this.modules = [];
    //       this.modulesError = 'Modules could not be loaded.';
    //       this.modulesLoading = false;
    //       this.selectDefaultModule();
    //     }
    //   });
  }

  public selectModule(menuModule: AsideMenuModule): void {
    //this.activeMode = menuModule.mode;
    this.moduleSelected.emit(menuModule.mode);
  }

  private normalizeModuleName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private selectDefaultModule(): void {
    const enabledModules = this.enabledMenuModules;
    this.activeMode = environment.defaultModule || this.activeMode;
    const activeModule = enabledModules.find(
      (module) => module.mode === this.activeMode,
    );

    if (activeModule || enabledModules.length === 0) {
      this.selectModule(activeModule!);
      return;
    }

    this.selectModule(enabledModules[0]);
  }
}
