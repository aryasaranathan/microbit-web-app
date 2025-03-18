let streaming = false;

input.onButtonPressed(Button.A, function () {
    streaming = true;
    basic.showIcon(IconNames.Yes); // Show a checkmark icon when streaming starts
    control.inBackground(function () {
        while (streaming) {
            // Gather accelerometer data from all three axes
            let x = input.acceleration(Dimension.X);
            let y = input.acceleration(Dimension.Y);
            let z = input.acceleration(Dimension.Z);

            // Create a structured JSON object with timestamp and accelerometer data
            let data = {
                timestamp: control.millis(), // Add a timestamp to the data
                x: x,
                y: y,
                z: z
            };

            // Log data in JSON format (easily parsable on the receiving end)
            serial.writeLine(JSON.stringify(data));  // Send data as a JSON string

            basic.pause(200);  // Delay between readings
        }
    });
});

input.onButtonPressed(Button.B, function () {
    streaming = false;
    basic.clearScreen(); // Clear the display when streaming stops
});

// Enable serial communication to transmit data
serial.redirectToUSB();

