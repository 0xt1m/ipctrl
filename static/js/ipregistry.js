function ipRegistryScan(ipAddress) {
    $.ajax({
        type: 'POST',
        url: '/_ipregistry_scan',
        contentType: 'application/json',
        data: JSON.stringify({
            ip_address: ipAddress
        }),
        success: function(data) {
            if (data.status_code === 200) {
                displayIpregistry(data["ipregistry"]);
            }
            else if (data.status_code === 400) {
                displayIpregistryError(data["ipregistry"]);
            }
            else if (data.status_code === 401) {
                displayIpregistryError(data)
            }
        }
    });
}


function displayIpregistry(data) {
    let ipregistryElement = $("#ipregistry");
    let mapElement = $("#map-location");
    ipregistryElement.empty();
    mapElement.empty();

    let location = data["location"];

    let countryName = location["country"]["flag"]["emoji"] + location["country"]["name"];
    let region = location["region"]["name"];
    let city = location["city"];
    let latitude = location["latitude"];
    let longitude = location["longitude"];

    let locationTextTag = "<p>" + countryName + ", " + region + ", " + city
    let mapsFrame = '<iframe frameborder="0" style="border:0" width="100%" height=100%" src="https://www.google.com/maps?q=' + latitude + ',' + longitude + '&hl=es;z=14&output=embed" allowfullscreen></iframe>'
    
    ipregistryElement.append(locationTextTag);
    mapElement.append(mapsFrame);
    
    ipregistryElement.show();
    ipregistryElement.siblings('.lodaing-element').remove();
    
    mapElement.show();
    mapElement.siblings('.loading-element').remove();
}

function displayIpregistryError(data) {
    let ipregistryElement = $("#ipregistry");
    let mapElement = $("#map-location");
    ipregistryElement.empty();
    mapElement.empty();

    ipregistryElement.append("<strong class='text-danger'>" + data["message"] + "</strong>")
    
    ipregistryElement.show();
    ipregistryElement.siblings('.loading-element').remove();
}