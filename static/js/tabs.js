$(document).ready(function() {
    $(".tab-content").hide();
    displayTab("tab1");
});


$('.tab-link').click(function() {
    var tabId = $(this).data('tab');
    $('.tab-link').removeClass('active');
    $(this).addClass('active');

    displayTab(tabId);
});


function displayTab(tabId) {
    $('.tab-content').removeClass('active').hide();
    $('#' + tabId).addClass('active').show();
}