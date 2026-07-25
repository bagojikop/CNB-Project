export interface apiResponse {
  pageDetails: any;
  status_cd: number;
  data: any;
  errors: errors;
}

export interface errors {
  error_cd: string;
  message: string;
  exception?: any;
}
