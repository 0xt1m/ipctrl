import re
import json


with open("config.json", "r") as file:
    config = json.load(file)

LISTS_FILE = config["lists_config_filepath"]
ACCESS_LOG = config["access_log_filepath"]


# Get functions
def get_lists_dict():
    with open(LISTS_FILE, "r") as lists_file:
        return json.load(lists_file)

def get_blacklists():
    lists = get_lists_dict()  
    blacklists = []

    for k in lists.keys():
        if lists[k]["type"] == "blacklist":
            blacklists.append(k)
    
    return blacklists
    
def get_whitelists():
    lists = get_lists_dict()
    
    whitelists = []
    for k in lists.keys():
        if lists[k]["type"] == "whitelist":
            whitelists.append(k)

    return whitelists

def get_list(list_name):
    lists = get_lists_dict()
    list_path = lists[list_name]["path"]
    
    with open(list_path, "r") as ip_list:
        list_contents = ip_list.readlines()
    
    return list_contents

def get_last(list_name, number):
    lists = get_lists_dict()
    list_path = lists[list_name]["path"]

    with open(list_path, "r") as ip_list:
        list_contents = ip_list.readlines()
    
    try:
        last = list_contents[-number:]
    except:
        last = list_contents

    last = [element.strip() for element in last]
    return last

def get_access_log(current_log_size):      
    with open(ACCESS_LOG, "r") as access_log_file:
        access_log = access_log_file.readlines()

    new_logs = access_log[current_log_size:]

    return new_logs


# Find functions
def ip_lookup(input_value):
    ip = input_value
    lists = get_lists_dict()
    
    for l in lists:
        list_content = get_list(l)
        for i in list_content:
            l_ip = i.strip()
            if l_ip == ip:
                return {
                    "ip": l_ip,
                    "list": l
                }
            elif "/" in l_ip:
                if l_ip.split("/")[0] == ip:
                    return {
                        "ip": l_ip,
                        "list": l
                    }
    return False

def find_in_list(ip, listname):
    list_content = get_list(listname)
    for i in list_content:
        if i.strip() == ip.strip():
            return True
    
    return False

def find_private_ips(ips):
    private_ips = []
    for ip in ips:
        if ip.startswith("172.16."):
            private_ips.append(ip)

    return private_ips

def find_existing_ips(ips):
    lists = get_lists_dict()
    existing_ips = []
    
    for l in lists:
        list_content = get_list(l)
        for i in list_content:
            for ip in ips:
                if ip.strip() == i.strip():
                    existing_ips.append((ip, l))
                elif "/" in i.strip():
                    if i.split("/")[0] == ip.strip():
                        existing_ips.append((ip, l))
    
    return existing_ips

def find_missing_ips(ips, listname):
    missing_ips = []

    for ip in ips:
        if not find_in_list(ip, listname):
            missing_ips.append(ip)

    return missing_ips

def find_invalid_ips(ips):
    invalid_ips = []
    for ip in ips:
        is_valid = validate_input_value(ip)
        if not is_valid:
            invalid_ips.append(ip)

    return invalid_ips


# Validation functions 
def list_name_check(list_name):
    lists = get_lists_dict()
    return list_name in lists

def strip_domain(domain):
    if "/" in domain:
        domain = domain.split("/")[0]
    
    domain = domain.replace("*.", "")

    return domain

def validate_input_value(value):
    if not value:
        return False
    elif not "." in value:
        return False
    
    return bool(re.match("^[a-zA-Z0-9./*-]+[a-zA-Z0-9.\/]$", value))

def is_ip(ip):
    ip_pattern = r'^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$'

    if "/" in ip:
        ip = ip.split('/')[0]
    
    return bool(re.match(ip_pattern, ip))


# Add function
def add_ips(ips, list_name): 
    lists = get_lists_dict()
    filepath = lists[list_name]["path"]

    add_ips_to_file(filepath, ips)

def add_ips_to_file(filepath, ips):
    with open(filepath, "r") as file_content:
        file_content_lines = file_content.readlines()

    new_file_content_lines = []
    for line in file_content_lines:
        if line.strip():
            new_file_content_lines.append(line.strip())

    for ip in ips:
        if ip.strip():
            new_file_content_lines.append(ip.strip())

    with open(filepath, "w") as file_content:
        file_content.write('\n'.join(new_file_content_lines))


# Remove functions
def remove_ip(ip, list_name):
    lists = get_lists_dict()
    filepath = lists[list_name]["path"]

    remove_ip_from_file(filepath, ip)

def remove_ip_from_file(filepath, ip):
    with open(filepath, "r") as file_content:
        lines = file_content.readlines()

    new_content = ""
    with open(filepath, "w") as file_content:
        for line in lines:
            if line.strip("\n") != ip:
                new_content += line
        file_content.write(new_content.strip())


def remove_ips(ips, list_name):
    lists = get_lists_dict()
    filepath = lists[list_name]["path"]
        
    remove_ips_from_file(filepath, ips)
    
def remove_ips_from_file(filepath, ips):
    with open(filepath, "r") as file_content:
        lines = file_content.readlines()
    
    new_content = ""
    with open(filepath, "w") as file_content:
        for line in lines:
            if line.strip("\n") not in ips:
                new_content += line
        file_content.write(new_content.strip())


# Additional 
