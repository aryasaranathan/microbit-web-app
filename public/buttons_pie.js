// Function to send configuration message
function sendConfig() {
    let config = {
        type: "config",
        graphType: "pie",
        title: "Live button presses",
        series: [
            { displayName: "Left", y_column: "left", color: 0xff0000, icon: "circle" },
            { displayName: "Right", y_column: "right", color: 0x00ff00, icon: "circle" }
        ]
    };
    let configJSON = JSON.stringify(config);
    serial.writeLine(configJSON); // Ensure full message sent
}

// Button press counters
let leftPresses = 0;
let rightPresses = 0;

// Function to send button press data
function sendData() {
    let timestamp = input.runningTime();
    let data = {
        type: "data",
        timestamp: timestamp,
        values: {
            left: leftPresses,
            right: rightPresses
        }
    };
    let dataJSON = JSON.stringify(data);
    serial.writeLine(dataJSON); // Ensure full message sent
}

// Initialize and start sending data
serial.redirectToUSB();
sendConfig();

let counter = 0;
// Increment counters on button press
input.onButtonPressed(Button.A, function () {
    leftPresses += 1;
    if (counter%3 == 0) {
        sendConfig();
        basic.pause(100);  // Small delay to ensure full transmission
    }
    counter += 1;
    sendData();
});

input.onButtonPressed(Button.B, function () {
    rightPresses += 1;
    if (counter%3 == 0) {
        sendConfig();
        basic.pause(100);  // Small delay to ensure full transmission
    }
    counter += 1;
    sendData();
});
