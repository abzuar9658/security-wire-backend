import sys
import url
import sqli
import xss
import port
import exif
from collections import OrderedDict
import json

target = ""

DATA = {}


def worker():
    if len(sys.argv) < 2:
        return -2
    target = sys.argv[1]
    return url.worker(target, False)


if __name__ == "__main__":
    try:
        DATA["url"] = sys.argv[1]
        urls_all = worker()
        if urls_all == -2:
            DATA["error"] = "No target specified"
            exit()
        urls = list(OrderedDict.fromkeys(urls_all))
        try:
            sqli_urls = sqli.worker(urls)
            DATA["sqli"] = sqli_urls
        except:
            DATA["sqli"] = []
        try:
            xss_urls = xss.worker(urls)
            DATA["xss"] = xss_urls
        except:
            DATA["xss"] = []
        try:
            scan_ports = port.worker(sys.argv[1])
            DATA["port"] = scan_ports
        except:
            DATA["port"] = []
        try:
            exif_res = exif.worker(urls)
            DATA["exif"] = exif_res
        except:
            DATA["exif"] = []
        print(json.dumps(DATA))
    except:
        print(json.dumps({"url": sys.argv[1], "sqli": [],
              "xss": [], "port": [], "exif": "null"}))
