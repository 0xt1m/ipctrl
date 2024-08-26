import ipctrl
import virustotal_api, bgphenet, abuseipdb, ipregistry, shodan, sitecheck, splunk
import recently_added_ips as rai

import socket
import json
import hashlib

from flask import Flask, request, render_template, redirect, jsonify, send_file, url_for, request
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'Wave.Page0.Truck'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = 'login'


class User(db.Model, UserMixin):
    id = db.Column(db.String(80), primary_key=True)
    password = db.Column(db.String(32), nullable=False)  # MD5 is 32 characters long


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

def verify_password(stored_password, provided_password):
    return stored_password == hash_password(provided_password)


# What I do in the beginning
@app.route('/')
@login_required
def home():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_id = request.form['username']
        password = request.form['password']
        user = User.query.get(user_id)

        if user and verify_password(user.password, password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            return 'Invalid credentials'
    
    return render_template('login.html')
        

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# Get Black and White lists
@app.route('/_get_lists', methods=['POST'])
def get_lists():
    try:
        lists = {
            "blacklists": ipctrl.get_blacklists(),
            "whitelists": ipctrl.get_whitelists()
        }
        
        return jsonify({
            "status_code": 200,
            "lists": lists
        })
    except:
        return jsonify({
            "status_code": 400,
            "info": "Failed to get lists"
        })



# Handle list request
@app.route('/_get_list', methods=['POST'])
def get_list():
    if request.is_json:
        data = request.get_json()
        list_name = data.get('listName')
    
    if ipctrl.list_name_check(list_name):
        try:
            list_content = ipctrl.get_list(list_name)
            return {
                "status_code": 200,
                "list_content": list_content,
                "list_name": list_name
            }
        except:
            return {
                "status_code": 500,
                "info": "Error getting list content",
                "list_name": list_name
            }
    else:
        return { 
            "status_code": 400,
            "info": "Didn't find selected lists",
            "list_name": list_name
        }
    

# Hostname resolution
@app.route('/_get_hostname', methods=['POST'])
def get_hostname():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ip')

    try:
        hostname, alias, addresslist = socket.gethostbyaddr(ip)
        return {
            "status_code": 200,
            "hostname": hostname
        }

    except socket.herror as e:
        return {
            "status_code": 404,
            "ip": ip
        }
    

# Handle actions
@app.route('/_add_ips', methods=['POST'])
@login_required
def add_ip():
    if request.is_json:
        data = request.get_json()
        ips = data.get('ips')
        list_name = data.get('listName')
    
    invalid_ips = ipctrl.find_invalid_ips(ips)
    existing_ips = ipctrl.find_existing_ips(ips)
    private_ips = ipctrl.find_private_ips(ips)
    
    if existing_ips:
        return {
            "status_code": 400,
            "info": "existingIps",
            "existingIps": existing_ips
        }
    
    elif invalid_ips:
        return {
            "status_code": 400,
            "info": "invalidIps",
            "invalidIps": invalid_ips
        }
    
    elif private_ips:
        return {
            "status_code": 400,
            "info": "privateIps",
            "privateIps": private_ips
        }
    
    elif not existing_ips and not private_ips:    
        try:
            ipctrl.add_ips(ips, list_name)
            return {
                "status_code": 200
            }
        except:
            return {
                "status_code": 500,
                "info": "Error adding IP"
            }


@app.route('/_remove_ips', methods=['POST'])
@login_required
def remove_ips():
    if request.is_json:
        data = request.get_json()
        ips = data.get('ips')
        list_name = data.get('listName')

    missing_ips = ipctrl.find_missing_ips(ips, list_name)  
    if missing_ips:
        return {
            "status_code": 404,
            "info": "missingIps",
            "missingIps": missing_ips
        }

    try:
        ipctrl.remove_ips(ips, list_name)
        return {
            "status_code": 200,
            "ips": ips,
            "listName": list_name
        }
    except:
        return {
            "status_code": 500,
            "info": "Error removing IP",
            "ips": ips,
            "listName": list_name
        }
    

@app.route('/_virustotal_scan', methods=['POST'])
@login_required
def virustotal_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ipAddress')
    
    # Check whether it gets IP or domain
    if ipctrl.is_ip(ip): 
        if "/" in ip:
            ip = ip.split("/")[0]

        virustotal_result = virustotal_api.scan_ip(ip)
    else:
        ip = ipctrl.strip_domain(ip)
        virustotal_result = virustotal_api.scan_domain(ip)
        
    return jsonify(virustotal_result)


@app.route('/_bgphenet_scan', methods=['POST'])
def bgphenet_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ipAddress')

    response = {
        "status_code": 400,
        "info": "bgp.he.net scan was not performed!"
    }
    
    if ipctrl.is_ip(ip):
        if "/" in ip:
            ip = ip.split("/")[0]
        
        bgphenet_result = bgphenet.scan_ip(ip)

        response.update({
            "status_code": 200,
            "bgphenet": bgphenet_result
        })

    else:
        ip = ipctrl.strip_domain(ip)
        bgphenet_result = bgphenet.scan_domain(ip)
        response.update({
            "status_code": 200,
            "bgphenet": bgphenet_result
        })

    return jsonify(response)


@app.route('/_abuseipdb_scan', methods=['POST'])
def abuseipdb_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ipAddress')

    abuseipdb_scan = abuseipdb.abuseipdb_scan(ip)

    if abuseipdb_scan["status_code"] == 200:  
        return {
            "status_code": 200,
            "abuseIpDb": abuseipdb_scan
        }
    else:
        return {
            "status_code": 400,
            "info": "AbuseIPDB scan failed"
        }
    

@app.route('/_ipregistry_scan', methods=['POST'])
@login_required
def ipregistry_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ip_address')

    ipregistry_scan = ipregistry.ipregistry_scan(ip)

    if ipregistry_scan:
        if "ip" in ipregistry_scan.keys():
            return {
                "status_code": 200,
                "ipregistry": ipregistry_scan
            }
        else: 
            return {
                "status_code": 400,
                "ipregistry": ipregistry_scan
            }
    else:
        return {
            "status_code": 401,
            "message": "You entered a value that does not appear to be a valid domain or IP address"
        }
    

@app.route('/_shodan_scan', methods=['POST'])
def shodan_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ip_address')

    shodan_scan = shodan.shodan_scan(ip)

    if shodan_scan:
        return {
            "status_code": 200,
            "open_ports": shodan_scan["open_ports"]
        }
    
    else:
        return {
            "status_code": 404,
            "message": "Shodan couldn't find it"
        }
    

@app.route('/_sitecheck_scan', methods=['POST'])
def sitecheck_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ip_address')

    sitecheck_scan = sitecheck.sitecheck_scan(ip)

    if sitecheck_scan:
        return {
            "status_code": 200,
            "sitecheck_content": sitecheck_scan
        }
    else:
        return {
            "status_code": 400,
            "message": "Could not perform sitecheck scan!"
        }
    

@app.route('/_splunk_scan', methods=['POST'])
@login_required
def splunk_scan():
    if request.is_json:
        data = request.get_json()
        ip = data.get('ip_address')

    fields = ["_time", "dvc_name", "src_ip", "dest_ip", "dest_port", "action", "rule"]
    splunk_search = 'search index=* ' + ip + ' earliest=-24h@h | head 20 | table ' + ", ".join(fields)
    splunk_scan = splunk.splunk_scan(splunk_search)

    if splunk_scan:
        response = {
            "status_code": 200,
            "splunk_logs": splunk_scan,
            "fields": fields,
            "search": splunk_search
        }

        return jsonify(response)
    
    else:
        return jsonify({
            "status_code": 404,
            "message": "No hits found in the last 24 hours",
            "search": splunk_search
        })

    
@app.route('/_recently_reported_ips', methods=['POST'])
def recently_reported_ips():

    recently_reported_ips = abuseipdb.get_recently_reported_ips()

    return {
        "status_code": 200,
        "recently_reported_ips": recently_reported_ips
    }


@app.route('/_log', methods=['POST'])
@login_required
def get_log():
    if request.is_json:
        data = request.get_json()
        current_log_size = data
        try:
            log = ipctrl.get_access_log(current_log_size)
            return {
                "status_code": 200,
                "log": log
            }
        except:
            return {
                "status_code": 500,
                "info": "Error occured while getting access log"
            }


# Handle request from the IP form
@app.route('/_ip_lookup', methods=['POST'])
@login_required
def search_ip(): 
    if request.is_json:
        data = request.get_json()
        input_value = data.get('inputValue')
        
        if ipctrl.validate_input_value(input_value):

            try:
                ip_lookup = ipctrl.ip_lookup(input_value)

                if ip_lookup:
                    return {
                        "status_code": 200,
                        "ipLookup": ip_lookup
                    }
                else:
                    return {
                        "status_code": 404,
                        "info": "notFound",
                        "ip": input_value
                    }
            except:
                return {
                    "status_code": 500,
                    "info": "Error searching IP"
                }
        
        else:
            return {
                "status_code": 400,
                "info": "Injection"
            }


@app.route('/_recently_added_ips')
@login_required
def get_recently_added_ips():
    rai.update()

    with open('config.json', "r") as f:
        recently_added_ips_filepath = json.load(f)['recently_added_ips_filepath']
    
    with open(recently_added_ips_filepath) as f:
        recently_added_ips = json.load(f)

    return {
        "status_code": 200,
        "recently_added_ips": recently_added_ips
    }


@app.route('/<path:any_text>')
def handle_dynamic_text(any_text):
    if ipctrl.list_name_check(any_text):
        list_path = ipctrl.get_lists_dict()[any_text]["path"]
        return send_file(list_path)
    else:
        return {
            "status_code": 404,
            "info": "File was not found"
        }


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    with open("config.json", "r") as file:
        debug = json.load(file)['debug']

    app.run(debug=debug, host='0.0.0.0')
