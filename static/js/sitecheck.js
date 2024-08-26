function sitecheckScan(ipAddress) {
    $.ajax({
        type: 'POST',
        url: '/_sitecheck_scan',
        contentType: 'application/json',
        data: JSON.stringify({
            ip_address: ipAddress
        }),
        success: function(data) {
            if (data.status_code === 200) {
                displaySitecheck(data["sitecheck_content"]);

            } else if (data.status_code === 400) {
                $("#sitecheck").empty();
                $("#sitecheck").append("<p class='text-danger'>" + data["message"] + "</p>");
                $("#sitecheck").show();
                $("#sitecheck").siblings(".loading-element").remove();
            }
        }
    });
}

function displaySitecheck(data) {
    let sitecheckElement =  $("#sitecheck");
    sitecheckElement.empty();

    let html = '<div class="container card-container">';
    
    function createBlock(title, content) {
      return `
        <div class="card mb-3">
          <div class="card-header">${title}</div>
          <div class="card-body">
            ${content}
          </div>
        </div>`;
    }

    function formatValue(value) {
      if (typeof value === 'string' && (value.includes('</div>') || value.includes('</a>'))) {
        return value; // Return HTML content as-is
      }
      if (typeof value === 'object') {
        return `<pre>${JSON.stringify(value, null, 4)}</pre>`;
      }
      if (Array.isArray(value)) {
        let content = '<ul>';
        value.forEach(item => {
          content += `<li>${item}</li>`;
        });
        content += '</ul>';
        return content;
      }
      return value;
    }

    $.each(data, function(key, value) {
      let content = '';
      if (typeof value === 'object' && !Array.isArray(value)) {
        content += '<ul>';
        $.each(value, function(subKey, subValue) {
          let displayKey = typeof subKey === 'string' ? subKey.charAt(0).toUpperCase() + subKey.slice(1) : subKey;
          content += `<li>${displayKey}: ${formatValue(subValue)}</li>`;
        });
        content += '</ul>';
      } else {
        content += formatValue(value);
      }
      html += createBlock(key.charAt(0).toUpperCase() + key.slice(1), content);
    });

    html += '</div>';

    sitecheckElement.append(html);
    
    sitecheckElement.show();
    sitecheckElement.siblings('.loading-element').remove();
}