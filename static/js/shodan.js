function shodanScan(ipAddress) {
    $.ajax({
        type: 'POST',
        url: '/_shodan_scan',
        contentType: 'application/json',
        data: JSON.stringify({
            ip_address: ipAddress
        }),
        success: function(data) {
            if (data.status_code === 200) {
                displayShodan(data);

            } else if (data.status_code === 404) {
                $("#shodan").empty();
                $("#shodan").append("<p class='text-danger'>" + data["message"] + "</p>");
                
                $("#shodan").show();
                $("#shodan").siblings('.loading-element').remove();
            }
        }
    });
}


function displayShodan(data) {
    let shodanElement = $("#shodan");
    shodanElement.empty();

    openPorts = data["open_ports"];

    let html = '<div class="number-container">';
    openPorts.forEach(port => {
      html += `<div class="number-box">${port.port_number}`;
      if ("service_name" in port) {
        html += ` -<br>${port.service_name}`;
      };

      html += '</div>';
    });
    html += '</div>';

    shodanElement.append(html);
    
    shodanElement.show();
    shodanElement.siblings(".loading-element").remove();
};