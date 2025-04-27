import { createWebBluetoothConnection, MicrobitWebBluetoothConnection } from "@microbit/microbit-connection";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { UARTDataEvent } from "@microbit/microbit-connection";
import { handleConfig, handleData, GraphConfig, PlotData } from "../utils/messageHandler";

export class MicrobitConnectorBluetooth { // initiates connection, parses data, and graphs accordingly
    private bluetooth: MicrobitWebBluetoothConnection | null = null;
    private dataBuffer: string = "";
    private graphConfig: GraphConfig | null = null; // Store the latest configuration
    private plotData: PlotData = {}; // Stores sensor traces

    async connect(): Promise<boolean> {
        try { // use connection library to connect
            this.bluetooth = createWebBluetoothConnection();
            const status = await this.bluetooth.connect();
            console.log("Micro:bit connection status:", status);

            if (status === ConnectionStatus.CONNECTED) {
                console.log("Setting up serial data event listener...");
                if (this.bluetooth) { // remove existing event listener
                    this.bluetooth.removeEventListener("uartdata", this.handleSerialData.bind(this));
                }
                this.bluetooth.addEventListener("uartdata", this.handleSerialData.bind(this));
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
        if (this.bluetooth) {
            this.bluetooth.disconnect();
            console.log("Micro:bit disconnected.");
            this.updateStatus("Disconnected");
        }
    }

    // BLE data is received as a array of bytes
    // needs to be decoded into string for parsing
    private textDecoder = new TextDecoder("utf-8"); 

    private handleSerialData(event: UARTDataEvent) {
        console.log("Serial (bluetooth) data received:", event.value);

        const chunk = this.textDecoder.decode(event.value);
        console.log("Decoded BLE chunk:", chunk);
    
        // ✅ Preserve `\n` and append data as-is to avoid breaking JSON format
        this.dataBuffer += chunk;
        //console.log("Data arrived: ", event.data);
    
        // Process only complete JSON objects
        let newlineIndex;
        while ((newlineIndex = this.dataBuffer.indexOf("\n")) !== -1) {
            let jsonString = this.dataBuffer.slice(0, newlineIndex); // Extract JSON 
            this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1); // Remove processed JSON from buffer
    
            if (jsonString.trim().length==0) {
                jsonString = "";
                continue; // ✅ Ignore empty lines
            }
    
            try {
                console.log("Attempting to parse JSON:", jsonString);
                const parsedData = JSON.parse(jsonString);
                console.log("✅ Successfully parsed:", parsedData);
    
                // ✅ Handle different message types
                if (parsedData.type === "config") {
                    this.graphConfig = handleConfig(parsedData, this.graphConfig, this.plotData);
                } else if (parsedData.type === "data") {
                    handleData(parsedData, this.graphConfig);
                }
            } catch (error) {
                console.warn("❌ JSON Parse Error:", error);
                console.warn("Faulty JSON:", jsonString);
            }
        }
    }

    private updateStatus(status: string) {
        const statusElement = document.getElementById("status");
        if (statusElement) {
            statusElement.textContent = `Status: ${status}`;
        }
    }

    public getBluetoothConnection(): MicrobitWebBluetoothConnection | null {
        return this.bluetooth;
    }
}