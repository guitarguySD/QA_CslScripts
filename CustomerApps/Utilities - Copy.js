/*
 *  Utilities.js 
 *     Custom JavaScript for Sonant Utilities Application.
 *
 *  July 2015 D. Goddette
 *  3/31/16 - dwg - Added method CallinWindow
 * 04/14/16 - dwg - Added method inReportingWeek
 */

///////////////////////////////////
//    Required Modules 
///////////////////////////////////
var ivr = require(__dirname + '\\SonantIvrInterface');
var errorText = '';
var logger = require(__dirname + '\\TextFileLogger');

////////////////////////////////////////////////////////////////////////////////////////
//  Global Vars and Constants                                       
////////////////////////////////////////////////////////////////////////////////////////
const SCRIPT_VERSION = '1.0';

// Logging levels for TextFileLogger
const LOGLEVEL_INFO = 1;
const LOGLEVEL_DEBUG = 2;

// Defines the format of the response string returned to IVR
const RESPONSE_FORMAT_JSON = 1;
const RESPONSE_FORMAT_XML = 2;
const RESPONSE_FORMAT_STRING = 3;

const TEST_MODE = false;

// The script expects two command line arguments: 
//    First arg is the listen TCP port for IVR requests (argv[2]). 
var REQUEST_PORT = process.argv[2];

// Set the Uncaught Exception Handler
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log('Utilities Uncaught Exception: ' + err);  
});

//  Second argument is 'LOG' or 'NOLOG'. LOG sends log statements to the console
var logToConsole = true;
if (process.argv.length > 3) {
   logToConsole = (process.argv[3].toLowerCase() == 'log');
} else {
	logToConsole = false;
}

if (logToConsole) {
  var logData = getTimeString() + 'Entered Utilities.js';
  console.log(logData);
 };

try {
  // Initialize the logger
  if (logger.initialize(2, '', 'Utilities') == false) {
    console.log('logger.initialize failed.');
    process.exit(1);
  };
  
  logger.write('------------- Utilities.js Starting -------------');
} catch(e) {
     console.log('Exception in logger.initialize: ' + e.name);
};
 
  // Initialize the SonantIvrInterface
  try {

    if (ivr.initialize(logToConsole, logger, LOGLEVEL_DEBUG, REQUEST_PORT, processIvrRequest, TEST_MODE, errorText)) {
      
      // Run test scenarios here
      if (TEST_MODE) {
        // Simulate a "Test" method request
        var ivrRequest = {"Method":"Test", "InputVars":{"ScriptInput":2}};
        ivr.testRequest(ivrRequest);
        console.log('ivr.testRequest has returned.');
      };

    } else {
      console.log('ivr.initialize failed: ' + errorText);
    };
} catch(e) {
     console.log('Exception in ivr.initialize: ' + e.name);
};


////////////////////////////////////////////////////////////////////////////////////////
//  getTimeString
//    Return HH:MM:SS + Space string for time-stamping console messages
////////////////////////////////////////////////////////////////////////////////////////
function getTimeString() {
  var d = new Date();
  return 'Utl ' + d.toTimeString().slice(0,8) + '.'+ ('00' + d.getMilliseconds()).slice(-3) + ' ';
};

////////////////////////////////////////////////////////////////////////////////////////
//  processIvrRequest
//    This function handles the incoming requests from the SonantIvrInterface Module.
//    No blocking functions should be called when handling requests because this will
//    block other IVR requests.                                     
//	
//    The ccsRequest object contains the input variables in JSON format:            
//         Method    - Name of the requested method                                  
//         MessageId - Unique integer from requestor; Tracks concurrent requests.    
//         InputVars - JSON object with list of input variables.                    
//                                                                                   
//    Note:  All scripts must execute the 'ScriptStatus' method.                         
////////////////////////////////////////////////////////////////////////////////////////
function processIvrRequest(ivrRequest) {
  //console.log(getTimeString() + 'processIvrRequest entered.');

  switch (ivrRequest.Method) {
    case 'ScriptStatus':
      processMethodScriptStatus(ivrRequest);    
    break;

    case 'CallInWindow':
       processMethodCallInWindow(ivrRequest);
       break;

     case 'DialingRules':
       processMethodDialingRules(ivrRequest);
       break;
     
     case 'AsyncDialingRules':
       processAsyncDialingRules(ivrRequest);
       break;
 
    case 'InReportingWeek':
       processMethodInReportingWeek(ivrRequest);
       break;

    case 'InEveningCallinWindow':
       processMethodInEveningCallinWindow(ivrRequest);
       break;

    default:
      if (logToConsole) {
        console.log(getTimeString() + 'processIvrRequest has unexpected Method: "' + ivrRequest.Method + '"');
      }; 
    break;
  };
};


////////////////////////////////////////////////////////////////////////////////////////
//  Method ScriptStatus Processor                                      
//      All scripts must execute this method.  The IVR calls it shortly after it 
//      connects.  The Methods are saved internally inside the IVR.
//      Keep the scriptVersion and Methods array up-to-date as methods are added!!! 
////////////////////////////////////////////////////////////////////////////////////////
function processMethodScriptStatus(ivrRequest) {
  // Return Node version, Script version, and Methods array
  ivrRequest.ivrResponse.NodeVersion = process.version;
  ivrRequest.ivrResponse.ScriptVersion = SCRIPT_VERSION;
  
  // List all script methods here.  Note that we override the default to return the response.
  ivrRequest.ivrResponse.Methods = ["ScriptStatus","CallInWindow","DialingRules","AsyncDialingRules","InReportingWeek","InEveningCallinWindow",]; 
  ivrRequest.ivrResponse.ReturnResponse = true;
  
  if (logToConsole) { 
    console.log(getTimeString() + 'processMethodScriptStatus: ' + JSON.stringify(ivrRequest.ivrResponse));
  };
}

////////////////////////////////////////////////////////////////////////////////////////
//  Method CallInWindow Processor                                      
////////////////////////////////////////////////////////////////////////////////////////
function processMethodCallInWindow(ivrRequest) {
    console.log('Test method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
     // Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    ivrRequest.ivrResponse.OutputVars={};
    ivrRequest.ivrResponse.OutputVars.inCallinWindow=99;
   
    try {
    // Echo back the ScriptInput var to the ScriptOutput.  Send Status as 1.
	var thisDay = new Date();
	var jsScheduledDate = new Date(ivrRequest.InputVars.scheduledDate);
	jsScheduledDate.setHours(17,0,0,0);
	var diff = jsScheduledDate - thisDay;
	var window = 1000 * 60 * 60 * 24;
	var inCallIn = Math.floor( diff / window );
	
	if (inCallIn== 0) {
	   ivrRequest.ivrResponse.OutputVars.inCallinWindow = 1;
	   }
	else if (inCallIn > 0) {
	   ivrRequest.ivrResponse.OutputVars.inCallinWindow = 0;
	} else if (inCallIn < 0) {
	   ivrRequest.ivrResponse.OutputVars.inCallinWindow = -1;	   
	} 
	logger.log('inCallinWindow = ' + ivrRequest.ivrResponse.OutputVars.inCallinWindow);
   }
	catch (e) {
	   console.log('Exception in CallinWindow : ' + e.name);
	   logger.write('CallinWindow error : ' + e.name);
    }

};

////////////////////////////////////////////////////////////////////////////////////////
//  Method inReportingWeek Processor   
//  the Reporting Week is from 6PM before their reporting date through
//  Friday at 6PM.     
//  0 = Before reporting week
//  1 = in Reporting Week
// -1 = after Reporting Week                              
////////////////////////////////////////////////////////////////////////////////////////
function processMethodInReportingWeek(ivrRequest) {
    console.log('Test method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
     // Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    ivrRequest.ivrResponse.OutputVars={};
    ivrRequest.ivrResponse.OutputVars.inReportingWeek=0;
    ivrRequest.ivrResponse.OutputVars.resultCode=99;
    ivrRequest.ivrResponse.OutputVars.resultMessage="Initialized";
   
    try {
    // Echo back the ScriptInput var to the ScriptOutput.
	var now = new Date();
	console.log('Now = ' + now);
	var jsScheduledDate = new Date(ivrRequest.InputVars.scheduledDate);
	var startOfWeek = new Date(ivrRequest.InputVars.scheduledDate);
	var endOfWeek = new Date(ivrRequest.InputVars.scheduledDate);
	console.log('Scheduled Date = ' + jsScheduledDate);
	var dayOfTheWeek = jsScheduledDate.getDay();
	console.log('Day of the Week = ' + dayOfTheWeek);
	
	startOfWeek.setDate(startOfWeek.getDate() - dayOfTheWeek);
	console.log('Start of the week = ' + startOfWeek);
	
	endOfWeek.setDate(endOfWeek.getDate() + 5 - dayOfTheWeek);
	console.log('End of the week = ' + endOfWeek);

	startOfWeek.setHours(18,0,0,0);
	console.log('Start of the week = ' + startOfWeek);

	endOfWeek.setHours(18,0,0,0);
	console.log('End of the week = ' + endOfWeek);
	
	if (( now > startOfWeek) && (now < endOfWeek)) {
	   ivrRequest.ivrResponse.OutputVars.inReportingWeek = 1;
	   }
	else if ( now < startOfWeek) {
	   ivrRequest.ivrResponse.OutputVars.inReportingWeek = 0;
	} else if ( now > endOfWeek ) {
	   ivrRequest.ivrResponse.OutputVars.inReportingWeek = -1;	   
	} 
	ivrRequest.ivrResponse.OutputVars.resultCode=0;
	ivrRequest.ivrResponse.OutputVars.resultMessage="Success";
	logger.write('inReportingWeek = ' + ivrRequest.ivrResponse.OutputVars.inReportingWeek);
   }
	catch (e) {
	   console.log('Exception in inReportingWeek : ' + e.name);
	   logger.write('inReportingWeek error : ' + e.name);
	   resultCode=1;
	   resultMessage='inReportingWeek error : ' +  e.name;
    }

};

////////////////////////////////////////////////////////////////////////////////////////
//  Method eveningCallinWindow Processor                                      
////////////////////////////////////////////////////////////////////////////////////////
function processMethodInEveningCallinWindow(ivrRequest) {
    console.log('Test method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
     // Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    ivrRequest.ivrResponse.OutputVars={};
    ivrRequest.ivrResponse.OutputVars.inEveningCallinWindow=0;
    ivrRequest.ivrResponse.OutputVars.resultCode=99;
    ivrRequest.ivrResponse.OutputVars.resultMessage="Initialized";
   
    try {
    // Echo back the ScriptInput var to the ScriptOutput.
	var now = new Date();
	var startTime = parseInt(ivrRequest.InputVars.startTime);
	var endTime = parseInt(ivrRequest.InputVars.endTime);
	var startWindow = new Date();
	startWindow.setHours(startTime,0,0,0);
	var endWindow = new Date(); //technically this is the end window from yesterday
	endWindow.setHours(endTime,0,0,0);
		
	if ((now > startWindow) || (now < endWindow)) {
	   //console.log('Now is in the callin window');
    	   ivrRequest.ivrResponse.OutputVars.inEveningCallinWindow=1;
           ivrRequest.ivrResponse.OutputVars.resultCode=0;
           ivrRequest.ivrResponse.OutputVars.resultMessage="Success";
	} else if ((now < startWindow) && (now > startWindow)) {
	   //console.log('Now is out of the callin window');
    	   ivrRequest.ivrResponse.OutputVars.inEveningCallinWindow=0;
           ivrRequest.ivrResponse.OutputVars.resultCode=0;
           ivrRequest.ivrResponse.OutputVars.resultMessage="Success";
	} 
	
	logger.write('inEveningCallinWindow = ' + ivrRequest.ivrResponse.OutputVars.inEveningCallinWindow);
   }
	catch (e) {
	   console.log('Exception in inEveningCallinWindow : ' + e.name);
	   logger.write('inEveningCallinWindow error : ' + e.name);
	   resultCode=1;
	   resultMessage='inEveningCallinWindow error : ' +  e.name;
    }

};
////////////////////////////////////////////////////////////////////////////////////////
//  Method DialingRules Processor                                      
////////////////////////////////////////////////////////////////////////////////////////
function processMethodDialingRules(ivrRequest) {
  logger.write('DR method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
  console.log('DR method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
   // Respond synchronously.  Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    ivrRequest.ivrResponse.OutputVars = {};
    ivrRequest.ivrResponse.OutputVars.dialString="";
    ivrRequest.ivrResponse.OutputVars.Status=0;
    ivrRequest.ivrResponse.OutputVars.errorMessage="Initialized";
    
  var areaCode;
  var sevenDigitPhoneNumber;

  // Respond synchronously.  Build the ivrResponse: Return JSON
  try {
     if (ivrRequest.InputVars.phoneNumber.length == 10) {
         console.log('Ten digits');
    	 areaCode = ivrRequest.InputVars.phoneNumber.substr(0,3);
    	 sevenDigitPhoneNumber = ivrRequest.InputVars.phoneNumber.substr(3,7);
    	//check if it's a local call - use 7 digit number only
    	 if (ivrRequest.InputVars.localExchanges.indexOf(areaCode) > -1) {
            console.log('DR: Local Exchange');
    	    ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.localPrefix + sevenDigitPhoneNumber + ivrRequest.InputVars.localSuffix;
            ivrRequest.ivrResponse.OutputVars.Status = 0;
            ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, local call.";
    	 } else if (ivrRequest.InputVars.allowedLongDistanceExchanges.indexOf(areaCode) > -1){
            console.log('DR: Long distance Exchange');
    	    ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.LDPrefix + areaCode + sevenDigitPhoneNumber + ivrRequest.InputVars.LDSuffix;
            ivrRequest.ivrResponse.OutputVars.Status = 0;
            ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, long distance call.";   
    	 } else if (ivrRequest.InputVars.allowedLongDistanceExchanges == "*"){
            console.log('DR: All Long Distance Exchanges Allowed');
    	    ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.LDPrefix + areaCode + sevenDigitPhoneNumber + ivrRequest.InputVars.LDSuffix;
            ivrRequest.ivrResponse.OutputVars.Status = 0;
            ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, long distance call.";   
    	 } else {
            console.log('DR: Error, Area code not found in allowed exchanges');
            ivrRequest.ivrResponse.OutputVars.dialString = "";
            ivrRequest.ivrResponse.OutputVars.Status = 2;
            ivrRequest.ivrResponse.OutputVars.errorMessage = "Error - exchange not allowed.";
   	 };
     } else {
       console.log('DR: Error, not 10 digit phone number.');
       ivrRequest.ivrResponse.OutputVars = {};
       ivrRequest.ivrResponse.OutputVars.dialString = "";
       ivrRequest.ivrResponse.OutputVars.Status = 1;
       ivrRequest.ivrResponse.OutputVars.errorMessage = "Phone number wrong length";
     };
     } catch (e) {
        console.log('Exception in Dialing Rules : ' + e.name);
     }
};
////////////////////////////////////////////////////////////////////////////////////////
//  sendAsyncResponse - Timer callback function that returns a response                                      
////////////////////////////////////////////////////////////////////////////////////////
function sendAsyncResponse(ivrRequest) {
  // Return the response to an async request.  
  console.log(getTimeString());
  try {
    // Build ivrResponse
    // Echo back the ScriptInput var to the ScriptOutput.  Send Status as 2.
    ivrRequest.ivrResponse.OutputVars = {};
    ivrRequest.ivrResponse.OutputVars.ScriptOutput = ivrRequest.InputVars.ScriptInput;
    ivrRequest.ivrResponse.OutputVars.Status = 2;
    
    ivr.sendIvrResponse(ivrRequest);
  } catch(e) {
  };
};

////////////////////////////////////////////////////////////////////////////////////////
//  Method AsyncDialingRules Processor                                      
////////////////////////////////////////////////////////////////////////////////////////
function processAsyncDialingRules(ivrRequest) {
  console.log('AsyncDR method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
    // Respond Asynch:  Set timer to respond in 200 mS. Pass ivrRequest to callback.
    setTimeout(sendAsyncDialingRulesResponse, 1, ivrRequest);
    // The infrastructure will not return a response when we exit because
    // the OutputVars object was not added to the ivrResponse.
};

////////////////////////////////////////////////////////////////////////////////////////
//  sendDialingRulesResponse - Timer callback function that returns a response                                      
////////////////////////////////////////////////////////////////////////////////////////
function sendAsyncDialingRulesResponse(ivrRequest) {
  // Return the response to an async request.  
  logger.write('sendAsyncDialingRules method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
  console.log('sendAsyncDialingRules method InputVars: ' + JSON.stringify(ivrRequest.InputVars));

  var areaCode;
  var sevenDigitPhoneNumber;
  ivrRequest.ivrResponse.OutputVars = {};

  try {
    // Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    
    // Strip various characters from the phone number. Just in case. 
    ivrRequest.InputVars.phoneNumber = ivrRequest.InputVars.phoneNumber.replace(".","").replace(" ","").replace("-","").replace("+","").replace("(","").replace(")","");
    
    if (ivrRequest.InputVars.phoneNumber.length == 10) {
        logger.write('Utl: AsyncDR: Ten digits');
    	areaCode = ivrRequest.InputVars.phoneNumber.substr(0,3);
    	sevenDigitPhoneNumber = ivrRequest.InputVars.phoneNumber.substr(3,7);
    	//check if it's a local call - use 7 digit number only
    	if (ivrRequest.InputVars.localExchanges.indexOf(areaCode) > -1) {
           ivrRequest.ivrResponse.OutputVars = {};
    	   ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.localPrefix + sevenDigitPhoneNumber + ivrRequest.InputVars.localSuffix;
           ivrRequest.ivrResponse.OutputVars.Status = 0;
           ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, local call.";
           console.log(getTimeString());
           console.log('Utl: AsynDR: Output Vars = ' + JSON.stringify(ivrRequest.ivrResponse.OutputVars));
           logger.write('Utl: AsynDR: Output Vars = ' + JSON.stringify(ivrRequest.ivrResponse.OutputVars));
           ivr.sendIvrResponse(ivrRequest);
    	} else if (ivrRequest.InputVars.allowedLongDistanceExchanges.indexOf(areaCode) > -1){
           console.log('AsyncDR: Long distance Exchange');
    	   ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.LDPrefix + sevenDigitPhoneNumber + ivrRequest.InputVars.LDSuffix;
           ivrRequest.ivrResponse.OutputVars.Status = 0;
           ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, long distance call.";   
           console.log('AsynDR: Output Vars = ' + JSON.stringify(ivrRequest.ivrResponse.OutputVars));
           ivr.sendIvrResponse(ivrRequest);
    	} else if (ivrRequest.InputVars.allowedLongDistanceExchanges == "*"){
           console.log('AsyncDR: All Long Distance Exchanges Allowed');
    	   ivrRequest.ivrResponse.OutputVars.dialString = ivrRequest.InputVars.LDPrefix + sevenDigitPhoneNumber + ivrRequest.InputVars.LDSuffix;
           ivrRequest.ivrResponse.OutputVars.Status = 0;
           ivrRequest.ivrResponse.OutputVars.errorMessage = "Normal completion, long distance call.";   
           console.log('AsynDR: Output Vars = ' + JSON.stringify(ivrRequest.ivrResponse.OutputVars));
           ivr.sendIvrResponse(ivrRequest);
    	} else {
           console.log('AsyncDR: Error, Area code not found in allowed exchanges');
           ivrRequest.ivrResponse.OutputVars.dialString = "";
           ivrRequest.ivrResponse.OutputVars.Status = 2;
           ivrRequest.ivrResponse.OutputVars.errorMessage = "Error - exchange not allowed.";
           console.log('AsynDR: Output Vars = ' + JSON.stringify(ivrRequest.ivrResponse.OutputVars));
		   console.log(getTimeString() + ' sendIVRResponse.');
           ivr.sendIvrResponse(ivrRequest);
  	};
    } else {
      console.log('AsyncDR: Error, not 10 digit phone number.');
      ivrRequest.ivrResponse.OutputVars.dialString = "";
      ivrRequest.ivrResponse.OutputVars.Status = 1;
      ivrRequest.ivrResponse.OutputVars.errorMessage = "Phone number wrong length";
      ivr.sendIvrResponse(ivrRequest);
    };
    } catch(e) {
  };

};




