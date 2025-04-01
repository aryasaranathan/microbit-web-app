// Function to send configuration message
function sendConfig() {
    let config = {
        type: "config",
        graphType: "scatter",
        title: "Live Accelerometer Data",
        x: {
            label: "Time (ms)",
            min: 0,
            max: 10000
        },
        y: {
            label: "Acceleration (mg)",
            min: -1024,
            max: 1024
        },
        series: [
            { displayName: "Accel X", name: "accelX", color: "#ff0000", symbol: "x" },
            { displayName: "Accel Y", name: "accelY", color: "#00ff00", symbol: "x" },
            { displayName: "Accel Z", name: "accelZ", color: "#0000ff", symbol: "x" }
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
