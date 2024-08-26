import requests
import json
import ipctrl, dns2ip

with open("config.json", "r") as file:
    config = json.load(file)

API_KEY = config["ipregistry_api_key"]

def ipregistry_scan(ip):

    if ipctrl.is_ip(ip):
        if "/" in ip:
            ip = ip.split("/")[0]
    
    else:
        ip = dns2ip.dns2ip(ip)
    
    
    if ip:
        url = "https://api.ipregistry.co/" + ip + "?key=" + API_KEY
        response = requests.get(url)
        return response.json()
    else:
        return False