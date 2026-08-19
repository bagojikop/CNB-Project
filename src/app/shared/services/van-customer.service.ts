import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Customer {
  id: string;
  firmName: string;
  accountNo: string;
  customerId: string;
  clientId: string;
  firmId: string;
  branchId: string;
}

export interface VANCreationRequest {
  id: string;
  Request: {
    body: {
      encryptData: {
        accountNo: string;
        startDate: string;
        endDate: string;
        countVAN: string;
        virtualAccountDetails: Array<{
          vanNumber: string;
          endDate?: string;
        }>;
      };
    };
  };
}

export interface Configuration {
  id: string;
  firmId: string;
  firmName: string;
  accountNo: string;
  accountName: string;
  customerId: string;
  clientId: string;
  branchId: string;
  IFSC_Code: string;
}

export interface DbData {
  users: any[];
  configuration: Configuration[];
  VANCreation: VANCreationRequest[];
  payments: any[];
}

export interface CustomerWithVANs extends Customer {
  vanNumbers: string[];
  vanCount: number;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VANCustomerService {
  private dbPath = 'assets/data/db.json';

  constructor(private http: HttpClient) {}

  getDbData(): Observable<DbData> {
    return this.http.get<DbData>(this.dbPath);
  }

  getCustomers(): Observable<Customer[]> {
    return this.getDbData().pipe(
      map((data) => {
        return data.configuration.map((config) => ({
          id: config.id,
          firmName: config.firmName,
          accountNo: config.accountNo,
          customerId: config.customerId,
          clientId: config.clientId,
          firmId: config.firmId,
          branchId: config.branchId,
        }));
      }),
    );
  }

  getCustomersWithVANs(): Observable<CustomerWithVANs[]> {
    return this.getDbData().pipe(
      map((data) => {
        // Build a map of accountNo -> customer details
        const customerMap = new Map<string, any>();
        data.configuration.forEach((config) => {
          customerMap.set(config.accountNo, {
            id: config.id,
            firmName: config.firmName,
            accountNo: config.accountNo,
            customerId: config.customerId,
            clientId: config.clientId,
            firmId: config.firmId,
            branchId: config.branchId,
            vanNumbers: [],
            startDate: '',
            endDate: '',
          });
        });

        // Add VAN numbers to customers
        data.VANCreation.forEach((vanRequest) => {
          const encryptData = vanRequest.Request.body.encryptData;
          const accountNo = encryptData.accountNo;
          const customer = customerMap.get(accountNo);
          if (customer) {
            encryptData.virtualAccountDetails.forEach((detail) => {
              customer.vanNumbers.push(detail.vanNumber);
            });
            customer.startDate = encryptData.startDate;
            customer.endDate = encryptData.endDate;
          }
        });

        return Array.from(customerMap.values());
      }),
    );
  }

  getVANsForCustomer(accountNo: string): Observable<string[]> {
    return this.getDbData().pipe(
      map((data) => {
        const vanNumbers: string[] = [];
        data.VANCreation.forEach((vanRequest) => {
          const encryptData = vanRequest.Request.body.encryptData;
          if (encryptData.accountNo === accountNo) {
            encryptData.virtualAccountDetails.forEach((detail) => {
              vanNumbers.push(detail.vanNumber);
            });
          }
        });
        return vanNumbers;
      }),
    );
  }

  getCustomerByAccountNo(accountNo: string): Observable<Customer | undefined> {
    return this.getCustomers().pipe(
      map((customers) => customers.find((c) => c.accountNo === accountNo)),
    );
  }

  // Get all VAN numbers across all customers
  getAllVANs(): Observable<string[]> {
    return this.getDbData().pipe(
      map((data) => {
        const vans: string[] = [];
        data.VANCreation.forEach((vanRequest) => {
          const encryptData = vanRequest.Request.body.encryptData;
          encryptData.virtualAccountDetails.forEach((detail) => {
            vans.push(detail.vanNumber);
          });
        });
        return vans;
      }),
    );
  }

  // Get VAN to customer mapping
  getVANToCustomerMap(): Observable<Map<string, Customer>> {
    return this.getDbData().pipe(
      map((data) => {
        const vanMap = new Map<string, Customer>();
        const customerMap = new Map<string, Customer>();

        // Build customer map
        data.configuration.forEach((config) => {
          const customer: Customer = {
            id: config.id,
            firmName: config.firmName,
            accountNo: config.accountNo,
            customerId: config.customerId,
            clientId: config.clientId,
            firmId: config.firmId,
            branchId: config.branchId,
          };
          customerMap.set(config.accountNo, customer);
        });

        // Map VANs to customers
        data.VANCreation.forEach((vanRequest) => {
          const encryptData = vanRequest.Request.body.encryptData;
          const customer = customerMap.get(encryptData.accountNo);
          if (customer) {
            encryptData.virtualAccountDetails.forEach((detail) => {
              vanMap.set(detail.vanNumber, customer);
            });
          }
        });

        return vanMap;
      }),
    );
  }
}
