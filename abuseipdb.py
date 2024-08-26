import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

ua = UserAgent()

def get_recently_reported_ips():
    headers = {
        'User-Agent': ua.random
    }
    url = "https://www.abuseipdb.com"
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    reported_ips = []
    
    all_reported_ips = []
    all_reported_ips = soup.find_all(class_="col-md-3")
    
    if all_reported_ips:
        for ip in all_reported_ips:
            flag_tag = ip.img
            try:
                del flag_tag["src"]
                del flag_tag["style"]
            except:
                pass

            
            flag_tag = str(flag_tag).split(">")[0] + ">"
            ip_tag = str(ip.a)

            reported_ips.append({
                "ip_tag": ip_tag,
                "flag_tag": flag_tag
            })

    return reported_ips


def abuseipdb_scan(ip):
    headers = {
        'User-Agent': ua.random,
        "Referer": "https://www.google.com/"
    }

    if "/" in ip:
        ip = ip.split("/")[0]

    url = "https://www.abuseipdb.com/check/" + ip
    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.text, 'html.parser')
    well_div = soup.find(class_="well")
    report_wrapper = soup.find(id="report-wrapper")
    
    try:
        if "was found" in str(well_div.h3):
            times_reported = well_div.p.b.text
            confidence_of_abuse = well_div.p.find_all("b")[1].text
            
            del well_div.table.find("img")["src"]
            del well_div.table.find("img")["style"]
            
            info_table = str(well_div.table)
            description = str(report_wrapper.p)

            reports_table = report_wrapper.find("table", id="reports")
            
            reports_table_imgs = reports_table.find_all("img")
            for img in reports_table_imgs:
                del img["src"]
                del img["style"]
            
            try:
                del reports_table.find("img")["src"]
                del reports_table.find("img")["style"]
            except:
                pass

            recent_reports = str(reports_table)

            return {
                "abused": True,
                "ip": ip,
                "description": description,
                "times_reported": times_reported,
                "confidence_of_abuse": confidence_of_abuse,
                "info_table": info_table,
                "recent_reports": recent_reports,
                "status_code": 200
            }
        elif "was not found" in str(well_div.h3):
            return {
                "abused": False,
                "ip": ip,
                "status_code": 200
            }
    except AttributeError:
        return {
            "status_code": 400
        }
