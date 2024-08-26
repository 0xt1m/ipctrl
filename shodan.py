import requests
import dns2ip
import ipctrl
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

ua = UserAgent()

def shodan_scan(ip):
    headers = {
        'User-Agent': ua.random,
        "Referer": "https://www.google.com/"
    }

    if ipctrl.is_ip(ip):
        if "/" in ip:
            ip = ip.split("/")[0]
    
    else:
        ip = dns2ip.dns2ip(ip)

    if ip:
        url = "https://www.shodan.io/host/" + ip
        response = requests.get(url, headers=headers)

        soup = BeautifulSoup(response.text, 'html.parser')

        ports = soup.find(id="ports")
        
        if ports:
            ports.find_all("a")
        
            open_ports = []
            for port in ports:
                if port.text.strip():
                    port_object = {
                        "port_number": port.text
                    }
                    port_service_name = get_service_name(port.text, soup)
                    if port_service_name:
                        port_object.update({
                            "service_name": port_service_name
                        })
                    
                    open_ports.append(port_object)

            return {
                "open_ports": open_ports
            }
    
    return False


def get_service_name(port, soup):
    port_title = soup.find(id=str(port))

    try:
        port_service = port_title.find_next_sibling().find("h1")

        if port_service:
            return port_service.text
        else:
            return False
    except:
        return False