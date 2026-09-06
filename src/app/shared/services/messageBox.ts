import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export type DialogType = 'confirm' | 'success' | 'error' | 'warning';

export interface DialogOptions {
    dialog: DialogType;
    title?: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class DialogsService {

    constructor() { }

    swal(param: DialogOptions): Promise<boolean> {
        const baseConfig = {
            allowOutsideClick: false,
            allowEscapeKey: true
        };

        switch (param.dialog) {
            case 'confirm':
                return Swal.fire({
                    ...baseConfig,
                    title: param.title || "Confirmation",
                    text: param.message,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(res => res.isConfirmed);

            case 'success':
                return new Promise<boolean>((resolve) => {
                    Swal.fire({
                        ...baseConfig,
                        title: param.title || "Success",
                        text: param.message,
                        icon: 'success',
                        showCancelButton: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            setTimeout(() => Swal.close(), 1500);
                        }
                    }).then(res => resolve(true));
                });

            case 'error':
                return Swal.fire({
                    ...baseConfig,
                    title: param.title || "Error",
                    text: param.message,
                    icon: 'error'
                }).then(res => res.isConfirmed);

            case 'warning':
                return Swal.fire({
                    ...baseConfig,
                    title: param.title || "Warning",
                    text: param.message,
                    icon: 'warning'
                }).then(res => res.isConfirmed);
        }
    }

    confirmIdle(timeoutMs = 60_000): Promise<boolean> {
        return Swal.fire({
            title: 'You are idle',
            text: 'You will be automatically logged out. Do you want to stay signed in?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, continue',
            cancelButtonText: 'No, log out',
            confirmButtonColor: '#0078a8',
            cancelButtonColor: '#6c757d',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: timeoutMs,
            timerProgressBar: true,
        }).then((result) => result.isConfirmed);
    }
}
