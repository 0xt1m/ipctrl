function getListContent(listName) {
    return new Promise((resolve, reject) => {
        $('#list-content').hide();
        $('#list-loading').show();

        $.ajax({
            type: 'POST',
            url: '/_get_list',
            contentType: 'application/json',
            data: JSON.stringify({
                listName: listName
            }),
            success: function (data) {
		        if (data.status_code == 200) {
                    resolve(data.list_content); 
                } else {
                    displayMessage(data.info, "danger");
                    reject();
                }

                $('#list-loading').hide();
                $('#list-content').show();
            },
            error: function() {
                reject();
            }
        });
    });
};


async function displayList(listContent) {     
    if (listContent) {
        $("#list-content").empty();

        for (let i = listContent.length - 1; i >= 0; i--) {
            let ip = listContent[i].trim();
            let attrs = "class='list-group-item list-group-item-action ip-btn' id='ip-btn' data-ip='" + ip + "'";

            let removeBtn = "<button class='remove-ip-btn btn btn-danger' data-ip='" + ip + "'>Remove</button>";
            let ipBtn = "<a " + attrs + ">" + ip + removeBtn + "</a>";

            $("#list-content").append(ipBtn);
        }
    }
};


// Handle clicking on one of the IPs
$("#list-content").on("click", ".ip-btn", function (event) {    
    let selectedIP = $(this).attr("data-ip").trim();

    // ctrl key handler
    // For deleting a few IPs
    if (!event.ctrlKey) {
        $(".ip-btn").removeClass("bg-dark text-white active");
        selectedIps = [];
    }
    
    if (event.ctrlKey && !$(this).hasClass("active")) {
        $(this).addClass("active");
        selectedIps.push(selectedIP);

    } else if (event.ctrlKey && $(this).hasClass("active")) {
        $(this).removeClass("active");
        selectedIps = selectedIps.filter(item => item !== selectedIP);

    } else {
        $(".ip-btn").removeClass("bg-dark text-white active");
        $(this).addClass("active")
        selectedIps.push(selectedIP);
    };
    
    $("#add-ip-input").val("");
    $("#live-search").val(selectedIP);
    performScan(selectedIP)
});


// Live search
$("#live-search").on("input", function() {
    $(".ip-btn").removeClass("bg-dark text-white");
    let currentInputValue = $(this).val().trim();
    if (currentInputValue) {
        let matchedElement = findElementByAttr(".ip-btn", "data-ip", currentInputValue);
        if (matchedElement) {
            matchedElement.addClass("bg-dark text-white");
            scrollTo(matchedElement);
        };
    };
});

// Hitting Enter handler
$("#live-search").on("keydown", function(event) {
    if (event.key === "Enter") {
        let currentInputValue = $(this).val().trim();
        let matchedElement = findElementByAttr(".ip-btn", "data-ip", currentInputValue);
        if (matchedElement) {
            matchedElement.click();
        }
    }
});