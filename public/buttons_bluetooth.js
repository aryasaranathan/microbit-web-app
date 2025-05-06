//I MPORTANT: this will only commpile into the correct hex file
// if the 'no pairing required' option in MakeCode bluetooth settings is used

basic.showIcon(IconNames.Happy)
bluetooth.startUartService()
bluetooth.startLEDService()
bluetooth.startButtonService()
bluetooth.setTransmitPower(7)

let counter = 0
let timestamp = 0
let rightPresses = 0
// Button press counters
let leftPresses = 0


// Function to send button press data
function sendData () {
    timestamp = input.runningTime()
    let data = {
        type: "data",
        timestamp: timestamp,
        values: {
            left: leftPresses,
            right: rightPresses
        }
    };
let dataJSON = JSON.stringify(data);
bluetooth.uartWriteLine(dataJSON)
}
// Boosts Bluetooth signal strength
// Function to send configuration message
function sendConfig () {
    let config = {
        type: "config",
        graphType: "bar",
        title: "Live button presses",
        x: {
            label: "Buttons"
        },
        y: {
            label: "Press Count",
            min: 0,
            max: 20
        },
        series: [
            { displayName: "Left", y_column: "left", color: 0xff0000, icon: "circle" },
            { displayName: "Right", y_column: "right",  color: 0x00ff00, icon: "circle" }
        ]
    };
    let configJSON = JSON.stringify(config);
    bluetooth.uartWriteLine(configJSON);
}
input.onButtonPressed(Button.A, function () {
    leftPresses += 1
    if (counter % 3 == 0) {
        sendConfig()
        basic.pause(100)
    }
    counter += 1
    sendData()
})
input.onButtonPressed(Button.B, function () {
    rightPresses += 1
    if (counter % 3 == 0) {
        sendConfig()
        basic.pause(100)
    }
    counter += 1
    sendData()
})

