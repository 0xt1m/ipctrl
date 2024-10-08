# IPCTRL
*Lightweight Flask Application to control Blacklists & Whitelists*

This is a simple web application to manage IP blacklists and whitelists. In addition to providing functionality for controlling the lists, you can perform IP lookups to determine whether an IP is good or bad. The lookup checks the IP against VirusTotal, AbuseIPDB, Shodan, etc. It will display a map with the IP's location, attempt to resolve the IP to a domain name, and take a screenshot of the associated website. You can also connect the application to Splunk to view the most recent logs associated with the IP.

---

## config.json
`./config.json`
1. Responsible for API keys.
2. Filepath to `lists.json`
3. Filepath to `access.log`
4. More

---

## lists.json
`./lists/lists.json`
Information about all of your lists. To add a new list you should go to `lists.json` and add new json object. 
*Template:*
```
{
...
    "newlist.txt": {
        "path": "/file/path/newlist.txt",
        "type": "blacklist"
    }
}
```

---

## users.py
`./users.py`
This is a python script for managing users for the application.
```
usage: users.py [-h] {add,a,remove,r,change-password,cp,list,l} ...

Manage users in the database.

positional arguments:
  {add,a,remove,r,change-password,cp,list,l}
                        Sub-commands: add, remove, change-password, list
    add (a)             Add a new user
    remove (r)          Remove an existing user
    change-password (cp)
                        Change the password of an existing user
    list (l)            List all existing users

options:
  -h, --help            show this help message and exit
```

---

## app.py
`./app.py`
Responsible for running the application.
Deploying the app: [Youtube Video](https://www.youtube.com/watch?v=KWIIPKbdxD0)

```
# For debug purposes
python3 app.py
```