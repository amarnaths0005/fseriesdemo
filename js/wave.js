'use strict'
// Fourier Series Demo in HTML5
// By Amarnath S, amarnaths.codeproject@gmail.com, June 2019

class Wave {
    constructor(name, period, minTime, maxTime, numberTimePoints, minFrequency, maxFrequency,
        numberTimePointsFrequency, noCoeffts) {
        this.name = name;
        this.period = period;
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.numberTimePoints = numberTimePoints;
        this.minFrequency = minFrequency;
        this.maxFrequency = maxFrequency;
        this.numberTimePointsFrequency = numberTimePointsFrequency;
        this.noCoeffts = noCoeffts;
        this.waveform = [];
        this.spectrum = [];

        this.getName = function () {
            return this.name;
        }

        this.setName = function (name) {
            this.name = name;
        }

        this.setPeriod = function (period) {
            this.period = period;
        }

        this.setNumberTimePoints = function (noTimePts) {
            this.numberTimePoints = noTimePts;
        }

        this.setNoCoefficients = function (noCoeffts) {
            this.noCoeffts = noCoeffts;
        }

        this.getSpectrum = function () {
            return this.spectrum;
        }

        this.computeWaveform = function () {
            this.waveform.length = 0; // Empty the array
            let timeVal, val1, val2, x1, x2, periodBy2;
            let timeStep = (this.maxTime - this.minTime) / this.numberTimePoints;
            this.computeSpectrum();

            if (this.name === 'square') {
                // Square wave - start
                for (let i = 0; i < this.numberTimePoints; ++i) {
                    timeVal = this.minTime + i * timeStep;
                    val1 = Math.sin(2 * Math.PI * timeVal / this.period);
                    if (val1 >= 0) {
                        val2 = 1.0;
                    }
                    else {
                        val2 = -1.0;
                    }
                    let sum = 0.0;
                    for (let k = 1; k < this.noCoeffts; k += 2) {
                        sum += (4.0 / (Math.PI * k)) * Math.sin(2 * Math.PI * k * timeVal / this.period);
                    }
                    let errorVal = val2 - sum;

                    this.waveform.push({
                        xVal: timeVal,
                        yVal: val2,
                        synthesis: sum,
                        error: errorVal
                    });
                } // Square wave end
            } else if (this.name === 'triangle') {
                // Triangular wave start
                periodBy2 = 0.5 * this.period;
                for (let i = 0; i < this.numberTimePoints; ++i) {
                    timeVal = this.minTime + i * timeStep;
                    x1 = timeVal / this.period;
                    if (x1 < 0) {
                        x2 = timeVal - Math.floor(x1) * this.period;
                        if (x2 > periodBy2) {
                            x2 -= this.period;
                        }
                    }
                    else {
                        x2 = timeVal - Math.ceil(x1) * this.period;
                        if (x2 < -periodBy2) {
                            x2 += this.period;
                        }
                    }
                    if (x2 < 0) {
                        val1 = 2 * x2 / periodBy2 + 1.0;
                    }
                    else {
                        val1 = -2 * x2 / periodBy2 + 1.0;
                    }

                    let sum = 0.0;
                    for (let k = 1; k < this.noCoeffts; k += 2) {
                        sum += (8.0 / (Math.PI * Math.PI * k * k)) *
                            Math.cos(2 * Math.PI * k * timeVal / this.period);
                    }
                    let errorVal = val1 - sum;

                    this.waveform.push({
                        xVal: timeVal,
                        yVal: val1,
                        synthesis: sum,
                        error: errorVal
                    });
                } // Triangular wave end
            } else if (this.name === 'sawtooth') {
                periodBy2 = 0.5 * this.period;
                // Sawtooth wave
                for (let i = 0; i < this.numberTimePoints; ++i) {
                    timeVal = this.minTime + i * timeStep;
                    x1 = timeVal / this.period;
                    if (x1 < 0) {
                        x2 = timeVal - Math.floor(x1) * this.period;
                        if (x2 > periodBy2) {
                            x2 -= this.period;
                        }
                    }
                    else {
                        x2 = timeVal - Math.ceil(x1) * this.period;
                        if (x2 < -periodBy2) {
                            x2 += this.period;
                        }
                    }
                    val1 = 2.0 * x2 / this.period;

                    let sum = 0.0;
                    for (let k = 1; k < this.noCoeffts; ++k) {
                        sum += (2.0 * Math.pow(-1, k + 1) / (Math.PI * k)) *
                            Math.sin(2 * Math.PI * k * timeVal / this.period);
                    }
                    let errorVal = val1 - sum;

                    this.waveform.push({
                        xVal: timeVal,
                        yVal: val1,
                        synthesis: sum,
                        error: errorVal
                    });
                }
            } else if (this.name == 'fullsine') {
                // Full Wave Rectified Sine wave
                periodBy2 = 0.5 * this.period;
                for (let i = 0; i < this.numberTimePoints; ++i) {
                    timeVal = this.minTime + i * timeStep;
                    x1 = timeVal / this.period;
                    if (x1 < 0) {
                        x2 = timeVal - Math.floor(x1) * this.period;
                        if (x2 > periodBy2) {
                            x2 -= this.period;
                        }
                    }
                    else {
                        x2 = timeVal - Math.ceil(x1) * this.period;
                        if (x2 < -periodBy2) {
                            x2 += this.period;
                        }
                    }
                    val1 = Math.abs(Math.sin(2.0 * Math.PI * x2 / this.period));

                    let sum = 2.0 / Math.PI;
                    let omega = 2.0 * Math.PI / this.period;
                    for (let k = 1; k < this.noCoeffts; ++k) {
                        sum += (4.0 / (Math.PI * (1 - 4.0 * k * k))) *
                            Math.cos(2 * Math.PI * k * timeVal / periodBy2);
                    }
                    let errorVal = val1 - sum;

                    this.waveform.push({
                        xVal: timeVal,
                        yVal: val1,
                        synthesis: sum,
                        error: errorVal
                    });
                }
            }

            return this.waveform;
        }

        this.computeSpectrum = function () {
            this.spectrum.length = 0; // Empty the array
            let timeStepMag = (this.maxFrequency - this.minFrequency) /
                (this.numberTimePointsFrequency - 1);
            let timeVal, val1, val2, coeffVal;

            if (this.name === 'square') {
                // Square Wave - start
                for (let i = 0; i < this.numberTimePointsFrequency; ++i) {
                    let j = i + this.maxFrequency;
                    timeVal = this.minFrequency + i * timeStepMag;
                    coeffVal = timeVal / this.period;

                    let j1 = Math.abs(i - 15);
                    if (j % 2 !== 0) {
                        val1 = 2 / (Math.PI * j1);
                        if (timeVal < 0) {
                            val2 = 0.5 * Math.PI;
                        }
                        else {
                            val2 = -0.5 * Math.PI;
                        }
                    }
                    else {
                        val1 = 0;
                        val2 = 0;
                    }
                    if (Math.abs(timeVal) > this.noCoeffts) {
                        val1 = 0;
                        val2 = 0;
                    }
                    this.spectrum.push({
                        xVal: timeVal, // Frequency
                        yVal: val1, // Magnitude
                        phase: val2, // Phase
                        coeff: coeffVal // Coefficient
                    });
                } // Square Wave end
            } else if (this.name === 'triangle') {
                // Triangular Wave - start
                for (let i = 0; i < this.numberTimePointsFrequency; ++i) {
                    let j = i + this.maxFrequency;
                    timeVal = this.minFrequency + i * timeStepMag;
                    coeffVal = timeVal / this.period;

                    let j1 = Math.abs(i - 15);
                    if (j % 2 !== 0) {
                        val1 = 4 / (Math.PI * Math.PI * j1 * j1);
                        val2 = 0;
                    }
                    else {
                        val1 = 0;
                        val2 = 0;
                    }
                    if (Math.abs(timeVal) > this.noCoeffts) {
                        val1 = 0;
                        val2 = 0;
                    }
                    this.spectrum.push({
                        xVal: timeVal, // Frequency
                        yVal: val1, // Magnitude
                        phase: val2, // Phase
                        coeff: coeffVal // Coefficient
                    });
                } // Triangular Wave end
            } else if (this.name === 'sawtooth') {
                // Sawtooth Wave start
                for (let i = 0; i < this.numberTimePointsFrequency; ++i) {
                    let j = i + this.maxFrequency;
                    timeVal = this.minFrequency + i * timeStepMag;
                    coeffVal = timeVal / this.period;

                    let j1 = Math.abs(i - 15);
                    let j2 = (i - 15) < 0 ? -1 : 1;
                    if (j1 === 0) {
                        val1 = 0;
                        val2 = 0;
                    } else if (j1 % 2 !== 0) {
                        val1 = 1 / (Math.PI * j1);
                        val2 = -1 * j2; // seems wrong
                    }
                    else {
                        val1 = 1 / (Math.PI * j1);
                        val2 = 1 * j2; // seems incorrect
                    }
                    if (Math.abs(timeVal) > this.noCoeffts) {
                        val1 = 0;
                        val2 = 0;
                    }
                    this.spectrum.push({
                        xVal: timeVal, // Frequency
                        yVal: val1, // Magnitude
                        phase: val2, // Phase
                        coeff: coeffVal // Coefficient
                    }); // Sawtooth Wave end
                }
            } else if (this.name === 'fullsine') {
                // Full Wave Rectified Sine start
                for (let i = 0; i < this.numberTimePointsFrequency; ++i) {
                    let j = i + this.maxFrequency;
                    timeVal = this.minFrequency + i * timeStepMag;
                    coeffVal = timeVal / this.period;

                    let j1 = (i - 15);
                    val1 = Math.abs(2.0 / (Math.PI * (1 - 4 * j1 * j1)));
                    if (j1 == 0) {
                        val2 = 0;
                    } else if (j1 > 0) {
                        val2 = -Math.PI;
                    } else {
                        val2 = Math.PI;
                    }
                    if (Math.abs(timeVal) > this.noCoeffts) {
                        val1 = 0;
                        val2 = 0;
                    }
                    this.spectrum.push({
                        xVal: timeVal, // Frequency
                        yVal: val1, // Magnitude
                        phase: val2, // Phase
                        coeff: coeffVal // Coefficient
                    }); // Full Wave Rectified Sine end
                }
            }

            return this.spectrum;
        }
    }
}