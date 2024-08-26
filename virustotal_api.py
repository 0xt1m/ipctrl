import requests
import json

with open("config.json", "r") as file:
    config = json.load(file)

API_KEY = config['virustotal_api_key']


def scan_ip(ip):
    url = f"https://www.virustotal.com/api/v3/ip_addresses/" + ip

    headers = {
        "accept": "application/json",
        "x-apikey": API_KEY
    }

    response = requests.get(url, headers=headers)

    return response.text


def scan_domain(domain):
    url = f"https://www.virustotal.com/api/v3/domains/" + domain

    headers = {
        "accept": "application/json",
        "x-apikey": API_KEY
    }

    response = requests.get(url, headers=headers)

    return response.text