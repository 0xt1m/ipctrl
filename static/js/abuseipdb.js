// Scan
function abuseIpDbScan(ipAddress) {
    $.ajax({
        type: 'POST',
        url: '/_abuseipdb_scan',
        data: JSON.stringify({
            ipAddress: ipAddress
        }),
        contentType: 'application/json',
        success: function(data) {            
            if (data.status_code === 200) {
                displayAbuseIpDbScan(data.abuseIpDb);
            } else if (data.status_code === 400) {
                $("#abuseipdb").html("<b class='text-danger'>" + data.info + "<b>");
                $("#abuseipdb").show();
                $("#abuseipdb").siblings('.loading-element').remove();
            }
        }
    });
};

function displayAbuseIpDbScan(abuseIpDbData) {
    let abuseElement = $("#abuseipdb");
    abuseElement.empty();
    if (abuseIpDbData.abused) {
        abuseElement.append("<h4>AbuseIPDB Report</h4>");
	    abuseElement.append("<b>" + abuseIpDbData.ip + "</b>");
        abuseElement.append(abuseIpDbData.description);
        abuseElement.append(abuseIpDbData.info_table);
        abuseElement.append(abuseIpDbData.recent_reports);
    } else {
        let new_value = $("<p>" + abuseIpDbData.ip + " was not found in AbuseIPDB's database</p>");
        abuseElement.append(new_value);
    }
    
    abuseElement.show();
    abuseElement.siblings(".loading-element").remove();
}


// Recently Reported IPs
function getRecentlyReportedIps() {
    return new Promise((resolve, reject) => {
        $(".recently-reported-ips").hide();

        $.ajax({
            type: 'POST',
            url: '/_recently_reported_ips',
            contentType: 'application/json',
            success: function(data) {
                if (data.status_code === 200) {
                    resolve(data.recently_reported_ips);
                    $(".recently-reported-ips-loading").hide();
                    $(".recently-reported-ips").show()
                } else {
                    displayMessage(data.info, "danger");
                }
            },
            error: function() {
                reject();
            }
        });
    });
};

function displayRecentlyReportedIps() {
    for (let i = 0; i < 10; i++) {
        let new_row = "<pre>";
        new_row += recentlyReportedIps[i]["flag_tag"] + " ";
        new_row += recentlyReportedIps[i]["ip_tag"];
        new_row += "</pre>";
        
        $("#recently-reported-ips").append(new_row);
    }
}
