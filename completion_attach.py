import sys
import json
import time

##crid = 510
crid = sys.argv[1]

with open('./creative_id/' + str(crid) + '_info.json', 'r') as json_info:
    data_info = json_info.read()


info_obj = json.loads(data_info)

with open('./creative_id/' + str(crid) + '_pixel.json', 'r') as json_pixel:
    data_pixel = json_pixel.read()


pixel_obj = json.loads(data_pixel)

##Completion Pixel Attach
cmp_pixel_json = {"complete": pixel_obj["completion_pixel"]}
info_obj["payload"][0]["events"].append(cmp_pixel_json)

completion_pixel_obj = info_obj["payload"][0]["events"]

print(completion_pixel_obj)

sys.exit(0)