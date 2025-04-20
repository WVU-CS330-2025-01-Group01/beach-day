import json
import os
import hashlib
import fcntl
import time

MAX_SEARCH_CACHE = 20
MAX_SEARCH_RESULTS = 500

# Construct the correct absolute path
base_dir = os.path.dirname(__file__)  # Get the directory of the current script
json_path = os.path.join(base_dir, "beach_data", "beach_attributes.json")

cache_path = os.path.join(base_dir, "caching", "search_cache.json")

beaches = {}
with open(json_path, 'r') as beaches_file:
    beaches = json.loads(beaches_file.read())


# Search for beach by ZIP code
def search_beach_by_zip(zip_code, start, stop):

    '''
    Cache file entries have the following format for zip codes:

    "{cache_hash}": {
        "type":"zip_code",
        "zip_code":"{zip_code}",
        "results":"[{id1},{id2},{id3},...],
        "last_accessed":"{last accessed time}",
    }
    '''


    hash_collect = hashlib.blake2b(digest_size=16)
    hash_collect.update(b'zip_code')
    hash_collect.update(zip_code.to_bytes(4, 'big'))
    hash_collect.update(start.to_bytes(4, 'big'))
    hash_collect.update(stop.to_bytes(4, 'big'))

    cache_hash = hash_collect.hexdigest()

    test = {
        "type":"zip_code",
        "zip_code":"26505",
        "results":[5,72,34,5],
        "last_accessed":10
    }
    cache_insert("keytest", test)

    result = {
        "cache_hash": cache_hash,
        "result": cache_get(cache_hash)
    }

    return result

def cache_init(cache_file):
    cache_file.seek(0)
    json.dump({}, cache_file, indent=4)
    cache_file.truncate()

def cache_get(cache_hash):
    result = {}
    with open(cache_path, 'r+') as cache_file:
        fcntl.flock(cache_file, fcntl.LOCK_EX)
        cache = {}
        try:
            cache_file.seek(0)
            cache = json.loads(cache_file.read())
        except json.decoder.JSONDecodeError:
            print("failed during get")
            cache_init(cache_file)
            cache_file.seek(0)
            cache = json.loads(cache_file.read())

        try:
            old_time = cache["cache_hash"]["last_accessed"]
            curr_time = int(time.time())
            cache["cache_hash"]["last_accessed"] = curr_time
        except KeyError:
            result = {}
        
        cache_file.seek(0)
        json.dump(cache, cache_file, indent=4)
        cache_file.truncate()
        fcntl.flock(cache_file, fcntl.LOCK_UN)
    return cache.get(cache_hash, {})

def cache_insert(cache_hash, search_info):
    with open(cache_path, 'r+') as cache_file:
        fcntl.flock(cache_file, fcntl.LOCK_EX)

        cache = {}
        try:
            cache = json.loads(cache_file.read())
        except json.decoder.JSONDecodeError:
            print("failed during insert")
            cache_init(cache_file)
            cache = json.loads(cache_file.read())
        
        cache[cache_hash] = search_info
        
        sorted_by_time = dict(sorted(cache.items(), key=lambda x: x[1]["last_accessed"]))

        for (i, key) in enumerate(sorted_by_time.keys()):
            if i >= MAX_SEARCH_CACHE:
                cache.pop(key)

        json.dump(cache, cache_file, indent=4)

        fcntl.flock(cache_file, fcntl.LOCK_UN)
