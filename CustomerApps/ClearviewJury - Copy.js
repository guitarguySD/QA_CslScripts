/*
 *  ClarkCountyAgileJury.js 
 *     Custom JavaScript for the ClarkCountyAgileJury Application.
 *
 *  May 2015 Puja Malik
 *  3/8/16 Version 1.0.0.1 dwg
 *  3/9/16 Edited while debugging in lab. DWG MSJ
 *  3/17/16 Version 1.0.0.2 Released to Clark Productiong dwg
 *  3/31/16 Version 1.0.0.3 JurorID Mismatch workaround
 *  4/04/16 1.0.0.4 dwg Minor mod from Puja, moved to production 
 *  4/13/16 1.0.0.5 pm  Added new PendingReview value to jurorInfo 
 *  4/20/16 1.0.0.6 pm  Added dob to data returned from notifications
 *  6/13/18 1.0.0.7 dwg Added 10th answer to bio questionnaire
 *  12/18/20 1.0.0.8 dwg Added supplemental answers to bio questionnaire
*/
///////////////////////////////////
//    Required Modules 
///////////////////////////////////
var http = require('http');
var fs = require("fs");
var logger = require(__dirname + '\\TextFileLogger');
var ivr = require(__dirname + '\\SonantIvrInterface');

////////////////////////////////////////////////////////////////////////////////////////
//  Global Vars and Constants                                       
////////////////////////////////////////////////////////////////////////////////////////
const SCRIPT_VERSION = '1.0';
const req = "Requesting";
const available ="Available";
const idle = "Idle";

var configData = JSON.parse(fs.readFileSync(__dirname +'\\config.json'));
var errorText = '';
var boolTrue = "1";
var boolFalse = "0";
var emptyString = "";
var jurorinfo = "jurorinfo";
var sendResponse;
var outputJurorInfo;
var outputPostponementInfo;
var postponementinfo = "postponementinfo";
var postponementconfirmation ="postponementconfirmation";
var processqualification = "processqualification";
var processexcuseexempt = "processexcuseexempt";
var processbioform = "processbioform";
var outboundnotification = "outboundnotification";
var processworkcertificate = "processworkcertificate";
var getoutboundnotification = "getoutboundnotification";
var processsupplementalbioform = "processsuplementalbioform";
var resultCodePass ="0";

var q1="Qualification_IVR_1";
var q2="Qualification_IVR_2";
var q3="Qualification_IVR_3";
var q4="Qualification_IVR_4";
var q5="Qualification_IVR_5";
var b1="BioForm_IVR_1";
var b2="BioForm_IVR_2";
var b3="BioForm_IVR_3";
var b4="BioForm_IVR_4";
var b5="BioForm_IVR_5";
var b6="BioForm_IVR_6";
var b7="BioForm_IVR_7";
var b8="BioForm_IVR_8";
var b9="BioForm_IVR_9";
var b10="BioForm_IVR_10";
var s1="IVR_SUP_1";
var s2="IVR_SUP_2";
var s3="IVR_SUP_3";
var s4="IVR_SUP_4";
var s5="IVR_SUP_5";
var s6="IVR_SUP_6";
var s7="IVR_SUP_7";
var s8="IVR_SUP_8";
var s9="IVR_SUP_9";
var s10="IVR_SUP_10";
var s11="IVR_SUP_11";
var s12="IVR_SUP_16";
var s13="IVR_SUP_17";
var s14="IVR_SUP_18";
var s15="IVR_SUP_19";
var s16="IVR_SUP_20";
var s17="IVR_SUP_21";
var s18="IVR_SUP_22";
var s19="IVR_SUP_23";
var s20="IVR_SUP_24";
var s21="IVR_SUP_25";

var notificationData= "";
var notificationState= idle;
var notificationArray=[];
//notificationArray=[{"jurorID":"1","phoneNumber":"2092102275","notificationType":"Change Status to Completed Letter","nameFirst":"l","nameFirstInitial":"P"},
// {"jurorID":"2","phoneNumber":"2092102275","notificationType":"Change Status to Completed Letter","nameFirst":"m","nameFirstInitial":"r"},
// {"jurorID":"3","phoneNumber":"2092102275","notificationType":"Change Status to Completed Letter","nameFirst":"A","nameFirstInitial":"w"},
// {"jurorID":"4","phoneNumber":"2092102275","notificationType":"Change Status to Completed Letter","nameFirst":"B","nameFirstInitial":"d"},
// {"jurorID":"5","phoneNumber":"2092102275","notificationType":"Change Status to Completed Letter","nameFirst":"C","nameFirstInitial":"v"}]


var remainingNotifications = 0;

var yes ="Yes";
var no="No";

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
    console.log('Uncaught Exception: ' + err);  
});

//  Second argument is 'LOG' or 'NOLOG'. LOG sends log statements to the console
var logToConsole = false;
if (process.argv.length > 3) {
   logToConsole = (process.argv[3].toLowerCase() == 'log');
} else {
	logToConsole = false;
}

var logData = getTimeString() + 'Entered ClarkCountyAgileJury.js';
if (logToConsole) {
  console.log(logData);
 };

try {
  // Initialize the logger
  if (logger.initialize(2, '', 'IvrInterfaceTest') == false) {
    console.log('logger.initialize failed.');
    process.exit(1);
  };
} catch(e) {
     console.log('Exception in logger.initialize: ' + e.name);
};
 
logger.write(logData);
  
  // Initialize the SonantIvrInterface
  try {

    if (ivr.initialize(logToConsole, logger, LOGLEVEL_DEBUG, REQUEST_PORT, processIvrRequest, TEST_MODE, errorText)) {
      console.log('Sonant IVR Interface has been initialized.');
      
      // Run test scenarios here
      if (TEST_MODE) {
        // Simulate a "Test" method request
        //var ivrRequest = {"Method":"Test", "InputVars":{"ScriptInput":2}};
		//var ivrRequest = {"Method":"jurorinfo", "InputVars":{"jurorID":"101526191","dob":"01011961"}};
		//var ivrRequest = {"Method":"postponementinfo", "InputVars":{"jurorID":"103449080"}};
		//var ivrRequest = {"Method":"postponementconfirmation", "InputVars":{"jurorID":"100811493","postponedDate":"09/09/2015"}};
		//var ivrRequest = {"Method":"processqualification", "InputVars":{"jurorID":"000013995","Q1Answer":"1","Q2Answer":"1","Q3Answer":"1","Q4Answer":"1","Q5Answer":"'1"}};
		//var ivrRequest = {"Method":"processbioform", "InputVars":{"jurorID":"103522184","value1":"Male","value2":"H","value3":"111111111","value4":"25","value5":"MARRIED","value6":"High School Grad","value7":"1181118111","value8":"1111211481","value9":"8581211481","value10":"J"}};
		//var ivrRequest = {"Method":"processexcuseexempt","InputVars":{"jurorID":"101705915","reasonCode":"A","reasonType":"Exempt"}}
		//var ivrRequest = {"Method":"outboundnotification"}
		//var ivrRequest = {"Method":"getoutboundnotification","InputVars":{"notificationCount":"2"}};
		//var ivrRequest = {"Method":"processworkcertificate", "InputVars":{"jurorID":"100811493"}};
		
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
  return d.toTimeString().slice(0,8) + ' ';
};

 ////////////////////////////////////////////////////////////////////////////////////////
//  sendResponse - Timer callback function that returns a response                                      
////////////////////////////////////////////////////////////////////////////////////////
sendResponse=function sendResponse(returnedJSON,ivrRequest) {
  // Return the response to an async request.  
  try {
    // Build ivrResponse
    // Echo back the ScriptInput var to the ScriptOutput.  Send Status as 2.
	switch(returnedJSON.resMethod){	
	
	case jurorinfo:
	     ivrRequest=outputJurorInfo(returnedJSON,ivrRequest);		 
	break;	 
	
	case postponementinfo:
		ivrRequest=outputPostponementInfo(returnedJSON,ivrRequest); 				
    break;
	
	case postponementconfirmation:
		ivrRequest=outputPostponementConfirmation(returnedJSON,ivrRequest);   
    break;
	
	case processqualification:
		ivrRequest=outputProcessQualification(returnedJSON,ivrRequest);
    break;
	
	case processexcuseexempt:
		ivrRequest=outputProcessExcuseExempt(returnedJSON,ivrRequest);  
    break;
	
	case processbioform:
		ivrRequest=outputProcessBioform(returnedJSON,ivrRequest);
	break;
	
	case processsupplementalbioform:
		ivrRequest=outputProcessSupplementalBioform(returnedJSON,ivrRequest);
    break;

    case outboundnotification:
		ivrRequest=outputOutboundNotification(returnedJSON,ivrRequest); 
    break;
	
	//case getoutboundnotification:
	//	ivrRequest=outputGetOutboundNotification(returnedJSON,ivrRequest); 
   // break;
	
	case processworkcertificate:
		ivrRequest=outputWorkCertificate(returnedJSON,ivrRequest); 				
    break;
	
	default:
      if (logToConsole) {
        console.log("Unexpected Error in function sendResponse");
      }; 
    break;
    }
	logger.write('ivrRequest-----------------------CCS Input '+JSON.stringify(ivrRequest))
	ivr.sendIvrResponse(ivrRequest);
	
  } catch(e) {
	logger.write('Error in the function sendResponse : ' + e.message);
  };
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
  console.log(getTimeString() + 'processIvrRequest entered.');

  switch (ivrRequest.Method) {
    case 'ScriptStatus':
      processMethodScriptStatus(ivrRequest);    
    break;
    
    case 'Test':
      processMethodTest(ivrRequest);    
    break;
	
	case jurorinfo:
      processJurorInfo(ivrRequest);    
    break;
	
	case postponementinfo:
      processPostponementInfo(ivrRequest);    
    break;
	
	case postponementconfirmation:
      processPostponementConfirmation(ivrRequest);    
    break;
	
	case processqualification:
      processQualification(ivrRequest);    
    break;
	
	case processexcuseexempt:
      processExcuseExempt(ivrRequest);    
    break;
	
	case processbioform:
      processBioform(ivrRequest);    
	break;
	
	case processsupplementalbioform:
		processSupplementalBioform(ivrRequest);    
	  break;

     case outboundnotification:
      processOutboundNotification(ivrRequest);    
    break;
	
	case processworkcertificate:
      processWorkCertificate(ivrRequest);    
    break;
	
	case getoutboundnotification:
	  processGetOutboundNotification(ivrRequest);
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
  ivrRequest.ivrResponse.Methods = ["ScriptStatus","Test","jurorinfo","postponementinfo","postponementconfirmation","processqualification","processexcuseexempt","processbioform","processsupplementalbioform","outboundnotification","getoutboundnotification","processworkcertificate"]; 
  ivrRequest.ivrResponse.ReturnResponse = true;
  
  if (logToConsole) { 
    console.log('processMethodScriptStatus: ' + JSON.stringify(ivrRequest.ivrResponse));
  };
}

////////////////////////////////////////////////////////////////////////////////////////
//  Method Test Processor                                      
////////////////////////////////////////////////////////////////////////////////////////
function processMethodTest(ivrRequest) {
  //console.log('Test method InputVars: ' + JSON.stringify(ivrRequest.InputVars));
  

  // Should we respond synchronously or async?
  if (ivrRequest.InputVars.ScriptInput == "1") {
    // Respond synchronously.  Build the ivrResponse: Return JSON
    ivrRequest.ivrResponse.Format = RESPONSE_FORMAT_JSON;
    ivrRequest.ivrResponse.ReturnResponse = true;
    
    // Echo back the ScriptInput var to the ScriptOutput.  Send Status as 1.
    ivrRequest.ivrResponse.OutputVars = {};
    ivrRequest.ivrResponse.OutputVars.ScriptOutput = ivrRequest.InputVars.ScriptInput;
    ivrRequest.ivrResponse.OutputVars.Status = 1;
  } else {
    // Respond Asynch:  Set timer to respond in 200 mS. Pass ivrRequest to callback.
    setTimeout(sendAsyncResponse, 200, ivrRequest);
    
    // The infrastructure will not return a response when we exit because
    // the OutputVars object was not added to the ivrResponse.
  }; 
};
 ////////////////////////////////////////////////////////////////////////////////////////
//  sendAsyncResponse - Timer callback function that returns a response                                      
////////////////////////////////////////////////////////////////////////////////////////
function sendAsyncResponse(ivrRequest) {
  // Return the response to an async request.  
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
//  Method Get Juror Information from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////
function processJurorInfo(ivrRequest) {
	try {
	    var dob=ivrRequest.InputVars.dob.replace(/\//g, "");	
	    jurorInfoJSON = {"jurorID":ivrRequest.InputVars.jurorID,"dob":dob};
		data = JSON.stringify(jurorInfoJSON);
		logger.write("Input to AJ for method processJurorInfo"+data);
		
	    var requestOptions = {
			          //host : '192.168.5.126', 
					 // port : '80', 
					 // path : '/rest/ivr/jurorinfo', 
					  host : configData.host, 
					  port : configData.port,
					  path : configData.jurorInfoPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					  //rejectUnauthorized : false;// charset=utf-8;
					};
					
					var jurorInfoRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {						
											logger.write('getJurorInfo'+d);										
											var  returnedJSON = JSON.parse(d);
											returnedJSON.resMethod=jurorinfo;
											sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
						
					
					
					jurorInfoRequest.on('error', function(e) {
					  logger.write('problem with request for jurorInfoRequest : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=jurorinfo;
					  sendResponse(returnedJSON,ivrRequest);
					});
					jurorInfoRequest.write(data);
                    jurorInfoRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processJurorInfo : ' + e.message);
	}
}
////////////////////////////////////////////////////////////////////////////////////////
//  Method Postponement Request from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processPostponementInfo(ivrRequest) {
	try {
	    postponementInfoJSON = {"jurorID":ivrRequest.InputVars.jurorID};
		data = JSON.stringify(postponementInfoJSON);
		logger.write("Input to AJ for method postponementInfoJSON"+data);
		
	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.postponementinfoPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var postponementInfoRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processPostponementInfo'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=postponementinfo;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					postponementInfoRequest.on('error', function(e) {
					  logger.write('problem with request for processPostponementInfo : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=postponementinfo;
					  sendResponse(returnedJSON,ivrRequest);
					});
					postponementInfoRequest.write(data);
                    postponementInfoRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processPostponementInfo : ' + e.message);
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//  Method Postponement Confirmation Request from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processPostponementConfirmation(ivrRequest) {
	try {	
		var postponedDate=ivrRequest.InputVars.postponedDate.replace(/\//g, "");	
	    postponementConfJSON = {"jurorID":ivrRequest.InputVars.jurorID,"postponedDate":postponedDate};
		data = JSON.stringify(postponementConfJSON);
		logger.write("Input to AJ for method processPostponementConfirmation"+data);
		
	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.postponementConfirmationPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var postponementConfRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processPostponementConfirmation'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=postponementconfirmation;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					postponementConfRequest.on('error', function(e) {
					  logger.write('problem with request for processPostponementConfirmation : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=postponementconfirmation;
					  sendResponse(returnedJSON,ivrRequest);
					});
					postponementConfRequest.write(data);
                    postponementConfRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processPostponementConfirmation : ' + e.message);
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Qualification from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processQualification(ivrRequest) {
	try {
		json1={};
		json1.questionId = q1;
		json1.value=(ivrRequest.InputVars.value1)==="1" ? yes:no;
		
		json2={};
		json2.questionId = q2;
		json2.value=(ivrRequest.InputVars.value2)==="1" ? yes:no;
		
		json3={};
		json3.questionId = q3;
		json3.value=(ivrRequest.InputVars.value3)==="1" ? yes:no;
		
		json4={};
		json4.questionId = q4;
		json4.value=(ivrRequest.InputVars.value4)==="1" ? yes:no;
		
		json5={};
		json5.questionId = q5;
		json5.value=(ivrRequest.InputVars.value5)==="1"  ? yes:no;
		
		var answers =[json1,json2,json3,json4,json5];
		
	    qualificationJSON = {"personId":ivrRequest.InputVars.jurorID,"answers":answers};
		data = JSON.stringify(qualificationJSON);
		
		logger.write("Input to AJ for method processQualification"+data);

	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.qualificationPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var qualificationRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processQualification'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=processqualification;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					qualificationRequest.on('error', function(e) {
					  logger.write('problem with request for processQualification : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=processqualification;
					  sendResponse(returnedJSON,ivrRequest);
					});
					qualificationRequest.write(data);
                    qualificationRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processQualification : ' + e.message);
	}
}
////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Bio Information from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processBioform(ivrRequest) {
	try {

		bjson1={};
		bjson1.questionId = b1;
		bjson1.value=ivrRequest.InputVars.value1 || emptyString;
		
		bjson2={};
		bjson2.questionId = b2;
		bjson2.value=ivrRequest.InputVars.value2 || emptyString;
		
		bjson3={};
		bjson3.questionId = b3;
		var ssnstr=ivrRequest.InputVars.value3 || emptyString;
		if(ssnstr != emptyString){ssnstr=ssnstr.substr(0,3) + '-' + ssnstr.substr(3, 2) + '-' + ssnstr.substr(5)};
		bjson3.value=ssnstr;
		
		bjson4={};
		bjson4.questionId = b4;
		bjson4.value=ivrRequest.InputVars.value4 || emptyString;
		
		bjson5={};
		bjson5.questionId = b5;
		bjson5.value=ivrRequest.InputVars.value5 || emptyString;
		
		bjson6={};
		bjson6.questionId = b6;
		bjson6.value=ivrRequest.InputVars.value6 || emptyString;;
		
		bjson7={};
		bjson7.questionId = b7;
		var busstr=ivrRequest.InputVars.value7 || emptyString;
		if(busstr != emptyString){busstr=formatPhoneNo(busstr)};
		bjson7.value=busstr;
		
		bjson8={};
		bjson8.questionId = b8;
		var cellstr=ivrRequest.InputVars.value8 || emptyString;
		if(cellstr != emptyString){cellstr=formatPhoneNo(cellstr)};
		bjson8.value=cellstr;
		
		bjson9={};
		bjson9.questionId = b9;
		var homestr=ivrRequest.InputVars.value9 || emptyString;
		if(homestr != emptyString){homestr=formatPhoneNo(homestr)};
		bjson9.value=homestr;
		
		bjson10={};
		bjson10.questionId = b10;
		bjson10.value=ivrRequest.InputVars.value10 || emptyString;

		var answers =[bjson1,bjson2,bjson3,bjson4,bjson5,bjson6,bjson7,bjson8,bjson9,bjson10];		
	        bioformJSON = {"personId":ivrRequest.InputVars.jurorID,"answers":answers};		
		data = JSON.stringify(bioformJSON);		
		logger.write("Input to AJ for method processBioform"+data);
		
	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.processbioformPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var bioformRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processBioform'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=processbioform;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					bioformRequest.on('error', function(e) {
					  logger.write('problem with request for processBioform : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=processbioform;
					  sendResponse(returnedJSON,ivrRequest);
					});
					bioformRequest.write(data);
                    bioformRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processBioform : ' + e.message);
	}
}

////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Supplemental Bio Information from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processSupplementalBioform(ivrRequest) {
	try {

		// Supplemental question answers	
		sa1={};
		sa1.questionId = s1;
		sa1.value=ivrRequest.InputVars.supAns1 || emptyString;

		sa2={};
		sa2.questionId = s2;
		sa2.value=ivrRequest.InputVars.supAns2 || emptyString;

		sa3={};
		sa3.questionId = s3;
		sa3.value=ivrRequest.InputVars.supAns3 || emptyString;

		sa4={};
		sa4.questionId = s4;
		sa4.value=ivrRequest.InputVars.supAns4 || emptyString;

		sa5={};
		sa5.questionId = s5;
		sa5.value=ivrRequest.InputVars.supAns5 || emptyString;

		sa6={};
		sa6.questionId = s6;
		sa6.value=ivrRequest.InputVars.supAns6 || emptyString;

		sa7={};
		sa7.questionId = s7;
		sa7.value=ivrRequest.InputVars.supAns7 || emptyString;

		sa8={};
		sa8.questionId = s8;
		sa8.value=ivrRequest.InputVars.supAns8 || emptyString;

		sa9={};
		sa9.questionId = s9;
		sa9.value=ivrRequest.InputVars.supAns9 || emptyString;

		sa10={};
		sa10.questionId = s10;
		sa10.value=ivrRequest.InputVars.supAns10 || emptyString;

		sa11={};
		sa11.questionId = s11;
		sa11.value=ivrRequest.InputVars.supAns11 || emptyString;

		sa12={};
		sa12.questionId = s12;
		sa12.value=ivrRequest.InputVars.supAns12 || emptyString;

		sa1={};
		sa13.questionId = s13;
		sa13.value=ivrRequest.InputVars.supAns13 || emptyString;

		sa14={};
		sa14.questionId = s14;
		sa14.value=ivrRequest.InputVars.supAns14 || emptyString;

		sa15={};
		sa15.questionId = s15;
		sa15.value=ivrRequest.InputVars.supAns1 || emptyString;

		sa16={};
		sa16.questionId = s16;
		sa16.value=ivrRequest.InputVars.supAns16 || emptyString;

		sa17={};
		sa17.questionId = s17;
		sa17.value=ivrRequest.InputVars.supAns17 || emptyString;

		sa18={};
		sa18.questionId = s18;
		sa18.value=ivrRequest.InputVars.supAns18 || emptyString;

		sa19={};
		sa19.questionId = s19;
		sa19.value=ivrRequest.InputVars.supAns19 || emptyString;

		sa20={};
		sa20.questionId = s20;
		sa20.value=ivrRequest.InputVars.supAns20 || emptyString;

		sa21={};
		sa21.questionId = s21;
		sa21.value=ivrRequest.InputVars.supAns21 || emptyString;

		var answers =[sa1,sa2,sa3,sa4,sa5,sa6,sa7,sa8,sa9,sa10,sa11,sa12,sa13,sa14,sa15,sa16,sa17,sa18,sa19,sa20,sa20];		
	        bioformJSON = {"personId":ivrRequest.InputVars.jurorID,"answers":answers};		
		data = JSON.stringify(bioformJSON);		
		logger.write("Input to AJ for method processSupplementalBioform"+data);
		
	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.processbioformPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var bioformRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processSupplementalBioform'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=processbioform;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					bioformRequest.on('error', function(e) {
					  logger.write('problem with request for processSupplementalBioform : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=processsupplementalbioform;
					  sendResponse(returnedJSON,ivrRequest);
					});
					bioformRequest.write(data);
                    bioformRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processSupplementalBioform : ' + e.message);
	}
}
////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Excuse Exempt Request from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processExcuseExempt(ivrRequest) {
	try {
	    excuseExemptJSON = {"jurorID":ivrRequest.InputVars.jurorID,"reasonCode":ivrRequest.InputVars.reasonCode,"requestType":ivrRequest.InputVars.reasonType};
		data = JSON.stringify(excuseExemptJSON);
		logger.write("Input to AJ for method processExcuseExempt"+data);

	   var requestOptions = {
					  host : configData.host, 
					  port : configData.port,
					  path : configData.excuseExemptPath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					};
									  
					var excuseExemptRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processExcuseExempt'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=processexcuseexempt;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
											
					excuseExemptRequest.on('error', function(e) {
					  logger.write('problem with request for processExcuseExempt : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=processexcuseexempt;
					  sendResponse(returnedJSON,ivrRequest);
					});
					excuseExemptRequest.write(data);
                    excuseExemptRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processExcuseExempt : ' + e.message);
	}
}
////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Outbound Notification Request from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////	
function processOutboundNotification(ivrRequest) {
	try {
	   var requestOptions = {
					    host : configData.host, 
					    port : configData.port,
					    path : configData.outboundNotificationPath,
					    method : configData.method,headers: {'Content-Type': configData.contentType}
					};
									  
					var outboundNotificationRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										var data = "";
										res.on('data', function(d) {
                                            notificationState = req;
											logger.write("notificationState = "+notificationState);
											data+=d.toString();									
									}); 
										res.on('end', function () {
											logger.write('processOutboundNotification'+data);
										    var returnedJSON = JSON.parse(data);
											notificationData = returnedJSON;                                           											
											returnedJSON.resMethod=outboundnotification;
											sendResponse(returnedJSON,ivrRequest);												   
											});
									
                        });
											
					  outboundNotificationRequest.on('error', function(e) {
					  logger.write('problem with request for processOutboundNotification : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=outboundnotification;
					  sendResponse(returnedJSON,ivrRequest);
					});
					
                    outboundNotificationRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processOutboundNotification : ' + e.message);
	}
}

function processGetOutboundNotification(ivrRequest){
	try {
	logger.write('entering processGetOutboundNotification  ' );
	var data={"notificationCount":ivrRequest.InputVars.notificationCount,"resMethod":getoutboundnotification};
    var returnedJSON= data;
	outputGetOutboundNotification(returnedJSON,ivrRequest);	
	} catch(e){
	logger.write('error in the function processGetOutboundNotification : ' + e.message); 
	}
}
////////////////////////////////////////////////////////////////////////////////////////
//  Method Process Work Certificate from Agile Jury                                 
////////////////////////////////////////////////////////////////////////////////////////
function processWorkCertificate(ivrRequest) {
	try {
	    workcertificateJSON = {"jurorID":ivrRequest.InputVars.jurorID};
		data = JSON.stringify(workcertificateJSON);
		console.log(workcertificateJSON);
		console.log(data);
	    var requestOptions = {
			         // host : '192.168.5.126', 
					// port : '80', 
					//  path : '/rest/ivr/jurorinfo', 
					  host : configData.host, 
					  port : configData.port,
					  path : configData.workcertificatePath,
					  method : configData.method,
					  headers: {
									'Content-Type': configData.contentType,
									'Content-Length': data.length
										  }
					  //rejectUnauthorized : false;// charset=utf-8;
					};
					
					var workcertificateRequest = http.request(requestOptions, function handleResponse(res) {
										res.setEncoding('utf8');
										res.on('data', function(d) {
										logger.write('processWorkCertificate'+d);										
										var  returnedJSON = JSON.parse(d);
										returnedJSON.resMethod=processworkcertificate;
										sendResponse(returnedJSON,ivrRequest);										
									});            								
                        });
						
					
					
					workcertificateRequest.on('error', function(e) {
					  logger.write('problem with request for processworkcertificate : ' + e.message);
					  var returnedJSON = {}
					  returnedJSON.status='WITH_ERROR';
					  returnedJSON.errorCode='5555';
					  returnedJSON.resultCode='5555';					  
					  returnedJSON.resultMessage=e.message;
					  returnedJSON.resMethod=processworkcertificate;
					  sendResponse(returnedJSON,ivrRequest);
					});
					workcertificateRequest.write(data);
                    workcertificateRequest.end();
					
	 } catch(e) {	 
	 logger.write('error in the function processworkcertificate : ' + e.message);
	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the juror info output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
outputJurorInfo =function outputJurorInfo(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};	
				if(returnedJSON.status == "OK"){
					ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
					ivrRequest.ivrResponse.OutputVars.dob = returnedJSON.jurorInformation.dob || emptyString;
					ivrRequest.ivrResponse.OutputVars.nameFirst = returnedJSON.jurorInformation.nameFirst || emptyString;
					var firtname=returnedJSON.jurorInformation.nameFirst || emptyString;
					ivrRequest.ivrResponse.OutputVars.nameFirstInitial = firtname.substring(0,1);
					ivrRequest.ivrResponse.OutputVars.nameLast = returnedJSON.jurorInformation.nameLast || emptyString;
					ivrRequest.ivrResponse.OutputVars.nameMiddle = returnedJSON.jurorInformation.nameMiddle || emptyString;
					ivrRequest.ivrResponse.OutputVars.nameSuffix = returnedJSON.jurorInformation.nameSuffix || emptyString;
					ivrRequest.ivrResponse.OutputVars.personStatus = returnedJSON.jurorInformation.personStatus || emptyString;
					ivrRequest.ivrResponse.OutputVars.reportingStatus = returnedJSON.jurorInformation.reportingStatus || emptyString;
					ivrRequest.ivrResponse.OutputVars.reportingAtAfter = returnedJSON.jurorInformation.reportingAtAfter || emptyString;
					
					var reportingDate =returnedJSON.jurorInformation.reportingDate || emptyString;
					if(reportingDate){
					reportingDate=formatDateString(reportingDate);
					}
					ivrRequest.ivrResponse.OutputVars.reportingDate = reportingDate;
					
					var reportingTime =returnedJSON.jurorInformation.reportingTime || emptyString;
					if(reportingTime){
					reportingTime=formatTimeString(reportingTime);
					}
					ivrRequest.ivrResponse.OutputVars.reportingTime = reportingTime;				
					ivrRequest.ivrResponse.OutputVars.courtLocationCode = returnedJSON.jurorInformation.courtLocationCode || emptyString;
					ivrRequest.ivrResponse.OutputVars.courtLocationName = returnedJSON.jurorInformation.courtLocationName || emptyString;
					ivrRequest.ivrResponse.OutputVars.street = returnedJSON.jurorInformation.street || emptyString;
					ivrRequest.ivrResponse.OutputVars.street2 = returnedJSON.jurorInformation.street2 || emptyString;
					ivrRequest.ivrResponse.OutputVars.city = returnedJSON.jurorInformation.city || emptyString;
					ivrRequest.ivrResponse.OutputVars.state = returnedJSON.jurorInformation.state || emptyString;
					ivrRequest.ivrResponse.OutputVars.zipCode = returnedJSON.jurorInformation.zipCode || emptyString;
					ivrRequest.ivrResponse.OutputVars.serviceStartDate = returnedJSON.jurorInformation.serviceStartDate || emptyString;
					ivrRequest.ivrResponse.OutputVars.serviceEndDate = returnedJSON.jurorInformation.serviceEndDate || emptyString;
					ivrRequest.ivrResponse.OutputVars.lastPaymentAmount = returnedJSON.jurorInformation.lastPaymentAmount || emptyString;
					ivrRequest.ivrResponse.OutputVars.lastPaymentDate = returnedJSON.jurorInformation.lastPaymentDate || emptyString;
					ivrRequest.ivrResponse.OutputVars.lastMileage = returnedJSON.jurorInformation.lastMileage || emptyString;
					ivrRequest.ivrResponse.OutputVars.bioComplete = returnedJSON.jurorInformation.bioComplete ? boolTrue:boolFalse;
					ivrRequest.ivrResponse.OutputVars.pendingReview = returnedJSON.jurorInformation.pendingReview ? boolTrue:boolFalse;
					ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
					ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.jurorID =emptyString;
						ivrRequest.ivrResponse.OutputVars.dob =emptyString;
						ivrRequest.ivrResponse.OutputVars.nameLast=emptyString;
						ivrRequest.ivrResponse.OutputVars.nameFirstInitial=emptyString;
						ivrRequest.ivrResponse.OutputVars.nameFirst=emptyString;
						ivrRequest.ivrResponse.OutputVars.nameMiddle=emptyString;
						ivrRequest.ivrResponse.OutputVars.nameSuffix=emptyString;
						ivrRequest.ivrResponse.OutputVars.personStatus=emptyString;
						ivrRequest.ivrResponse.OutputVars.reportingStatus=emptyString;
						ivrRequest.ivrResponse.OutputVars.reportingAtAfter=emptyString;
						ivrRequest.ivrResponse.OutputVars.reportingDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.reportingTime=emptyString;
						ivrRequest.ivrResponse.OutputVars.courtLocationCode=emptyString;
						ivrRequest.ivrResponse.OutputVars.courtLocationName=emptyString;
						ivrRequest.ivrResponse.OutputVars.street=emptyString;
						ivrRequest.ivrResponse.OutputVars.street2=emptyString;
						ivrRequest.ivrResponse.OutputVars.city=emptyString;
						ivrRequest.ivrResponse.OutputVars.state=emptyString;
						ivrRequest.ivrResponse.OutputVars.zipCode=emptyString;
						ivrRequest.ivrResponse.OutputVars.serviceStartDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.serviceEndDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.lastPaymentAmount=emptyString;
						ivrRequest.ivrResponse.OutputVars.lastPaymentDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.lastMileage=emptyString;
						ivrRequest.ivrResponse.OutputVars.bioComplete=emptyString;
						ivrRequest.ivrResponse.OutputVars.pendingReview=emptyString;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputJurorInfo : ' + e.message);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the postponement info output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputPostponementInfo(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};
				if(returnedJSON.status == "OK"){
						var reportingDate = returnedJSON.jurorInformation.reportingDate || emptyString;
							if(reportingDate){
								reportingDate=formatDateString(reportingDate);
							}
						ivrRequest.ivrResponse.OutputVars.reportingDate = reportingDate;
						
						var postponeEligible = returnedJSON.jurorInformation.postponeEligible || emptyString;
							if (postponeEligible == 'Yes')
								{postponeEligible=boolTrue;
								}						
							else if(postponeEligible == 'No')
								{postponeEligible=boolFalse;
								}						
						ivrRequest.ivrResponse.OutputVars.postponeEligible = postponeEligible;
						
						var calculatedPostponeDates=[];
						calculatedPostponeDates=returnedJSON.jurorInformation.calculatedPostponeDates;
							
						if (calculatedPostponeDates.length == 3){
							var calculatedPostponeDates1 = calculatedPostponeDates[0]|| emptyString;
							if(calculatedPostponeDates1){
								calculatedPostponeDates1=formatDateString(calculatedPostponeDates1);
							}
							
							var calculatedPostponeDates2 = calculatedPostponeDates[1]|| emptyString;
							if(calculatedPostponeDates2){
								calculatedPostponeDates2=formatDateString(calculatedPostponeDates2);
							}
							
							var calculatedPostponeDates3 =calculatedPostponeDates[2]|| emptyString;
							if(calculatedPostponeDates3){
								calculatedPostponeDates3=formatDateString(calculatedPostponeDates3);
							}
							
							ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates1 = calculatedPostponeDates1;
							ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates2 = calculatedPostponeDates2;
							ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates3 = calculatedPostponeDates3;							
						}else{
						    ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates1 = emptyString;
							ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates2 = emptyString;
							ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates3 = emptyString;
						}	
							
							var str= returnedJSON.jurorInformation.postponeIneligibleReason || emptyString ;
							
						if (str){
							var postponeIneligibleReason=str.slice(-1);
							ivrRequest.ivrResponse.OutputVars.postponeIneligibleReason = postponeIneligibleReason;
								switch(postponeIneligibleReason){
									case "1":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="Too Close to Service Date";
									break;
									
									case "2":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="Max Postponement Exceeded";
									break;
									
									case "3":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="Beyond 365 days from Summons Date";
									break;
									
									case "4":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="Attendance Limit reached";
									break;
									
									case "5":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="FTA Limit reached";
									break;
									
									case "6":									
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="Juror already has a request in pending review status";
									break;
								
									default:
										ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="";
										logger.write('postponement Ineligible Reason is incorrect');
									break;	
							}
						}	else { ivrRequest.ivrResponse.OutputVars.postponeIneligibleReason = str; 
								   ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage="";
						}							
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;
						
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.reportingDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.postponeEligible=emptyString;
						ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates1 = emptyString;
						ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates2 = emptyString;
						ivrRequest.ivrResponse.OutputVars.calculatedPostponeDates3 = emptyString;
						ivrRequest.ivrResponse.OutputVars.postponeIneligibleReasonMessage= emptyString;
						ivrRequest.ivrResponse.OutputVars.postponeIneligibleReason = emptyString;						
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputPostponementInfo : ' + e.message);
		}
	}	
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the postponement confirmation output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputPostponementConfirmation(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};	
                if(returnedJSON.status == "OK"){				
						ivrRequest.ivrResponse.OutputVars.postponeStatus = returnedJSON.jurorInformation.postponeStatus || emptyString;
						
						var postponedDate =returnedJSON.jurorInformation.postponedDate || emptyString;
						if(postponedDate){
						postponedDate=formatDateString(postponedDate);
						}
						
						ivrRequest.ivrResponse.OutputVars.postponedDate = postponedDate;
						ivrRequest.ivrResponse.OutputVars.poolID = returnedJSON.jurorInformation.poolID || emptyString;
						ivrRequest.ivrResponse.OutputVars.groupID = returnedJSON.jurorInformation.groupID || emptyString;				
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;	
						
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.postponeStatus=emptyString;
						ivrRequest.ivrResponse.OutputVars.postponedDate=emptyString;
						ivrRequest.ivrResponse.OutputVars.poolID=emptyString;
						ivrRequest.ivrResponse.OutputVars.groupID=emptyString;
						
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputPostponementConfirmation : ' + e.message);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Qualification output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputProcessQualification(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};
				if(returnedJSON.status == "OK"){
						ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
						ivrRequest.ivrResponse.OutputVars.qualificationStatus = returnedJSON.jurorInformation.qualificationStatus || emptyString;
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;						
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.jurorID=emptyString;
						ivrRequest.ivrResponse.OutputVars.qualificationStatus=emptyString;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputProcessQualification : ' + e.message);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Bio Information output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputProcessBioform(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};	
				if(returnedJSON.status == "OK"){				
						ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
						ivrRequest.ivrResponse.OutputVars.bioformCompletionStatus = returnedJSON.jurorInformation.bioformCompletionStatus || emptyString;
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;						
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.jurorID=emptyString;
						ivrRequest.ivrResponse.OutputVars.bioformCompletionStatus=emptyString;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputProcessBioform : ' + e.message);
		}
	}	
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Bio Information output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputProcessSupplementalBioform(returnedJSON,ivrRequest){
	try{
			ivrRequest.ivrResponse.OutputVars = {};	
			if(returnedJSON.status == "OK"){				
					ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
					ivrRequest.ivrResponse.OutputVars.bioformCompletionStatus = returnedJSON.jurorInformation.bioformCompletionStatus || emptyString;
					ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
					ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;						
			}   else if(returnedJSON.status == "WITH_ERROR") {
					returnedJSON=getErrorCode(returnedJSON);			
					ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
					ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
					ivrRequest.ivrResponse.OutputVars.jurorID=emptyString;
					ivrRequest.ivrResponse.OutputVars.bioformCompletionStatus=emptyString;
				}
			return ivrRequest;
	}catch(e){
			logger.write('Error in the function outputProcessSupplementalBioform : ' + e.message);
	}
}	
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Excuse Exempt methods output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputProcessExcuseExempt(returnedJSON,ivrRequest){
		try{
						ivrRequest.ivrResponse.OutputVars = {};
				if(returnedJSON.status == "OK"){									
						ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
						ivrRequest.ivrResponse.OutputVars.eligibleInd = returnedJSON.jurorInformation.eligibleInd ? boolTrue:boolFalse;
						ivrRequest.ivrResponse.OutputVars.inEligibleReason = returnedJSON.jurorInformation.inEligibleReason || emptyString;
						ivrRequest.ivrResponse.OutputVars.excuseExemptRequestStatus = returnedJSON.jurorInformation.excuseExemptRequestStatus || emptyString;
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;					
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.jurorID=emptyString;
						ivrRequest.ivrResponse.OutputVars.eligibleInd=emptyString;
						ivrRequest.ivrResponse.OutputVars.inEligibleReason=emptyString;
						ivrRequest.ivrResponse.OutputVars.excuseExemptRequestStatus=emptyString;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputProcessExcuseExempt : ' + e.message);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Work Certificate methods output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputWorkCertificate(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};	
				if(returnedJSON.status == "OK"){				
						ivrRequest.ivrResponse.OutputVars.jurorID = returnedJSON.jurorInformation.jurorID || emptyString;
						ivrRequest.ivrResponse.OutputVars.notificationType = returnedJSON.jurorInformation.notificationType || emptyString;
						ivrRequest.ivrResponse.OutputVars.notificationConfirmation = returnedJSON.jurorInformation.notificationConfirmation || emptyString;
						ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
						ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;					
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);			
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
						ivrRequest.ivrResponse.OutputVars.jurorID=emptyString;
						ivrRequest.ivrResponse.OutputVars.notificationType=emptyString;
						ivrRequest.ivrResponse.OutputVars.notificationConfirmation=emptyString;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputWorkCertificate : ' + e.message);
		}
	}	
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Outbound Notification method's output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputOutboundNotification(returnedJSON,ivrRequest){
		try{
				ivrRequest.ivrResponse.OutputVars = {};
				array = [];
				notificationArray =[];
				if(returnedJSON.status == "OK"){
						array =returnedJSON.jurorInformation;				
						for (var i in array)
						{
							notificationArray[i]={};
							notificationArray[i].jurorID = array[i].jurorID || emptyString;
							notificationArray[i].groupID = array[i].groupID || emptyString;
							notificationArray[i].caseID = array[i].caseID || emptyString;
							var phoneNumber = array[i].phoneNumber|| emptyString;
							notificationArray[i].phoneNumber = phoneNumber.replace(/-/g, "");
							
							var reportingDate = array[i].reportingDate || emptyString;
							if(reportingDate){
							reportingDate=formatDateString(reportingDate);
							}													
							notificationArray[i].reportingDate = reportingDate;
							
							var reportingTime = array[i].reportingTime || emptyString;
							if(reportingTime){
							reportingTime=formatTimeString(reportingTime);
							}
							notificationArray[i].reportingTime = reportingTime;
							notificationArray[i].notificationType = array[i].notificationType || emptyString;							
							var jurorDetails={};
							jurorDetails = array[i].jurorDetails;
							notificationArray[i].dob =  jurorDetails.dob || emptyString;
							notificationArray[i].nameFirst = jurorDetails.nameFirst|| emptyString;
							var firtname=jurorDetails.nameFirst|| emptyString;
					        	notificationArray[i].nameFirstInitial = firtname.substring(0,1);
							notificationArray[i].nameLast = jurorDetails.nameLast || emptyString;
							notificationArray[i].nameMiddle = jurorDetails.nameMiddle || emptyString;
							notificationArray[i].nameSuffix = jurorDetails.nameSuffix || emptyString;
							notificationArray[i].personStatus = jurorDetails.personStatus || emptyString;
							notificationArray[i].reportingStatus = jurorDetails.reportingStatus || emptyString;						
							notificationArray[i].courtLocationCode = jurorDetails.courtLocationCode || emptyString;
							notificationArray[i].courtLocationName = jurorDetails.courtLocationName || emptyString;
							notificationArray[i].street = jurorDetails.street || emptyString;
							notificationArray[i].street2 = jurorDetails.street2 || emptyString;
							notificationArray[i].city = jurorDetails.city || emptyString;
							notificationArray[i].state = jurorDetails.state || emptyString;
							notificationArray[i].zipCode = jurorDetails.zipCode || emptyString;
							
							var serviceStartDate = array[i].serviceStartDate || emptyString;
							if(serviceStartDate){
							serviceStartDate=formatDateString(serviceStartDate);
							}		
							notificationArray[i].serviceStartDate = serviceStartDate;
							
							var serviceEndDate = array[i].serviceEndDate || emptyString;
							if(serviceEndDate){
							serviceEndDate=formatDateString(serviceEndDate);
							}							
							notificationArray[i].serviceEndDate = serviceEndDate;
							
							notificationArray[i].reportingAtAfter = jurorDetails.reportingAtAfter || emptyString;
							notificationArray[i].bioComplete = jurorDetails.bioComplete ? boolTrue:boolFalse;
							notificationArray[i].lastPaymentAmount = jurorDetails.lastPaymentAmount || emptyString;
							
							var lastPaymentDate = array[i].lastPaymentDate || emptyString;
							if(lastPaymentDate){
							lastPaymentDate=formatDateString(lastPaymentDate);
							}	
							notificationArray[i].lastPaymentDate = jurorDetails.lastPaymentDate || emptyString;
							notificationArray[i].lastMileage = jurorDetails.lastMileage || emptyString;		
							}
							remainingNotifications = notificationArray.length;
							ivrRequest.ivrResponse.OutputVars.undeliveredNotifications=remainingNotifications;
							console.log("Total Notifications"+remainingNotifications);
							ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
							ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;
							notificationState = available;
							logger.write("notificationState = "+notificationState);
							
				}   else if(returnedJSON.status == "WITH_ERROR") {
						returnedJSON=getErrorCode(returnedJSON);
						notificationArray=[];
						remainingNotifications=0;
						notificationState = idle;
						logger.write("notificationState = "+notificationState);
						ivrRequest.ivrResponse.OutputVars.resultCode=returnedJSON.resultCode;
						ivrRequest.ivrResponse.OutputVars.resultMessage=returnedJSON.resultMessage;
					}
				return ivrRequest;
		}catch(e){
				logger.write('Error in the function outputOutboundNotification : ' + e.message);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Method to format the Get Outbound Notification methods output before sending to CVS
///////////////////////////////////////////////////////////////////////////////////////////////////////
function outputGetOutboundNotification(returnedJSON,ivrRequest){
		try{
				logger.write("entering outputGetOutboundNotification");	
				ivrRequest.ivrResponse.OutputVars = {};	
				var arraylength = Number(returnedJSON.notificationCount);
				ivrRequest.ivrResponse.OutputArray =[];				
				var outputNotification=0;
				if (remainingNotifications>arraylength){var	outputNotification=remainingNotifications-arraylength;}
				var j=0;
				
				for (i=remainingNotifications-1;i>=outputNotification;i--)
				{	function sendNotification(num1,num2){
					ivrRequest.ivrResponse.OutputArray[num2]=notificationArray[num1];
					//logger.write(" num1-i ="+num1+" num2-j "+num2);
					}
					sendNotification(i,j);
					function incCount(count){ 
					//logger.write("incCount"+count);
					var incCount=count+1;
					return incCount;
					//logger.write("incCount"+incCount);
					}
					j=incCount(j);
					//logger.write("j ="+j);
				}
				remainingNotifications=	outputNotification;					
				
				if(remainingNotifications==0){
				notificationArray=[];
				notificationState=idle;
				}
				
				logger.write("Returning Array: "+ JSON.stringify(ivrRequest.ivrResponse.OutputArray));					
				//logger.write("remainingNotifications"+remainingNotifications);					
				ivrRequest.ivrResponse.OutputVars.resultCode=resultCodePass;
				ivrRequest.ivrResponse.OutputVars.resultMessage=emptyString;					
				ivrRequest.ivrResponse.OutputVars.undeliveredNotifications=remainingNotifications;				
				ivrRequest.ivrResponse.ReturnResponse = true;
				
				//ivr.sendIvrResponse(ivrRequest);	

		}catch(e){
				logger.write('Error in the function outputGetOutboundNotification : ' + e.message);
		};
		
		logger.write("Leaving outputGetOutboundNotification");	
		
	}	
	
function getErrorCode(responseObject){
	try{
		var error = responseObject.errorCode || emptyString;
		switch (error) {
			case 'IVR_ERR_001':
			      responseObject.resultCode="1";
				  responseObject.resultMessage="The combination of Juror ID and DOB does not exist in AgileJury";
			break;
			
			case 'IVR_ERR_002':
			      responseObject.resultCode="2";
				  responseObject.resultMessage="Date is in format other than MMDDYYYY";
			break;
			
			case 'IVR_ERR_003':
			      responseObject.resultCode="3";
				  responseObject.resultMessage="Juror ID sent by IVR is null";			     
			break;
			
			case 'IVR_ERR_004':
			      responseObject.resultCode="4";
				  responseObject.resultMessage="Date sent by IVR is null";				      
			break;
			
			case 'IVR_ERR_005':
			      responseObject.resultCode="5";
				  responseObject.resultMessage="Juror ID sent by IVR size is greater than 9";				      
			break;
			
			case 'IVR_ERR_006':
			      responseObject.resultCode="6";
				  responseObject.resultMessage="Error while processing get juror information";				     
			break;
			
			case 'IVR_ERR_007':
			      responseObject.resultCode="7";
				  responseObject.resultMessage="Error while processing postponement request";				      
			break;
			
			case 'IVR_ERR_008':
			      responseObject.resultCode="8";
				  responseObject.resultMessage="Error while processing postponement confirmation";				      
			break;

			case 'IVR_ERR_009':
			      responseObject.resultCode="9";
				  responseObject.resultMessage="Juror id provided by IVR not found in AgileJury";				  
			break;
			
			case 'IVR_ERR_010':
			      responseObject.resultCode="10";
				  responseObject.resultMessage="Juror id provided by IVR is currently not in pool or Juror id is not active in the current pool";				  
			break;
			
			case 'IVR_ERR_011':
			 	  responseObject.resultCode="11";
				  responseObject.resultMessage="Error while getting address of the Juror id send by IVR";	 
			break;
			
			case 'IVR_ERR_012':
			      responseObject.resultCode="12";
				  responseObject.resultMessage="Error while getting attendance of the Juror id send by IVR";	
			break;
			
			case 'IVR_ERR_013':
			      responseObject.resultCode="13";
				  responseObject.resultMessage="Internal processing error while generating report for mail attachment";				  
			break;
			
			case 'IVR_ERR_014':
			      responseObject.resultCode="14";
				  responseObject.resultMessage="Internal processing error while processing work certificate request notification";				  
			break;
			
			case 'IVR_ERR_015':
			      responseObject.resultCode="15";
				  responseObject.resultMessage="No attendance record for this juror";				  
			break;
			
			case 'IVR_ERR_016':
			      responseObject.resultCode="16";
				  responseObject.resultMessage="IVR qualification questionnaire not found in AgileJury or Juror is not eligible to get the qualification questionnaire.";				  
			break;
			
			case 'IVR_ERR_017':
			      responseObject.resultCode="17";
				  responseObject.resultMessage="A question key sent by IVR cannot be found in AgileJury.";				  
			break;
			
			case 'IVR_ERR_018':
			      responseObject.resultCode="18";
				  responseObject.resultMessage="A question response sent by IVR cannot be found in AgileJury.";				  
			break;
			
			case 'IVR_ERR_019':
			      responseObject.resultCode="19";
				  responseObject.resultMessage="Internal processing error has occurred during processing qualification information";				  
			break;
			
			case 'IVR_ERR_020':
			      responseObject.resultCode="20";
				  responseObject.resultMessage="Internal processing error has occurred during processing excuse/exempt information";				  
			break;
			
			case 'IVR_ERR_021':
			      responseObject.resultCode="21";
				  responseObject.resultMessage="Excuse/exempt reason code send is not found in Agilejury.";				  
			break;
			
			case 'IVR_ERR_022':
			      responseObject.resultCode="22";
				  responseObject.resultMessage="IVR bio form questionnaire not found in AgileJury.";				  
			break;
			
			case 'IVR_ERR_023':
			      responseObject.resultCode="23";
				  responseObject.resultMessage="Internal processing error has occurred during processing bio form information";				  
			break;
			
			case 'IVR_ERR_024':
			      responseObject.resultCode="24";
				  responseObject.resultMessage="Internal Processing Error while processing out bound notifications.";				  
			break;
			
			case 'IVR_ERR_025':
			      responseObject.resultCode="25";
				  responseObject.resultMessage="Juror is not in Qualified Status";				  
			break;
			
			case 'IVR_ERR_026':
			      responseObject.resultCode="26";
				  responseObject.resultMessage="Outbound notifications not found in AgileJury";				  
			break;
			
			case 'IVR_ERR_500':
			      responseObject.resultCode="500";
				  responseObject.resultMessage="Internal Processing Error in AgileJury";				  
			break;
			
			case '5555':
			break;
			
			default:
				 responseObject.resultCode="1111";	
				 responseObject.resultMessage="Unexpected error from Agile Jury";
			  if (logToConsole) {
				console.log(getTimeString() + 'getErrorCode has unexpected error from Agile Jury: ' + error );
			  }; 
			break;
		}
		return responseObject;
    }catch(e){
		logger.write('Error in the function getErrorCode : ' + e.message);
	}
}
function formatPhoneNo(phoneNo){
phoneNo=phoneNo.substr(0,3) + '-' + phoneNo.substr(3, 3) + '-' + phoneNo.substr(6);
return phoneNo;
}
function formatDateString(date){
date = date.substr(0,2)+'/'+date.substr(2,2)+'/'+date.substr(4);
return date;
}
function formatTimeString(time){
var hour = time.substr(0,2);
var minutes = time.substr(3,2);
var clock = (time.substr(9)).toUpperCase();

if (clock=="PM"){
	if((Number(hour))!= 12){
		var hour1 = Number(hour)+12;
		hour = hour1.toString();
	}
}

time1 = hour +":"+minutes;
return time1;
}

