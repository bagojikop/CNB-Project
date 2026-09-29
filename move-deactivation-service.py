from pathlib import Path
root=Path(r'E:\repos\CanaraBankApiService')
p=root/'Services/Portal/VpaRegistrationService.cs';s=p.read_text();i=s.rfind('}');s=s[:i]+'''    public async Task SaveDeactivationAsync(int bankAccountId, VPADecativation request, JObject response)
    {
        if (!VpaBankResult.IsSuccess(response)) return;
        var upiId = request.Request.body.encryptData.upiId?.Trim();
        if (string.IsNullOrWhiteSpace(upiId)) throw new InvalidOperationException("A UPI ID is required.");
        var record = await db.VpaRegistrations
            .Where(x => x.BankAccountId == bankAccountId && x.UpiId == upiId && x.Status != "Failed")
            .OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (record == null) throw new InvalidOperationException("Saved VPA registration not found.");
        record.Status = "Deactivated";
        record.DeactivationResponseJson = response.ToString(Formatting.None);
        record.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
'''+s[i:];p.write_text(s)
p=root/'Controllers/CNB/VPAController.cs';s=p.read_text(encoding='utf-8-sig');needle='var ResData = JsonConvert.DeserializeObject<VPADecativationResultEncryptdata>(dscData);';s=s.replace(needle,needle+'''
                    if (response.IsSuccessStatusCode && VpaBankResult.IsSuccess(JObject.Parse(dscData)))
                    {
                        try { await vpaRegistrations.SaveDeactivationAsync(id, vpa, JObject.Parse(dscData)); }
                        catch (Exception)
                        {
                            return StatusCode(500, new {
                                status_cd = 0, bankDeactivated = true,
                                errors = new { message = "Bank deactivation succeeded, but saving failed. Do not deactivate again; reconcile the saved record." }
                            });
                        }
                    }
''',1);p.write_text(s,encoding='utf-8-sig')
p=root/'Controllers/Portal/VpaRegistrationController.cs';s=p.read_text();a=s.index('    [Authorize]\n    [HttpPost(');b=s.index('    private static object RegistrationData',a);s=s[:a]+s[b:];s=s.replace('using CanaraBankApiService.Services;\n','').replace('using Newtonsoft.Json.Linq;\n','').replace('    private readonly CertificateService certService;\n','').replace('CnbDbContext db, CertificateService certificateService','CnbDbContext db').replace('        certService = certificateService;\n','');p.write_text(s)
p=root/'DATA/Scripts/README-VPA.md';s=p.read_text().replace('The existing portal deactivation handler updates their status.', 'The existing POST /vpa/upi-vpa-deactivation calls SaveDeactivationAsync directly after bank success. There is no separate portal deactivation API. A persistence failure returns bankDeactivated=true; do not repeat the bank operation.');p.write_text(s)
