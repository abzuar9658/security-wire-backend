from PIL import Image
from PIL.ExifTags import TAGS
import sys
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import urllib.request
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
s.headers.update({
    "User-Agent": random.choice(agents.agent)
})

DATA = []


def exif_Scanner(url):
    # imagename = sys.argv[1]
    # read the image data using PIL
    urllib.request.urlretrieve(url, "exif.jpeg")
    image = Image.open("exif.jpeg")
    # extract EXIF data
    exifdata = image.getexif()
    # iterating over all EXIF data fields
    for tag_id in exifdata:
        # get the tag name, instead of human unreadable tag id
        tag = TAGS.get(tag_id, tag_id)
        data = exifdata.get(tag_id)
        # decode bytes
        if isinstance(data, bytes):
            data = data.decode()
        DATA.append([tag+" : ", data])


def worker(urls):
    extensions = [".jpg", ".jpeg"]
    res = []
    for url in urls:
        check = False
        try:
            get = requests.get(url, allow_redirects=False)
            if get.status_code != 404:
                for ex in extensions:
                    if ex in url:
                        check = True
                if check:
                    exif_Scanner(url)
                    return DATA
        except:
            continue


if __name__ == "__main__":
    exif_Scanner(
        "https://raw.githubusercontent.com/ianare/exif-samples/master/jpg/gps/DSCN0027.jpg")
