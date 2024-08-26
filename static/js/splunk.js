function splunkPaloScan(ipAddress) {
    $.ajax({
        type: 'POST',
        url: '/_splunk_scan',
        contentType: 'application/json',
        data: JSON.stringify({
            ip_address: ipAddress
        }),
        success: function(data) {
            let splunkElement = $("#splunk");
            splunkElement.empty();

            if (data.status_code === 200) {
                displaySplunk(data, splunkElement);

            } else if (data.status_code === 404) {
                let message = data.message;
                let messageElement = "<p class='text-danger'>" + message + "</p>";

                splunkElement.append(messageElement);
                splunkElement.show();

                splunkElement.siblings('.loading-element').remove();
            }
        }
    })
};


function displaySplunk(data, splunkElement) {   
    let splunkLogs = data.splunk_logs;
    let splunkSearch = data.search;
    let splunkSearchFields = data.fields;
    
    let encodedQuery = encodeURIComponent(splunkSearch);
    let splunkSearchUrl = `https://splunk.organization.org:8000/en-US/app/search/search?q=${encodedQuery}`;
    let allResultsElement = "<a href='" + splunkSearchUrl + "' target='_blank'>See all results in Splunk</a>";

    splunkElement.append(allResultsElement);

    let tableElement = getHtmlSplunkTable(splunkSearchFields, splunkLogs);

    splunkElement.append(tableElement);

    splunkElement.show();
    splunkElement.siblings('.loading-element').remove();
}


function getHtmlSplunkTable(head, contents) {
    let tableElement = "<table calss='table table-dark splunk-logs-table'>";

    // Table Head
    tableElement += "<thead>";
    tableElement += "<tr>";  
    head.forEach(element => {
        tableElement += "<th scope='col'>" + element + "</th>";
    });   
    tableElement += "</tr>";
    tableElement += "</thead>";

    // Table Body
    tableElement += "<tbody>";

    for (let i in contents) {

        tableElement += "<tr>";
        head.forEach(element => {
            tableElement += "<td>" + contents[i][element] + "</td>";
        });
        tableElement += "</tr>";
    }

    tableElement += "</tbody>";
    tableElement += "</table>";

    return tableElement;
}