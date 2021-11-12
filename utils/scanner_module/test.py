import urllib3
import sys
import agents
import random
# http = urllib3.PoolManager()
# main = "https://www.google.com/"
# res = http.request('GET', main)
# print("success admin = ", res.status, sys.argv[1])
print(random.choice(agents.agent))
