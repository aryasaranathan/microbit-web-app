import Plotly from 'plotly.js-dist';

export class Plotter {
    private data: any;
    private layout: any;
    private config: any;
    private maxPoints: number;
    private windowSize: number;
    private indices: number[];
    private xData: number[];
    private yData: number[];
    private zData: number[];
    private bufferSize: number;
    private buffer: { x: number[], y: number[], z: number[] };
    private indexCounter: number;
    private startTime: number | null = null;

    constructor() {
        this.data = [
            { x: [], y: [], mode: 'lines', name: 'X' },
            { x: [], y: [], mode: 'lines', name: 'Y' },
            { x: [], y: [], mode: 'lines', name: 'Z' }
        ];

        this.layout = {
            title: 'Accelerometer Data',
            xaxis: { title: 'Data Point Index' },
            yaxis: { title: 'Acceleration (mg)' }
        };

        this.config = { responsive: true };
        this.maxPoints = 100;
        this.windowSize = 5; // Moving average window size
        this.indices = [];
        this.xData = [];
        this.yData = [];
        this.zData = [];
        this.bufferSize = 5; // Number of data points to average
        this.buffer = { x: [], y: [], z: [] };
        this.indexCounter = 0;

        Plotly.newPlot('plot', this.data, this.layout, this.config);
    }

    private movingAverage(data: number[]): number[] {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - this.windowSize + 1);
            const end = i + 1;
            const subset = data.slice(start, end);
            const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
            result.push(avg);
        }
        return result;
    }

    private averageBuffer(buffer: number[]): number {
        const sum = buffer.reduce((a, b) => a + b, 0);
        return sum / buffer.length;
    }

    updatePlot(timestamp: number, x: number, y: number, z: number) {
        // Initialize startTime on the first call
        if (this.startTime === null) {
            this.startTime = timestamp;
        }
        // Compute elapsed time in seconds
        const elapsedTime = (timestamp - this.startTime) / 1000;

        this.buffer.x.push(x);
        this.buffer.y.push(y);
        this.buffer.z.push(z);

        if (this.buffer.x.length >= this.bufferSize) {
            const avgX = this.averageBuffer(this.buffer.x);
            const avgY = this.averageBuffer(this.buffer.y);
            const avgZ = this.averageBuffer(this.buffer.z);

            this.buffer.x = [];
            this.buffer.y = [];
            this.buffer.z = [];

            if (this.indices.length >= this.maxPoints) {
                this.indices.shift();
                this.xData.shift();
                this.yData.shift();
                this.zData.shift();
            }

            // Use elapsed time as the x-axis value
            this.indices.push(elapsedTime);
            this.xData.push(avgX);
            this.yData.push(avgY);
            this.zData.push(avgZ);

            const smoothedX = this.movingAverage(this.xData);
            const smoothedY = this.movingAverage(this.yData);
            const smoothedZ = this.movingAverage(this.zData);

            Plotly.react('plot', [
                { x: this.indices, y: smoothedX, mode: 'lines', name: 'X' },
                { x: this.indices, y: smoothedY, mode: 'lines', name: 'Y' },
                { x: this.indices, y: smoothedZ, mode: 'lines', name: 'Z' }
            ], this.layout, this.config);
        }
    }
}