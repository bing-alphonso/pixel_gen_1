#!/bin/bash

#advertiser="Beeswax Test"
#account=1
#crid=510

advertiser_name=$1
account=$2
crid=$3


#set cookies
accountCookieCmd="curl -X POST \"https://alphonso.api.beeswax.com/rest/authenticate\" -c cookies.txt -d '{\"email\": \"joe@alphonso.tv\", \"password\":\"1973Alphonso1\", \"account_id\":${account}}'"
eval_cookie_res=` eval $accountCookieCmd `
##echo "$eval_cookie_res"
##curl -X POST "https://alphonso.api.beeswax.com/rest/authenticate" -c cookies.txt -d '{"email":"joe@alphonso.tv", "password":"1973Alphonso1"}'  > /dev/null

#get creative info
creative_api_str="curl -X GET \"https://alphonso.api.beeswax.com/rest/creative\" -b cookies.txt -d '{\"creative_id\": \"${crid}\"}'"
eval_cr_res=` eval $creative_api_str `

echo "$eval_cr_res" > ./creative_id/${crid}_info.json

##get advertiser id and 

#get advertiser info
advertiser_api_str="curl -X GET \"https://alphonso.api.beeswax.com/rest/advertiser\" -b cookies.txt -d '{\"advertiser_name\": \"${advertiser_name}\"}'"
eval_adv_res=` eval $advertiser_api_str `




echo "$eval_cr_res" > ./creative_id/${crid}_info.json

echo "$eval_adv_res+++and+++$eval_cr_res" 

exit

