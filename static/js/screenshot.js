function getScreenshot(inputUrl) {
    url = "https://api.screenshotmachine.com/?key=13e824&url=" + inputUrl + "&dimension=1024x768";
    $.ajax({
        url: url,
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function(data) {
            $('#screenshot-loading').hide();
            $('#screenshot-img').show();

            displayScreenshot(data)
        },
        error: function(xhr, status, error) {
            console.error("Error", error);
        }
    });
}

function displayScreenshot(image) {  
    imageUrl = URL.createObjectURL(image);
    
    screenshotElement = $("#screenshot");
    screenshotElement.empty();

    imageElement = $('<img id="screenshot-img">').attr('src', imageUrl);

    screenshotElement.append(imageElement);
    screenshotElement.show();
    screenshotElement.siblings('.loading-element').remove();
}