const buttons = document.querySelectorAll(".bt1");
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        alert('This Button was clicked!');
    });
});