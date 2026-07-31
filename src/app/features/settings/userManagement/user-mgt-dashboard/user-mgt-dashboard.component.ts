import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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

import { userMgt } from '@shared-interfaces/settings/user';
import { DialogsService } from '@shared-services/messageBox';
import { UserService } from '@shared-services/user.service';

@Component({
  selector: 'app-user-mgt-dashboard',
  imports: [DSS_FORM_CONTROLS, ReactiveFormsModule],
  templateUrl: './user-mgt-dashboard.component.html',
  styleUrl: './user-mgt-dashboard.component.scss',
})
export class UserMgtDashboardComponent implements OnInit, AfterViewInit {
  readonly caseStyle = CaseStyle;
  dashboardTitle: string = 'User Management';
  private userSrc = inject(UserService);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogsService);
  readonly userInputs = createUserManagementForm(this.fb);
  visible: boolean = false;
  readonly handleAdd = () => this.addNew();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);

  jsonData = signal<userMgt[]>([]);

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

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.userSrc.getAll().subscribe({
      next: (res) => {
        this.jsonData.set(res);
      },
      error: (err) => {
        this.dialog.swal({
          dialog: 'error',
          message: err.message,
        });
      },
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

      mobileNo: [user?.mobileNo],

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

    const user = this.userInputs.getRawValue() as userMgt;

    if (user.id != null) {
      const users = this.jsonData() as userMgt[];
      var index = users.findIndex((user) => user?.id === user.id);
    } else {
      var index = -1;
    }

    //onEdit
    if (index !== -1) {
      debugger;
      this.userSrc.update(user).subscribe({
        next: (res) => {
          this.jsonData.update((data) => {
            const updated = [...data];
            updated[index] = {
              ...updated[index],
              ...user,
            };
            return updated;
          });

          this.dialog.swal({
            dialog: 'success',
            message: 'Record Update Successfully',
          });
        },
        error: (err) => {
          this.dialog.swal({
            dialog: 'error',
            message: err.message,
          });
        },
      });
    } else {
      // New record

      debugger;
      this.userSrc.add(user).subscribe({
        next: (res) => {
          this.jsonData.update((data) => [...data, { ...user }]);
          this.dialog.swal({
            dialog: 'success',
            message: 'Record Save Successfully',
          });
        },
        error: (err) => {
          this.dialog.swal({
            dialog: 'error',
            message: err.message,
          });
        },
      });
    }

    this.visible = false;
  }

  consoleTest() {
    console.log('Button Clicked');
  }

  onGridEdit(item: any) {
    this.userInputs.patchValue({
      ...item,
      id: item.id,
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
        if (res) {
          this.userSrc.delete(item.id).subscribe({
            next: (res) => {
              const index = this.jsonData().findIndex(
                (control) => control.id === item.id,
              );

              if (index !== -1) {
                this.jsonData().splice(index, 1);
              }
            },
            error: (err) => {
              this.dialog.swal({
                dialog: 'error',
                message: err.message,
              });
            },
          });
        }
      });
  }
}
