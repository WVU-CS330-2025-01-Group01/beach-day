import json
from pathlib import Path

in_json = {}

with open("../beach_attributes.json", "r") as f:
    in_json = json.loads(f.read())

states = {}

for key in in_json.keys():
    state = key[0:2]
    number = key[2:]

    if not (state in states.keys()):
        states[state] = {}
    
    states[state][key] = in_json[key]


for state in states.keys():

    for beach_id in states[state].keys():
        with open(Path(f"./states/{state}.json"), "w") as f:
            json.dump(states[state], f, indent=4)
    
    print(f"Done with {state}")
