#!/bin/bash

# account=1
# key=56110321145723
# crid=510
account=$1
key=$2
crid=$3


accountCookieCmd="curl -X POST \"https://alphonso.api.beeswax.com/rest/authenticate\" -c cookies.txt -d '{\"email\": \"joe@alphonso.tv\", \"password\":\"1973Alphonso1\", \"account_id\":${account}}'"
eval_cookie_res=` eval $accountCookieCmd `

str_1="https://tr.alphonso.tv/ad/ord={{CACHEBUSTER}}"
str_2="&deviceid={{USER_ID}}&cid={{CAMPAIGN_ID}}&lid={{LINE_ITEM_ID}}&crid={{CREATIVE_ID}}&aid={{AUCTION_ID}}&domain={{DOMAIN}}&site_name={{SITE_NAME}}&app_bundle={{APP_BUNDLE}}&app_id={{APP_ID}}&app_name={{APP_NAME}}&lat={{LAT}}&long={{LONG}}&zip_code={{ZIP_CODE}}&age={{AGE}}&gender={{GENDER}}&platform_os={{PLATFORM_OS}}&platform_carrier={{PLATFORM_CARRIER}}&device_model={{DEVICE_MODEL}}&device_make={{DEVICE_MAKE}}&metro_code={{METRO_CODE}}&Inventory_Source={{INVENTORY_SOURCE}}"
imp_pixel="${str_1}?src=${key}${str_2}"
cmp_pixel="${str_1}?cmp=${key}&complete=100${str_2}"
##Save Impression and Completion pixels in json file.
echo "{\"impression_pixel\": \"${imp_pixel}\", \"completion_pixel\": \"${cmp_pixel}\"}" > ./creative_id/${crid}_pixel.json


##Could be improved here if we have json parsing in bash!
impression_attach_str="python3 impression_attach.py ${crid}"
eval_imp_res=` eval $impression_attach_str `

completion_attach_str="python3 completion_attach.py ${crid}"
eval_cmp_res=` eval $completion_attach_str `

##Here I replace all single quotes with double quotes. Could be improved here.
attach_creative_str="curl -X PUT \"https://alphonso.api.beeswax.com/rest/creative\" -b cookies.txt -d '{\"creative_id\": $crid, \"pixels\": ${eval_imp_res//\'/\"}, \"events\": ${eval_cmp_res//\'/\"}}'"
eval_attach_res=` eval $attach_creative_str `

echo "$eval_attach_res"

rm ./creative_id/${crid}_info.json
##echo "$eval_cookie_res"
##echo "Getting Advertiser ID for Advertiser: $advertiser for account: $account"
#set cookies
##curl -X POST "https://alphonso.api.beeswax.com/rest/authenticate" -c cookies.txt -d '{"email":"joe@alphonso.tv", "password":"1973Alphonso1"}'  > /dev/null

##command_str="curl -X PUT \"https://alphonso.api.beeswax.com/rest/creative\" -b cookies.txt -d '{\"creative_id\":${crid}, \"pixels\": [\"${imp_pixel}\"], \"events\": [{\"complete\":\"${cmp_pixel}\"}]}'"
#echo "command_str:$command_str"
##eval_res=` eval $command_str `
##echo "$eval_res" 

##echo "$eval_res" | cut -d'\"advertiser_id\":' -f 2

exit

