import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CaseStyle,
  DSS_FORM_CONTROLS,
} from '@shared-directives/dss-form-controls';
import { createUserManagementForm } from './user-mgt-edit.factory';
import { crudService } from '@shared-services/crudService';
import { userMgt } from '@shared-interfaces/settings/user';

@Component({
  selector: 'app-user-mgt-dashboard',
  imports: [DSS_FORM_CONTROLS, ReactiveFormsModule],
  templateUrl: './user-mgt-dashboard.component.html',
  styleUrl: './user-mgt-dashboard.component.scss',
})
export class UserMgtDashboardComponent implements OnInit, AfterViewInit {
  readonly caseStyle = CaseStyle;
  dashboardTitle: string = 'User Management';
  private crudService = inject(crudService);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  readonly userInputs = createUserManagementForm(this.fb);
  visible: boolean = false;
  jsonData = <userMgt[]>[];
  columns = [
    {
      key: 'username',
      label: 'Username',
      type: 'string',
      _style: { width: '10%' },
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      _style: { width: '10%' },
    },
    {
      key: 'role',
      label: 'Role',
      type: 'string',
      _style: { width: '10%' },
    },
  ];

  userRole = [
    {
      cd: 1,
      nm: 'Admin',
    },
    {
      cd: 2,
      nm: 'user',
    },
  ];

  handleAdd = () => this.addNew();
  handleEdit = () => this.Edit();

  ngOnInit(): void {
    this.crudService.STORAGE_KEY.set('UserMgt');
  }

  ngAfterViewInit(): void {
    this.jsonData = this.crudService.getAll() as userMgt[];

    this.jsonData.map((el) => {
      el.role = el.role == '1' ? 'Admin' : 'User';
    });
  }

  addNew() {
    this.visible = true;
  }

  close() {
    this.userInputs.reset();
    this.visible = false;
  }

  Edit() {}

  saveModalData() {
    var data = this.userInputs.getRawValue();
    this.crudService.add(data);

    this.userInputs.reset();
    this.visible = false;
  }
}
