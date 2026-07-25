export interface ReportParam {
  key: string;
  value: any;
}
export interface MailNav {
  mailAddress: string;
  ccAddress: string;
  subject: string;
  body: string;
  fileType: string;
}
export interface WappNav {
  mobileno: string;
  fileType: string;
}
export interface ReportDictionory {
  reportParams?: ReportParam[];
  exportType?: string;
  mail?: MailNav;
  wapp?: WappNav;
  reportCacheId?: string;
  docName?: string;
}

export interface CompanyInfo {
  company: any;
  branches: any[];
  finYear: any;
  user: any;
  userinfo: any;
  modules: any;
  id: number | null;
}
