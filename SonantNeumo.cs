ResponseScript="""
using System.Text.Json;

var root = JsonDocument.Parse(response).RootElement;

// Root level
vars["CT_ResultCode"]    = root.TryGetProperty("status",    out var status)    ? status.GetString()    ?? "" : "";
vars["CT_ResultMessage"] = root.TryGetProperty("errorCode", out var errorCode) ? errorCode.GetString() ?? "" : "";

// jurorInformation block
if (root.TryGetProperty("jurorInformation", out var juror))
{
    vars["CT_JurorState"]        = juror.TryGetProperty("personStatus",      out var v) ? v.GetString() ?? "UNKNOWN" : "UNKNOWN";
    vars["CT_JurorID"]           = juror.TryGetProperty("jurorID",           out v) ? v.GetString() ?? "" : "";

    vars["CT_DOB"]               = juror.TryGetProperty("dob",               out v) ? v.GetString() ?? "" : "";

    vars["CT_FirstName"]         = juror.TryGetProperty("nameFirst",         out v) ? v.GetString() ?? "" : "";
    //vars["CT_FirstInitial"]      = juror.TryGetProperty("nameFirst",         out v) ? (v.GetString() ?? "").Substring(0, Math.Min(1, (v.GetString() ?? "").Length)) : "";
    vars["CT_LastName"]          = juror.TryGetProperty("nameLast",          out v) ? v.GetString() ?? "" : "";
    //vars["CT_FullName"]          = $"{vars["CT_FirstName"]} {vars["CT_LastName"]}".Trim();
    vars["CT_Middle"]            = juror.TryGetProperty("nameMiddle",        out v) ? v.GetString() ?? "" : "";
    vars["CT_NameSuffix"]        = juror.TryGetProperty("nameSuffix",        out v) ? v.GetString() ?? "" : "";
    vars["CT_ReportingStatus"]   = juror.TryGetProperty("reportingStatus",   out v) ? v.GetString() ?? "" : "";
    // Combine JurorState and ReportingStatus 
    vars["CT_JurorState"] = vars["CT_JurorState"] == "Qualified" ? $"{vars["CT_JurorState"]}{vars["CT_ReportingStatus"]}" : vars["CT_JurorState"];
    vars["CT_ScheduledDate"]     = juror.TryGetProperty("reportingDate",     out v) && v.GetString()?.Length == 8 && DateTime.TryParseExact(v.GetString(), "MMddyyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime schDt) ? schDt.ToString("yyyy-MM-ddTHH:mm:ss") : "";

    vars["CT_ScheduledTime"]     = juror.TryGetProperty("reportingTime",     out v) ? v.GetString() ?? "" : "";
    vars["CT_LocationCode"]      = juror.TryGetProperty("courtLocationCode", out v) ? v.GetString() ?? "" : "";
    vars["CT_LocationName"]      = juror.TryGetProperty("courtLocationName", out v) ? v.GetString() ?? "" : "";
    vars["CT_Street1"]           = juror.TryGetProperty("street",            out v) ? v.GetString() ?? "" : "";
    vars["CT_Street2"]           = juror.TryGetProperty("street2",           out v) ? v.GetString() ?? "" : "";
    vars["CT_City"]              = juror.TryGetProperty("city",              out v) ? v.GetString() ?? "" : "";
    vars["CT_State"]             = juror.TryGetProperty("state",             out v) ? v.GetString() ?? "" : "";
    vars["CT_Zipcode"]           = juror.TryGetProperty("zipCode",           out v) ? v.GetString() ?? "" : "";
    vars["CT_ServiceStartDate"]  = juror.TryGetProperty("serviceStartDate",  out v) && v.GetString()?.Length == 8 && DateTime.TryParseExact(v.GetString(), "MMddyyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime ssdDt) ? ssdDt.ToString("yyyy-MM-ddTHH:mm:ss") : "";
    vars["CT_ServiceEndDate"]    = juror.TryGetProperty("serviceEndDate",    out v) && v.GetString()?.Length == 8 && DateTime.TryParseExact(v.GetString(), "MMddyyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime sedDt) ? sedDt.ToString("yyyy-MM-ddTHH:mm:ss") : "";
    vars["CT_ReportingAtAfter"]  = juror.TryGetProperty("reportingAtAfter",  out v) ? v.GetString() ?? "" : "";
    vars["CT_BioComplete"]       = juror.TryGetProperty("bioComplete",       out v) ? v.GetBoolean().ToString() : "";
    vars["CT_PendingReview"]     = juror.TryGetProperty("pendingReview",     out v) ? (v.GetBoolean() ? "1" : "0") : "0";
    vars["CT_PoolID"]            = juror.TryGetProperty("poolID",            out v) ? v.GetString() ?? "" : "";
    vars["CT_LastPaymentAmount"] = juror.TryGetProperty("lastPaymentAmount", out v) ? v.GetString() ?? "" : "";
    vars["CT_LastPaymentDate"]   = juror.TryGetProperty("lastPaymentDate",   out v) && v.GetString()?.Length == 8 && DateTime.TryParseExact(v.GetString(), "MMddyyyy", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime lpdDt) ? lpdDt.ToString("yyyy-MM-ddTHH:mm:ss") : "";
    vars["CT_LastMileage"]       = juror.TryGetProperty("lastMileage",       out v) ? v.GetString() ?? "" : "";
}