import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

ua = UserAgent()

def dns2ip(dns):
    headers = {
        'User-Agent': ua.random,
        "Referer": "https://www.google.com/"
    }

    url = "https://www.whatsmydns.net/dns-lookup?query=" + dns + "&server=google"
    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        ip = soup.find("tbody").find_all("a")[1].text
        return ip
    except:
        return False