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
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CaseStyle,
  DSS_FORM_CONTROLS,
} from '@shared-directives/dss-form-controls';
import { createUserManagementForm } from './user-mgt-edit.factory';

import { users } from '@shared-interfaces/settings/user';
import { DialogsService } from '@shared-services/messageBox';
import { UserService } from '@shared-services/user.service';

interface Branch {
  branch_code: string;
  branch_name: string;
}

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
  private http = inject(HttpClient);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogsService);
  readonly userInputs = createUserManagementForm(this.fb);
  visible: boolean = false;
  readonly handleAdd = () => this.addNew();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);

  jsonData = signal<users[]>([]);

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
      key: 'branch_name',
      label: 'Branch',
      type: 'string',
      _style: { width: '30%' },
    },
    {
      key: 'roleName',
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
      nm: 'Checker',
    },
    {
      cd: 3,
      nm: 'Maker',
    },
  ];

  branches: Branch[] = [];

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    forkJoin({
      branches: this.http.get<Branch[]>('data/branches.json'),
      users: this.userSrc.getAll(),
    }).subscribe({
      next: ({ branches, users }) => {
        this.branches = branches;

        if (users) {
          for (const element of users) {
            const matchedBranch = this.branches.find(
              (branch) => branch.branch_code === element.branch_code,
            );
            element.branch_name = matchedBranch?.branch_name || '';
          }

          this.jsonData.set(users);
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

  change(event: any) {
    this.userInputs
      .get('roleName')
      ?.setValue(event.cd === 1 ? 'Admin' : 'User');
  }

  createUserMgtForm(user?: users) {
    return this.fb.group({
      id: [user?.id],
      username: [user?.username, Validators.required],
      email: [user?.email, Validators.required],
      mobileNo: [user?.mobileNo],
      role: [user?.role],
      roleName: [user?.roleName],
      branch_code: [user?.branch_code || 'ALL'],
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

    const formValue = this.userInputs.getRawValue();
    const user: users = {
      id: formValue.id ?? undefined,
      username: formValue.username,

      mobileNo: formValue.mobileNo,
      email: formValue.email ?? undefined,
      branch_code: formValue.branch_code,
      role: formValue.role || '',
      roleName: formValue.roleName || '',
    };

    if (user.id != null) {
      const users = this.jsonData() as users[];
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

  onGridDelete(item: users) {
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
