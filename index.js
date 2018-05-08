http = require('http');
var env = require('dotenv').config();



const port = process.env.PORT || 5000;


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
    req.on('data' , function data(datafromweb){
        requestdata += datafromweb;

    })

    if(req.url=="/")
    {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end('{"Connected":"server is working !! , use post to make a request "}');
        req.connection.destroy();
    }
    else if (req.url=='/access/')
    {
        formalrequesttype = "access";
        startvalidation=true;
    }
    else if (req.url.toString()=="/insert/")
    {


        startvalidation=true;
        formalrequesttype = "insert";
        advancedverifcareq = true;
    }
    else if(req.url=="/action/")
    {
        startvalidation=true;
        formalrequesttype = "action";
        advancedverifcareq = true;
    }
    else
    {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('wrong url , url cannot be found ');
        req.connection.destroy();
    }

    req.on('data' , function data(datafromweb){
        requestdatatest += datafromweb;
        console.log(datafromweb);

    })


    if(startvalidation)
    {
        if(requestdatatest.length==0)
        {
            console.log('BAD BOY')
            requestdata  = '{"userkey":"wfwrgegttrhrthr","requesttype":"address","useraddress":{"line":"wfwrgegttrhrthr","city":"fverge","userstate":"wfwrgegttrhrthr","zipcode":"address"}}';
        }
        else
        {
            console.log("Good boy");
            requestdata = requestdatatest;
        }


        var validationcode = extractjsondata(requestdata);


        // check if the code is validated
        if(validationcode==99)
        {
            jsonuserresponse = '{"error":"There is a problem with your key or the type of request you want to make "}';
            responseready = true;
        }
        else
        {
            // take the json data for user validation
            if(advancedverifcareq)
            {

                var goahead = advanceduservalidation(puserdata); //bypass this function if its just access

                if(goahead==11)
                {
                    jsonuserresponse = procesuserjsonrequest();
                    responseready = true;
                }
                else
                {
                    jsonuserresponse = '{"error":"There is a problem with your json values maybe there is one of them is missing or misspelt "}'
                    responseready = true;
                }
            }
            else
            {
                // if advanced validation is required pocess the request
                console.log(requestdatatest);
                jsonuserresponse = procesuserjsonrequest();
                responseready = true;

            }

        }
    }

            // reply the client with response
            //make sure the result is ready because of the callback chain
            if(jsonuserresponse!=null)
            {

                if(responseready)
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(jsonuserresponse);
                    req.connection.destroy();
                }
                else
                {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end('{"error":"an error occured"}');
                req.connection.destroy();
                }
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

    else if (userreqjsonobject.requesttype == "address") {
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


// connect to the web json database
function procesuserjsonrequest()
{
// this codes checks wants the user wants from the database and returns the result
// this should be a client call to amazon aws or redis service in which json file is downloaded as a string and parsed

    var currentdata = JSON.parse('{"temperature":"67.9","alarmstatus":"on","useraddress":{"line":"403 torry avenue","city":"bronx","userstate":"newyork","zipcode":"10473"},"cancelalarm":"false"}')
    var result = "";

    if(formalrequesttype=="access")
        {
            // reads data
                result = '{"temperature":"' + currentdata.temperature + '","alarmstatus":"' + currentdata.alarmstatus + '"}';
                return result;

        }
     else if(formalrequesttype=="insert")
    {
        if(puserdata.requesttype=="temperature")
        {
            currentdata.temperature=puserdata.uservalue;
            result = '{"value":"11"}';
            //console.log(result);

            //before returnin result send data to aws or redis storage
            return result;
        }
        else if(puserdata.requesttype=="alarmstatus")
        {
            currentdata.alarmstatus=puserdata.uservalue;
            result = '{"value":"11"}';

            //before returnin result send data to aws or redis storage
            return result;
        }
        else if(puserdata.requesttype=="address")
        {
            currentdata.useraddress.line=puserdata.useraddress.line;
            currentdata.useraddress.city=puserdata.useraddress.city;
            currentdata.useraddress.userstate=puserdata.useraddress.userstate;
            currentdata.useraddress.zipcode=puserdata.useraddress.zipcode;

            result = '{"value":"11"}';

            //before returnin result send data to aws or redis storage
            return result;
        }

    }
    else
    {
        if(puserdata.requesttype=="cancelalarm")
        {
            currentdata.cancelalarm=puserdata.uservalue;
            result = '{"value":"11"}';
            //before returnin result send data to aws or redis storage
            return result;

        }
    }

}



server.listen(port,() => {
console.log('server running');
});




