import { MicrobitConnectorUSB } from "./microbit/connection";
import { MicrobitConnectorBluetooth } from "./bluetooth/connection";
import { flashMicrobitUSBAccelerometer, flashMicrobitUSBButtons, flashMicrobitUSBButtonsPie, flashMicrobitUSBAccelerometerScatter, flashMicrobitUSBButtonsBluetooth} from "./microbit/flasher";
//import { Plotter } from './plot/plotter';
//import Plotly from 'plotly.js-dist';

const microbitConnectorUSB = new MicrobitConnectorUSB();
const microbitConnectorBluetooth = new MicrobitConnectorBluetooth();

async function setupMicrobitUSB() {
    try {
        const isConnected = await microbitConnectorUSB.connect();
        if (isConnected) {
            console.log("Micro:bit connected!");
            // Add any additional logic to handle after successful connection
        } else {
            console.log("Failed to connect to Micro:bit.");
        }
    } catch (error) {
        console.error("Error connecting to Micro:bit:", error);
    }
}

async function setupMicrobitBluetooth() {
    try {
        const isConnected = await microbitConnectorBluetooth.connect();
        if (isConnected) {
            console.log("Micro:bit connected!");
            // Add any additional logic to handle after successful connection
        } else {
            console.log("Failed to connect to Micro:bit.");
        }
    } catch (error) {
        console.error("Error connecting to Micro:bit:", error);
    }
}

// // const plotter = new Plotter();

// function onResetGraphClick() {
//   plotter.resetPlot();
// }

async function flashMicrobitHandlerAccelerometer() {
    try {
        const usb = microbitConnectorUSB.getUsbConnection();
        if (usb) {
            await flashMicrobitUSBAccelerometer(usb);
            console.log("Micro:bit flashed successfully!");
            setupMicrobitUSB();
        } else {
            console.log("Micro:bit USB connection is not initialized.");
        }
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

async function flashMicrobitHandlerAccelerometerScatter() {
    try {
        const usb = microbitConnectorUSB.getUsbConnection();
        if (usb) {
            await flashMicrobitUSBAccelerometerScatter(usb);
            console.log("Micro:bit flashed successfully!");
            setupMicrobitUSB();
        } else {
            console.log("Micro:bit USB connection is not initialized.");
        }
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

async function flashMicrobitHandlerButtons() {
    try {
        const usb = microbitConnectorUSB.getUsbConnection();
        if (usb) {
            await flashMicrobitUSBButtons(usb);
            console.log("Micro:bit flashed successfully!");
            setupMicrobitUSB();
        } else {
            console.log("Micro:bit USB connection is not initialized.");
        }
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

async function flashMicrobitHandlerButtonsPie() {
    try {
        const usb = microbitConnectorUSB.getUsbConnection();
        if (usb) {
            await flashMicrobitUSBButtonsPie(usb);
            console.log("Micro:bit flashed successfully!");
            setupMicrobitUSB();
        } else {
            console.log("Micro:bit USB connection is not initialized.");
        }
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

async function flashMicrobitHandlerButtonsBluetooth() {
    try {
        const usb = microbitConnectorUSB.getUsbConnection();
        if (usb) {
            await flashMicrobitUSBButtonsBluetooth(usb);
            console.log("Micro:bit flashed successfully!");
            setupMicrobitBluetooth();
        } else {
            console.log("Micro:bit USB connection is not initialized.");
        }
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

function disconnectMicrobit() {
    microbitConnectorUSB.disconnect();
    microbitConnectorBluetooth.disconnect();
}

// Attach to the connect button click (user interaction required)
document.getElementById("connectUSBBtn")?.addEventListener("click", setupMicrobitUSB);

document.getElementById("connectBluetoothBtn")?.addEventListener("click", setupMicrobitBluetooth);

// Attach to the flash button click (user interaction required)
document.getElementById("flashBtnAccelerometer")?.addEventListener("click", flashMicrobitHandlerAccelerometer);

// Attach to the flash button click (user interaction required)
document.getElementById("flashBtnAccelerometerScatter")?.addEventListener("click", flashMicrobitHandlerAccelerometerScatter);

// Attach to the flash button click (user interaction required)
document.getElementById("flashBtnButtonsPie")?.addEventListener("click", flashMicrobitHandlerButtonsPie);

// Attach to the flash button click (user interaction required)
document.getElementById("flashBtnButtons")?.addEventListener("click", flashMicrobitHandlerButtons);

document.getElementById("flashBtnButtonsBluetooth")?.addEventListener("click", flashMicrobitHandlerButtonsBluetooth);

// Attach to the disconnect button click (user interaction required)
document.getElementById("disconnectBtn")?.addEventListener("click", disconnectMicrobit);

// document.getElementById('resetGraphBtn')?.addEventListener('click', onResetGraphClick);

// export { plotter };