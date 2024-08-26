import requests
import dns2ip
import ipctrl
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

url = "https://sitecheck.sucuri.net/results/hello.com"

ua = UserAgent()

def sitecheck_scan(ip):
    headers = {
        'User-Agent': ua.random,
        "Referer": "https://www.google.com/"
    }

    if not ipctrl.is_ip(ip):
        url = "https://sitecheck.sucuri.net/api/v3/?scan=" + ip
        response = requests.get(url, headers=headers)

        if response:
            return response.json()
        else:
            return False
    
    else:
        return False

