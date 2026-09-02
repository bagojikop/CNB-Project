import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { firstValueFrom, forkJoin, startWith } from 'rxjs';
import {
  CaseStyle,
  DSS_FORM_CONTROLS,
} from '@shared-directives/dss-form-controls';
import { createUserManagementForm } from './user-mgt-edit.factory';

import { users } from '@shared-interfaces/settings/user';
import { DialogsService } from '@shared-services/messageBox';
import { UserService } from '@shared-services/user.service';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { Http } from '@shared-services/httpService';

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

  private http = inject(Http);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogsService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly userInputs = createUserManagementForm(this.fb);
  visible: boolean = false;
  readonly handleAdd = () => this.addNew();
  readonly handleEdit = (item?: any) => this.onGridEdit(item);
  readonly handleDelete = (item?: any) => this.onGridDelete(item);

  users = signal<users[]>([]);

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
      key: 'mobileNo',
      label: 'Mobile No.',
      type: 'string',
      _style: { width: '20%' },
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

  ngOnInit(): void {
    const roleControl = this.userInputs.controls.role;
    const branchControl = this.userInputs.controls.branch_code;

    roleControl.valueChanges.pipe(startWith(roleControl.value)).subscribe((role) => {
      if (Number(role) === 1) {
        branchControl.removeValidators(Validators.required);
      } else {
        branchControl.addValidators(Validators.required);
      }
      branchControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngAfterViewInit(): void {
    forkJoin({
      branches: this.http.readJson<Branch[]>('assets/data/branches.json'),
      userResponse: this.http.get<apiResponse>('user/List'),
    }).subscribe({

      next: ({ branches, userResponse }) => {
        this.branches = branches;

        if (userResponse.status_cd === 1) {
          const userRows = Array.isArray(userResponse.data)
            ? userResponse.data.map((user) => this.normalizeUser(user))
            : [];

          for (const element of userRows) {
            const matchedBranch = this.branches.find(
              (branch) => String(branch.branch_code) === String(element.branch_code),
            );
            element.branch_name = matchedBranch?.branch_name || '';
            element.roleName = this.userRole.find((r) => r.cd === parseInt(element.role))?.nm || '';
          }

          this.users.set(userRows);
          return;
        }

        this.users.set([]);
        void this.dialog.swal({
          dialog: 'error',
          message: userResponse.errors?.message || 'Unable to load users.',
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



  createUserMgtForm(user?: users) {
    return this.fb.group({
      id: [user?.id],
      username: [user?.username, Validators.required],
      email: [user?.email, Validators.required],
      mobileNo: [user?.mobileNo],
      role: [user?.role],

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

    };

    const res = await firstValueFrom(
      user.id ? this.http.post<apiResponse>(`user/update/${user.id}`, user)
        : this.http.post<apiResponse>('user/create', user)
    )

    if (res.status_cd === 1) {
      this.userInputs.patchValue(this.normalizeUser(res.data));
      this.dialog.swal({
        dialog: 'success',
        message: 'Record Update Successfully',
      }).then(() => {
        this.visible = false;
        this.userInputs.reset();
        this.ngAfterViewInit();
      })
      //onEdit
    }
    else {
      this.dialog.swal({
        dialog: 'error',
        message: res.errors.message,
      });
    }
  }

  consoleTest() {
    console.log('Button Clicked');
  }

  async onGridEdit(item: any) {
    const res = await firstValueFrom(this.http.get<apiResponse>(`user/single/${item.id}`));
    if (res.status_cd === 1) {
      this.visible = true;
      this.userInputs.reset(this.normalizeUser(res.data));
      this.cdr.detectChanges();
    }
  }

  private normalizeUser(value: any): users {
    return {
      ...value,
      mobileNo: String(value?.mobileNo ?? value?.mobileno ?? value?.mobile_no ?? ''),
    } as users;
  }

  onGridDelete(item: users) {
    this.dialog
      .swal({
        dialog: 'confirm',
        message: 'Do you want to Delete this record',
      })
      .then(async (res) => {
        if (res) {

          const res = await firstValueFrom(this.http.delete<apiResponse>(`user/delete/${item.id}`));

          if (res.status_cd === 1) {
            this.dialog.swal({
              dialog: 'success',
              message: 'Record Deleted Successfully',
            }).then(() => {
              const index = this.users().findIndex(
                (control) => control.id === item.id,
              );

              if (index !== -1) {
                this.users.update((current) => current.filter((_, i) => i !== index));
              }
            });
          }

          else {


            this.dialog.swal({
              dialog: 'error',
              message: res.errors.message || 'Unable to delete the record. Please try again.',
            }).then(() => {
              this.ngAfterViewInit();
            });
          }
        }

      });
  }
}
