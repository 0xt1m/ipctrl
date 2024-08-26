let followingLogs = true;

function fetchLogData() {
    fetch('/_log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(getCurrentLogSize())
    })
    .then(response => response.text())
    .then(data => {
        data = JSON.parse(data);

        if (data.status_code = 200) {
            addLogs(data.log);
        } else {
            displayMessage(data.info, "danger")
        }
    })
    .catch(error => displayMessage("Error fetching logs", "danger")); 
}


function addLogs(data) {
    let logsCol = $(".rt-logs .col");
    for (let i = 0; i < data.length; i++) {
        logsCol.append("<div class='row border log'><p>" + data[i] + "</p></div>");
    }
}


function followLogs() {
    if (followingLogs) {
        $('.rt-logs').animate({
            scrollTop: $('.rt-logs')[0].scrollHeight
        }, 500);
    } else if (!followingLogs) {
        $("#follow-btn").show()
    }
};


function getCurrentLogSize() {
    return $(".log").length;
}


$("#follow-btn").on("click", function() {
    followingLogs = true;
    
    $('.rt-logs').animate({
        scrollTop: $('.rt-logs')[0].scrollHeight
    }, 500);

    $("#follow-btn").hide();
});

$('.rt-logs').on("mousewheel DOMMouseScroll", function(event) {
    followingLogs = false;
    $("#follow-btn").show()
})
