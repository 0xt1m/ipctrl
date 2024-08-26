function getLists() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/_get_lists',
            success: function(data) {
                if (data.status_code === 200) {
                    blacklists = data.lists.blacklists
                    whitelists = data.lists.whitelists
                } else {
                    displayMessage(data.info, "danger")
                }
                resolve(data);
            },
            error: function() {
                reject();
            }
        });
    });
};


function displayLists() {
    for (let i = 0; i < blacklists.length; i++) {
        let listName = blacklists[i];
        let attrs = "class='list-group-item list-group-item-action list-btn' data-list-name='" + listName + "'";
        $("#blacklists").append("<button " + attrs + ">" + listName + "</button>");
    }
    
    for (let i = 0; i < whitelists.length; i++) {
        let listName = whitelists[i];
        let attrs = "class='list-group-item list-group-item-action list-btn' data-list-name='" + listName + "'";
        $("#whitelists").append("<button " + attrs + ">" + listName + "</button>");
    }
};


// Handle clicking on one of the lists
$("#blacklists, #whitelists").on("click", ".list-btn", async function () {      
    selectedList = $(this);
    let listName = selectedList.attr("data-list-name");
    
    $('.list-btn').removeClass('active');
    selectedList.addClass("active");
    
    let listContent = await getListContent(listName);
    displayList(listContent);

    // Clean Up
    selectedIps = [];
    $("#add-ip-input").val("");
    $("#live-search").val("");
});


// function findElement(elementIdentifier, text) {
//     let $matchingElements = $(elementIdentifier).filter(function() {
//         return $(this).text().trim() === text;
//     })
//     return $matchingElements;
// };
