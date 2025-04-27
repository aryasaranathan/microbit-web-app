import Plotly from "plotly.js-dist";

export interface GraphConfig {
    graphType: string;
    title: string;
    x: { label: string; min: number; max: number };
    y: { label: string; min: number; max: number };
    series: Array<{ name: string; displayName: string; color?: string; symbol?: string }>;
}

export interface PlotData {
    [key: string]: any;
}

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
        plotData.x = config.series.map((sensor) => sensor.name);
        plotData.y = config.series.map(() => 0);
        plotData.type = "bar";
        plotData.marker = {
            color: config.series.map((sensor) => sensor.color || "blue"),
        };

        const layout = {
            title: {text: config.title}, // Set the graph title
            xaxis: { 
                title: { text: config.x.label }, // Explicitly set x-axis label
                type: "category" 
            },
            yaxis: { 
                title: { text: config.y.label }, // Explicitly set y-axis label
                range: [config.y.min, config.y.max] 
            },
        };

        Plotly.newPlot("plot", [plotData], layout);
    } else if (config.graphType === "pie") {
        plotData.labels = config.series.map((sensor) => sensor.name);
        plotData.values = config.series.map(() => 0);
        plotData.type = "pie";
        plotData.marker = {
            colors: config.series.map((sensor) => sensor.color || "blue"),
        };

        const layout = {title: {text: config.title}};
        Plotly.newPlot("plot", [plotData], layout);
    } else if (config.graphType === "line" || config.graphType === "scatter") {
        plotData = {};
        const traces = config.series.map((sensor) => {
            plotData[sensor.name] = {
                x: [],
                y: [],
                name: sensor.displayName,
                type: config.graphType === "scatter" ? "scatter" : "line",
                mode: config.graphType === "scatter" ? "markers" : "lines",
                line: { color: sensor.color },
                marker: {
                    symbol: sensor.symbol || "circle",
                    size: 6,
                    color: sensor.color || "blue",
                },
            };
            return plotData[sensor.name];
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
            if (Object.prototype.hasOwnProperty.call(data.values, sensor.name)) {
                update.x.push([data.timestamp / 1000]);
                update.y.push([data.values[sensor.name]]);
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
        const newY = graphConfig.series.map((sensor) =>
            data.values[sensor.name] !== undefined ? data.values[sensor.name] : 0
        );

        if (newY.length > 0) {
            Plotly.update("plot", { y: [newY] }, {}, [0]);
        }
    } else if (graphConfig.graphType === "pie") {
        const newValues = graphConfig.series.map((sensor) =>
            data.values[sensor.name] !== undefined ? data.values[sensor.name] : 0
        );

        if (newValues.length > 0) {
            Plotly.update("plot", { values: [newValues] }, {}, [0]);
        }
    }
}