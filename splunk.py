import json
import time
import splunklib.client as client
import splunklib.results as results

with open("config.json", "r") as file:
    config = json.load(file)

API_TOKEN = config['splunk']['api_token']

# Define your Splunk connection parameters
SPLUNK_HOST = config['splunk']['host']

# Create a Service instance and provide your Splunk credentials and host information
service = client.connect(
    host=SPLUNK_HOST,
    port=8089,
    token=API_TOKEN
)


def splunk_scan(search_query):
    job = service.jobs.create(search_query)

    while not job.is_ready():
        time.sleep(2)

    results_stream = job.results(output_mode="json")
    reader = results.JSONResultsReader(results_stream)

    splunk_logs = []
    for hit in reader:
        if isinstance(hit, dict):
            splunk_logs.append(hit)
    
    return splunk_logs