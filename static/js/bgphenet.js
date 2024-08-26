let bgpData;

function bgpHeNetScan(ipAddress) {  
    $.ajax({
        type: 'POST',
        url: '/_bgphenet_scan',
        contentType: 'application/json',
        data: JSON.stringify({
            ipAddress: ipAddress
        }),
        success: function(data) {
			if (data.status_code === 200) {
                bgpData = data.bgphenet;
                displayBgphenet(data.bgphenet);
            } else {
                displayMessage(data.info, "danger");
                return false;
            }
        }
    });
};

function displayBgphenet(data) {
    let bgpheneElement = $("#bgphenet");
    bgpheneElement.empty();

    let html = '<div class="card-container">';

    function createBlock(title, content) {
      return `
        <div class="card mb-3">
          <div class="card-header">${title}</div>
          <div class="card-body">
            ${content}
          </div>
        </div>`;
    };

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
    };

    $.each(data, function(key, value) {
      let content = '';
      if (typeof value === 'object' && !Array.isArray(value)) {
        content += '<ul>';
        $.each(value, function(subKey, subValue) {
          content += `<li>${subKey.charAt(0).toUpperCase() + subKey.slice(1)}: ${formatValue(subValue)}</li>`;
        });
        content += '</ul>';
      } else {
        content += formatValue(value);
      }
      html += createBlock(key.charAt(0).toUpperCase() + key.slice(1), content);
    });

    html += '</div>';

    bgpheneElement.append(html);
	bgpheneElement.show();
	bgpheneElement.siblings('.loading-element').remove();
};
