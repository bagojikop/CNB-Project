import { RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-status',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './qr-status.component.html',
  styleUrl: './qr-status.component.scss',
})
export class QrStatusComponent implements OnInit {
  qrStatusForm: FormGroup;
  submitted = false;
  qrStatusResult: any = null;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.qrStatusForm = this.fb.group({
      mid: [
        'YOUTUBE001',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      sid: [
        'SURYA01410',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      terminalId: [''],
      startDate: ['2020-05-01T00:00:00', [Validators.required]],
      endDate: ['2025-05-25T00:00:00', [Validators.required]],
      pageSize: [
        '5',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      pageNo: ['1', [Validators.required, Validators.min(1)]],
      checksum: [''],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitted = true;
    if (this.qrStatusForm.invalid) {
      return;
    }

    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.qrStatusResult = {
        ...this.qrStatusForm.value,
        request: {
          body: {
            encryptData: {
              mid: this.qrStatusForm.value.mid,
              sid: this.qrStatusForm.value.sid,
              terminalId: this.qrStatusForm.value.terminalId || '',
              startDate: this.qrStatusForm.value.startDate,
              endDate: this.qrStatusForm.value.endDate,
              pageSize: this.qrStatusForm.value.pageSize,
              pageNo: this.qrStatusForm.value.pageNo,
              checksum: this.qrStatusForm.value.checksum || '',
            },
          },
        },
      };
      this.isLoading = false;
    }, 1000);
  }

  get f() {
    return this.qrStatusForm.controls;
  }
}
