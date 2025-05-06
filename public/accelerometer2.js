// Function to send configuration message
function sendConfig() {
    let config = {
        type: "config",
        graphType: "line",
        title: "Live Accelerometer Data",
        x: {
            label: "time (seconds)",
            min: 0,
            max: 10000
        },
        y: {
            label: "Acceleration (mg)",
            min: -1024,
            max: 1024
        },
        series: [
            { displayName: "Accel X", x_column: "time", y_column: "accelX", color: 0xff0000, icon: "cross" },
            { displayName: "Accel Y", x_column: "time", y_column: "accelY", color: 0x00ff00, icon: "cross" },
            { displayName: "Accel Z", x_column: "time", y_column: "accelZ", color: 0x0000ff, icon: "cross" }
        ]
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
        basic.pause(100);  // Small delay to ensure full transmission
    }

    sendData();
    basic.pause(300); 
    counter += 1;
});
