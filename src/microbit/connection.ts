import { createWebUSBConnection, MicrobitWebUSBConnection } from "@microbit/microbit-connection";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { SerialDataEvent } from "@microbit/microbit-connection";
//import Plotly from "plotly.js-dist";
import { handleConfig, handleData, GraphConfig, PlotData } from "../utils/messageHandler";

export class MicrobitConnectorUSB {
    private usb: MicrobitWebUSBConnection | null = null;
    private dataBuffer: string = "";
    private graphConfig: GraphConfig | null = null; // Store the latest configuration
    private plotData: PlotData = {}; // Stores sensor traces

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
    
    

    // private handleConfig(config: any) {
    //     console.log("Received new graph configuration:", config);
    //     this.graphConfig = config;
    //     const series = config.series;
        
    //     if (config.graphType === "bar") {
    //         // Use the sensor list from the config as the fixed x-axis categories.
    //         this.plotData = {
    //             x: config.series.map((sensor: any) => sensor.name), 
    //             y: config.series.map(() => 0), // Start with all zero values
    //             type: "bar",
    //             marker: {
    //                 color: config.series.map((sensor: any) => sensor.color || "blue") // Use specified color or fallback to blue
    //             }
    //         };
    
    //         const layout = {
    //             title: config.title,
    //             xaxis: { title: config.x.label, type: "category" },
    //             yaxis: { title: config.y.label, range: [config.y.min, config.y.max] }
    //         };
    
    //         // Create the initial bar chart with dynamic x-axis labels.
    //         Plotly.newPlot("plot", [this.plotData], layout);
    //     } else if (config.graphType === "pie") {
    //         // Create data structure for the pie chart
    //         this.plotData = {
    //             labels: config.series.map((sensor: any) => sensor.name), // Labels from the series
    //             values: config.series.map(() => 0), // Start with all zero values
    //             type: "pie",
    //             marker: {
    //                 colors: config.series.map((sensor: any) => sensor.color || "blue") // Use specified color or fallback to blue
    //             }
    //         };
        
    //         const layout = {
    //             title: config.title
    //         };
        
    //         // Create the initial pie chart
    //         Plotly.newPlot("plot", [this.plotData], layout);
    //     } else if (config.graphType === "line"){
    //         // Existing logic for other graph types (line/scatter)
    //         this.plotData = {};
    //         const traces = series.map((sensor: any) => {
    //             this.plotData[sensor.name] = {
    //                 x: [],
    //                 y: [],
    //                 name: sensor.displayName,
    //                 type: config.graphType === "scatter",
    //                 mode: "lines",
    //                 line: { color: sensor.color }
    //             };
    //             return this.plotData[sensor.name];
    //         });
    
    //         // need some logic here to determine if the x-axis is time or not, and accordingly set scrolling = true/false
    //         //if (config.xLabel === "time (seconds)" || config.xLabel === "time (ms)") {

    //         const layout = {
    //             title: config.title,
    //             xaxis: { title: config.x.label, range: [config.x.min, config.x.max] },
    //             //xaxis: { title: config.x.label},
    //             yaxis: { title: config.y.label, range: [config.y.min, config.y.max] }
    //         };

            
    
    //         Plotly.newPlot("plot", traces, layout);
    //     } else if (config.graphType === "scatter"){
    //         // Existing logic for other graph types (line/scatter)
    //         this.plotData = {};
    //         const traces = series.map((sensor: any) => {
    //             this.plotData[sensor.name] = {
    //                 x: [],
    //                 y: [],
    //                 name: sensor.displayName,
    //                 type: config.graphType === "scatter",
    //                 mode: "markers",
    //                 line: { color: sensor.color || "blue" },
    //                 marker: {
    //                     symbol: sensor.symbol || "circle", // Marker shape, default to 'circle'
    //                     size: 6, // currently no option to set marker size
    //                     color: sensor.color || "blue" // marker color, default to blue
    //                 },
    //             };
    //             return this.plotData[sensor.name];
    //         });
    
    //         const layout = {
    //             title: config.title,
    //             xaxis: { title: config.x.label, range: [config.x.min, config.x.max] },
    //             //xaxis: { title: config.x.label},
    //             yaxis: { title: config.yLabel, range: [config.y.min, config.y.max] }
    //         };
    
    //         Plotly.newPlot("plot", traces, layout);
    //     }
    // }
    

    // private handleData(data: any) {
    //     if (!this.graphConfig) {
    //         console.warn("Received data before configuration was set. Ignoring.");
    //         return;
    //     }
    //     console.log(`Timestamp: ${data.timestamp}, Values:`, data.values);
    //     if (this.graphConfig.graphType === "line") {
    //         // Prepare update arrays for x and y
    //         const update: { x: any[], y: any[] } = { x: [], y: [] };
    //         const traceIndices: number[] = [];
        
    //         // Loop through the sensor names in the same order as in the configuration
    //         this.graphConfig.series.forEach((sensor: any, index: number) => {
    //             const sensorName = sensor.name; // Use the `name` property from series
    //             // Only update if there's a value for this sensor
    //             if (Object.prototype.hasOwnProperty.call(data.values, sensorName)) {
    //                 update.x.push([data.timestamp / 1000]); // Convert timestamp to seconds
    //                 update.y.push([data.values[sensorName]]);
    //                 traceIndices.push(index);
    //             }
    //         });
        
    //         if (update.x.length > 0 && update.y.length > 0) {
    //             // Maximum number of points to retain in the graph
    //             const MAX_POINTS = 30;
        
    //             // Extend the traces with the new data points
    //             Plotly.extendTraces("plot", update, traceIndices, MAX_POINTS);
    //         }
    //     } else if (this.graphConfig.graphType === "bar") {
    //         // Create a new y array based on the sensor labels from the configuration.
    //         let newY = this.graphConfig.series.map((sensor: any) => {
    //             const sensorName = sensor.name; // Use `name` from series
    //             return data.values[sensorName] !== undefined ? data.values[sensorName] : 0;
    //         });

    //         if (newY.length > 0) {
    //             // Update the single bar trace with the new y values
    //             Plotly.update("plot", { y: [newY] }, {}, [0]);
    //         }       
    //     } else if (this.graphConfig.graphType === "scatter") {
    //         // Prepare update arrays for x and y
    //         const update: { x: any[], y: any[] } = { x: [], y: [] };
    //         const traceIndices: number[] = [];
        
    //         // Loop through the sensor names in the same order as in the configuration
    //         this.graphConfig.series.forEach((sensor: any, index: number) => {
    //             const sensorName = sensor.name; // Use the `name` property from series
    //             // Only update if there's a value for this sensor
    //             if (Object.prototype.hasOwnProperty.call(data.values, sensorName)) {
    //                 update.x.push([data.timestamp / 1000]); // Convert timestamp to seconds
    //                 update.y.push([data.values[sensorName]]);
    //                 traceIndices.push(index);
    //             }
    //         });
        
    //         if (update.x.length > 0 && update.y.length > 0) {
    //             // Maximum number of points to retain in the graph
    //             const MAX_POINTS = 30;
        
    //             // Extend the traces with the new data points
    //             Plotly.extendTraces("plot", update, traceIndices, MAX_POINTS);
    //         }
    //     } else if (this.graphConfig.graphType === "pie") {
    //         // Create a new values array based on the series labels from the configuration.
    //         let newValues = this.graphConfig.series.map((sensor: any) => {
    //             const sensorName = sensor.name; // Use `name` from series
    //             return data.values[sensorName] !== undefined ? data.values[sensorName] : 0;
    //         });
        
    //         if (newValues.length > 0) {
    //             // Update the pie chart trace with the new values
    //             Plotly.update("plot", { values: [newValues] }, {}, [0]);
    //         }
    //     }
    // }
    

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
