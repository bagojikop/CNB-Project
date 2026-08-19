import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular-pro';

// Import all form control components
import { DssDateFinComponent } from './directives/dss-date-fin/dss-date-fin.component';
import { DssInputNumComponent } from './directives/dss-input-num/dss-input-num.component';
import { DssInputNumPipe } from './directives/dss-input-num/dss-input-num.pipe';
import { DssInputTextComponent } from './directives/dss-input-text/dss-input-text.component';
import { DssInputWithPrefixComponent } from './directives/dss-input-with-prefix/dss-input-with-prefix.component';
import { NgCustomSelectComponent } from './directives/ng-select/ng-select.component';
import { DssTableGridComponent } from './directives/dss-table-grid/dss-table-grid';
import { DssTableDashboardComponent } from './directives/dss-table-dashboard/dss-table-dashboard';
import { DssDocumentPreviewComponent } from './directives/dss-document-preview/dss-document-preview.component';
import { NavactionsComponent } from './directives/nav-actions/nav-actions.component';
import { CaseStyleDirective } from './directives/dss-input-text/case-style.directive';
import { DssViewportHeightDirective } from './directives/dss-viewport-height/dss-viewport-height.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormModule,
    // Import standalone components
    DssDateFinComponent,
    DssInputNumComponent,
    DssInputNumPipe,
    DssInputTextComponent,
    DssInputWithPrefixComponent,
    NgCustomSelectComponent,
    DssTableGridComponent,
    DssTableDashboardComponent,
    DssDocumentPreviewComponent,
    NavactionsComponent,
    CaseStyleDirective,
    DssViewportHeightDirective,
  ],
  exports: [
    // Export all form controls for use in other components
    DssDateFinComponent,
    DssInputNumComponent,
    DssInputNumPipe,
    DssInputTextComponent,
    DssInputWithPrefixComponent,
    NgCustomSelectComponent,
    DssTableGridComponent,
    DssTableDashboardComponent,
    DssDocumentPreviewComponent,
    NavactionsComponent,
    CaseStyleDirective,
    DssViewportHeightDirective,
    // Export required modules
    ReactiveFormsModule,
    FormModule,
  ],
})
export class SharedModule {}
