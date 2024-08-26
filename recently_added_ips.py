import json
import ipctrl
import datetime


with open('config.json', "r") as f:
    config = json.load(f)

RECENTLY_ADDED_IPS_PATH = config['recently_added_ips_filepath']
LAST_50_LINES_PATH = config['last_50_lines_filepath']


# Compares 2 lists and returns IPs that are present in the list 2 but not present in the list 1
def get_difference(list1, list2):
    return list(set(list2) - set(list1))

def get_last_50_lines_from_lists(lists):
    last_50_lines_res = {}
    for l in lists:
        last_50_lines = ipctrl.get_last(l, 50)
        last_50_lines_res.update({l: last_50_lines})
    
    return last_50_lines_res

def update_last_50_lines_file(new_content):
    with open(LAST_50_LINES_PATH, "w") as f:
        json.dump(new_content, f, indent=4)


start_lists = ipctrl.get_lists_dict()
start_last_50_lines_for_each_file = get_last_50_lines_from_lists(start_lists)
update_last_50_lines_file(start_last_50_lines_for_each_file)

def update(): 
    with open(LAST_50_LINES_PATH, "r") as f:
        last_50_lines_for_each_file = json.load(f)

    with open(RECENTLY_ADDED_IPS_PATH, "r") as f:
        recently_added_ips = json.load(f)

    current_time = str(datetime.datetime.now())
    difference_in_each_file = {}

    current_lists = ipctrl.get_lists_dict()
    current_last_50_lines_for_each_file = get_last_50_lines_from_lists(current_lists)

    for l in current_lists:
        if not l in list(last_50_lines_for_each_file):
            print("Need to Add all the values to the differences")

        else:
            last_50_lines = last_50_lines_for_each_file[l]
            current_last_50_lines = current_last_50_lines_for_each_file[l]

            difference = get_difference(last_50_lines, current_last_50_lines)
            difference_in_each_file.update({l: difference})
    
    for f in difference_in_each_file:
        for ip in difference_in_each_file[f]:
            if not ip in recently_added_ips:
                recently_added_ips.update({
                    ip: {
                        "timestamp": current_time,
                        "list_name": f
                    }
                })

    non_existent_ips = []
    for ip in recently_added_ips:
        if not ipctrl.ip_lookup(ip):
            non_existent_ips.append(ip)
    
    for ip in non_existent_ips:
        recently_added_ips.pop(ip)
    
    # Reassign Variables
    update_last_50_lines_file(current_last_50_lines_for_each_file)
    
    # Sort Recently Added Ips
    recently_added_ips = dict(sorted(recently_added_ips.items(), key=lambda item: item[1]['timestamp']))

    # Get only the last 5
    last_50_recently_added = dict(list(recently_added_ips.items())[-50:])

    # Write it to the file
    with open(RECENTLY_ADDED_IPS_PATH, "w") as f:
        json.dump(last_50_recently_added, f, indent=4)