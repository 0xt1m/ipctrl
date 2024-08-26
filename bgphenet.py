import requests
from bs4 import BeautifulSoup

def scan_ip(ip):
    url = "https://bgp.he.net/ip/" + ip
    response = requests.get(url)
    page = BeautifulSoup(response.text, 'html.parser')

    
    return {
        "ip_info": parse_ip_info(page),
        "dns_records": parse_dns_records(page)
    }


def scan_domain(domain):
    url = "https://bgp.he.net/dns/" + domain
    response = requests.get(url)
    page = BeautifulSoup(response.text, 'html.parser')

    return {
        "dns_info": parse_dns_info(page),
        "dns_ip_info": parse_dns_ip_info(page)
    }


def parse_ip_info(page):
    ipinfo = str(page.find(id='ipinfo'))
    return ipinfo


def parse_dns_records(page):
    dns_records = str(page.find(id='dnsrecords'))
    return dns_records


def parse_dns_info(page):
    dns = str(page.find(id='dns'))
    return dns


def parse_dns_ip_info(page):
    dns_ip_info = str(page.find(id='ipinfo'))
    return dns_ip_info