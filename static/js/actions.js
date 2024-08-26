// Add IP handler
$("#add-ip-btn").on("click", function () {
    let currentListName = selectedList.attr("data-list-name");
    let addInputValue = $("#add-ip-input").val().trim();
    let newIps = [];
    
    // Get IPs
    if (addInputValue) {
        if (addInputValue.includes(',')) {
            newIps = addInputValue.split(',').map(value => value.trim()).filter(value => value !== '');
        } else {
            newIps = [addInputValue];
        }
    }   

    let invalidIPs = []
    newIps.forEach(ip => {
        if (!validateInputValue(ip)) {
            invalidIPs.push(ip);
            displayMessage("Invalid IP or Domain: " + ip, "danger");
        }
    });
    
    if (newIps.length && !invalidIPs.length) {
        addIps(newIps, currentListName);
    }
});

// Hitting Enter handler
$("#add-ip-input").on("keydown", function(event) {
    if (event.key === "Enter") {
        $("#add-ip-btn").click();
    }
});


function addIps(ips, listName) {
    $.ajax({
        type: 'POST',
        url: '/_add_ips',
        contentType: 'application/json',
        data: JSON.stringify({
            ips: ips,
            listName: listName,
        }),
        success: async function (data) {
            if (data.status_code === 200) {
                let message = "Added " + ips.join(", ") + " to " + listName;
                displayMessage(message, "success");

                // Clean up
                $("#add-ip-input").val("");

                // Refresh the list
                let selectedListContent = await getListContent(selectedList.text());
                displayList(selectedListContent);

                // Select the new IPs
                let lastAddedIp = ips[ips.length - 1];
                let lastAddedIpElement = findElementByAttr(".ip-btn", "data-ip", lastAddedIp);
                
                lastAddedIpElement.addClass("active");
                scrollTo(lastAddedIpElement);
                selectedIps = [lastAddedIp];

                // Scan new IP
                performScan(lastAddedIp);
            
            } else if (data.status_code === 400 && data.info === "existingIps") {
                displayMessage("Found: " + data.existingIps.join(" + "), "danger");
            
            } else if (data.status_code === 400 && data.info === "invalidIps") {
                displayMessage("Invalid IP(s): " + data.invalidIps.join(" + "), "danger");
            
            } else if (data.status_code === 400 && data.info === "privateIps") {
                displayMessage("Private IP(s): " + data.privateIps.join(" + "), "danger");
            
            } else if (data.status_code === 401) {
                displayMessage("You are not allowed to do it!", "danger");

            } else {
                displayMessage(data.info, "danger");
            };
        }
    });
};


// Remove IP handler
$("#list-content").on("click", ".remove-ip-btn", function() {
    let ip = $(this).attr("data-ip");
    let listName = selectedList.text();

    removeIps([ip], listName);
    
    selectedIps = [];
    $(".ip-btn").removeClass("bg-dark text-white active");
    $("#live-search").val("");
});


// Detele button handler
$(document).on("keydown", function(event) {
    if (event.key === "Delete" || event.keyCode === 46) {
        let listName = selectedList.text();
        if (selectedIps.length) {
            removeIps(selectedIps, listName);
            
            selectedIps = [];
            $(".ip-btn").removeClass("bg-dark text-white active");
            $("#live-search").val("");
        } else {
            displayMessage("Select IP(s)!", "danger");
        }
    };
});


function removeIps(ips, listName) {
    $.ajax({
        type: 'POST',
        url: '/_remove_ips',
        contentType: 'application/json',
        data: JSON.stringify({
            ips: ips,
            listName: listName,
        }),
        success: async function (data) {
            if (data.status_code === 200) {
                displayMessage("Removed " + data.ips + " from " + data.listName, "success");
                
                // Refresh the list
                let selectedListContent = await getListContent(selectedList.text());
                displayList(selectedListContent);

            } else if (data.status_code === 404) {
                let message = "Missing: " + data.missingIps[0]
                displayMessage(message, "danger");

            } else if (data.status_code === 401) {
                displayMessage("You are not allowed to do it!", "danger");

            } else {
                displayMessage(data.info, "danger");
            };
        }
    });
};
