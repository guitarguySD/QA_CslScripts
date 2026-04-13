# JSI DLL → Inline C# Conversion Project

---

## Project Layout

```
JSI/
├── CLAUDE.md                        ← You are here
├── JSI Web Access.pdf               ← Official API spec (in root, not in Cvp.Jury.Jsi/)
├── RestApiBlock.cvs                 ← READ-ONLY example of the target output format
├── Cvp.Jury.Jsi/                    ← READ-ONLY DLL source — never modify these files
│   ├── JsiParameters.xml            ← Parameter key names and values for the DLL
│   ├── Constants.cs                 ← GBL_SCRIPT_PREFIX constant
│   ├── UniversalScriptInterface.cs  ← DLL entry point; dispatches ExecuteRoutine calls
│   ├── RestApi/
│   │   ├── JsiClient.cs             ← Primary: HTTP calls to JSI REST API
│   │   ├── SonantJuryClient.cs      ← Proxy HTTP client + GetJurorGroup
│   │   └── JsiData/
│   │       ├── JurorData.cs         ← Deserialization model for get_juror response
│   │       └── FormData.cs          ← Deserialization model for get_nextgen response
│   └── Script/
│       ├── Enumerations/
│       │   ├── ResultCode.cs                  ← Generic: Ok=0, SystemIssue=999
│       │   ├── ResultCodeGetJuror.cs          ← Ok=0, JurorNotFound=1, JurorMismatch=2, SystemError=999
│       │   ├── ResultCodeGetGroupReporting.cs ← Ok=0, JurorGroupNotFound=1, SystemError=999
│       │   ├── JurorStatusEnum.cs             ← Available, Pool, AssignedToCase, etc.
│       │   └── JurorGroupStatusEnum.cs        ← RequiredToReport, CallbackRequired, ServiceCompleted
│       ├── Helper/
│       │   └── ReportingDay.cs      ← Reporting week/day/call-in-window calculations
│       ├── Input/
│       │   ├── SV_I_Juror.cs                  ← Input: JurorId
│       │   ├── SV_I_JurorGroup.cs             ← Input: ReportingGroup
│       │   ├── SV_I_Postponement.cs           ← Input: TypeCode, ReasonCode, NewReportingDate
│       │   ├── SV_I_ServiceEnd.cs             ← Input: TypeCode, ReasonCode
│       │   ├── SV_I_UpdateJuror.cs            ← Input: JurorId, JurorPhoneNumber
│       │   ├── SV_I_GetPostponementDates.cs   ← Input: NumberOfPostmentDates
│       │   └── SV_I_fn_*.cs                   ← Inputs for script helper functions
│       ├── Output/
│       │   ├── SV_O_Juror.cs                  ← Output: full juror record + computed flags
│       │   ├── SV_O_Postponement.cs           ← Output: NewReportingDate, AlternateReportingDate
│       │   ├── SV_O_GroupInstructions.cs      ← Output: group reporting date/time/status
│       │   ├── SV_O_Result.cs                 ← Generic: Result enum + ErrorMessage
│       │   ├── SV_O_ResultGetJuror.cs         ← GetJuror-specific result + ErrorMessage
│       │   ├── SV_O_ResultGetGroupReporting.cs← GetGroupReporting-specific result
│       │   └── SV_O_fn_*.cs                   ← Outputs for script helper functions
│       └── Routines/
│           ├── BaseExports.cs         ← Base: GetCvpScriptInterfaceShim, handleException
│           ├── JurorExports.cs        ← Exported routines: GetJurorRecord, ApplyPostponement, etc.
│           ├── Juror.cs               ← Business logic: orchestrates JsiClient calls
│           ├── ScriptHelper.cs        ← Date/expression utility implementations
│           ├── ScriptHelperExports.cs ← Exported script helper wrappers
│           └── MiscellaneousExports.cs← Debug dump routines
└── tests/                           ← WRITE TARGET — all output goes here (create if needed)
    └── [test scripts to be created]
```

> `RestApiBlock.cvs` in the root is the format reference; do not modify it.

**Write permission:** `tests/` only. All other files and folders are read-only reference material.

---

## Known Supporting Files

| File | Role | Notes |
|------|------|-------|
| `RestApi/JsiClient.cs` | Direct HTTP calls to JSI REST endpoints | Primary conversion source; 5 methods |
| `RestApi/SonantJuryClient.cs` | `GetJurorGroup` helper (not used in RestApiBlock output) | Ignore the `ProxyExecute` method — transport is handled by the IVR platform |
| `RestApi/JsiData/JurorData.cs` | Response model for `get_juror` | Deserialize entire envelope; `content.badgeNumber` used as ID in subsequent calls |
| `RestApi/JsiData/FormData.cs` | Response model for `get_nextgen` | `content.fieldData[0]` holds phone value |
| `Script/Routines/Juror.cs` | Orchestration layer; calls JsiClient | `ApplyServiceEnd` hardcodes `sendNotice = "1"` |
| `Script/Routines/JurorExports.cs` | Exported DLL entry points | Dispatched from `UniversalScriptInterface.ExecuteRoutine` |
| `Script/Routines/BaseExports.cs` | Shared CVP shim initialization | `GetCvpScriptInterfaceShim(ptr)` |
| `Script/Helper/ReportingDay.cs` | Reporting day/week/call-in-window logic | Reads many config parameters; timezone-aware |
| `JsiParameters.xml` | Configuration defaults for the DLL | Actual key names confirmed here |

---

## Project Goal

Convert `JsiClient.cs` (a C# wrapper DLL around the Jury Systems Incorporated REST API) into
inline C# code that can be embedded directly in the host application. The DLL is eliminated;
each call site gets its own self-contained HTTP + deserialization logic drawn from the original
DLL source.

---

## Source Materials

| File | Location | Purpose |
|------|----------|---------|
| `JsiClient.cs` | `Cvp.Jury.Jsi/RestApi/` | HTTP calls and response-processing logic |
| `SonantJuryClient.cs` | `Cvp.Jury.Jsi/RestApi/` | Reference only — `ProxyExecute` is not used; transport is handled by the IVR platform |
| `JurorData.cs` | `Cvp.Jury.Jsi/RestApi/JsiData/` | `get_juror` response model |
| `FormData.cs` | `Cvp.Jury.Jsi/RestApi/JsiData/` | `get_nextgen` response model |
| `Juror.cs` | `Cvp.Jury.Jsi/Script/Routines/` | Orchestration; shows how JsiClient is called |
| `JsiParameters.xml` | `Cvp.Jury.Jsi/` | Config parameter key names and default values |
| `JSI Web Access.pdf` | `JSI/` (root) | Official API spec v1.6 |
| `RestApiBlock.cvs` | `JSI/` (root) | **Target output format example** — read before writing any `.cvs` output |

---

## Configuration Parameters

All parameters are scoped to `ParameterTypeEnum.Jury2` / `ParameterPartitionTypeEnum.Department`
and accessed via `ConfigurationParameterCache.Get<T>(...)`. The C# constant names
(`Jury2DepartmentConfig.*`) resolve to the string keys shown in `JsiParameters.xml`.

### JsiClient-relevant parameters

| Runtime Variable | Key in JsiParameters.xml | C# Constant | Default Value | Description |
|-----------------|--------------------------|-------------|---------------|-------------|
| `JsiUrl` | `JuryServiceUrl` | `Jury2DepartmentConfig.JuryServiceUrl` | `https://jury-svc-prod.sjcourts.org/jp_access/ws/jury` | Base URL for JSI service |
| `JsiApiKey` | `JuryServiceApiKey` | `Jury2DepartmentConfig.JuryServiceApiKey` | `keySJQ439!` | API key for authentication |
| `JurorPhoneNumber` | `JsiFormDataKeys` = `PhoneNumber:4` | Hardcoded `"4"` in source | `"4"` | JSI field identifier for phone number |

> The `JurorPhoneNumber = "4"` is hardcoded directly in `JsiClient.cs` line 18.
> `JsiParameters.xml` also stores it as `JsiFormDataKeys` = `PhoneNumber:4` for reference,
> but the DLL does not read that config key — it uses the hardcode.

### Other parameters (used by Juror.cs / ReportingDay.cs, not JsiClient)

| Key | Default Value | Used By |
|-----|---------------|---------|
| `GroupNumberRegex` | `^[0-9]{3,4}$` | Group number validation |
| `DefaultJurorGroupReportingDate` | `NextWorkingDay` | Group reporting defaults |
| `DefaultJurorGroupReportingTime` | `08:00 AM` | Group reporting defaults |
| `DefaultJurorGroupCallbackTime` | `05:00 PM` | Group reporting defaults |
| `DefaultJurorGroupReportingStatus` | `CallbackRequired` | Group reporting defaults |
| `DefaultJurorGroupReportingLocation` | `Stockton` | Group reporting defaults |
| `DefaultJurorGroupInstructionsAvailable` | `true` | Group reporting defaults |
| `DefaultJurorGroupEnabled` | `true` | Group reporting defaults |
| `GroupReportingType` | `OnCallWeek` | ReportingDay — determines if group date is used |
| `GroupReportingWeekStartDay` | `Friday` | ReportingDay window calculation |
| `GroupReportingWeekStartTime` | `04:00 PM` | ReportingDay window calculation |
| `GroupReportingWeekEndDay` | `Friday` | ReportingDay window calculation |
| `GroupReportingWeekEndTime` | `01:00 PM` | ReportingDay window calculation |
| `CallInWindowDaysOffset` | `1` | ReportingDay call-in window |
| `CallInWindowStartTime` | `05:00 PM` | ReportingDay call-in window |
| `CallInWindowDuration` | `17` (hours) | ReportingDay call-in window |
| `CallInWindowCutOffTime` | `02:00 PM` | ReportingDay FTA cut-off |
| `Postponement_AllowedReportingDayOfWeek` | `Monday` | Juror.cs postponement date generation |

---

## High-Level Exported Routines (JurorExports → Juror.cs)

These are the exported DLL routines that the host CVP script calls. Each one orchestrates
one or more `JsiClient` calls. Understanding this layer clarifies how the methods are used:

| Exported Routine | JsiClient Calls | Notes |
|-----------------|-----------------|-------|
| `GetJurorRecord` | `GetJuror()` + `GetJurorPhoneNumber()` + `SonantJuryClient.GetJurorGroup()` | Stores `JurorData` in `CallSession`; populates all `SV_O_Juror` variables |
| `GetGroupReportingInstructions` | `SonantJuryClient.GetJurorGroup()` only | No direct JSI HTTP call |
| `ApplyAutoPostponement` | `UpdateReportingDate()` × up to 5 tries | Iterates candidate dates until one succeeds |
| `ApplyPostponement` | `UpdateReportingDate()` × 1 | Explicit date from `SV_I_Postponement.NewReportingDate` |
| `ApplyServiceEnd` | `ServiceEnd()` | Hardcodes `sendNotice = "1"` — not from script input |
| `GetPostponementDates` | None (date math only) | Returns up to 3 candidate dates; no HTTP call |
| `UpdateJuror` | `UpdatePhoneNumber()` | Phone number from `SV_I_UpdateJuror.JurorPhoneNumber` |

---

## Target Output Format — RestApiBlock `.cvs` Files

**This is what we are building.** Each JsiClient method becomes one RestApiBlock in a `.cvs`
file. The example in `RestApiBlock.cvs` (root) is from a different jury system (Neumo/FJD) but
the block structure is identical. Read that file before writing any output.

### Output File List

```
tests/
├── GetJuror_Test.cvs
├── GetJurorPhoneNumber_Test.cvs
├── UpdatePhoneNumber_Test.cvs
├── UpdateReportingDate_Test.cvs
└── ServiceEnd_Test.cvs
```

### RestApiBlock Format Reference

```
[BlockName]
type=RestApi
Method=GET|POST
url={JsiUrl}/<endpoint>/{BadgeNumber}?api_key={JsiApiKey}   ← full URL with variable substitutions
RequestScript="""
    using System.Text.Json;
    // C# code that RETURNS the request body as a string.
    // Read script variables via: vars["VarName"]
    // For GET requests with no body: return "";
    // For form-encoded POST: return "field1=value1&field2=value2";
    return ...;
"""
ResponseScript="""
    using System.Text.Json;
    // C# code that processes the response. No return value.
    // response  — the raw response body string
    // vars["VarName"] — read or write script variables
    var root = JsonDocument.Parse(response).RootElement;
    vars["SomeOutputVar"] = root.TryGetProperty("field", out var v) ? v.GetString() ?? "" : "";
"""
StatusCodeVar=HttpStatusCodeVar    ← script variable that receives the HTTP status code
SuccessVar=ApiSuccessVar           ← script variable that receives success flag
ErrorVar=ApiErrorVar               ← script variable that receives error message
OnError=BlockNameOnError           ← next block if the call fails
Next=BlockNameOnSuccess            ← next block if the call succeeds
```

### Key Differences: RestApiBlock vs DLL

The DLL constructs `HttpRequestMessage` objects and routes them through an internal proxy service.
RestApiBlocks replace all of that — the IVR platform handles HTTP transport directly. This means:

- **No `HttpRequestMessage` construction** — the block's `Method=` and `url=` fields replace it
- **`RequestScript` returns the body string** — for GET requests with no body, return `""`
- **`ResponseScript` receives `response`** — the raw response body string
- **URL is set directly in `url=`** — include the full path and `?api_key=` in the url value

### JSI-Specific Body Format

JSI POST endpoints use `application/x-www-form-urlencoded`, not JSON. The `RequestScript`
for JSI POST methods returns a URL-encoded string:

```csharp
// Example: GetJurorPhoneNumber body (field ID "4", empty value = read)
return "4=";

// Example: UpdatePhoneNumber body (field ID "4", value = write)
return $"4={vars["JurorPhoneNumber"]}";

// Example: UpdateReportingDate body
return $"typeCode={vars["TypeCode"]}&reasonCode={vars["ReasonCode"]}" +
       $"&newLocation=&newDate={vars["NewDate"]}" +
       $"&noticeSendInd=&noticeType=&sendNoticeDefault=&newGroupInd=&newGroupNumber=";

// Example: ServiceEnd body
return $"typeReasonCode={vars["TypeCode"]}{vars["ReasonCode"]}&noticeSendInd=1";
```

### JSI Response Parsing in ResponseScript

JSI responses wrap all data in an envelope: `{ "code": "200", "message": "OK", "content": { ... } }`.
The `ResponseScript` must check the `code` field and extract from `content`:

```csharp
// Standard JSI response check and extraction pattern:
using System.Text.Json;
var root = JsonDocument.Parse(response).RootElement;
var code = root.TryGetProperty("code", out var c) ? c.GetString() ?? "" : "";
vars["JsiResultCode"] = code;

if (code == "200")
{
    if (root.TryGetProperty("content", out var content))
    {
        vars["BadgeNumber"] = content.TryGetProperty("badgeNumber", out var v) ? v.GetInt32().ToString() : "";
        // ... more fields
    }
}
```

For `UpdateReportingDate`, the success response body may be **empty** or the literal string
`"null"` — handle these before attempting `JsonDocument.Parse`:

```csharp
// UpdateReportingDate special case:
if (string.IsNullOrWhiteSpace(response) ||
    response.Trim().Equals("null", StringComparison.OrdinalIgnoreCase))
{
    vars["JsiUpdateSuccess"] = "true";
    return;   // or omit return — ResponseScript has no return value
}
var root = JsonDocument.Parse(response).RootElement;
var code = root.TryGetProperty("code", out var v) ? v.GetString() ?? "" : "";
vars["JsiUpdateSuccess"] = code == "200" ? "true" : "false";
```

---

## JSI API Fundamentals (from spec)

**Base URL pattern:**
```
{JsiUrl}/{service_name}?api_key={JsiApiKey}
```
where `JsiUrl` already includes the path up through `/ws/jury` (e.g.,
`https://jury-svc-prod.sjcourts.org/jp_access/ws/jury`).

**Auth:** Every secured endpoint appends `?api_key={api_key}` as a query parameter.

**Methods:** GET or POST only.

**Response envelope — all endpoints return this JSON wrapper:**
```json
{
  "code": "200",
  "message": "OK",
  "content": { ... }
}
```

**Success check:** HTTP 200 AND `code == "200"` (or extended code `"0001"` = success with more data).

**Key status codes to handle in every converted call:**
- `200` — success
- `404` — not found
- `401` — unauthorized
- `405` — invalid parameters
- `500` — internal server error
- `0001` — success, more data available (pagination)
- `4021` — invalid juror ID / badge number
- `3003` — not found (extended)
- `3010` — update error

---

## Methods in JsiClient — Conversion Inventory

Work through these in order. Check each off as done.

### 1. `GetJuror(string jurorId)` → `get_juror/{id}`
- **HTTP:** GET
- **URL:** `{JsiUrl}/get_juror/{jurorId}?api_key={JsiApiKey}`
- **Returns:** `JurorData` — full envelope deserialized (code + message + content + extInfos)
- **Logic to preserve in ResponseScript:**
  1. Check HTTP success (via `SuccessVar`) — block handles transport
  2. Parse full JSON string — deserializes the **entire** envelope
  3. Check top-level `code == "200"` before trusting `content`
- **Output variables:** Read `Cvp.Jury.Jsi/RestApi/JsiData/JurorData.cs` and write every
  field in `JurorData` and `JurorDataContent` to a `vars[]` entry using the C# property
  name as the variable name. Do not invent names — use the model as the authoritative list.
  `content.badgeNumber` must always be included as it is the ID used in all subsequent calls.
- **Notes:**
  - Caller in `Juror.cs` checks `juror?.code != "200"` and returns `JurorNotFound` if so
  - `juror.content.badgeNumber` (int) is used as the ID in all subsequent API calls

### 2. `GetJurorPhoneNumber(JurorData juror)` → `get_nextgen/{id}`
- **HTTP:** POST
- **URL:** `{JsiUrl}/get_nextgen/{juror.content.badgeNumber}?api_key={JsiApiKey}`
- **Body:** `application/x-www-form-urlencoded`, UTF-8 — body string is `"4="` (field ID `"4"`, empty value)
- **Returns:** `string` — `formData.content.fieldData[0]`
- **Logic to preserve in RequestScript/ResponseScript:**
  1. `RequestScript` returns `"4="` (field ID `"4"`, empty value)
  2. Check HTTP success via `SuccessVar`
  3. Parse response → extract `content.fieldData[0]` → write to output variable
- **Output variables:** Read `Cvp.Jury.Jsi/RestApi/JsiData/FormData.cs` and use its property
  names as `vars[]` variable names. The phone number result is `content.fieldData[0]`.
- **Notes:** `JurorPhoneNumber` is the field ID `"4"` (hardcoded); value is intentionally empty to read

### 3. `UpdatePhoneNumber(JurorData juror, string jurorPhoneNumber)` → `get_nextgen/{id}`
- **HTTP:** POST (same endpoint as `GetJurorPhoneNumber`, different body value)
- **URL:** `{JsiUrl}/get_nextgen/{juror.content.badgeNumber}?api_key={JsiApiKey}`
- **Body:** `application/x-www-form-urlencoded`, UTF-8 — `"4={jurorPhoneNumber}"`
- **Returns:** `void`
- **Logic to preserve in RequestScript/ResponseScript:**
  1. `RequestScript` returns `"4={vars["JurorPhoneNumber"]}"` (field ID `"4"`, populated value)
  2. Check HTTP success via `SuccessVar` — no response body parsing needed

### 4. `UpdateReportingDate(JurorData juror, string typeCode, string reasonCode, DateTime reportingDate)` → `update_schg/{id}`
- **HTTP:** POST
- **URL:** `{JsiUrl}/update_schg/{juror.content.badgeNumber}?api_key={JsiApiKey}`
- **Body:** `application/x-www-form-urlencoded`, UTF-8 — exact field order from source:
  ```
  typeCode={typeCode}&reasonCode={reasonCode}&newLocation=&newDate={yyyyMMdd}&noticeSendInd=&noticeType=&sendNoticeDefault=&newGroupInd=&newGroupNumber=
  ```
- **Returns:** `bool` — `true` if success
- **Logic to preserve in ResponseScript (critical — non-trivial):**
  1. Check HTTP success via `SuccessVar`
  2. If `response` is empty/whitespace or equals `"null"` (case-insensitive) → set success = true, stop
  3. Otherwise parse JSON → read `code` field
  4. If `code == "200"` → set success = true, else set success = false
- **Notes:**
  - The DLL correctly uses `Newtonsoft.Json` (`JObject.Parse`) here; the RestApiBlock `ResponseScript` achieves the same logic using `System.Text.Json` (`JsonDocument`) — see the response pattern in the "Target Output Format" section
  - `ApplyAutoPostponement` calls this in a loop (up to 5 dates) and treats `false` as "try next date"

### 5. `ServiceEnd(JurorData juror, string typeCode, string reasonCode, string sendNotice)` → `update_send/{id}`
- **HTTP:** POST
- **URL:** `{JsiUrl}/update_send/{juror.content.badgeNumber}?api_key={JsiApiKey}`
- **Body:** `application/x-www-form-urlencoded`, UTF-8:
  ```
  typeReasonCode={typeCode}{reasonCode}&noticeSendInd={sendNotice}
  ```
- **Returns:** `void`
- **Logic to preserve in RequestScript/ResponseScript:**
  1. `RequestScript` returns `"typeReasonCode={vars["TypeCode"]}{vars["ReasonCode"]}&noticeSendInd=1"`
  2. Check HTTP success via `SuccessVar` — no response body parsing needed
- **Notes:**
  - `typeReasonCode` concatenates `typeCode` + `reasonCode` directly (no separator)
  - `Juror.cs` (`ApplyServiceEnd`) always passes hardcoded `sendNotice = "1"` — the `sendNotice`
    parameter exists in the signature but the script does not supply it

---

## Conversion Rules

### Mapping DLL Concepts to RestApiBlock

| DLL Concept | RestApiBlock Equivalent |
|-------------|------------------------|
| `JsiUrl` + URL path + `?api_key=` | `url=` field in the block — full URL including api_key |
| `new StringContent(body, UTF8, "application/x-www-form-urlencoded")` | `RequestScript` returns the body string; block sets content-type |
| `response.StatusCode != OK` → throw | `StatusCodeVar` / `SuccessVar` / `OnError` handle this |
| `JsonSerializer.Deserialize<T>(content)` | `JsonDocument.Parse(response)` in `ResponseScript` |
| `JObject.Parse(content)["code"]` | `JsonDocument.Parse(response).RootElement.TryGetProperty("code", ...)` |
| Write to `SV_O_*` script variables | `vars["OutputVarName"] = ...` in `ResponseScript` |
| Read from `SV_I_*` script variables | `vars["InputVarName"]` in `RequestScript` or `ResponseScript` |

### For Each Method

1. **URL** — set the full URL directly in `url=`, including path, badge number, and `?api_key=`
2. **RequestScript** — translate the DLL's `StringContent(...)` body string into a `return`
   statement; for GET with no body return `""`
3. **ResponseScript** — this is the primary deliverable: translate all response-handling
   logic from `JsiClient.cs` into `vars[...]` assignments using `System.Text.Json`
4. **Output variable names** — derive from the C# model classes, not invented names:
   - `GetJuror` → use property names from `Cvp.Jury.Jsi/RestApi/JsiData/JurorData.cs`
   - `GetJurorPhoneNumber` → use property names from `Cvp.Jury.Jsi/RestApi/JsiData/FormData.cs`
   - Read the model file before writing the ResponseScript — do not guess field names
5. **Do NOT change business logic** — the ResponseScript must be functionally identical to
   the DLL, including all null/empty/code checks
6. **`System.Text.Json` in all output** — the DLL legitimately uses both `System.Text.Json`
   and `Newtonsoft.Json` (see the JSON library table below), but RestApiBlock `ResponseScript`
   code must use only `JsonDocument`/`JsonElement` — do not carry `Newtonsoft.Json` into any
   output file

### JSON Libraries — DLL vs RestApiBlock Output

The DLL uses two JSON libraries. The RestApiBlock output must use only `System.Text.Json`.

| Method | DLL library | RestApiBlock `ResponseScript` |
|--------|-------------|-------------------------------|
| `GetJuror` | `System.Text.Json` (`JsonSerializer.Deserialize<JurorData>`) | `JsonDocument.Parse(response).RootElement` → check `code` → extract `content.*` fields |
| `GetJurorPhoneNumber` | `System.Text.Json` (`JsonSerializer.Deserialize<FormData>`) | Parse → `content` → `fieldData` array → index `[0]` |
| `UpdatePhoneNumber` | None | No parsing — check `SuccessVar` only |
| `UpdateReportingDate` | `Newtonsoft.Json` (`JObject.Parse` + `["code"]`) | Guard for empty/`"null"` first, then `TryGetProperty("code", ...)` |
| `ServiceEnd` | None | No parsing — check `SuccessVar` only |

> The DLL's use of `Newtonsoft.Json` in `UpdateReportingDate` is accurate source documentation.
> The RestApiBlock `ResponseScript` achieves the same result using `System.Text.Json` — do not
> carry `Newtonsoft.Json` into any output file.

### Configuration Values in RestApiBlock Scripts

| Script Variable | Config Key (JsiParameters.xml) | Description |
|----------------|-------------------------------|-------------|
| `JsiUrl` | `JuryServiceUrl` | Base URL including `/ws/jury` path — used directly in `url=` |
| `JsiApiKey` | `JuryServiceApiKey` | API key — appended as `?api_key={JsiApiKey}` in `url=` |
| `JsiBadgeNumber` | From `GetJuror` response | Set after GetJuror block; embedded in `url=` for all subsequent blocks |
| Phone field ID `"4"` | Hardcoded literal in RequestScript | Not a variable — write `"4="` or `"4={vars["PhoneNumber"]}"` directly |

---

## Output Format Per Method

Each method becomes a single RestApiBlock in its own `tests/<MethodName>_Test.cvs` file.
Use this skeleton — fill in the block name, URL variable name, body, and response parsing:

```
[Jsi<MethodName>]
type=RestApi
Method=GET|POST
url={JsiUrl}/<endpoint>/{BadgeNumber}?api_key={JsiApiKey}
RequestScript="""
    // Build and return the request body string.
    // GET methods: return "";
    // POST methods: return the url-encoded form body.
"""
ResponseScript="""
    using System.Text.Json;
    // Parse response and write output to vars["..."].
    // Always check for empty/null response before JsonDocument.Parse (especially UpdateReportingDate).
    // Check envelope code field before extracting content.
"""
StatusCodeVar=JsiHttpStatus
SuccessVar=JsiSuccess
ErrorVar=JsiError
OnError=Jsi<MethodName>Error
Next=Jsi<MethodName>Done
```

> The `ResponseScript` is the primary deliverable — it must faithfully reproduce the
> response-handling logic from `JsiClient.cs`, translated from C# DLL code into the
> inline `vars[...]`-based style shown in `RestApiBlock.cvs`.

---

## Known Quirks and Edge Cases

1. **`UpdateReportingDate` null check:** The spec says `update_schg` returns nothing on success,
   but the DLL defensively handles three cases: empty string, the literal string `"null"`, and
   a JSON object with a `code` field. Preserve all three checks.

2. **Field ID `"4"` for phone:** The `JurorPhoneNumber` field is hardcoded as `"4"`. The
   `JsiParameters.xml` key `JsiFormDataKeys` = `PhoneNumber:4` documents this, but the DLL
   does not read that key — the `"4"` is a compile-time constant. Per the `get_nextgen` spec,
   field identifiers are numeric IDs used as parameter names.

3. **`get_nextgen` dual use:** The same endpoint is used for both read (get phone) and write
   (update phone) — the difference is whether the field value is empty or populated in the
   POST body.

4. **`update_schg` vs `grant_schg`:** `UpdateReportingDate` maps to `update_schg` (Grant
   Schedule Change, SCHG/U001), not `grant_schg` (Grant Long Term Postponement, SCHG/U003).
   These are different endpoints.

5. **`GetJuror` response is the full envelope:** The `ResponseScript` must parse the top-level
   `code` field and extract fields from within `content` — do not assume the root element is
   the juror record directly.

6. **`ServiceEnd` hardcoded `sendNotice = "1"`:** The `RequestScript` should always use `1`
   for `noticeSendInd` — this is not a script variable, it is a fixed value.

7. **`badgeNumber` is an integer with no padding:** Use it as-is in the `url=` value.

---

## Verification Checklist (Per Method)

### Block structure
- [ ] Block follows `RestApiBlock.cvs` format exactly (`type=RestApi`, `Method=`, `url=`, `RequestScript`, `ResponseScript`, `StatusCodeVar`, `SuccessVar`, `ErrorVar`, `OnError`, `Next`)
- [ ] `url=` contains the full URL with variable substitutions, including `?api_key=`

### Request
- [ ] HTTP method (GET/POST) matches spec
- [ ] URL path segments match spec exactly
- [ ] `?api_key=` appended to every URL
- [ ] POST body field names match DLL source exactly
- [ ] Date format is `yyyyMMdd` in POST bodies where required
- [ ] GET `RequestScript` returns `""`; POST `RequestScript` returns the url-encoded body string

### Response
- [ ] `ResponseScript` checks `SuccessVar` / HTTP status before parsing
- [ ] JSI envelope `code` field checked before extracting `content`
- [ ] `GetJuror`: extracts from full envelope (top-level `code` + `content.*` fields)
- [ ] `GetJurorPhoneNumber`: extracts `content.fieldData[0]`
- [ ] `UpdateReportingDate`: guards for empty/`"null"` response before `JsonDocument.Parse`
- [ ] All output values written to `vars["VarName"]`
- [ ] No business logic changed relative to DLL
