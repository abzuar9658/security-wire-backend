import requests
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import os
from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin
from pprint import pprint
import agents
import random
import agents

import random
s = requests.Session()
s.headers.update({
    "User-Agent": random.choice(agents.agent)
})


def get_all_forms(url):
    """Given a `url`, it returns all forms from the HTML content"""
    try:
        soup = bs(s.get(url, allow_redirects=False).content, "html.parser")
    except:
        pass
    return soup.find_all("form")


def get_form_details(form):
    """
    This function extracts all possible useful information about an HTML `form`
    """
    details = {}
    # get the form action (target url)
    try:
        action = form.attrs.get("action").lower()

        # get the form method (POST, GET, etc.)
        method = form.attrs.get("method", "get").lower()
        # get all the input details such as type and name
        inputs = []
        for input_tag in form.find_all("input"):
            input_type = input_tag.attrs.get("type", "text")
            input_name = input_tag.attrs.get("name")
            input_value = input_tag.attrs.get("value", "")
            inputs.append(
                {"type": input_type, "name": input_name, "value": input_value})
        # put everything to the resulting dictionary
        details["action"] = action
        details["method"] = method
        details["inputs"] = inputs
        return details
    except:
        action = None


def is_vulnerable(response):
    """This functon mactch response for any sql related error"""
    errors = {
        # MySQL
        "you have an error in your sql syntax;",
        "warning: mysql",
        # SQL Server
        "unclosed quotation mark after the character string",
        "Unclosed quotation mark",
        # Oracle
        "quoted string not properly terminated",
    }
    for error in errors:
        # if any error matched in response, return True
        if error.lower() in response.content.decode().lower():
            return True
    # no error detected
    return False


def scan_sql_injection(url):
    # test on URL
    for c in "'\"":
        # add quote/double quote character to the URL
        new_url = url+c
        # print("[!] Trying", new_url)
        # HTTP request
        try:
            res = s.get(new_url)
            if is_vulnerable(res):
                # SQL Injection detected on the given url no need to test the forms
                # print("[+] SQL Injection vulnerable, link:", new_url)
                return url
        except Exception as e:  # work on python 3.x
            # print(new_url)
            # print('Failed to upload to ftp: ' + str(e))
            # test on HTML forms
            pass
    try:
        forms = get_all_forms(url)
        # print(f"[+] Detected {len(forms)} forms on {url}.")
        for form in forms:
            form_details = get_form_details(form)
            for c in "\"'":
                # the data body we want to submit
                data = {}
                for input_tag in form_details["inputs"]:
                    if input_tag["value"] or input_tag["type"] == "hidden":
                        # use input form that has some value or is_hidden.
                        try:
                            data[input_tag["name"]] = input_tag["value"] + c
                        except:
                            pass
                    elif input_tag["type"] != "submit":
                        # all others except submit, use some junk data with special character
                        data[input_tag["name"]] = f"test{c}"
                # join the url with the action (form request URL)
                url = urljoin(url, form_details["action"])
                if form_details["method"] == "post":
                    res = s.post(url, data=data)
                elif form_details["method"] == "get":
                    try:
                        res = s.get(url, params=data, allow_redirects=False)
                    except:
                        pass
                # test if the resulting page is vulnerable
                if is_vulnerable(res):
                    # print("[+] SQL Injection vulnerability detected, link:", url)
                    # print("[+] Form:")
                    # pprint(form_details)
                    return url
                    break
    except:
        pass


def worker(urls):
    extensions = [".pdf", ".jpg", ".jpeg", ".gif", ".svg", ".woff",
                  ".png", ".css", ".eot", ".txt", ".ttf", ".js", ".axd", ".ico"]
    res = []
    for url in urls:
        check = True
        try:
            get = requests.get(url, allow_redirects=False)
            if get.status_code != 404:
                for ex in extensions:
                    if ex in url:
                        check = False
                if check:
                    tmp = scan_sql_injection(url)
                    if tmp != None:
                        res.append(tmp)
        except:
            continue
    return res


if __name__ == "__main__":
    urls = sys.argv[1].split(',')
    res = []
    for url in urls:
        tmp = scan_sql_injection(url)
        print(tmp)
        if tmp:
            res.append(tmp)
    print(res)
