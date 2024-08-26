function displayRecentlyAddedIps(recentlyAddedIps) {
    let raiElement = $("#recently-added-ips");
    raiElement.empty();

    for (ip in recentlyAddedIps) {
        let ipElement = "<button class='list-group-item'>" + ip + " - " + recentlyAddedIps[ip]["list_name"] + "</button>";
        raiElement.append(ipElement);
    }
}

function getRecentlyAddedIps() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/_recently_added_ips',
            success: function(data) {
                if (data.status_code === 200) {
                    sortedRecentlyAddedIps = sortDictByTimestamp(data.recently_added_ips)
                    resolve(sortedRecentlyAddedIps);
                } else {
                    displayMessage(data.info, "danger")
                }
            },
            error: function() {
                reject();
            }
        });  
    });
};


function sortDictByTimestamp(data) {
    const dataArray = Object.entries(data);
    
    for (let i = 0; i < dataArray.length - 1; i++) {
        for (let j = 0; j < dataArray.length - i - 1; j++) {
            if (dataArray[j][1]["timestamp"] > dataArray[j+1][1]["timestamp"]) {
                const temp = dataArray[j];
                dataArray[j] = dataArray[j+1];
                dataArray[j+1] = temp;
            };
        };
    };
    
    const sortedData = Object.fromEntries(dataArray.slice(-5));
    return sortedData;
}