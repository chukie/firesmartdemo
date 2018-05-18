var querystring = require('querystring');
var https = require('https');
var env = require('dotenv');
var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJBA5SVLFJIVD2CGA";
AWS.config.secretAccessKey = "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";

var s3 = new AWS.S3();

var params = {Bucket: "firesmartdemodb",Key: 'defaultdabase.json'};


var bearer = env.access_key


//http.get

//build the fire request in json

var alarmid = "";

var rawjson = JSON.parse('{"latx":455,"long":342}');


//var processedjson = buildrequest(rawjson);


//buildupdaterequest();

refreshapi();

function refreshapi()
{
 var dwd = '{"grant_type" : "refresh_token" , "client_id": "gk1nFtbQr4pBpJD0rzAp3vaSi555sm4s"  , "client_secret": "eWTSj_izMvD3nBJFXxkRDZF4aXDGKofYRZyzw_31oer31kuoY6-OVDs27nEHJu0B", "refresh_token": "kvWr0ozajMrLBD3PHeSXWrsTJMuYm0GnzvH0w4hubybWE"}';
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
            console.log(chunk);
            //saveidtodatabase(chunk);
            //buildupdaterequest()

        });


        res.on('error', function (e){
            console.log(e.message);
        });

    });


    sendrequest.write(builtrequest);
    sendrequest.end();
}

// build Api request using data gotten from the firesmart get request
/*
s3.getObject(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
        console.log("bad");
        usercode = 99;
    }// an error occurred
    else {
        console.log(data.Body.toString());
        var datatosend = JSON.parse(data.Body.toString());
        buildrequest(datatosend);

    }
})
*/
/*
"line1": "1234 9th Ave",
    "line2": "Unit 302",
    "city": "San Diego",
    "state": "CA",
    "zip": "92101",
    "created_at": "2018-05-16T18:01:50Z"
    */


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
            'Authorization' : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5FWTBPVVV3TVRSRU5qUTRSVUZDTkVJd01rUTBSVEUwUVRJMFF6ZzRSVGc1T0RBMFJEWXhOUSJ9.eyJodHRwOi8vY2xpZW50LW5hbWUiOiJDT0xMRUdFX0RFVkVMT1BFUl9QUk9HUkFNIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi1zYW5kYm94LnNhZmV0cmVrLmlvLyIsInN1YiI6InNtc3w1YWU0OTZhYWE2ODAzYTkxOTEzNWRiNDYiLCJhdWQiOlsiaHR0cHM6Ly9hcGktc2FuZGJveC5zYWZldHJlay5pbyIsImh0dHBzOi8vc2FmZXRyZWstc2FuZGJveC5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI2NDkxNzU1LCJleHAiOjE1MjY1Mjc3NTUsImF6cCI6ImdrMW5GdGJRcjRwQnBKRDByekFwM3ZhU2k1NTVzbTRzIiwic2NvcGUiOiJvcGVuaWQgcGhvbmUgb2ZmbGluZV9hY2Nlc3MifQ.pKRC-htaCj0glgLr-mBntzZLllwx4d4-SinXH3mFvqduJH2VMNq8oQs_DpXs_k9zdIkOhiXCMLQTIFg-N0bPGjBzWCgvaI_7w9h3l0zV62dQcFMGjeATIhP5riyajQbxvwEsq_wL4JPD1xRPznX2ae80e4CTTg6UcCtVRc-Alg8PswYpZA670Vn0jO0a-xQ0iZc-48XrO1xP0LODfKiGFXUFWKVGe3HG76uDZM9LIEdYlr7_nUMcZx_jbCy19aUaX1lNUFNCl8Y-3lMcWIQcL6JVh7LytmQlYSVcgqsZgM3d67Amegi_77aKgim1c9Aa95v0SrnJfI9nE3zA_BJ4mw"
        }

    }


    var result = "";

    var sendrequest = https.request(headermessages, function(res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            console.log(chunk);
            saveidtodatabase(chunk);
            buildupdaterequest()

        });


        res.on('error', function (e){
            console.log(e.message);
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
                console.log("updated alarm id to current ");
            }
        });


}


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
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5FWTBPVVV3TVRSRU5qUTRSVUZDTkVJd01rUTBSVEUwUVRJMFF6ZzRSVGc1T0RBMFJEWXhOUSJ9.eyJodHRwOi8vY2xpZW50LW5hbWUiOiJDT0xMRUdFX0RFVkVMT1BFUl9QUk9HUkFNIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi1zYW5kYm94LnNhZmV0cmVrLmlvLyIsInN1YiI6InNtc3w1YWU0OTZhYWE2ODAzYTkxOTEzNWRiNDYiLCJhdWQiOlsiaHR0cHM6Ly9hcGktc2FuZGJveC5zYWZldHJlay5pbyIsImh0dHBzOi8vc2FmZXRyZWstc2FuZGJveC5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI2NDkxNzU1LCJleHAiOjE1MjY1Mjc3NTUsImF6cCI6ImdrMW5GdGJRcjRwQnBKRDByekFwM3ZhU2k1NTVzbTRzIiwic2NvcGUiOiJvcGVuaWQgcGhvbmUgb2ZmbGluZV9hY2Nlc3MifQ.pKRC-htaCj0glgLr-mBntzZLllwx4d4-SinXH3mFvqduJH2VMNq8oQs_DpXs_k9zdIkOhiXCMLQTIFg-N0bPGjBzWCgvaI_7w9h3l0zV62dQcFMGjeATIhP5riyajQbxvwEsq_wL4JPD1xRPznX2ae80e4CTTg6UcCtVRc-Alg8PswYpZA670Vn0jO0a-xQ0iZc-48XrO1xP0LODfKiGFXUFWKVGe3HG76uDZM9LIEdYlr7_nUMcZx_jbCy19aUaX1lNUFNCl8Y-3lMcWIQcL6JVh7LytmQlYSVcgqsZgM3d67Amegi_77aKgim1c9Aa95v0SrnJfI9nE3zA_BJ4mw"
        }
    };

    var updaterequest = https.request(options, function(res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            console.log(chunk);
            if(res.statusCode===200)
            {
                console.log("cancelled");
            }

        });




        res.on('error', function (e){
            console.log(e.message);
        });

    });

    updaterequest.write(requestdata);
    updaterequest.end();

}


