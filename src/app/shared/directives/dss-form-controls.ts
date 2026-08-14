import { DssDateFinComponent } from './dss-date-fin/dss-date-fin.component';
import { DssInputNumComponent } from './dss-input-num/dss-input-num.component';
import { DssInputNumPipe } from './dss-input-num/dss-input-num.pipe';
import { DssInputTextComponent } from './dss-input-text/dss-input-text.component';
import { NgCustomSelectComponent } from './ng-select/ng-select.component';
import { CaseStyle } from './dss-input-text/case-style-enum';
import { CaseStyleDirective } from './dss-input-text/case-style.directive';
import { NavType } from './nav-actions/navTypes';
import { NavactionsComponent } from './nav-actions/nav-actions.component';
import { DssTableGridComponent } from './dss-table-grid/dss-table-grid';
import { DssViewportHeightDirective } from './dss-viewport-height/dss-viewport-height.directive';

import {
  BadgeModule,
  ButtonModule,
  CardModule,
  FormCheckComponent,
  GridModule,
  ModalModule,
  TableModule,
  Tabs2Module,
} from '@coreui/angular-pro';

import { DssDocumentPreviewComponent } from './dss-document-preview/dss-document-preview.component';
import { DssTableDashboardComponent } from './dss-table-dashboard/dss-table-dashboard';
import { DatePipe } from '@angular/common';
import {
  IconDirective,
  IconModule,
  IconSetService,
} from '@coreui/icons-angular';
import { DssInputWithPrefixComponent } from './dss-input-with-prefix/dss-input-with-prefix.component';

export const DSS_FORM_CONTROLS = [
  DssDateFinComponent,
  DssInputNumComponent,
  DssInputNumPipe,
  DssInputTextComponent,
  DssInputWithPrefixComponent,
  DssTableGridComponent,
  NgCustomSelectComponent,
  CaseStyleDirective,
  TableModule,
  BadgeModule,
  CardModule,
  FormCheckComponent,
  DssViewportHeightDirective,
  NavactionsComponent,
  DatePipe,
  Tabs2Module,
  DssTableDashboardComponent,
  DssDocumentPreviewComponent,
  ButtonModule,
  GridModule,
  ModalModule,
  IconModule,
] as const;

export {
  DssDateFinComponent,
  DssInputNumComponent,
  DssInputNumPipe,
  TableModule,
  FormCheckComponent,
  BadgeModule,
  CardModule,
  DssInputWithPrefixComponent,
  DssInputTextComponent,
  DssTableGridComponent,
  NgCustomSelectComponent,
  ButtonModule,
  CaseStyleDirective,
  DssViewportHeightDirective,
  NavactionsComponent,
  DssTableDashboardComponent,
  NavType,
  Tabs2Module,
  DssDocumentPreviewComponent,
  CaseStyle,
};
