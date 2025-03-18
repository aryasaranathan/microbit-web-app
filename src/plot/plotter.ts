import Plotly from 'plotly.js-dist';

export class Plotter {
    private layout: any;
    private config: any;
    private maxPoints: number;
    private windowSize: number;
    private bufferSize: number;
    private startTime: number | null = null;
    private indices: number[] = [];
    private xData: number[] = [];
    private yData: number[] = [];
    private zData: number[] = [];
    private buffer: { x: number[], y: number[], z: number[] } = { x: [], y: [], z: [] };

    constructor() {
        this.maxPoints = 100;
        this.windowSize = 5; // Moving average window size
        this.bufferSize = 5; // Buffer size for averaging
        
        this.layout = {
            title: 'Accelerometer Data',
            xaxis: { title: 'Time (s)', range: [0, 10] }, // Set initial range
            yaxis: { title: 'Acceleration (mg)' }
        };
        this.config = { responsive: true };

        Plotly.newPlot('plot', [
            { x: [], y: [], mode: 'lines', name: 'X' },
            { x: [], y: [], mode: 'lines', name: 'Y' },
            { x: [], y: [], mode: 'lines', name: 'Z' }
        ], this.layout, this.config);

        // // Update x-axis range at a regular interval for smooth scrolling
        // setInterval(() => {
        //     if (this.startTime !== null) {
        //         const elapsedTime = (Date.now() - this.startTime) / 1000;
        //         this.updateXAxisRange(elapsedTime);
        //     }
        // }, 100); // Update every 100 milliseconds
    }

    /**
     * Resets the plot by clearing all data and reinitializing the plot.
     */
    resetPlot() {
        this.startTime = null;
        this.indices = [];
        this.xData = [];
        this.yData = [];
        this.zData = [];
        this.buffer = { x: [], y: [], z: [] };

        Plotly.newPlot('plot', [
            { x: [], y: [], mode: 'lines', name: 'X' },
            { x: [], y: [], mode: 'lines', name: 'Y' },
            { x: [], y: [], mode: 'lines', name: 'Z' }
        ], this.layout, this.config);
    }

    private updateXAxisRange(elapsedTime: number) {
        const futureTimeBuffer = 2.5; // 1/4 of the 10-second window
        const xAxisRange = [Math.max(0, elapsedTime - 10), elapsedTime + futureTimeBuffer];
    
        Plotly.relayout('plot', {
            'xaxis.range': xAxisRange
        });
    }

    /**
     * Computes a simple moving average of a dataset.
     */
    private movingAverage(data: number[]): number[] {
        return data.map((_, i) => {
            const start = Math.max(0, i - this.windowSize + 1);
            const subset = data.slice(start, i + 1);
            return subset.reduce((sum, val) => sum + val, 0) / subset.length;
        });
    }

    /**
     * Computes the average of a buffer array.
     */
    private averageBuffer(buffer: number[]): number {
        return buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    }

    /**
     * Updates the graph with new accelerometer data.
     */
    updatePlot(timestamp: number, x: number, y: number, z: number) {
        if (this.startTime === null) {
            this.startTime = timestamp;
        }
        const elapsedTime = (timestamp - this.startTime) / 1000;
    
        // Store new values in the buffer
        this.buffer.x.push(x);
        this.buffer.y.push(y);
        this.buffer.z.push(z);
    
        if (this.buffer.x.length >= this.bufferSize) {
            // Compute averages and clear buffer
            const avgX = this.averageBuffer(this.buffer.x);
            const avgY = this.averageBuffer(this.buffer.y);
            const avgZ = this.averageBuffer(this.buffer.z);
            this.buffer.x = [];
            this.buffer.y = [];
            this.buffer.z = [];
    
            // Maintain fixed window size
            if (this.indices.length >= this.maxPoints) {
                this.indices.shift();
                this.xData.shift();
                this.yData.shift();
                this.zData.shift();
            }

            if (this.indices.length > 0) {
                const lastTime = this.indices[this.indices.length - 1];
                if (elapsedTime < lastTime) {
                  console.warn(`Out-of-order timestamp: ${elapsedTime} < ${lastTime}. Skipping or reordering...`);
                  return; // or handle out-of-order data as needed
                }
            }
    
            // Append new time-aligned data
            this.indices.push(elapsedTime);
            this.xData.push(avgX);
            this.yData.push(avgY);
            this.zData.push(avgZ);
    
            // Apply moving average **before updating Plotly**
            const smoothedX = this.movingAverage(this.xData);
            const smoothedY = this.movingAverage(this.yData);
            const smoothedZ = this.movingAverage(this.zData);
    
            // Ensure x-values match the y-values in length
            const alignedIndices = this.indices.slice(-smoothedX.length);
    
            Plotly.react('plot', [
                { x: alignedIndices, y: smoothedX, mode: 'lines', name: 'X' },
                { x: alignedIndices, y: smoothedY, mode: 'lines', name: 'Y' },
                { x: alignedIndices, y: smoothedZ, mode: 'lines', name: 'Z' }
            ], this.layout, this.config);
        }
    
        // Update the x-axis range to maintain a window of the last 10 seconds
        this.updateXAxisRange(elapsedTime);
    }
    
}
