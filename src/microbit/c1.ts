import { createWebUSBConnection, MicrobitWebUSBConnection } from "@microbit/microbit-connection";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { SerialDataEvent } from "@microbit/microbit-connection";
import { plotter } from "../main"; // Import the plotter instance

export class MicrobitConnector {
    private usb: MicrobitWebUSBConnection | null = null;
    private dataBuffer: string = "";

    async connect(): Promise<boolean> {
        try {
            this.usb = createWebUSBConnection();
            const status = await this.usb.connect();
            console.log("Micro:bit connection status:", status);

            if (status === ConnectionStatus.CONNECTED) {
                console.log("Setting up serial data event listener...");
                this.usb.addEventListener("serialdata", this.handleSerialData.bind(this));
                console.log("Serial data event listener added.");
                this.updateStatus("Connected");
                return true;
            } else {
                console.error("Failed to connect to micro:bit. Status:", status);
                this.updateStatus("Failed to connect");
            }
        } catch (error) {
            console.error("Connection failed:", error);
            this.updateStatus("Connection failed");
        }
        return false;
    }

    disconnect() {
        if (this.usb) {
            this.usb.disconnect();
            console.log("Micro:bit disconnected.");
            this.updateStatus("Disconnected");
        }
    }

    private handleSerialData(event: SerialDataEvent) {
        console.log("Serial data received:", event.data);
        this.dataBuffer += event.data.trim();

        try {
            // Regular expression to match complete JSON objects
            const jsonRegex = /{[^}]*}/g;
            let match;
            while ((match = jsonRegex.exec(this.dataBuffer)) !== null) {
                const jsonString = match[0];
                const parsedData = JSON.parse(jsonString);
                console.log("Parsed Data:", parsedData);

                // Call a function to handle this data (you can pass it to your UI)
                this.processData(parsedData);
            }

            // Remove processed data from the buffer
            this.dataBuffer = this.dataBuffer.slice(jsonRegex.lastIndex);
        } catch (error) {
            // If parsing fails, wait for more data
            console.log("Error parsing data:", error);
        }
    }

    private processData(data: { timestamp: number; x: number; y: number; z: number }) {
        console.log(`Timestamp: ${data.timestamp}, X: ${data.x}, Y: ${data.y}, Z: ${data.z}`);
        const outputElement = document.getElementById("output");
        if (outputElement) {
            //outputElement.textContent += `Timestamp: ${data.timestamp}, X: ${data.x}, Y: ${data.y}, Z: ${data.z}\n`;
        }

        console.log("Updating plot with new data");
        plotter.updatePlot(data.timestamp, data.x, data.y, data.z);
    }

    private updateStatus(status: string) {
        const statusElement = document.getElementById("status");
        if (statusElement) {
            statusElement.textContent = `Status: ${status}`;
        }
    }

    // Public getter for the usb property
    public getUsbConnection(): MicrobitWebUSBConnection | null {
        return this.usb;
    }
}
