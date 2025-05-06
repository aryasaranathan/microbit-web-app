import Plotly from "plotly.js-dist";

export interface GraphConfig {
    graphType: string;
    title: string;
    x: { label: string; min: number; max: number };
    y: { label: string; min: number; max: number };
    series: Array<{ x_column: string; y_column: string; displayName?: string; color?: number; icon?: string }>;
    //y_column is used as a unique identifier for each series
}

export interface PlotData {
    [key: string]: any;
}

function numToColorCode(num: number): string {
    return "#" + num.toString(16).padStart(6, "0");
  } // colors received as an integer, so they must first be converted to hex

/**
 * Handles the configuration message and initializes the graph.
 * Returns the updated graphConfig.
 */
export function handleConfig(config: GraphConfig, graphConfig: GraphConfig | null, plotData: PlotData): GraphConfig {
    console.log("Received new graph configuration:", config);

    // Check if the new config is the same as the current config
    if (graphConfig && JSON.stringify(graphConfig) === JSON.stringify(config)) {
        console.log("Configuration unchanged. Skipping graph update.");
        return graphConfig; // Return the existing config without updating
    }

    graphConfig = config; // Update the graphConfig reference

    if (config.graphType === "bar") {
        plotData.x = config.series.map((sensor) => sensor.y_column);
        plotData.y = config.series.map(() => 0);
        plotData.type = "bar";
        plotData.marker = {
            color: config.series.map((sensor) => numToColorCode(sensor.color || 0x0000ff)), // Default to blue
        };

        const layout = {
            title: {text: config.title}, // Set the graph title
            xaxis: { 
                title: { text: config.x?.label || "Category" }, // Explicitly set x-axis label
                type: "category" 
            },
            yaxis: { 
                title: { text: config.y.label }, // Explicitly set y-axis label
                range: [config.y.min, config.y.max] 
            },
        };

        Plotly.newPlot("plot", [plotData], layout);
    } else if (config.graphType === "pie") {
        plotData.labels = config.series.map((sensor) => sensor.y_column);
        plotData.values = config.series.map(() => 0);
        plotData.type = "pie";
        plotData.marker = {
            colors: config.series.map((sensor) => numToColorCode(sensor.color || 0x0000ff)), // Default to blue
        };

        const layout = {title: {text: config.title}};
        Plotly.newPlot("plot", [plotData], layout);
    } else if (config.graphType === "line" || config.graphType === "scatter") {
        plotData = {};
        const traces = config.series.map((sensor) => {
            const uniqueId = sensor.y_column;
            plotData[uniqueId] = {
                x: [],
                y: [],
                name: sensor.displayName || uniqueId,
                type: config.graphType === "scatter" ? "scatter" : "line",
                mode: config.graphType === "scatter" ? "markers" : "lines",
                line: { color: numToColorCode(sensor.color || 0x0000ff) }, // Default to blue
                marker: {
                    symbol: sensor.icon || "circle",
                    size: 6,
                    color: numToColorCode(sensor.color || 0x0000ff), // Default to blue
                },
            };
            return plotData[uniqueId];
        });

        const layout = {
            title: { text: config.title },
            xaxis: {
                title: { text: config.x.label },
                range: config.x.label === "time (seconds)" ? undefined : [config.x.min, config.x.max], // Enable scrolling only for "time (seconds)"
            },
            yaxis: { title: { text: config.y.label }, range: [config.y.min, config.y.max] },
        };

        Plotly.newPlot("plot", traces, layout);
    }

    return graphConfig; // Return the updated graphConfig
}

/**
 * Handles the data message and updates the graph.
 */
export function handleData(data: any, graphConfig: GraphConfig | null): void {
    if (!graphConfig) {
        console.warn("Received data before configuration was set. Ignoring.");
        return;
    }

    console.log(`Timestamp: ${data.timestamp}, Values:`, data.values);

    if (graphConfig.graphType === "line" || graphConfig.graphType === "scatter") {
        const update: { x: any[]; y: any[] } = { x: [], y: [] };
        const traceIndices: number[] = [];

        graphConfig.series.forEach((sensor, index) => {
            const yColumn = sensor.y_column;

            if (data.values[yColumn] !== undefined) {
                update.x.push([data.timestamp / 1000]);
                update.y.push([data.values[yColumn]]);
                traceIndices.push(index);
            }
        });

        if (update.x.length > 0 && update.y.length > 0) {
            if (graphConfig.x.label === "time (seconds)") {
                const MAX_POINTS = 30;
                Plotly.extendTraces("plot", update, traceIndices, MAX_POINTS);
            } else {
                Plotly.extendTraces("plot", update, traceIndices);
            }
        }
    } else if (graphConfig.graphType === "bar") {
        const newY = graphConfig.series.map((sensor) => {
            const yColumn = sensor.y_column;
            return data.values[yColumn] !== undefined ? data.values[yColumn] : 0;
        });

        if (newY.length > 0) {
            Plotly.update("plot", { y: [newY] }, {}, [0]);
        }
    } else if (graphConfig.graphType === "pie") {
        const newValues = graphConfig.series.map((sensor) => {
            const yColumn = sensor.y_column;
            return data.values[yColumn] !== undefined ? data.values[yColumn] : 0;
        });

        if (newValues.length > 0) {
            Plotly.update("plot", { values: [newValues] }, {}, [0]);
        }
    }
}