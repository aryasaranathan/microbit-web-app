// Function to send configuration message
function sendConfig() {
    let config = {
        type: "config",
        graphType: "bar",
        title: "Live button presses",
        y: {
            label: "Press Count",
            min: 0,
            max: 20
        },
        series: [
            { displayName: "Left", name: "left", color: "#ff0000"},
            { displayName: "Right", name: "right", color: "#00ff00"}
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
