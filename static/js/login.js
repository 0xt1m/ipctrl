$(document).ready(function() {
    $("#login-form").submit(function(event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/login",
            data: $(this).serialize(),
            success: function(response) {
                if (response == "Invalid credentials") {
                    alert(response);
                } else {
                    window.location.href = '/';
                }
            }
        });
    });
});