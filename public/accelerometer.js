// Function to send configuration message
function sendConfig() {
    let config = {
        type: "config",
        graphType: "line",
        xLabel: "Time (ms)",
        yLabel: "Acceleration (mg)",
        scale: { min: -1024, max: 1024 },
        sensors: ["accelX", "accelY", "accelZ"]
    };
    let configJSON = JSON.stringify(config);
    serial.writeLine(configJSON); // Ensure full message sent
}

// Function to send accelerometer data
function sendData() {
    let timestamp = input.runningTime();
    let data = {
        type: "data",
        timestamp: timestamp,
        values: {
            accelX: input.acceleration(Dimension.X),
            accelY: input.acceleration(Dimension.Y),
            accelZ: input.acceleration(Dimension.Z)
        }
    };
    let dataJSON = JSON.stringify(data);
    serial.writeLine(dataJSON); // Ensure full message sent
}

// Initialize and start sending data
serial.redirectToUSB();

let counter = 0;
basic.forever(function () {
    counter = counter % 10;

    if (counter == 0) {
        sendConfig();
        basic.pause(100);  //  Small delay to ensure full transmission
    }

    sendData();
    basic.pause(300); 
    counter += 1;
});
