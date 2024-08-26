function virusTotalScan(ipAddress) {
    return new Promise((resolve, reject) => {        
        $.ajax({
            type: 'POST',
            url: '/_virustotal_scan',
            contentType: 'application/json',
            data: JSON.stringify({
                ipAddress: ipAddress
            }),
            success: function(data) {        
                data = JSON.parse(data);
                if (data.error) {
                    $("#virustotal-stats").empty();
                    $("#virustotal-dns-records").empty();
                    $("#virustotal-avs").empty();
                    resolve();
                    
                } else if (data.data) {
                    virusTotalScanData = data.data;
    
                    let statsData = data.data.attributes.last_analysis_stats;
                    let avsData = data.data.attributes.last_analysis_results;
                    let whoisData = data.data.attributes.whois;

                    $(".virustotal-scan-value").html("<b>" + ipAddress + "</b>");
                    
                    displayVirusTotalStats(statsData);
                    
                    if (data.data.type === "domain") {
                        displayDnsRecords(data.data.attributes.last_dns_records);
                    } else {
                        let dnsRecordsElement = $("#virustotal-dns-records");
                        dnsRecordsElement.empty();
                        dnsRecordsElement.append("<p class='text-danger'>No DNS Records for IP</p>");

                        dnsRecordsElement.show();
                        dnsRecordsElement.siblings('.loading-element').remove();
                    }
    
                    displayVirusTotalAVCheck(avsData);
                    displayWhois(whoisData);

                    resolve(data.data);
                } else {
                    displayMessage("VirusTotal doesn't work", "danger");
                }
            },
            error: function() {
                reject();
            }
        });
    });
};

// Display VirusTotal Stats
function displayVirusTotalStats(statsData) {
    let statsElement = $("#virustotal-stats");
    statsElement.empty();

    let statsTags = generateTagsForStats(statsData);

    for (let i = 0; i < statsTags.length; i++) {
        statsElement.append(statsTags[i] + " | ");
    };

    statsElement.show();
    statsElement.siblings('.loading-element').remove();
};

function generateTagsForStats(statsData) {
    let tags = [];
    
    let malicious = statsData.malicious;
    let suspicious = statsData.suspicious;
    let undetected = statsData.undetected;
    let harmless = statsData.harmless;
    let timeout = statsData.timeout;

    if (malicious === 0) {
        let tag = `<span class="text-success">Malicious: ${malicious}</span>`;
        tags.push(tag);
    } else if (malicious > 0 && malicious < 8) {
        let tag = `<span class="text-warning">Malicious: ${malicious}</span>`;
        tags.push(tag);
    } else if (malicious >= 8) {
        let tag = `<span class="text-danger">Malicious: ${malicious}</span>`;
        tags.push(tag);
    };

    if (suspicious === 0) {
        let tag = `<span class="text-success">Suspicious: ${suspicious}</span>`;
        tags.push(tag);
    } else if (malicious > 0 ) {
        let tag = `<span class="text-warning">Suspicious: ${suspicious}</span>`;
        tags.push(tag);
    };

    tags.push(`<span>Undetected: ${undetected}`);

    if (harmless > 64) {
        let tag = `<span class="text-success">Harmless: ${harmless}</span>`;
        tags.push(tag);
    } else if (harmless <= 64) {
        let tag = `<span class="text-warning">Harmless: ${harmless}</span>`;
        tags.push(tag);
    }

    if (timeout === 0) {
        let tag = `<span class="text-success">Timeout: ${timeout}</span>`;
        tags.push(tag);
    } else if (timeout > 0) {
        let tag = `<span class="text-warning">Timeout: ${timeout}</span>`;
        tags.push(tag);
    };

    return tags;
};


// Display VirusTotal Antirviruses check
function displayVirusTotalAVCheck(avsData) {
    let avsElement = $("#virustotal-avs");
    avsElement.empty();

    let tableElement = "<table class='table table-dark virustotal-av-table'>";
    
    // Table Head
    tableElement += "<thead>";
    tableElement += "<tr>";
    // tableElement += "<th scope='col'>#</th>";
    tableElement += "<th scope='col'>Antivirus</th>";
    tableElement += "<th scope='col'>Method</th>";
    tableElement += "<th scope='col'>Engine Name</th>";
    tableElement += "<th scope='col'>Category</th>";
    tableElement += "<th scope='col'>Result</th>";
    tableElement += "</tr>";
    tableElement += "</thead>";

    // Table Body
    tableElement += "<tbody>";

    for (let i in avsData) {
        let name = i;
        let method = avsData[i].method;
        let engineName = avsData[i].engine_name;
        let category = avsData[i].category;
        let result = avsData[i].result;

        tableElement += "<tr>";

        tableElement += "<td>" + name + "</td>";
        tableElement += "<td>" + method + "</td>";
        tableElement += "<td>" + engineName + "</td>";
        tableElement += "<td>" + category + "</td>";

        if (result === "malicious") {
            tableElement += "<td class='text-danger'>" + result + "</td>";
        } else if (result === "clean") {
            tableElement += "<td class='text-success'>" + result + "</td>";
        } else if (result === "unrated") {
            tableElement += "<td>" + result + "</td>";
        } else {
            tableElement += "<td class='text-warning'>" + result + "</td>";
        };

        tableElement += "</tr>";
    };
    
    tableElement += "</tbody>";

    tableElement += "</table>";

    avsElement.append(tableElement);
    avsElement.show();
    avsElement.siblings(".loading-element").remove();
};


// Display DNS records
function displayDnsRecords(dnsRecords) {
    let dnsRecordsElement = $("#virustotal-dns-records");
    dnsRecordsElement.empty();

    let tableElement = "<table class='table table-dark virustotal-dns-table'>";
    
    // Table Head
    tableElement += "<thead>";
    tableElement += "<tr>";
    tableElement += "<th scope='col'>Type</th>";
    tableElement += "<th scope='col'>TTL</th>";
    tableElement += "<th scope='col'>Value</th>";
    tableElement += "</tr>";
    tableElement += "</thead>";

    // Table Body
    tableElement += "<tbody>";

    for (let i in dnsRecords) {
        let type = dnsRecords[i].type;
        let ttl = dnsRecords[i].ttl;
        let value = dnsRecords[i].value;

        tableElement += "<tr>";

        tableElement += "<td>" + type + "</td>";
        tableElement += "<td>" + ttl + "</td>";
        tableElement += "<td>" + value + "</td>";

        tableElement += "</tr>";
    };
    
    tableElement += "</tbody>";
    tableElement += "</table>";

    dnsRecordsElement.append(tableElement);
    dnsRecordsElement.show();
    dnsRecordsElement.siblings(".loading-element").remove();
};


// Display whois data
function displayWhois(whoisData) {
    let whoisElement = $("#whois-data");
    whoisElement.empty();
    whoisElement.append("<pre>" + whoisData + "</pre>");
    whoisElement.show();
    whoisElement.siblings(".loading-element").remove();
};