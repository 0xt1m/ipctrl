// Search button handler
$("#ip-lookup-btn").on("click", async function() {
    let inputValue = $("#ip-lookup-input").val();
    inputValue = stripInput(inputValue);
    
    performScan(inputValue, listsScan=true);
});

// Hitting Enter Handler
$("#ip-lookup-input").on("keydown", function(event) {
    if (event.key === "Enter") {
        $("#ip-lookup-btn").click();
    }
});

async function performScan(input, listsScan=false) {
    let ip = stripInput(input);
    domain = stripInput(input);

    hideContent();
    showLoading();

    let virusTotalScanData = await virusTotalScan(ip);
    let isValid = validateInputValue(ip);

    if (isValid && virusTotalScanData) {
        $("#ip-lookup-input").val(input);
        $(".tab-buttons-container").show();
        
        if (isValid === "ip") {
            domain = await getHostname(ip);

        } else if (isValid === "domain") {
            let aRecords = virusTotalScanData.attributes.last_dns_records.filter(record => record.type === "A");
            if (aRecords.length) {
                ip = aRecords[0].value; 
            }
        }
    } else {
        displayMessage("Invalid input", "danger");
        return null;
    };
    
    abuseIpDbScan(input);
    shodanScan(ip);
    sitecheckScan(domain);
    ipRegistryScan(ip);
    getScreenshot(domain);
    bgpHeNetScan(input);
    splunkPaloScan(input);
    splunkMerakiScan(input);

    $(".input-scan-value").html("<b>" + input + "</b>").show();
    $(".ip-scan-value").html("<b>" + ip + "</b>").show();
    $(".domain-scan-value").html("<b>" + domain + "</b>").show();

    if (listsScan) {
        // Clean up
        selectedIps = [];
        $('.ip-btn').removeClass('active bg-dark text-white');
        
        performListsScan(input);
    };
};


async function performListsScan(ip) {
    var listsLookup = await lookupInLists(ip);
    if (listsLookup) {
        let listName = listsLookup.list;
        let ip = listsLookup.ip

        // Select list
        let listContent = await getListContent(listName);
        displayList(listContent)

        selectedList = findElementByAttr('.list-btn', 'data-list-name', listName);
        $('.list-btn').removeClass('active');
        selectedList.addClass("active");

        // Select IP
        selectedIps.push(ip);

        let ipElement = findElementByAttr(".ip-btn", "data-ip", ip);
        ipElement.addClass("active");
        scrollTo(ipElement);

    } else {
        $("#add-ip-input").val(ip);
    };
}

function lookupInLists(inputValue) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type:'POST',
            url: '/_ip_lookup',
            contentType: 'application/json',
            data: JSON.stringify({
                inputValue: inputValue
            }),
            success: function(data) {
                if (data.status_code === 200) {
                    resolve(data.ipLookup);
                } else if (data.status_code === 404) {
                    displayMessage(data.ip + " was not found in your lists", "warning");
                } else {
                    displayMessage(data.info, "danger");
                }
                resolve(false);
            },
            error: function() {
                reject();
            }
        });
    });
}


function hideContent() {
    $(".input-scan-value").hide();
    $(".ip-scan-value").hide();
    $(".domain-scan-value").hide();

    let scanElements = [
        $("#virustotal-stats"), 
        $("#virustotal-avs"), 
        $("#abuseipdb"), 
        $("#shodan"), 
        $("#sitecheck"), 
        $("#ipregistry"), 
        $("#map-location"), 
        $("#screenshot"), 
        $("#virustotal-dns-records"), 
        $("#whois-data"), 
        $("#bgphenet"),
        $("#splunk-palo"),
        $("#splunk-meraki")
    ];

    scanElements.forEach(element => {
        element.hide();
    });
}


function showLoading() {
    let loadingElement = $("<p class='loading-element'>Loading...</p>");
    $(".tab-content").append(loadingElement);
};


async function getHostname(ip) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/_get_hostname',
            contentType: 'application/json',
            data: JSON.stringify({
                ip: ip
            }),
            success: function(data) {
                if (data.status_code === 200) {
                    resolve(data.hostname);
                } else if (data.status_code === 404) {
                    resolve(ip)
                }
            },
            error: function() {
                reject();
            }
        })
    })
}