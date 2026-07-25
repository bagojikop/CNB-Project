import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class crudService {
  STORAGE_KEY = signal('jsonData');

  getAll(): any[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY()) ?? '[]');
  }

  add(data: any): void {
    const list = this.getAll();
    list.push(data);
    localStorage.setItem(this.STORAGE_KEY(), JSON.stringify(list));
  }

  update(data: any): void {
    const list = this.getAll();

    const index = list.findIndex((x) => x.batchId === data.batchId);

    if (index !== -1) {
      list[index] = data;
      localStorage.setItem(this.STORAGE_KEY(), JSON.stringify(list));
    }
  }

  delete(batchId: number): void {
    const list = this.getAll().filter((x) => x.batchId !== batchId);
    localStorage.setItem(this.STORAGE_KEY(), JSON.stringify(list));
  }

  getById(batchId: number): any | undefined {
    return this.getAll().find((x) => x.batchId === batchId);
  }
}
