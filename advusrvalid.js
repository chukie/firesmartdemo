module.exports.runvalidation = function advanceduservalidation(userreqjsonobject) {

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
    else if(userreqjsonobject.requesttype.toString() == "call911")
    {
        return 11; // if the user wants to call 911;
    }
    else
    {
        return 99;
    }
}