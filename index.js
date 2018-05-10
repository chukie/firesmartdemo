http = require('http');
var env = require('dotenv').config();
var AWS = require('aws-sdk');



const port = process.env.PORT || 7000;
//console.log(process.env.access_kedyid);


AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.access_kedyid;
AWS.config.secretAccessKey = process.env.secretaccesskey;



var s3 = new AWS.S3();

var params = {Bucket: "firesmartdemodb",Key: 'defaultdabase.json'};


// set the server to accept only json request

var puserdata = null;
var formalrequesttype = null;

const server = http.createServer(function (req,res) {


    var requestdata = '';

    var requestdatatest = '';

    //{"userkey":"wfwrgegttrhrthr","requesttype":"temperature"}


    var advancedverifcareq = false ; // this is used to check if the advanced validation acess required

    var startvalidation = false;

    var jsonuserresponse = null;

    var responseready = false;

    //console.log(req.method);
    //console.log(req.headers);
   // res.statusCode = 200;
   // res.setHeader('Content-Type', 'text/plain');
   // res.end('Hello World\n');

    /*
    if(req.method=='POST')
    {
        console.log('not a post request');
         res.statusCode = 200;
         res.setHeader('Content-Type', 'text/plain');
         res.end('Hello World\n');
         req.connection.destroy();
    }

    */

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
            req.connection.destroy();
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
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('wrong url , url cannot be found ');
            req.connection.destroy();
        }



        if (startvalidation) {
            if (requestdatatest.length == 0) {
                console.log('Default')
                requestdata = '{"userkey":"wfwrgegttrhrthr","requesttype":"cancelalarm","uservalue":"off","useraddress":{"line":"wfwrgegttrhrthr","city":"fverge","userstate":"wfwrgegttrhrthr","zipcode":"address"},"cancelalarm":"false"}';
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
                //JSON.parse('{"temperature":"67.9","alarmstatus":"off","useraddress":{"line":"403 torry avenue","city":"bronx","userstate":"newyork","zipcode":"10473"},"cancelalarm":"false"}');
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


        // reply the client with response
        //make sure the result is ready because of the callback chain

    }


});


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







server.listen(5000,() => {
console.log('server running');
});




