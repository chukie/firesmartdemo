var http = require('http');
var https = require('https');
var url = require('url');
var env = require('dotenv').config();
var mysql = require('mysql');
var validation = require("./advusrvalid");


const port = process.env.PORT || 5000;
//console.log(process.env.GAME);



// Declare Keys
//

AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.S3_KEY
AWS.config.secretAccessKey = process.env.S3_SECRET;
var safetrekpin = process.env.safe_trekpin;
var safetrek_clientid = process.env.safetrek_clientid;
var safetrek_clientsecret = process.env.safetrek_clientsecret;
var refreshtoken = process.env.safetrek_refreshtoken;
var dbname = process.env.db_name;
var hostname = process.env.hostname;
var password = process.env.db_password;
var dbusername = process.env.dbusername;


// end of the declaration of keys
var userkey="";
//var database = new calltodatabase();
var database = new calltodatabasewithpool();


// set the server to accept only json request

var puserdata = null;
var formalrequesttype = null;

var accesstoken="";

var  jsondb = null; // this is gotten from db and is stored one , instead being called twice




const server = http.createServer(function (req,res) {

    var requestdata = '';

    var requestdatatest = '';


    var advancedverifcareq = false ; // this is used to check if the advanced validation acess required

    var startvalidation = false; // this is used to check if the the validtaion should be started , that is the http request parameters ahve been validated

    var jsonuserresponse = null; // After the response

    var responseready = false; // this is used when

    var reqtype = null; // the type of request , whether access , action ..etc check docs


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

     async function startprocessing() {

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
            // this is the path that uses get
            var query  = url.parse(req.url,true);
            var modes = query.query;
            if(typeof modes.userkey === 'undefined' || typeof modes.requesttype === 'undefined')
            {
                responseready = true;
                sendanswer(99,'{"value":"99","message":"userkey has to be defined"}');
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
                    sendanswer(99,'{"value":"99","message":"uservalue has to be defined"}');
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
                    sendanswer(99,'{"value":"99","message":"userkey has to be defined"}');
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

                // this is used for when there is no json data sent to the server , the server automatically createsa json , this is used for testing
                    console.log('Testing enviroment initialized');
                    requestdata = '{"userkey":"65","requesttype":"cancelalarm","uservalue":"true","useraddress":{"line":"403 torry avenue","city":"bronx","userstate":"new york","zipcode":"10473"},"cancelalarm":"true"}';

            }
            else {
                console.log("userset");
                requestdata = requestdatatest;
            }


            //var validationcode = extractjsondata(requestdata);

            var validationcode = 0o1;

            // *********  ***  ** The beginnning of async task , the beginning of async Task , The beginning of async Task **************


            puserdata = JSON.parse(requestdata);

            //this function parses the data the server recieves , it uses  javascript json parser
            // then this functions checks if the required fields exist , fields such as key and typedefined

            var keydefined = true;
            var typedefined = true;



            if(!(typeof puserdata.requesttype === 'undefined' || puserdata.requesttype == "alarmstatus" || puserdata.requesttype == "temperature" || puserdata.requesttype== "address" || puserdata.requesttype == "wifi"  || puserdata.requesttype == "cancelalarm" || puserdata.requesttype == "call911"))
            {
                // this checks if the request type is defined in the user json request
                typedefined= false;
            }


            let promise = new Promise((resolve, reject) => {

                if(typeof puserdata.userkey== "undefined")
                {
                    resolve(false);
                }
                else
                {
                    var dbdata = [puserdata.userkey];
                    database.runquery('SELECT * FROM fsusers WHERE userkey=?',dbdata, function (err,results,fields)
                    {
                        // this is the call back for when the query is ran
                        if(err)
                        {
                            resolve(false);
                            console.log(err.message);
                        }
                        else
                        {
                            if(results.length==0)
                            {
                                //keydefined=false;
                                validationcode=99;
                                resolve(false);
                            }
                            else
                            {
                                //console.log(results[0]);
                                resolve(true);
                                jsondb = results[0];
                                userkey=results[0].userkey;

                            }

                        }
                    });
                }




            }  );

            keydefined = await promise; // this means wait for the data to be fetched from the database

            if(keydefined == true && typedefined == true)
            {
                validationcode = 11; // 11 is a code for when the user formatted the input right
            }



            // ************ THE END of async Task block *****


            // check if the code is validated
            if (validationcode == 99 ) {
                jsonuserresponse = '{"error":"There is a problem with your key or the type of request you want to make "}';
                responseready = true;
                sendanswer(99,jsonuserresponse);
            }
            else if(validationcode == 0o1)
            {
                jsonuserresponse = '{"value":"01","message":"Could not connect to the service right now"}';
                responseready = true;
                sendanswer(99,jsonuserresponse);
            }
            else {
                // take the json data for user validation
                if (advancedverifcareq) {

                    //required
                    var goahead = validation.runvalidation(puserdata); //bypass this function if its just access , look at json structure to see why advanced validation is not
                    // required

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
                    // if advanced validation is not required pocess the request
                    //console.log("this is the post dat " + requestdatatest.toString());
                    responseready = true;
                    procesuserjsonrequest();


                }

            }
        }


        function procesuserjsonrequest()
        {
            // this codes checks wants the user wants from the database and returns the result
            // this should be a client call to amazon aws or redis service in which json file is downloaded as a string and parsed

            var result = "";

                    if(formalrequesttype=="access")
                    {
                        // reads data

                        result = '{"temperature":"' + jsondb.Temperature + '","alarmstatus":"' + jsondb.Alarmstatus + '"}';
                        sendanswer(11,result);

                    }
                    else if(formalrequesttype=="insert")
                    {
                        if(puserdata.requesttype=="temperature")
                        {
                            jsondb.Temperature=puserdata.uservalue;
                            var aquery= 'UPDATE fsusers SET Temperature =? WHERE userkey=?';
                            var values = [jsondb.Temperature,userkey];
                            database.runquery(aquery,values,function (err,results,fields) {
                                if(err)
                                {

                                    result = '{"value":"01","message":"could not connect to the service right now "}';
                                    console.log(err.message);
                                    sendanswer(0o1,result);

                                    //throw error;
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
                            jsondb.Alarmstatus=puserdata.uservalue;
                            var aquery= 'UPDATE fsusers SET Alarmstatus =? WHERE userkey=?';
                            var values = [jsondb.Alarmstatus,userkey];
                            database.runquery(aquery,values,function (err,results,fields) {
                                if(err)
                                {
                                    result = '{"value":"01","message":"could not connect to the service right now "}';
                                    console.log(err.message);
                                    sendanswer(0o1,result);
                                    //throw error;
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
                            jsondb.Line=puserdata.useraddress.line;
                            jsondb.City=puserdata.useraddress.city;
                            jsondb.state=puserdata.useraddress.userstate;
                            jsondb.zipcode=puserdata.useraddress.zipcode;

                            var aquery= 'UPDATE fsusers SET Line = ?,City = ?,state = ?,zipcode = ?  WHERE userkey=?';
                            var values = [jsondb.Line,jsondb.City,jsondb.state,jsondb.zipcode,userkey];
                            database.runquery(aquery,values,function (err,results,fields) {
                                if(err)
                                {
                                    result = '{"value":"01","message":"could not connect to the service right now "}';
                                    console.log(err.message);
                                    sendanswer(0o1,result);
                                    //throw error;
                                }
                                else
                                {
                                    result = '{"value":"11"}';
                                    sendanswer(11,result);
                                }


                            });

                        }
                        else
                        {

                        }

                    }
                    else
                    {
                        refreshapi();
                    }



        }

        function sendanswer(inid,data)
        {
            // this is  used to send a response back to the user
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
            var requestfornewaccestoken = '{"grant_type" : "refresh_token" , "client_id":"' + safetrek_clientid + '", "client_secret":"' + safetrek_clientsecret + '", "refresh_token":"' + safetrek_refreshtoken + '"}';
            requestaccestoken(requestfornewaccestoken);
        }

        function requestaccestoken(builtrequest)
        {

            // build the header of the post request
            // ana access tokenhas to be gotten everytime because of the oath2 authentication model
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
                    accesstoken = tempx.access_token;

                    // after the accestoken has been received , move unto other part based on what the request wants to do


                    if(puserdata.requesttype=="cancelalarm")
                    {
                        buildupdaterequest();
                    }
                    else
                    {
                        // this calls the function to create new alarm
                        buildrequest(jsondb);

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



        // Beginning of create alarm

        function buildrequest(jsondata)
        {
            // this builds the json formart required to build an alarm in safetrek api
            // check safetrek api to get aquintted how to format the api

            var data = JSON.stringify({
                "services": {
                    "police": false,
                    "fire": true,
                    "medical": false
                },
                "location.address": {
                    "line1": jsondb.Line,
                    "line2": "",
                    "city": jsondb.City,
                    "state": jsondb.state,
                    "zip":  "10473",
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
                    console.log(chunk);
                    saveidtodatabase(chunk);


                });
                res.on('error', function (e){
                    console.log(e.message);
                    console.log("The request was not sent properly , check the headers, make sure the json was formatted well and make sure the right safe trek api are used");
                    sendanswer(0o1,'{"value":"01","message":"There has been an error connecting to the service"}');
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

            var result;

            var currentjs = JSON.parse(jsonstring);
            var values = [currentjs.id,userkey];

            var bquery= 'INSERT INTO alarms (Alarmid,userkey) VALUES (?,?)';
            database.runquery(bquery,values,function (err,results,fields) {
                if(err){
                    result = '{"value":"01","message":"could not connect to the service right now "}';
                    console.log(err.message);
                    sendanswer(0o1,result);
                }
                else
                {
                    result = '{"value":"11"}';
                    sendanswer(11,result);
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

            // this checks if the alarm still exists else it actually cancels it

            var values = [userkey];
            var result;

            var bquery= 'SELECT Alarmid FROM alarms WHERE userkey = ?';
            database.runquery(bquery,values,function (err,results,fields) {
                if(err){
                    result = '{"value":"01","message":"could not connect to the service right now "}';
                    console.log(err.message);
                    sendanswer(0o1,result);
                }
                else
                {
                    if(results.length==0)
                    {
                        sendanswer(11,'{"value":"22","message":"Successfull"}');
                    }
                    else
                    {
                        cancelalarm(results[0].Alarmid,localdata);
                    }
                }

            });



        }

        function cancelalarm(alaarmid,requestdata)
        {

            // this is the function that sends the data to safe trek (newly noonlight api )
            // The alarm id is gotten from the aws database

            var pathtitle = '/v1/alarms/' + alaarmid.toString() + '/status';


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

                    // When received alarm has been cancelled
                        console.log(chunk);
                        var result = '{"value":"11","message":"Alarm has been canceled"}';
                        sendanswer(11,result);
                        console.log("cancelled");
                        updaterequestindatabase(alaarmid);

                });


                res.on('error', function (e){
                    // whenn not a 200 response sent , sendanswer (the function that handeled the post request process ) is called
                    console.log(e.message);
                    var result = '{"value":"01","message":"Could not reach safe trek api"}';
                    sendanswer(0o1,result);
                });

            });



            updaterequest.write(requestdata);
            updaterequest.end();

        }

        // this is the end
         function updaterequestindatabase(alarmid)
         {
             let localquery = "DELETE FROM alarms WHERE Alarmid=?";
             let values = [alarmid];
             database.runquery(localquery,values,function (err){
                 //short call back
                 if(err)
                 {
                     console.log(err.message);
                 }
                 else
                 {
                     console.log("Alarm deleted");
                 }

             })
         }


    }


});


function calltodatabasewithpool()
{
    // this uses pool options , which saves resources because multiple requests are going to be made with database
    // this is the general mini class/object  we would  use to call to database
    // this uses es5.
    var pool = mysql.createPool({connectionLimit: 10, host: hostname ,database: dbname,user: dbusername , password: password});

    this.runquery = function(userquery,values,callbackf)
    {

        // this uses the shorthand form to create query

        if(values==null)
        {
            pool.query(userquery,callbackf);
        }
        else
        {
            pool.query(userquery,values,callbackf);
        }
    }

}

server.listen(port,() => {
console.log('server running');
});




