var http = require('http');
var https = require('https');
var url = require('url');
var env = require('dotenv').config();
var AWS = require('aws-sdk');



const port = process.env.PORT || 5000;
//console.log(process.env.GAME);


// copyright 2018 Neuion by chukwudi udoka
//

AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.S3_KEY
AWS.config.secretAccessKey = process.env.S3_SECRET;
var safetrekpin = process.env.safe_trekpin;
var safetrek_clientid = process.env.safetrek_clientid;
var safetrek_clientsecret = process.env.safetrek_clientsecret;
var refreshtoken = process.env.safetrek_refreshtoken;


// This add add a s3 sdk object to the project
var s3 = new AWS.S3();

var params = {Bucket: "firesmartdemodb",Key: 'defaultdabase.json'};


// set the server to accept only json request

var puserdata = null;
var formalrequesttype = null;

var accesstoken="";

const server = http.createServer(function (req,res) {


    var requestdata = '';

    var requestdatatest = '';



    var advancedverifcareq = false ; // this is used to check if the advanced validation acess required

    var startvalidation = false; // this is used to check if the the validtaion should be started , that is the http request parameters ahve been validated

    var jsonuserresponse = null; // After the response

    var responseready = false;

    var reqtype = null;




    if(req.method=='POST')
    {
        reqtype = false;
    }

    if(req.method=='GET')
    {
        reqtype = true;
    }


    req.on('data', chunk => {
        requestdatatest += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {

        //The function is called  when the sever finishing converting the buffer to string and the http headers are fully received
        startprocessing();
    });

    function startprocessing() {

        // This defines the routh path for the server
        // it process the request to give to the server


        if (req.url == "/") {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end('{"Connected":"server is working !! , use post to make a request "}');
            //req.connection.destroy();
        }
        else if (req.url == '/access/') {
            formalrequesttype = "access";
            startvalidation = true;
        }
        else if (req.url.toString() == "/insert/") {


            startvalidation = true;
            formalrequesttype = "insert";
            advancedverifcareq = true;
        }
        else if (req.url == "/action/") {
            startvalidation = true;
            formalrequesttype = "action";
            advancedverifcareq = true;
        }
        else
        {
            var query  = url.parse(req.url,true);
            var modes = query.query;
            if(typeof modes.userkey === 'undefined' || typeof modes.requesttype === 'undefined')
            {
                responseready = true;
                sendanswer(99,"userkey has to be defined");
            }
            else
            {

            if(modes.type == "access")
            {

                formalrequesttype = "access";
                requestdata = '{"userkey":"' + modes.userkey + '","requesttype":"' + modes.requesttype + '"}';
                puserdata = JSON.parse(requestdata);
                responseready = true;
                procesuserjsonrequest();

            }
            else if(modes.type == "insert")
            {
                if(typeof modes.uservalue === 'undefined')
                {
                    responseready = true;
                    sendanswer(99,"uservalue has to be defined");
                }
                else
                {
                    formalrequesttype = "insert";
                    requestdata = '{"userkey":"' + modes.userkey + '","requesttype":"' + modes.requesttype + '","uservalue":"' + modes.uservalue + '"}';
                    puserdata = JSON.parse(requestdata);
                    responseready = true;
                    procesuserjsonrequest();
                }

            }
            else if (modes.type == "action")
            {
                if(typeof modes.uservalue === 'undefined')
                {
                    responseready = true;
                    sendanswer(99,"uservalue has to be defined");
                }
                else {
                    formalrequesttype = "action";
                    requestdata = '{"userkey":"' + modes.userkey + '","requesttype":"' + modes.requesttype + '","uservalue":"' + modes.uservalue + '"}';
                    puserdata = JSON.parse(requestdata);
                    responseready = true;
                    procesuserjsonrequest();
                }


            }
            else
            {
                responseready = true;
                sendanswer(99,"invalid url");
            }
            }

        }




        if (startvalidation) {
            if (requestdatatest.length == 0) {
                if(reqtype)
                {

                    requestdata = '{"userkey":"wfwrgegttrhrthr","requesttype":"cancelalarm","uservalue":"off","useraddress":{"line":"wfwrgegttrhrthr","city":"fverge","userstate":"wfwrgegttrhrthr","zipcode":"address"},"cancelalarm":"false"}';
                }
                else {
                    console.log('Default');
                    requestdata = '{"userkey":"wfwrgegttrhrthr","requesttype":"cancelalarm","uservalue":"off","useraddress":{"line":"wfwrgegttrhrthr","city":"fverge","userstate":"wfwrgegttrhrthr","zipcode":"address"},"cancelalarm":"false"}';
                }
            }
            else {
                console.log("userset");
                requestdata = requestdatatest;
            }


            var validationcode = extractjsondata(requestdata);


            // check if the code is validated
            if (validationcode == 99) {
                jsonuserresponse = '{"error":"There is a problem with your key or the type of request you want to make "}';
                responseready = true;
                sendanswer(99,jsonuserresponse);
            }
            else {
                // take the json data for user validation
                if (advancedverifcareq) {

                    var goahead = advanceduservalidation(puserdata); //bypass this function if its just access

                    if (goahead == 11) {
                        responseready = true;
                        procesuserjsonrequest();

                    }
                    else {
                        jsonuserresponse = '{"error":"There is a problem with your json values maybe there is one of them is missing or misspelt "}'
                        responseready = true;
                        sendanswer(99,jsonuserresponse);
                    }
                }
                else {
                    // if advanced validation is required pocess the request
                    //console.log("this is the post dat " + requestdatatest.toString());
                    responseready = true;
                    procesuserjsonrequest();


                }

            }
        }


        function getdatafromaws()
        {
            //this data gets result from aws

        }


        function procesuserjsonrequest()
        {
            // this codes checks wants the user wants from the database and returns the result
            // this should be a client call to amazon aws or redis service in which json file is downloaded as a string and parsed

            //var s3 = new AWS.S3();
            var currentdata = "";
            var result = "";

            s3.getObject(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    console.log("bad");
                    result = "couldnt connect to aws";
                    sendanswer(99,result);
                }
                else {
                    currentdata = JSON.parse(data.Body.toString());
                    if(formalrequesttype=="access")
                    {
                        // reads data

                        result = '{"temperature":"' + currentdata.temperature + '","alarmstatus":"' + currentdata.alarmstatus + '"}';
                        sendanswer(11,result);

                    }

                    else if(formalrequesttype=="insert")
                    {
                        if(puserdata.requesttype=="temperature")
                        {
                            currentdata.temperature=puserdata.uservalue;
                            s3.putObject({Bucket: 'firesmartdemodb',Key: 'defaultdabase.json',Body: JSON.stringify(currentdata), ContentType: "application/json"},
                                function(err,data){
                                    if(err)
                                    {
                                        sendanswer(99,"could not connect to amazon aws");
                                    }
                                    else
                                    {
                                        result = '{"value":"11"}';
                                        sendanswer(11,result);
                                    }
                                });

                        }
                        else if(puserdata.requesttype=="alarmstatus")
                        {
                            currentdata.alarmstatus=puserdata.uservalue;
                            s3.putObject({Bucket: 'firesmartdemodb',Key: 'defaultdabase.json',Body: JSON.stringify(currentdata), ContentType: "application/json"},
                                function(err,data){
                                    if(err)
                                    {
                                        sendanswer(99,"could not connect to amazon aws");
                                    }
                                    else
                                    {
                                        result = '{"value":"11"}';
                                        sendanswer(11,result);
                                    }
                                });
                        }
                        else if(puserdata.requesttype=="address")
                        {
                            currentdata.useraddress.line=puserdata.useraddress.line;
                            currentdata.useraddress.city=puserdata.useraddress.city;
                            currentdata.useraddress.userstate=puserdata.useraddress.userstate;
                            currentdata.useraddress.zipcode=puserdata.useraddress.zipcode;

                            s3.putObject({Bucket: 'firesmartdemodb',Key: 'defaultdabase.json',Body: JSON.stringify(currentdata), ContentType: "application/json"},
                                function(err,data){
                                    if(err)
                                    {
                                        sendanswer(99,"could not connect to amazon aws");
                                    }
                                    else
                                    {
                                        result = '{"value":"11"}';
                                        sendanswer(11,result);
                                    }
                                });
                        }

                    }
                    else
                    {
                        if(puserdata.requesttype=="cancelalarm")
                        {
                            currentdata.cancelalarm=puserdata.uservalue;
                            currentdata.alarmstatus="off";
                            s3.putObject({Bucket: 'firesmartdemodb',Key: 'defaultdabase.json',Body: JSON.stringify(currentdata), ContentType: "application/json"},
                                function(err,data){
                                    if(err)
                                    {
                                        sendanswer(99,"could not connect to amazon aws");
                                    }
                                    else
                                    {
                                        refreshapi();

                                    }
                                });

                        }
                        else
                        {
                            //beginalarmcreation();
                            refreshapi()
                        }
                    }


                }

            });

                    // handle when the data is sent

        }

        function sendanswer(inid,data)
        {
            if (responseready) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                req.connection.destroy();
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end('{"error":"an error occured"}');
                req.connection.destroy();
            }
        }

        // create a new access token
        // due to safe trek api oauth2 authentication , an access token is needed every 24 hours, but instead of making extra calls to database
        // this server request new refresh token everytime to get new token
        function refreshapi()
        {
            var requestfornewaccestoken = '{"grant_type" : "refresh_token" , "client_id":"' + safetrek_clientid + '", "client_secret":"' + safetrek_clientsecret + '", "refresh_token":"' + refreshtoken + '"}';
            requestaccestoken(requestfornewaccestoken);
        }

        function requestaccestoken(builtrequest)
        {

            // build the header of the post request
            var headermessages = {
                host : "login-sandbox.safetrek.io",
                port : "443",
                path : "/oauth/token",
                method : "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(builtrequest)
                }

            }

            var sendrequest = https.request(headermessages, function(res) {
                res.setEncoding('utf8');

                res.on('data', function (chunk) {

                    // when data has started coming in

                    var tempx = JSON.parse(chunk);
                    console.log("The access token has been retrieved");
                    accesstoken = tempx.access_token

                    // after the accestoken has been received , move unto other part based on what the request wants to do


                    if(puserdata.requesttype=="cancelalarm")
                    {
                        buildupdaterequest();
                    }
                    else
                    {
                        // this calls the function to create new alarm
                        beginalarmcreation();

                    }


                });



                res.on('error', function (e){
                    sendanswer(99,"there was a problem with getting an error token ");
                    console.log(e.message);
                    console.log("Error , access token could not gotten from safe trek api ");
                });

            });


            sendrequest.write(builtrequest);
            sendrequest.end();
        }



        //


        // reply the client with response
        //make sure the result is ready because of the callback chain

        // Beginning of create alarm
        function beginalarmcreation()
        {
            s3.getObject(params, function (err, data) {
                if (err) {

                    // an error occurred;
                    console.log(err, err.stack);
                    console.log("call to s3 bucket could not initiate ");
                    usercode = 99;
                }
                else {
                    //console.log("Successfully connected to s3 buckets");
                    // The user inofrmation is gotten from the s3 bucket , which contains json data of user address, zip code and info contained in a typical addresss
                    var datatosend = JSON.parse(data.Body.toString());
                    buildrequest(datatosend);

                }
            })
        }
        function buildrequest(jsondata)
        {
            // this builds the json formart required to build an alarm in safetrek api

            var data = JSON.stringify({
                "services": {
                    "police": false,
                    "fire": true,
                    "medical": false
                },
                "location.address": {
                    "line1": jsondata.useraddress.line,
                    "line2": "",
                    "city": jsondata.useraddress.city,
                    "state": jsondata.useraddress.userstate,
                    "zip":  jsondata.useraddress.zipcode,
                }
            })

            SendDatatoSafeTrek(data);
        }


        function SendDatatoSafeTrek(builtrequest)
        {
            // The function senddatatosafetrek api , builds a post request from the arguemnts and sends it to 911 at safetrek api
            // build the header of the post request
            var headermessages = {
                host : "api-sandbox.safetrek.io",
                port : "443",
                path : "/v1/alarms",
                method : "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(builtrequest),
                    'Authorization' : "Bearer " + accesstoken
                }

            }


            var sendrequest = https.request(headermessages, function(res) {
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    console.log('successfully called 911');
                    saveidtodatabase(chunk);


                });
                res.on('error', function (e){
                    console.log(e.message);
                    console.log("The request was not sent properly , check the headers, make sure the json was formatted well and make sure the right safe trek api are used");
                    sendanswer(99,{"error":"There has been an error connecting to safe trek api "});
                });

            });


            sendrequest.write(builtrequest);
            sendrequest.end();

        }
        function saveidtodatabase(jsonstring)
        {
            // This function takes the json string
            // converts it into a json object
            // gets the id from the parsed json string
            // this currently updates that alarmid.json file and saves the current alarm id to open

            var currentjs = JSON.parse(jsonstring);
            var datas = '{"alarmid":"' + currentjs.id + '"}';
            s3.putObject({Bucket: 'firesmartdemodb',Key: 'alarmid.json',Body: datas, ContentType: "application/json"},
                function(err,data){
                    if(err)
                    {
                        var result = '{"99": "Could not call 911 because alarm would not save to s3 bucket "}';
                        console.log("error saving the alarm details to the s3 bucket ");
                        sendanswer(99,result);
                    }
                    else
                    {
                        var result = '{"11":"Successfully called 911"}';
                        sendanswer(11,result);
                        console.log("saved the alarm id  to the database for future to be cancelled");
                    }
                });


        }



        // the end of create alarm


        // this is the beginning of the coding of cancel alarm proccess

        function buildupdaterequest()
        {
            // The api requires you pass a json data of your alarm status and pin
            var localdata = JSON.stringify({
                "status": "CANCELED",
                "pin":safetrekpin
            })

            s3.getObject({Bucket: "firesmartdemodb",Key: 'alarmid.json'}, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    console.log("bad");
                    usercode = 99;
                    sendanswer(99,{"error":"couldnt connect to aws for some reason we cant say"})
                }// an error occurred
                else {
                    var temp = JSON.parse(data.Body.toString());
                    if(temp.alarmid=="")
                    {
                        sendanswer(11,{"value":"alarm has been canceled"});
                    }
                    else
                    {
                        cancelalarm(temp.alarmid,localdata)
                        console.log(data.Body.toString());
                    }

                }
            })

        }

        function cancelalarm(alaarmid,requestdata)
        {

            // this is the function that sends the data to safe trek (newly noonlight api )
            // The alarm id is gotten from the aws database

            pathtitle = '/v1/alarms/' + alaarmid.toString() + '/status'


            // this builds the options of the api request
            // look up nonlight api reference docs to understand the options being paassd
            var options = {
                host: 'api-sandbox.safetrek.io',
                port: 443,
                path: pathtitle,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': requestdata.length,
                    'Authorization': "Bearer " + accesstoken
                }
            };

            var updaterequest = https.request(options, function(res) {
                res.setEncoding('utf8');

                res.on('data', function (chunk) {

                    // whenn not a 200 response sent , sendanswer (the function that handeled the post request process ) is called
                        console.log(chunk);
                        var result = '{"value":"11"}';
                        sendanswer(11,result);
                        console.log("cancelled");

                });


                res.on('error', function (e){
                    // whenn not a 200 response sent , sendanswer (the function that handeled the post request process ) is called
                    console.log(e.message);
                    var result = '{"value":"99"}';
                    sendanswer(99,result);
                });

            });



            updaterequest.write(requestdata);
            updaterequest.end();

        }

        // this is the end









    }


});



// this gets an arguement of a json data of the user request
// the purpose of this function is to open validate what the user put
function extractjsondata(userdata)
{
    puserdata = JSON.parse(userdata);

    //this function parses the data the server recieves , it uses  javascript json parser
    // then this functions checks if the required fields exist , fields such as key and typedefined

    var keydefined = true;
    var typedefined = true;

    // checks the userkey is defined


    if(puserdata.userkey.toString()==undefined )
    {
        keydefined == false;
    }
    else if(typeof puserdata.requesttype === 'undefined' || puserdata.requesttype.toString()!= "alarmstatus" || puserdata.requesttype.toString()!= "temperature" || puserdata.requesttype.toString()!= "address" || puserdata.requesttype.toString()!= "wifi"  || puserdata.requesttype.toString()!= "cancelalarm" || puserdata.requesttype.toString()!= "call911")
    {
        typedefined== false;
    }
    else
    {

    }

    if(keydefined == true && typedefined == true)
    {
        return 11; // 11 is a code for when the user formatted the input right
    }
    else
    {
        return 99; // 99 is a code for when the user formatted one of the input wrong
    }


}

function advanceduservalidation(userreqjsonobject) {

    if (userreqjsonobject.requesttype.toString() == "temperature") {

        // make sure the temperature value is sent
        // the value of the temperature is stored under the key user.value

        if (userreqjsonobject.uservalue==undefined) {
            return 99;
        }
        else
        {
            return 11;
        }

    }
    else if (userreqjsonobject.requesttype.toString() == "alarmstatus") {
        // make sure the alarm value is sent
        // the value of the alarm is stored under the key
        if (userreqjsonobject.uservalue==undefined) {
            return 99;
        }
        else
        {
            return 11;
        }
    }

    else if (userreqjsonobject.requesttype.toString() == "address") {
        //make sure the address is not empty and validate if the adress details have instatitize
        // the address have must have details of line(street no ) , city , userstte and zipcode
        if (typeof userreqjsonobject.useraddress === 'undefined')
        {

            return 99;
        }
        else
        {
            if(typeof userreqjsonobject.useraddress.line === 'undefined' || typeof userreqjsonobject.useraddress.city === 'undefined' || typeof userreqjsonobject.useraddress.userstate === 'undefined' || typeof userreqjsonobject.useraddress.zipcode === 'undefined')
            {
                return 99;
            }
            else
            {
                return 11;
            }

        }
    }
    else if (userreqjsonobject.requesttype.toString() == "cancelalarm") {
        // make sure the cancel alarm have valeu under uservalue , which can be true or false ;
        if (typeof userreqjsonobject.uservalue === 'undefined') {
            return 99;
        }
        else
        {
            return 11;
        }
    }
    else
    {
        return 99;
    }
}







server.listen(port,() => {
console.log('server running');
});




