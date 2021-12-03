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
    DATA["url"] = sys.argv[1]
    urls_all = worker()
    if urls_all == -2:
        DATA["error"] = "No target specified"
        exit()
    urls = list(OrderedDict.fromkeys(urls_all))
    sqli_urls = sqli.worker(urls)
    DATA["sqli"] = sqli_urls
    xss_urls = xss.worker(urls)
    DATA["xss"] = xss_urls
    scan_ports = port.worker(sys.argv[1])
    DATA["port"] = scan_ports
    exif_res = exif.worker(urls)
    DATA["exif"] = exif_res
    print(json.dumps(DATA))
