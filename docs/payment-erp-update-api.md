# Single payment ERP update integration

The frontend uses the existing `SinglePaymentRequest/` controller prefix relative to the API base URL.
Confirm that the supplied controller has this route prefix.

## List

`GET SinglePaymentRequest/status-requests?branch_id=BR&status=SUCCESS`

The endpoint returns single-payment entities with `erpUpdated: false`. The frontend reads either
an array or `{ "status_cd": 1, "data": [...] }`. Entity fields include `vch_id`, `payment_no`,
`vch_no`, `doc_no`, `doc_dt`, `firm_id`, `branch_id`, `srcAcctNumber`, `status`, `utr`, and `error_message`.
No beneficiary/amount schema is assumed for `json_script`.

## ERP update

`POST SinglePaymentRequest/single-payment-reUpdate`

```json
[{ "vch_id": 24, "accountNo": "123" }]
```

The frontend unwraps `Success(response)` and matches each result by `payment_no`, falling back
to `VCH-{vch_id}` for record-not-found errors. Example success:

```json
{
  "status_cd": 1,
  "data": [
    {
      "payment_no": "PAY-24",
      "status": "SUCCESS",
      "message": "UTR: UTR-24",
      "erpResponse": { "status_cd": 1 }
    }
  ]
}
```

Completion requires `erpUpdated: true/1`, or, when that flag is absent/null,
`erpResponse.status_cd == 1`. Bank status SUCCESS and an outer success envelope alone do not
confirm the ERP update. Missing and failed results stay available for retry. Bank status and UTR
remain unchanged. The frontend does not call the payment creation endpoint.

## Corrections needed in the supplied backend snippet

1. Remove the trailing apostrophe: `[HttpPost("single-payment-reUpdate")]`.
2. Call `_payService.Single(payment)` once and reuse `resData` as `erpResponse`.
3. Persist `payment.erpUpdated = true` with `await _db.SaveChangesAsync()` before reporting completion.
4. Return a failure result when `resData.status_cd != 1`; currently those documents are omitted.
5. Validate voucher/account/branch access and require stored payment status SUCCESS before updating ERP.
6. Skip already-updated records and return their confirmed result. Ensure ERP operations are idempotent
   across concurrent retries and when ERP succeeds but saving the local flag fails.
7. Confirm `_payService.Single` performs only an ERP update, with no new bank transfer. Its implementation
   is not available in this repository.

The backend project is not present here; these corrections have not been applied to backend code.
