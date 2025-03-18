import { createUniversalHexFlashDataSource, MicrobitWebUSBConnection} from "@microbit/microbit-connection";

/**
 * Loads the HEX file from the public directory.
 * @returns The HEX file contents as a string.
 */
async function loadHexFile(): Promise<string> {
    //const response = await fetch("microbit-NDJSON-streamer (9).hex");
    const response = await fetch("microbit-button_bluetooth (4).hex");
    //const response = await fetch("BLE_All_Services_CODAL_0-2-40-ABDLIMTU-P.hex");
    if (!response.ok) {
        throw new Error(`Failed to load HEX file: ${response.statusText}`);
    }
    return await response.text();
}

/**
 * Flashes the Micro:bit with the loaded HEX file.
 * @param usb The connected MicrobitWebUSBConnection instance.
 */
export async function flashMicrobitUSB(usb: MicrobitWebUSBConnection) {
    try {
        const hexData = await loadHexFile();
        console.log("HEX file loaded successfully.");

        await usb.flash(createUniversalHexFlashDataSource(hexData), {
            partial: true,
            progress: (percentage: number | undefined) => {
                console.log(`Flashing progress: ${percentage ?? 0}%`);
            },
        });

        console.log("Flashing complete!");
    } catch (error) {
        console.error("Error flashing Micro:bit:", error);
    }
}

// export async function flashMicrobitBluetooth(bluetooth: MicrobitWebBluetoothConnection) {
//     try {
//         const hexData = await loadHexFile();
//         console.log("HEX file loaded successfully.");

//         await bluetooth.flash(createUniversalHexFlashDataSource(hexData), {
//             partial: true,
//             progress: (percentage: number | undefined) => {
//                 console.log(`Flashing progress: ${percentage ?? 0}%`);
//             },
//         });

//         console.log("Flashing complete!");
//     } catch (error) {
//         console.error("Error flashing Micro:bit:", error);
//     }
// }
