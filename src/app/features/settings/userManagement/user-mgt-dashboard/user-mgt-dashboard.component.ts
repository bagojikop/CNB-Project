import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  CaseStyle,
  DSS_FORM_CONTROLS,
} from '@shared-directives/dss-form-controls';
import { createUserManagementForm } from './user-mgt-edit.factory';
import { crudService } from '@shared-services/crudService';
import { userMgt } from '@shared-interfaces/settings/user';
import { DialogsService } from '@shared-services/messageBox';

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
  private dialog = inject(DialogsService);
  readonly userInputs = createUserManagementForm(this.fb);
  visible: boolean = false;
  readonly handleAdd = () => this.addNew();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);

  form = this.fb.group({
    jsonData: this.fb.array([]),
  });

  get jsonData(): FormArray {
    return this.form.get('jsonData') as FormArray;
  }

  columns = [
    {
      key: 'username',
      label: 'Username',
      type: 'string',
      _style: { width: '40%' },
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      _style: { width: '40%' },
    },
    {
      key: 'roleName',
      label: 'Role',
      type: 'string',
      _style: { width: '20%' },
    },
  ];

  userRole = [
    {
      cd: 1,
      nm: 'Admin',
    },
    {
      cd: 2,
      nm: 'User',
    },
  ];

  ngOnInit(): void {
    this.crudService.STORAGE_KEY.set('UserMgt');
  }

  ngAfterViewInit(): void {
    const data = this.crudService.getAll() as userMgt[];

    this.jsonData.clear();

    data.forEach((user) => {
      this.jsonData.push(this.createUserMgtForm(user));
    });
  }

  change(event: any) {
    this.userInputs
      .get('roleName')
      ?.setValue(event.cd === 1 ? 'Admin' : 'User');
  }
  createUserMgtForm(user?: userMgt) {
    return this.fb.group({
      id: [user?.id],
      username: [user?.username],

      password: [user?.password],

      email: [user?.email],

      role: [user?.role],

      roleName: [user?.roleName],
    });
  }

  addNew() {
    this.visible = true;
  }

  close() {
    this.userInputs.reset();
    this.visible = false;
  }

  async saveModalData() {
    if (this.userInputs.invalid) {
      this.dialog.swal({
        dialog: 'error',
        message: 'Please Fill Required Fields',
      });
      return;
    }

    const user = this.userInputs.value as userMgt;

    const users = this.crudService.getAll() as userMgt[];

    const index = user.id
      ? users.findIndex((x) => Number(x.id) === Number(user.id))
      : -1;

    //onEdit
    if (index >= 0) {
      debugger;
      // Update FormArray
      this.jsonData.at(index).patchValue(user);
      this.crudService.update(user);
      // Update localStorage array
      users[index] = user;

      //onSave
    } else {
      debugger;
      // New record
      user.id = users.length ? (users[users.length - 1].id ?? 0) + 1 : 1;

      this.jsonData.push(this.createUserMgtForm(user));

      users.push(user);
      this.crudService.add(user);
    }

    this.dialog.swal({
      dialog: 'success',
      message: 'Record Save Successfully',
    });

    this.userInputs.reset();
    this.visible = false;
  }

  onGridEdit(item: any) {
    debugger;

    this.userInputs.patchValue({
      ...item,
      id: item.___id,
    });
    this.visible = true;
  }

  onGridDelete(item: userMgt) {
    this.dialog
      .swal({
        dialog: 'confirm',
        message: 'Do you want to Delete this record',
      })
      .then((res) => {
        console.log(res);

        if (res) {
          const index = this.jsonData.controls.findIndex(
            (control) => control.value.id === item.id,
          );

          if (index !== -1) {
            this.jsonData.removeAt(index);
          }

          this.crudService.delete(item.id!);
        }
      });
  }
}
