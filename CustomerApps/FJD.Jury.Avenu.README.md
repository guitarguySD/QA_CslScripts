# FJD Jury Avenu IVR Script - Variable Documentation

## Overview
This document details all input and output variables (`vars[]`) used in the FJD.Jury.Avenu.cvs IVR script for the CourtTalk Jury system integrated with Clearview/Neumo Jury API.

**Version:** 4.0  
**Last Updated:** March 27, 2026  
**Court:** Douglas County (CSK Clone)

---

## System Inputs (Automatic)

These variables are automatically provided by the IVR system when a call is received:

| Variable | Type | Description |
|----------|------|-------------|
| `@OriginationAddress` | String | Caller's phone number (ANI) |
| `@CallId` | String | Unique identifier for the call session |
| `@Result` | Integer | Result code from system operations |
| `@ResultMessage` | String | Result message from system operations |

---

## Configuration Inputs (Variable Manager)

Retrieved from the Variable Manager at script startup:

### System Configuration
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NeumoUserId` | String | - | API authentication username |
| `NeumoPassword` | String | - | API authentication password |
| `AssistanceAvailable` | Integer | 0 | Whether live operator assistance is available (0=No, 1=Yes) |
| `OperatorOpen` | Time | 09:00:00 | Operator availability start time |
| `OperatorClosed` | Time | 17:00:00 | Operator availability end time |
| `HostAvailable` | Integer | 0 | Whether database/API is available (0=No, 1=Yes) |
| `RecordPassword` | String | - | Password for administrative recording features |
| `TestPassword` | String | - | Password for test mode access |

### Timing Configuration
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REPORTING_WEEK_CUTOFF_HOUR` | Integer | 18 | Hour when reporting week starts/ends (6 PM) |
| `ONCALL_START_HOUR` | Integer | 18 | Start of on-call check-in window (6 PM) |
| `ONCALL_END_HOUR` | Integer | 10 | End of on-call check-in window (10 AM) |
| `FTA_CUTOFF_HOUR` | Integer | 11 | Cutoff time for FTA (Failure to Appear) on reporting date (11 AM) |
| `CourtPhoneNumber` | String | 4024446221 | Court contact phone number |
| `CourtFaxNumber` | String | 4024441977 | Court fax number |

### Feature Flags
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AllowDeferrals` | Integer | 1 | Allow jurors to request deferrals (0=No, 1=Yes) |
| `AllowDisqualifications` | Integer | 1 | Allow jurors to request disqualification (0=No, 1=Yes) |
| `AllowExcusals` | Integer | 1 | Allow jurors to request excusals (0=No, 1=Yes) |
| `FTAIsEligibleToDefer` | Integer | 0 | Whether FTA jurors can self-defer (0=No, 1=Yes) |

---

## User Inputs (Collected During Call)

These variables are collected from the caller via DTMF or voice input:

### Juror Identification
| Variable | Type | Max Length | Description |
|----------|------|------------|-------------|
| `CT_JurorID` | String | 13 digits | Juror identification number (entered by caller) |
| `CT_DOB` | String | 8 digits | Date of birth (MMDDYYYY format) |
| `EnteredJurorID` | String | 13 digits | Backup copy of entered juror ID |

### Bio Information Questionnaire (BQ)
| Variable | Type | Description |
|----------|------|-------------|
| `BQ1Answer` | String | Gender (Male/Female/Not Specified) |
| `BQ5Answer` | String | Telephone number (10-11 digits) |
| `BQ7Answer` | String | Spouse summoned (Yes/No) |
| `BQ10Answer` | String | Race (A=African American, B=White, C=Hawaiian, D=Native American, E=Asian, F=Other) |
| `BQ13Answer` | String | Ethnicity (H=Hispanic, B=Non-Hispanic) |

### Qualification Questionnaire (Q)
| Variable | Type | Values | Description |
|----------|------|--------|-------------|
| `Q1Answer` | String | 0/1 | US Citizen (1=Yes, 0=No) |
| `Q2Answer` | String | 0/1 | County Resident (1=Yes, 0=No) |
| `Q3Answer` | String | 0/1 | Speaks English (1=Yes, 0=No) |
| `Q4Answer` | String | 0/1 | 19+ years old (1=Yes, 0=No) |
| `Q5Answer` | String | 0/1 | Is a Judge (1=Yes, 0=No - disqualifying) |
| `Q6Answer` | String | 0/1 | Is a Sheriff (1=Yes, 0=No - disqualifying) |
| `Q7Answer` | String | 0/1 | Party to current case (1=Yes, 0=No - disqualifying) |
| `Q8Answer` | String | 0/1 | Convicted felon (1=Yes, 0=No - disqualifying) |

---

## API Outputs (From Neumo REST API)

### Ping Endpoint Response
| Variable | Source | Description |
|----------|--------|-------------|
| `CT_ResultCode` | API | Status code ("OK" or error) |
| `CT_ResultMessage` | API | Error code (e.g., "IVR_ERR_001") |

### Get Juror Info Endpoint Response

#### Juror Identity
| Variable | Source | Description |
|----------|--------|-------------|
| `CT_JurorID` | `vars["jurorID"]` | Juror ID from API response |
| `CT_DOB` | `vars["dob"]` | Date of birth from API |
| `CT_FirstName` | `vars["nameFirst"]` | First name |
| `CT_FirstInitial` | Calculated | First character of first name |
| `CT_LastName` | `vars["nameLast"]` | Last name |
| `CT_FullName` | Calculated | FirstName + LastName |
| `CT_Middle` | `vars["nameMiddle"]` | Middle name |
| `CT_NameSuffix` | `vars["nameSuffix"]` | Name suffix (Jr., Sr., etc.) |

#### Juror Status
| Variable | Source | Description |
|----------|--------|-------------|
| `CT_JurorState` | `vars["personStatus"]` + `vars["reportingStatus"]` | Current juror state (see States section below) |
| `CT_ReportingStatus` | `vars["reportingStatus"]` | Reporting status (Report/On Call) |
| `CT_PendingReview` | `vars["pendingReview"]` | Whether pending review (0/1) |
| `CT_BioComplete` | `vars["bioComplete"]` | Whether bio questionnaire completed |
| `CT_QualificationStatus` | Response | Qualification status after processing |

#### Scheduling
| Variable | Source | Format | Description |
|----------|--------|--------|-------------|
| `CT_ScheduledDate` | `vars["reportingDate"]` | yyyy-MM-ddTHH:mm:ss | Reporting date (converted from MMddyyyy) |
| `CT_ScheduledTime` | `vars["reportingTime"]` | String | Reporting time |
| `CT_ServiceStartDate` | `vars["serviceStartDate"]` | yyyy-MM-ddTHH:mm:ss | Service period start |
| `CT_ServiceEndDate` | `vars["serviceEndDate"]` | yyyy-MM-ddTHH:mm:ss | Service period end |
| `CT_ReportingAtAfter` | `vars["reportingAtAfter"]` | String | Reporting instructions |

#### Location
| Variable | Source | Description |
|----------|--------|-------------|
| `CT_LocationCode` | `vars["courtLocationCode"]` | Court location code |
| `CT_LocationName` | `vars["courtLocationName"]` | Court location name |
| `CT_Street1` | `vars["street"]` | Address line 1 |
| `CT_Street2` | `vars["street2"]` | Address line 2 |
| `CT_City` | `vars["city"]` | City |
| `CT_State` | `vars["state"]` | State |
| `CT_Zipcode` | `vars["zipCode"]` | ZIP code |

#### Payment & Pool
| Variable | Source | Description |
|----------|--------|-------------|
| `CT_PoolID` | `vars["poolID"]` | Jury pool ID |
| `CT_LastPaymentAmount` | `vars["lastPaymentAmount"]` | Last payment amount |
| `CT_LastPaymentDate` | `vars["lastPaymentDate"]` | Last payment date (yyyy-MM-ddTHH:mm:ss) |
| `CT_LastMileage` | `vars["lastMileage"]` | Last mileage claim |

### Postponement Info Endpoint Response
| Variable | Source | Description |
|----------|--------|-------------|
| `PostponeEligible` | `vars["postponeEligible"]` | Whether postponement is allowed |
| `PostponeIneligibleReason` | `vars["postponeIneligibleReason"]` | Reason if ineligible |
| `PostponeDate1` | `vars["calculatedPostponeDates"][0]` | First available postponement date |
| `PostponeDate2` | `vars["calculatedPostponeDates"][1]` | Second available postponement date |
| `PostponeDate3` | `vars["calculatedPostponeDates"][2]` | Third available postponement date |

---

## Calculated/Derived Variables

These variables are calculated by embedded C# code in the ResponseScript:

### Reporting Week Calculations
| Variable | Type | Values | Description |
|----------|------|--------|-------------|
| `InReportingWeek` | String | -1, 0, 1 | -1=Past reporting week, 0=Not yet, 1=Currently in reporting week |
| `inCallinWindow` | String | 0/1 | Whether currently in on-call check-in window (6 PM - 10 AM) |
| `isTodayReportingDate` | String | 0/1 | Whether today is the juror's reporting date |
| `isPastReportingDateFtaCutoff` | String | 0/1 | Whether past 11 AM cutoff on reporting date |

**Reporting Week Logic:**
- Starts: 3 days before scheduled date at 6 PM
- Ends: 5 days after scheduled date at 6 PM
- `InReportingWeek`:
  - `1` = Current time is between start and end (in reporting week)
  - `0` = Current time is before start (future)
  - `-1` = Current time is after end (past)

### Internal State Management
| Variable | Type | Description |
|----------|------|-------------|
| `AnswerSum` | Integer | Count of disqualifying answers in qualification questionnaire |
| `DisqReason1-8` | String | Message codes for disqualification reasons |
| `FirstRetrieval` | Integer | Whether this is first record retrieval (0/1) |
| `isBioInfoCollected` | Integer | Whether bio info was collected this session (0/1) |
| `CT_EligibleToPostpone` | Integer | Whether eligible to postpone (0/1) |
| `CT_EligibleToExcuse` | Integer | Whether eligible for excuse (0/1) |

---

## Juror States

The `CT_JurorState` variable controls script flow and can have these values:

| State | Description | Actions Available |
|-------|-------------|-------------------|
| `UNKNOWN` | No record retrieved yet | Get juror ID and DOB |
| `Available` | Available for service | Check eligibility |
| `Pool` | In jury pool | Complete bio/qualification if needed |
| `Qualified` | Qualified for service | Combined with Report/OnCall status |
| `QualifiedReport` | Qualified - must report | Provide reporting instructions |
| `QualifiedOnCall` | Qualified - on call | Check call-in window |
| `Juror` | Currently serving | Status information |
| `Alternate` | Serving as alternate | Status information |
| `Panel` | On a panel | Status information |
| `Completed` | Service completed | Service ended message |
| `Excused` | Excused from service | Confirmation message |
| `Exempt` | Exempt from service | Confirmation message |
| `Permanent Excused` | Permanently excused | Confirmation message |
| `Disqualified` | Not qualified | Disqualification message |
| `Permanent Disqualified` | Permanently disqualified | Disqualification message |
| `Postponed` | Deferred to later date | New reporting date |
| `FTA` | Failed to appear | FTA instructions |
| `FTA Responded` | FTA - has called in | FTA processing |
| `FTA Non Responded` | FTA - no contact | Force agent transfer |

---

## API Request Variables

### Input Variables (Required)
| Variable | Used In | Description |
|----------|---------|-------------|
| `vars["NeumoUserId"]` | All API calls | API authentication username |
| `vars["NeumoPassword"]` | All API calls | API authentication password |
| `vars["CT_JurorId"]` | Get Juror Info | Juror ID to retrieve |
| `vars["CT_DOB"]` | Get Juror Info | Date of birth for validation |
| `vars["ScheduledDate"]` | Testing override | Test date override (yyyy-MM-ddTHH:mm:ss) |

### Output Variables (All Endpoints)
| Variable | Description |
|----------|-------------|
| `ApiStatusCode` | HTTP status code |
| `ApiSuccess` | Whether API call succeeded (true/false) |
| `ApiError` | Error message if API call failed |

---

## Counter & Retry Variables

| Variable | Type | Description |
|----------|------|-------------|
| `IDRetryCounter` | Integer | Retry attempts for juror ID entry |
| `DOBMismatchCounter` | Integer | Count of DOB mismatch attempts |
| `RetryCounter` | Integer | General retry counter |
| `TimeoutRetryCounter` | Integer | Timeout retry counter |
| `NumberOfDigits` | Integer | Count of digits entered in GetDigits |
| `EnterPhoneRetry` | Integer | Retry counter for phone number entry |

---

## ACD/Transfer Variables

| Variable | Type | Description |
|----------|------|-------------|
| `ACD_AgentExtension` | String | Agent extension for transfer |
| `ACD_RouteCode` | Integer | Routing code |
| `ACD_PositionInQueue` | Integer | Position in agent queue |
| `ScreenMsg` | String | Screen pop message for agent |
| `AgentTransfer` | Integer | Whether transferring to agent (0/1) |

---

## Recording Variables

| Variable | Type | Description |
|----------|------|-------------|
| `RecordPath` | String | File path for voice recordings |
| `RecordPassword` | String | Password for administrative recording |
| `PhraseToRecord` | String | Message being recorded |

---

## Error Codes (CT_ResultMessage)

| Error Code | Description |
|------------|-------------|
| `IVR_ERR_001` | DOB mismatch |
| `IVR_ERR_002` | DOB mismatch (alternate) |
| `IVR_ERR_003` | System error |
| `IVR_ERR_004` | System error |
| `IVR_ERR_005` | System error |
| `IVR_ERR_006` | System error |
| `IVR_ERR_009` | Record not found |
| `IVR_ERR_010` | Record not found (alternate) |

---

## Configuration Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `NeumoBaseUrl` | https://fjd-sandbox.avenujury.com/base/rest/ivr | Base URL for Neumo API |
| `PingEndpoint` | /ping | Health check endpoint |
| `GetJurorInfoEndpoint` | /jurorinfo | Juror information retrieval |
| `PostponementInfoEndpoint` | /postponementinfo | Postponement eligibility |
| `PostponementConfirmationEndpoint` | /postponementconfirmation | Confirm postponement |
| `ProcessQualificationEndpoint` | /processqualification | Submit qualification answers |
| `ProcessExcuseExemptEnpoint` | /processexcuseexempt | Process excuse/exempt request |
| `ProcessBioformEndpoint` | /processbioform | Submit bio information |

---

## Key Variable Flows

### 1. Juror Lookup Flow
```
Input: User enters CT_JurorID and CT_DOB
  ↓
API Call: GetJurorInfo
  ↓
Output: CT_* variables populated with juror data
  ↓
Derived: InReportingWeek, inCallinWindow, isTodayReportingDate calculated
  ↓
State: CT_JurorState determines script path
```

### 2. Qualification Flow
```
Input: Q1-Q8 answers collected via DTMF
  ↓
Processing: AnswerSum counts disqualifying answers
  ↓
Output: DisqReason1-8 populated with issue codes
  ↓
API Call: ProcessQualification
  ↓
Result: CT_QualificationStatus (Qualified/Disqualified/Pending Review)
```

### 3. Bio Information Flow
```
Input: BQ1, BQ5, BQ7, BQ10, BQ13 collected via DTMF
  ↓
API Call: ProcessBioform
  ↓
Result: CT_BioComplete status updated
```

---

## Notes

1. **Date Formats:**
   - API Input: `MMddyyyy` (8 digits)
   - API Output/Storage: `yyyy-MM-ddTHH:mm:ss`

2. **Boolean Representations:**
   - Some variables use `"0"`/`"1"` strings
   - Others use `"true"`/`"false"` strings
   - C# booleans converted to strings as needed

3. **Variable Naming Convention:**
   - `CT_*` = CourtTalk/Neumo API variables
   - `BQ*` = Bio Questionnaire answers
   - `Q*` = Qualification Questionnaire answers
   - `ACD_*` = ACD (call routing) variables

4. **Critical Logic Issue:**
   - Line 862: `scheduledDate = testDate;` overrides API date with test variable
   - This is intentional for testing but should be removed in production

5. **Douglas County Special:**
   - OnCall status is treated as "Service Ended" (non-standard)
   - See `[OnCallIsServiceEnded]` block

---

## Version History

- **03/27/26** - Updated for new REST API block structure
- **09/17/25** - Cloned from Douglas County to CSK
- **03/14/24** - Added isPastReportingDateFtaCutoff calculation
- **03/06/24** - Fixed CheckisReportingDateToday logic
- **11/09/23** - Fixed call-in window issues
- **10/30/23** - Fixed call-in window issues
- **09/15/23** - Added telephone number capture
- **08/25/23** - Changed OnCall to Service Ended for Douglas
