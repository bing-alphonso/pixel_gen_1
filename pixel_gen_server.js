//Lets define a port we want to listen to, if not passed as arg
var http_PORT=12339;

//Lets require/import the HTTP module
var http = require('http');


//funcs
function get_url_args (req_url)
{
   var results = {};
   if (!req_url) return results;

   var splits = req_url.split("?");
   if (splits.length < 2 ) {
      return results;
   }

   var key_vals = splits[1].split("&");
   for (var i=0; i< key_vals.length; i++) {
       var kvs = key_vals[i].split("=");
       var key = kvs[0];
       var val = kvs[1];
       results[key] = val;
   }
   return results;
}


//We need a function which handles requests and send response
function handleRequest(request, response){
   console.log('Request method:' + request.method );
   var body = '';
   request.on('data', function (chunk) {
    body += chunk;
  });
  //basic auth
  var auth = request.headers['authorization']; 
  console.log("Authorization Header is: ", auth);
  if(!auth) {
     response.statusCode = 401;
     response.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
     response.end('<html><body>Need Creds</body></html>');
  } else if (auth) {
     var tmp = auth.split(' ');
     var buf = new Buffer(tmp[1], 'base64');
     var plain_auth = buf.toString();
     //console.log("Decoded Authorization ", plain_auth);
     var creds = plain_auth.split(':');
     var username = creds[0];
     var password = creds[1];
     if( ((username == 'alpha') && (password == '@Lph0ns0')) || 
         ((username == 'alphonso') && (password == '1973Alphonso1'))
       ) {

//authenticated block
  var req_url = request.url;
  //handler for load balancer checks
  console.log(req_url)
  //USE BW API TO ATTACH PIXEL TO THE CREATIVE
  if (req_url.indexOf('pixel_attach') > -1) {
    var url_args = get_url_args(req_url);
    console.log('--------------------------------')
    console.log(url_args)
    var key = url_args['key'];
    var acc_id = url_args['account_id']
    var creative_id = url_args['creative_id'];
    var exec = require('child_process').exec;
    var exec_cmd = './attach_pixel.sh' + ' ' + acc_id + ' ' + key + ' '+creative_id;
    console.log ('DBG exec_cmd:' + exec_cmd);
    exec(exec_cmd, function callback(error, stdout, stderr){
        console.log(stdout);
        var result_str = stdout;
        return response.end(result_str);
    })
  } else if (req_url.indexOf('pixel_submit') > -1 ) {
    //WILL PROCESS THE INPUT FROM USER HERE.
     var url_args = get_url_args(req_url);
     console.log('--------------------------------')
     console.log(url_args)
     var advertiser_name = url_args['advertiser_name'].replace("+", " ");
     var acc_id = url_args['account_id']
     var crid = url_args['creative_id']
     //WILL USE BW API TO GET ADVERTISER ID AND CREATIVE INFO. 
     var exec = require('child_process').exec;
     var exec_cmd = './get_aid_creative.sh' + ' \"' + advertiser_name + '\" '+ acc_id + ' ' + crid;
     console.log ('DBG exec_cmd:' + exec_cmd );
     exec(exec_cmd, function callback(error, stdout, stderr){
        //console.log(stdout);
        var result_array = stdout.split("+++and+++");
        console.log(result_array);
        // PARSING THE OUTPUT ADVERTISER JSON TO PIXEL AND CHECK IF CREATIVE ID BELONGS TO ADVERTISER.
        var result_adv = JSON.parse(result_array[0]);
        var result_cr = JSON.parse(result_array[1]);
        //console.log(result_cr)
        if (result_adv["success"] == false || result_cr["success"] == false){
          var result_str = "API Error. Please try again or contact bing@alphonso.tv."
        } else {
            var result_adv_payload = result_adv["payload"];
            var result_cr_payload = result_cr["payload"];
        // Is there any other cases like payload is not in the output?
          if (result_adv_payload.length == 0){
            var result_str = "Advertiser NOT Found on ACCOUNT " + acc_id + ". Please check the input and enter again."
          } else if (result_cr_payload.length == 0){
            var result_str = "Creative ID NOT Found on ACCOUNT " + acc_id + ". Please check the input and enter again."
          } else{
            var advertiser_id = result_adv_payload[0]["advertiser_id"];
            var aid = JSON.stringify(advertiser_id);
            var creative_advertiser_id = result_cr_payload[0]["advertiser_id"];
            var cr_aid = JSON.stringify(creative_advertiser_id);
            var creative_name = JSON.stringify(result_cr_payload[0]["creative_name"])
            if (aid != cr_aid){
              var result_str = "Creative ID " +crid+ " is NOT under Advertiser " + advertiser_name + ". Please check the input and enter again."
            } else{
              var s1 = "https://tr.alphonso.tv/ad/ord={{CACHEBUSTER}}";
              var s2 = "&deviceid={{USER_ID}}&cid={{CAMPAIGN_ID}}&lid={{LINE_ITEM_ID}}&crid={{CREATIVE_ID}}&aid={{AUCTION_ID}}&domain={{DOMAIN}}&site_name={{SITE_NAME}}&app_bundle={{APP_BUNDLE}}&app_id={{APP_ID}}&app_name={{APP_NAME}}&lat={{LAT}}&long={{LONG}}&zip_code={{ZIP_CODE}}&age={{AGE}}&gender={{GENDER}}&platform_os={{PLATFORM_OS}}&platform_carrier={{PLATFORM_CARRIER}}&device_model={{DEVICE_MODEL}}&device_make={{DEVICE_MAKE}}&metro_code={{METRO_CODE}}&Inventory_Source={{INVENTORY_SOURCE}}";
              var date = new Date();
              console.log(date);
              var year = date.getFullYear().toString().substring(2, 4);
              var day = date.getDate();
              var month = date.getMonth() + 1;
              // var hours = date.getHours();
              // var minutes = date.getMinutes();
              // var seconds = date.getSeconds();
              if (day < 10){
                day = "0" + day;
              }
              if(month < 10){
                month = "0" + month;
              }
              // if(hours < 10){
              //   hours = "0" + hours;
              // }
              // if(minutes < 10){
              //   minutes = "0" + minutes;
              // }
              // if(seconds < 10){
              //   seconds = "0" + seconds;
              // }
              date = year + month + day;
              var key = aid + "11" + date; //+ hours + minutes + seconds;
              var srcKey = "?src=" + key;
              var cmpKey = "?cmp=" + key +"&complete=100";
              var srcURL = s1 + srcKey + s2;
              var cmpURL = s1 + cmpKey + s2;
              var pixel_output = "Impression Pixel: \n" + srcURL + "\n \n " + "Completion Pixel: \n" + cmpURL
              var fs = require('fs');
              var submit_contents = fs.readFileSync('./pixel_submit.html').toString();
              var result_str = submit_contents.replace("PIXEL_RESULT", pixel_output);
              result_str = result_str.replace("CREATIVE_NAME_RESULT", creative_name);
              result_str = result_str.replace("KEY_RESULT", key);
              result_str = result_str.replace("ACCOUNT_RESULT", acc_id);
              result_str = result_str.replace("CREATIVE_ID_RESULT", crid);
              //console.log (result_str)
              console.log ('DBG error:' + error + ' stdout:' + stdout + ' stderr:' + stderr );
              }
            }
          }
        return response.end(result_str);
     });
  } else if(req_url.indexOf('pixel_generation') > -1 ) {
     var fs = require('fs');
     var contents = fs.readFileSync('./pixel_generation.html').toString();
     return response.end(contents);
   }

//end authenticated block
     } else {
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        response.end('<html><body> Not authorized user</body></html>');
     }
  }
  
  request.on('end', function () {
     //response.end('ok' + request.url + '\n');
  });

} // end handle request
//Create a server
var server = http.createServer(handleRequest);
//Lets start our server
server.listen(http_PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", http_PORT);
});


