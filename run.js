var querystring = require('querystring');
var https = require('https');


//http.get

//build the fire request in json

var alarmid = "";

var rawjson = JSON.parse('{"latx":455,"long":342}');


var processedjson = buildrequest(rawjson);
SendDatatoSafeTrek(processedjson);



// build Api request using data gotten from the firesmart get request
function buildrequest(jsondata)
{

    var data = JSON.stringify({
        "services": {
            "police": false,
            "fire": true,
            "medical": false
        },
        "location.coordinates": {
            "lat": jsondata.latx,
            "lng": jsondata.long,
            "accuracy": 5
        }
    })


    return data;
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
            'Authorization' : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5FWTBPVVV3TVRSRU5qUTRSVUZDTkVJd01rUTBSVEUwUVRJMFF6ZzRSVGc1T0RBMFJEWXhOUSJ9.eyJodHRwOi8vY2xpZW50LW5hbWUiOiJDT0xMRUdFX0RFVkVMT1BFUl9QUk9HUkFNIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi1zYW5kYm94LnNhZmV0cmVrLmlvLyIsInN1YiI6InNtc3w1YWU0OTZhYWE2ODAzYTkxOTEzNWRiNDYiLCJhdWQiOlsiaHR0cHM6Ly9hcGktc2FuZGJveC5zYWZldHJlay5pbyIsImh0dHBzOi8vc2FmZXRyZWstc2FuZGJveC5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI1MTg0NDE2LCJleHAiOjE1MjUyMjA0MTYsImF6cCI6ImdrMW5GdGJRcjRwQnBKRDByekFwM3ZhU2k1NTVzbTRzIiwic2NvcGUiOiJvcGVuaWQgcGhvbmUgb2ZmbGluZV9hY2Nlc3MifQ.RP0amuwg3vpFdG0_UEBhGppYzRYAk2F8dp972kN0httci5zgo8U1aqcNvGy3AWODRvTiQ5k6ykBeW-_HhzrgY5l8HwUw_W6fxCSBkPgBLd7ODl6u8qd-Bj05BwUCHhbivnAYNACI9qZiO9HTsG7CfP4-zg5Xvf76pf-jXNofZq_wZzQuN3IYwLYETr10UlenJw7UC3rsjp-bO2lRaUbtGhkCdLEUihLyGzrReByeQy9iOXQRpw4SiOcNACWKC4yknIoRipT0DUK3jIT2goQ6RfPX7hmpkYzd4RY_y0tsUd5wmpxH6wmcYs6oDUXGU7qPgWdFohrKU8NLNJhkWnT3aQ"
        }

    }


    var result = "";

    var sendrequest = https.request(headermessages, function(res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            console.log(chunk);
            cancelalarm(chunk,buildupdaterequest());

        });


        res.on('error', function (e){
            console.log(e.message);
        });

    });


    sendrequest.write(builtrequest);
    sendrequest.end();


}


function buildupdaterequest()
{
    var localdata = JSON.stringify({
            "status": "CANCELED",
            "pin": "7562"
    })

    return localdata;

}



function cancelalarm(jsondatau,requestdata)
{
    //console.log(id)
    var result  = JSON.parse(jsondatau);

    //build path for url
    pathtitle = '/v1/alarms/' + result.id.toString() + '/status'

    var options = {
        host: 'api-sandbox.safetrek.io',
        port: 443,
        path: pathtitle,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestdata.length,
            'Authorization' : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5FWTBPVVV3TVRSRU5qUTRSVUZDTkVJd01rUTBSVEUwUVRJMFF6ZzRSVGc1T0RBMFJEWXhOUSJ9.eyJodHRwOi8vY2xpZW50LW5hbWUiOiJDT0xMRUdFX0RFVkVMT1BFUl9QUk9HUkFNIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi1zYW5kYm94LnNhZmV0cmVrLmlvLyIsInN1YiI6InNtc3w1YWU0OTZhYWE2ODAzYTkxOTEzNWRiNDYiLCJhdWQiOlsiaHR0cHM6Ly9hcGktc2FuZGJveC5zYWZldHJlay5pbyIsImh0dHBzOi8vc2FmZXRyZWstc2FuZGJveC5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI1MTg0NDE2LCJleHAiOjE1MjUyMjA0MTYsImF6cCI6ImdrMW5GdGJRcjRwQnBKRDByekFwM3ZhU2k1NTVzbTRzIiwic2NvcGUiOiJvcGVuaWQgcGhvbmUgb2ZmbGluZV9hY2Nlc3MifQ.RP0amuwg3vpFdG0_UEBhGppYzRYAk2F8dp972kN0httci5zgo8U1aqcNvGy3AWODRvTiQ5k6ykBeW-_HhzrgY5l8HwUw_W6fxCSBkPgBLd7ODl6u8qd-Bj05BwUCHhbivnAYNACI9qZiO9HTsG7CfP4-zg5Xvf76pf-jXNofZq_wZzQuN3IYwLYETr10UlenJw7UC3rsjp-bO2lRaUbtGhkCdLEUihLyGzrReByeQy9iOXQRpw4SiOcNACWKC4yknIoRipT0DUK3jIT2goQ6RfPX7hmpkYzd4RY_y0tsUd5wmpxH6wmcYs6oDUXGU7qPgWdFohrKU8NLNJhkWnT3aQ"
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


