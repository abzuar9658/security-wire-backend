
import requests
import os
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from optparse import OptionParser
import agents
import random


def wayBack(domain, subdomain):
    # print("=================================================")
    # print("wayback")
    # print("=================================================")
    wb_url = []
    if subdomain == True:
        domain = "*."+domain
    try:
        rKey = True
        resumeKey = ""
        while rKey:
            wurl = "http://web.archive.org/cdx/search/cdx?url={}/*&collapse=urlkey&output=json&fl=original&showResumeKey=true&limit=".format(
                domain)
            # print(wurl)
            rep = req.get(wurl, stream=True)
            if rep.status_code == 200:
                if rep.json() != []:
                    if rep.json()[-2] == []:
                        resumeKey = rep.json()[-1][0]
                        for url in rep.json()[1:-2]:
                            # print(url[0])
                            wb_url.append(url[0])
                    else:
                        rKey = False
                        for url in rep.json()[1:]:
                            # print(url[0])
                            wb_url.append(url[0])
                else:
                    rKey = False
            else:
                rKey = False
    except requests.RequestException as err:
        pass
    return wb_url


def commonCrawl(domain, subdomain):
    # print("=================================================")
    # print("cc")
    # print("=================================================")
    cc_url = []
    if subdomain == True:
        domain = "*."+domain
    try:
        rep = req.get(
            cCrawlIndexs+"?url={}/*&output=text&fl=url{}".format(domain, ccFilters))
        if rep.status_code == 200:
            for url in rep.text.splitlines():
                cc_url.append(url)
    except requests.RequestException as err:
        pass
    return cc_url


def otx(domain):
    # print("=================================================")
    # print("otx")
    # print("=================================================")
    otx_url = []
    try:
        hNext = True
        page = 0
        while hNext:
            page += 1
            otxurl = "https://otx.alienvault.com/api/v1/indicators/domain/{}/url_list?limit={}&page={}".format(
                domain, OTXlimit, page)
            rep = req.get(otxurl)
            if rep.status_code == 200:
                hNext = rep.json()["has_next"]
                for url in rep.json()["url_list"]:
                    # print(url["url"])
                    otx_url.append(url["url"])
            else:
                hNext = False
    except requests.RequestException as err:
        pass
    return otx_url


def vTotal(domain):
    # print("=================================================")
    # print("vtotal")
    # print("=================================================")
    vTotalAPI = "123aec19c2bbdde70455acc0b0643998881f8af122e30fcfcd65b2882f2417a0"
    vTotal_url = []
    try:
        vturl = "https://www.virustotal.com/vtapi/v2/domain/report?apikey={}&domain={}".format(
            vTotalAPI, domain)
        rep = requests.get(vturl)
        if rep.status_code == 200:
            for url in rep.json()["detected_urls"]:
                # print(url["url"])
                vTotal_url.append(url["url"])
            for url in rep.json()["undetected_urls"]:
                # print(url[0])
                vTotal_url.append(url[0])
    except requests.RequestException as err:
        pass
    return vTotal_url


def cCrawlIndex():
    client = "commonCrawl Index"
    try:
        rep = req.get("http://index.commoncrawl.org/collinfo.json")
        if rep.status_code == 200:
            return rep.json()[0]["cdx-api"]
        else:
            return False
    except:
        return False


def worker(domain, subdomain):
    commonCrawl_urls = commonCrawl(domain, subdomain)
    wayBack_urls = wayBack(domain, subdomain)
    otx_urls = otx(domain)
    vTotal_urls = vTotal(domain)
    All_url = commonCrawl_urls + wayBack_urls + otx_urls + vTotal_urls
    return All_url


retry_strategy = Retry(
    total=3,
    status_forcelist=[429, 500, 502, 503, 504],
    method_whitelist="GET"
)
adapter = HTTPAdapter(max_retries=retry_strategy)
req = requests.Session()
req.mount("https://", adapter)
req.mount("http://", adapter)
req.headers.update({"User-Agent": random.choice(agents.agent)})

wbFilters = ccFilters = ""
WBlimit = 10000
OTXlimit = 10000
vTotalAPI = ""

ccFilters = "&filter=!statuscode:404"
wbFilters = "&filter=!statuscode:404"
cCrawlIndexs = cCrawlIndex()
