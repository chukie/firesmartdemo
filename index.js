var http = require('http');
var https = require('https');
var url = require('url');
var env = require('dotenv').config();
var AWS = require('aws-sdk');



const port = process.env.PORT || 5000;
//console.log(process.env.GAME);


AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.S3_KEY
AWS.config.secretAccessKey = process.env.S3_SECRET;



var s3 = new AWS.S3();

var params = {Bucket: "firesmartdemodb",Key: 'defaultdabase.json'};


// set the server to accept only json request

var puserdata = null;
var formalrequesttype = null;

var accesstoken="";

const server = http.createServer(function (req,res) {


    var requestdata = '';

    var requestdatatest = '';

    //{"userkey":"wfwrgegttrhrthr","requesttype":"temperature"}


    var advancedverifcareq = false ; // this is used to check if the advanced validation acess required

    var startvalidation = false;

    var jsonuserresponse = null;

    var responseready = false;

    var reqtype = null;

    //console.log(req.method);
    //console.log(req.headers);
   // res.statusCode = 200;
   // res.setHeader('Content-Type', 'text/plain');
   // res.end('Hello World\n');


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
        dff();
    });

    function dff() {



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
        function refreshapi()
        {
            var dwd = '{"grant_type" : "refresh_token" , "client_id":"' + process.env.safetrek_clientid + '", "client_secret":"' + process.env.safetrek_clientsecret + '", "refresh_token":"' + process.env.safetrek_refreshtoken + '"}';
            dwfwef(dwd);
        }

        function dwfwef(builtrequest)
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


            var result = "";

            var sendrequest = https.request(headermessages, function(res) {
                res.setEncoding('utf8');

                res.on('data', function (chunk) {

                    var tempx = JSON.parse(chunk);
                    //accesstoken = tempx.acess_token;
                    //console.log( + "yaaaa");
                    console.log("edeed4d4:" + tempx.access_token);
                    accesstoken = tempx.access_token

                    if(puserdata.requesttype=="cancelalarm")
                    {
                        buildupdaterequest();
                    }
                    else
                    {

                    beginalarmcreation();

                    }


                });



                res.on('error', function (e){
                    sendanswer(99,"there was a problem");
                    console.log(e.message);
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
                    console.log(err, err.stack);
                    console.log("bad");
                    usercode = 99;
                }// an error occurred
                else {
                    console.log("calling 911 started");
                    var datatosend = JSON.parse(data.Body.toString());
                    buildrequest(datatosend);

                }
            })
        }
        function buildrequest(jsondata)
        {

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

            console.log("success on stringifying data ");
            SendDatatoSafeTrek(data);
        }



// The function senddatatosafetrek api , builds a post request from the arguemnts and sends it to 911 at safetrek api

        function SendDatatoSafeTrek(builtrequest)
        {

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


            var result = "";

            var sendrequest = https.request(headermessages, function(res) {
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    console.log('successfully called 911');
                    console.log(chunk);
                    saveidtodatabase(chunk);

                    //buildupdaterequest()

                });
                res.on('error', function (e){
                    console.log(e.message);
                    console.log("it is from the error bro");
                });

            });


            sendrequest.write(builtrequest);
            sendrequest.end();

        }
        function saveidtodatabase(jsonstring)
        {
            var currentjs = JSON.parse(jsonstring);
            var datas = '{"alarmid":"' + currentjs.id + '"}';
            s3.putObject({Bucket: 'firesmartdemodb',Key: 'alarmid.json',Body: datas, ContentType: "application/json"},
                function(err,data){
                    if(err)
                    {

                    }
                    else
                    {
                        var result = '{"11":"Successfully called 911"}';
                        sendanswer(11,result);
                        console.log("updated alarm id to current ");
                    }
                });


        }


            // the end of create alarm









    }


});




// this is the beginning of the coding of cancel alarm proccess

function buildupdaterequest()
{
    var localdata = JSON.stringify({
        "status": "CANCELED",
        "pin": "7562"
    })

    s3.getObject({Bucket: "firesmartdemodb",Key: 'alarmid.json'}, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            console.log("bad");
            usercode = 99;
        }// an error occurred
        else {
            var temp = JSON.parse(data.Body.toString());
            if(temp.alarmid=="")
            {

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
    //console.log(id)
    // var result  = JSON.parse(jsondatau);

    //build path for url
    pathtitle = '/v1/alarms/' + alaarmid.toString() + '/status'

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
            console.log(chunk);
            if(res.statusCode===200)
            {
                var result = '{"value":"11"}';
                sendanswer(11,result);
                console.log("cancelled");
            }

        });


        res.on('error', function (e){
            console.log(e.message);
            sendanswer(99,{"value":"99"});
        });

    });



    updaterequest.write(requestdata);
    updaterequest.end();

}

// this is the end





// this gets an arguement of a json data of the user request
// the purpose of this function is to open validate what the user put
function extractjsondata(userdata)
{
    puserdata = JSON.parse(userdata);

    var keydefined = true;
    var typedefined = true;

    // checks the userkey and if the
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
        if (userreqjsonobject.uservalue==undefined) {
            return 99;
        }
    else
    {
            return 11;
    }

    }
    else if (userreqjsonobject.requesttype.toString() == "alarmstatus") {
// make sure the alarm
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
// make sure the alarm
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




