let selectedList;
let selectedIps = [];

let blacklists = [];
let whitelists = [];

let recentlyReportedIps = [];

let loadingElement = "<pre>Loading...</pre>";

$(document).ready(async function () {  
    
    // Hide 
    $('#list-loading').hide();
    $(".virustotal-loading").hide();
    $("#bgphenet-loading").hide();
    $("#abuseipdb-loading").hide();
    $("#screenshot-loading").hide();
    $("#shodan-loading").hide();
    $("sitecheck-loading").hide();
    
    $("#bgp-ip").hide();
    $("#bgp-dns").hide();
    
    $('#info-alert').hide();

    $("#follow-btn").hide();

    $(".tab-buttons-container").hide()

    
    // Get and display lists
    await getLists();
    displayLists();

    
    // Select the first list when page is loaded
    let firstListContent = await getListContent(blacklists[0])
    selectedList = findElementByAttr('.list-btn', 'data-list-name', blacklists[0]);
    $('.list-btn').removeClass('active');
    selectedList.addClass("active");
    displayList(firstListContent);

    
    // Display Recently Added IPs
    recentlyAddedIps = await getRecentlyAddedIps();
    displayRecentlyAddedIps(recentlyAddedIps);  
    setInterval(intervalRecentlyAddedIps, 3000);

    
    // Get recently reported IPs from AbuseIpDb
    recentlyReportedIps = await getRecentlyReportedIps();
    displayRecentlyReportedIps();

    
    // Run Logs
    setInterval(fetchLogData, 3000);
    setInterval(followLogs, 3000);

    followLogs();
    fetchLogData();
});


async function intervalRecentlyAddedIps() {
    recentlyAddedIps = await getRecentlyAddedIps();
    displayRecentlyAddedIps(recentlyAddedIps); 
}


// Function to scroll to element in lists.
function scrollTo(element) {
    const elementPosition = element.position().top + element.parent().scrollTop() - 500;
    $(element.parent())[0].scrollTop = elementPosition;
}


// Function to display messages
function displayMessage(message, type="") {
    let alert = $('<div class="alert" role="alert"></div>').text(message)
    alert.attr("class", "alert alert-" + type);
    
    $('#alert-container').append(alert);
    setTimeout(function() {
        alert.css('animation', 'slideOut 0.5s forwards');
        setTimeout(function() {
            alert.remove();
        }, 500);
    }, 3000);
}

// Helps to find elements in lists when needed
function findElementByAttr(elementsIdentificator, attrName, value) {
    let elements = $(elementsIdentificator);
    for (let i = 0; i < elements.length; i++) {
        let el = $(elements[i])
        if (el.attr(attrName).includes(value)) {
            return $(elements[i]);
        };
    };
    return false;
};

// Validation function
function validateInputValue(value) {
    value = stripInput(value);
    if (!value) {
        return false;
    };
    
    if (validator.isIP(value)) {
        if (!isPrivateIP(value) && !filterIP(value) && isValidNonLoopbackIP(value)) {
            return "ip";
        }
    } else if (validator.isFQDN(value)) {
        return "domain";
    };

    return false;
};

function isPrivateIP(ip) {
    const parts = ip.split('.').map(Number);
    return (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168)
    );
}

function isValidNonLoopbackIP(ip) {
    const parts = ip.split('.').map(Number);
    return parts[0] !== 127 && !(parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0) && !/^0[0-9]+/.test(ip);
}

function isIPInRange(ip, rangeStart, rangeEnd) {
    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(rangeStart);
    const endNum = ipToNumber(rangeEnd);
    return ipNum >= startNum && ipNum <= endNum;
}

function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

function filterIP(ip) {
    const ranges = [
        { start: '0.0.0.0', end: '0.255.255.255' },
        { start: '10.0.0.0', end: '10.255.255.255' },
        { start: '127.0.0.0', end: '127.255.255.255' },
        { start: '169.254.0.0', end: '169.254.255.255' },
        { start: '172.16.0.0', end: '172.31.255.255' },
        { start: '192.0.0.0', end: '192.0.0.7' },
        { start: '192.0.2.0', end: '192.0.2.255' },
        { start: '192.88.99.0', end: '192.88.99.255' },
        { start: '192.168.0.0', end: '192.168.255.255' },
        { start: '198.18.0.0', end: '198.19.255.255' },
        { start: '198.51.100.0', end: '198.51.100.255' },
        { start: '203.0.113.0', end: '203.0.113.255' },
        { start: '224.0.0.0', end: '239.255.255.255' },
        { start: '240.0.0.0', end: '255.255.255.255' }
    ];

    return ranges.some(range => isIPInRange(ip, range.start, range.end));
}




function stripInput(inputValue) {
    inputValue = inputValue.trim().replace("https://", "").replace("http://", "").replace("*.", "");

    if (inputValue.includes('/')) {
        inputValue = inputValue.split('/')[0];
    };

    return inputValue;
};