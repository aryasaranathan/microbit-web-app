import { createUniversalHexFlashDataSource, MicrobitWebUSBConnection} from "@microbit/microbit-connection";

/**
 * Loads the HEX file from the public directory.
 * @returns The HEX file contents as a string.
 */
async function loadHexFileAccelerometer(): Promise<string> {
    const response = await fetch("microbit-accelerometer2.hex");
    //const response = await fetch("buttons).hex");
    //const response = await fetch("BLE_All_Services_CODAL_0-2-40-ABDLIMTU-P.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

async function loadHexFileScatter(): Promise<string> {
    //const response = await fetch("accelerometer.hex");
    const response = await fetch("microbit-accel_scatter.hex");
    //const response = await fetch("BLE_All_Services_CODAL_0-2-40-ABDLIMTU-P.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

async function loadHexFilePie(): Promise<string> {
    //const response = await fetch("accelerometer.hex");
    const response = await fetch("microbit-buttons_pie.hex");
    //const response = await fetch("BLE_All_Services_CODAL_0-2-40-ABDLIMTU-P.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

async function loadHexFileButtons(): Promise<string> {
    //const response = await fetch("accelerometer.hex");
    const response = await fetch("microbit-buttons2.hex");
    //const response = await fetch("BLE_All_Services_CODAL_0-2-40-ABDLIMTU-P.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

async function loadHexFileButtonsBluetooth(): Promise<string> {
    const response = await fetch("buttons_bluetooth.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

/**
 * Updates the flashing status on the web page.
 * @param message The status message to display.
 */
function updateFlashStatus(message: string) {
    const statusElement = document.getElementById("flashStatus");
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * Updates the flashing progress on the web page.
 * @param percentage The progress percentage to display.
 */
function updateFlashProgress(percentage: number) {
    const progressElement = document.getElementById("flashProgress");
    if (progressElement) {
        (progressElement as HTMLProgressElement).value = percentage;
    }
}

/**
 * Flashes the Micro:bit with the loaded HEX file.
 * @param usb The connected MicrobitWebUSBConnection instance.
 */
export async function flashMicrobitUSBAccelerometer(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFileAccelerometer();
        console.log("HEX file loaded successfully.");
        updateFlashStatus("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                const progress = percentage ?? 0;
                console.log(`Flashing progress: ${progress}%`);
                updateFlashProgress(progress);
            },
        });

        console.log("Flashing complete!");
        updateFlashStatus("Flashing complete! Connect via USB again to see live data.");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
        if (error instanceof Error) {
            updateFlashStatus(`Error flashing Micro:bit: ${error.message}`);
        } else {
            updateFlashStatus("Error flashing Micro:bit: Unknown error");
        }
    }
}

export async function flashMicrobitUSBButtons(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFileButtons();
        console.log("HEX file loaded successfully.");
        updateFlashStatus("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                const progress = percentage ?? 0;
                console.log(`Flashing progress: ${progress}%`);
                updateFlashProgress(progress);
            },
        });

        console.log("Flashing complete!");
        updateFlashStatus("Flashing complete! Connect via USB again to see live data.");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
        if (error instanceof Error) {
            updateFlashStatus(`Error flashing Micro:bit: ${error.message}`);
        } else {
            updateFlashStatus("Error flashing Micro:bit: Unknown error");
        }
    }
}

export async function flashMicrobitUSBButtonsPie(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFilePie();
        console.log("HEX file loaded successfully.");
        updateFlashStatus("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                const progress = percentage ?? 0;
                console.log(`Flashing progress: ${progress}%`);
                updateFlashProgress(progress);
            },
        });

        console.log("Flashing complete!");
        updateFlashStatus("Flashing complete! Connect via USB again to see live data.");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
        if (error instanceof Error) {
            updateFlashStatus(`Error flashing Micro:bit: ${error.message}`);
        } else {
            updateFlashStatus("Error flashing Micro:bit: Unknown error");
        }
    }
}

export async function flashMicrobitUSBAccelerometerScatter(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFileScatter();
        console.log("HEX file loaded successfully.");
        updateFlashStatus("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                const progress = percentage ?? 0;
                console.log(`Flashing progress: ${progress}%`);
                updateFlashProgress(progress);
            },
        });

        console.log("Flashing complete!");
        updateFlashStatus("Flashing complete! Connect via USB again to see live data.");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
        if (error instanceof Error) {
            updateFlashStatus(`Error flashing Micro:bit: ${error.message}`);
        } else {
            updateFlashStatus("Error flashing Micro:bit: Unknown error");
        }
    }
}

export async function flashMicrobitUSBButtonsBluetooth(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFileButtonsBluetooth();
        console.log("HEX file loaded successfully.");
        updateFlashStatus("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                const progress = percentage ?? 0;
                console.log(`Flashing progress: ${progress}%`);
                updateFlashProgress(progress);
            },
        });

        console.log("Flashing complete!");
        updateFlashStatus("Flashing complete! Connect via Bluetooth to see live data.");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
        if (error instanceof Error) {
            updateFlashStatus(`Error flashing Micro:bit: ${error.message}`);
        } else {
            updateFlashStatus("Error flashing Micro:bit: Unknown error");
        }
    }
}
