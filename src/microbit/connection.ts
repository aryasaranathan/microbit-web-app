import { createWebUSBConnection, MicrobitWebUSBConnection } from "@microbit/microbit-connection";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { SerialDataEvent } from "@microbit/microbit-connection";
import Plotly from "plotly.js-dist";

export class MicrobitConnectorUSB {
    private usb: MicrobitWebUSBConnection | null = null;
    private dataBuffer: string = "";
    private graphConfig: any = null; // Store the latest configuration
    private plotData: { [key: string]: any } = {}; // Stores sensor traces

    async connect(): Promise<boolean> {
        try {
            this.usb = createWebUSBConnection();
            const status = await this.usb.connect();
            console.log("Micro:bit connection status:", status);

            if (status === ConnectionStatus.CONNECTED) {
                console.log("Setting up serial data event listener...");
                if (this.usb) { // remove existing event listener
                    this.usb.removeEventListener("serialdata", this.handleSerialData.bind(this));
                }
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
    
        // ✅ Preserve `\n` and append data as-is to avoid breaking JSON format
        this.dataBuffer += event.data;
        //console.log("Data arrived: ", event.data);
    
        // ✅ Process only complete JSON objects
        let newlineIndex;
        while ((newlineIndex = this.dataBuffer.indexOf("\n")) !== -1) {
            let jsonString = this.dataBuffer.slice(0, newlineIndex); // ✅ Extract JSON (DO NOT trim)
            this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1); // ✅ Remove processed JSON
    
            if (jsonString.trim().length==0) {
                jsonString = "";
                continue; // ✅ Ignore empty lines
            }
    
            try {
                console.log("Attempting to parse JSON:", jsonString);
                const parsedData = JSON.parse(jsonString);
                console.log("✅ Successfully parsed:", parsedData);
    
                // ✅ Handle different message types
                if ((parsedData.type === "config") && (this.graphConfig == null)) {
                    this.handleConfig(parsedData);
                } else if (parsedData.type === "data") {
                    this.handleData(parsedData);
                }
            } catch (error) {
                console.warn("❌ JSON Parse Error:", error);
                console.warn("Faulty JSON:", jsonString);
            }
        }
    }
    
    

    private handleConfig(config: any) {
        console.log("Received new graph configuration:", config);
        this.graphConfig = config;
        
        if (config.graphType === "bar") {
            // Use the sensor list from the config as the fixed x-axis categories.
            this.plotData = {
                x: config.sensors, 
                y: config.sensors.map(() => 0), // Start with all zero values
                type: "bar",
                marker: { color: "blue" }
            };
    
            const layout = {
                title: "Live Data from Micro:bit",
                xaxis: { title: config.xLabel, type: "category" },
                yaxis: { title: config.yLabel, range: [config.scale.min, config.scale.max] }
            };
    
            // Create the initial bar chart with dynamic x-axis labels.
            Plotly.newPlot("plot", [this.plotData], layout);
        } else {
            // Existing logic for other graph types (line/scatter)
            this.plotData = {};
            const traces = config.sensors.map((sensor: string) => {
                this.plotData[sensor] = {
                    x: [],
                    y: [],
                    name: sensor,
                    type: config.graphType === "bar" ? "bar" : "scatter",
                    mode: config.graphType === "line" ? "lines" : "markers"
                };
                return this.plotData[sensor];
            });
    
            const layout = {
                title: "Live Data from Micro:bit",
                xaxis: { title: config.xLabel },
                yaxis: { title: config.yLabel, range: [config.scale.min, config.scale.max] }
            };
    
            Plotly.newPlot("plot", traces, layout);
        }
    }
    

    private handleData(data: any) {
        if (!this.graphConfig) {
            console.warn("Received data before configuration was set. Ignoring.");
            return;
        }
        console.log(`Timestamp: ${data.timestamp}, Values:`, data.values);
        if (this.graphConfig.graphType === "line") {
            // Prepare update arrays for x and y
            const update: { x: any[], y: any[] } = { x: [], y: [] };
            const traceIndices: number[] = [];
        
            // Loop through the sensor names in the same order as in the configuration
            this.graphConfig.sensors.forEach((sensor: string, index: number) => {
                // Only update if there's a value for this sensor
                if (data.values[sensor] !== undefined) {
                    update.x.push([data.timestamp / 1000]); // Convert timestamp to seconds
                    update.y.push([data.values[sensor]]);
                    traceIndices.push(index);
                }
            });
        
            // Maximum number of points to retain in the graph (adjust as needed)
            const MAX_POINTS = 30;
        
            // Extend the traces with the new data points
            Plotly.extendTraces("plot", update, traceIndices, MAX_POINTS);
        } else if (this.graphConfig.graphType === "bar") {
            // Create a new y array based on the sensor labels from the configuration.
            let newY = this.graphConfig.sensors.map((sensor: string) => {
                return data.values[sensor] !== undefined ? data.values[sensor] : 0;
            });

            // Update the single bar trace with the new y values.
            Plotly.update("plot", { y: [newY] });
                
        }
    }
    

    private updateStatus(status: string) {
        const statusElement = document.getElementById("status");
        if (statusElement) {
            statusElement.textContent = `Status: ${status}`;
        }
    }

    public getUsbConnection(): MicrobitWebUSBConnection | null {
        return this.usb;
    }
}
