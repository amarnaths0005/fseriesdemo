
'option strict'

/*
Fourier Series Demo in HTML5 - Requirements:
By Amarnath S, amarnaths.codeproject@gmail.com, June 2019

1. Should allow the user to choose from these signal types - Square, Triangle, 
    Ramp or Sawtooth, Full wave rectified sine. Default Square wave.
2. Should allow the user to choose the period of the signal over the range 5 to 25 in 
    steps of 0.1. Default period 10.
3. Should allow the user to choose the number of Fourier Coefficients from 1 to 15.
    Default should be 5.
4. Should display the waveform of the original signal, in blue, and the 
    reconstructed waveform after Fourier Synthesis, in red.
5. Should allow the user the user to view the error between the original and 
    reconstructed signal, a radio button to view the error, or view the signals.
6. Should show the magnitude spectrum, as a lollipop plot. Should have a radio button
    to see the frequency or Fourier coefficient on the x-axis.
7. Should show the phase spectrum, as a lollipop plot. Again, should have a radio button
    to see the frequency or Fourier coefficient on the x-axis. 

Nice to have:
1. Tooltips for the plots.
2. Smooth/animated transition between successive plots.
*/

let minTime = -30.0;
let maxTime = 30.0;
let noTimePoints = 2000;
let period = 10; // Can be changed by user
let timeStep;
let selectSig;
let rangePeriod;
let waveform = [];
let xSignal, ySignal;
let svgSignal, svgMagnitude, svgPhase;
let width, height, margin;
let minTimeMag = -15.0;
let maxTimeMag = 15.0;
let noTimePointsMag = 31;
let timeStepMag;
let magnitude = [];
let wave;
let coeffCheck;
let sliderNoCoeffts;
let noCoefficients;
let errorCheck;

window.onload = init;

function init() {
    timeStep = (maxTime - minTime) / noTimePoints;
    timeStepMag = (maxTimeMag - minTimeMag) / 30;
    coeffCheck = document.getElementById("coeff");
    errorCheck = document.getElementById("error");
    sliderNoCoeffts = document.getElementById("sliderCoeffts");

    let svgWidth = 600, svgHeight = 140;
    margin = { top: 20, right: 20, bottom: 40, left: 50 };
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;

    svgSignal = d3.select('#svgSignal')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("class", "graph-svg-component");

    svgMagnitude = d3.select('#svgMagnitude')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("class", "graph-svg-component");

    svgPhase = d3.select('#svgPhase')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("class", "graph-svg-component");

    selectSig = document.getElementById("selSignalType");
    selectSig.addEventListener('change', handleSignal, false);

    rangePeriod = document.getElementById("sliderPeriod");
    rangePeriod.addEventListener('change', handlePeriod, false);

    coeffCheck.addEventListener("change", changeCoefftFrequencyDisplay);
    errorCheck.addEventListener("change", changeErrorDisplay);

    sliderNoCoeffts.addEventListener("change", changeNoCoeffts);
    noCoefficients = sliderNoCoeffts.value;

    wave = new Wave('square', period, minTime, maxTime, noTimePoints, minTimeMag,
        maxTimeMag, noTimePointsMag, noCoefficients);

    selectSig.selectedIndex = 0;
    handleSignal();
}

function changeErrorDisplay() {
    handleSignal();
}

function changeNoCoeffts() {
    d3.selectAll("svg > *").remove();
    noCoefficients = sliderNoCoeffts.value;
    let oCoeff = document.getElementById("opCoeffts");
    oCoeff.textContent = noCoefficients;
    handleSignal();
}

function changeCoefftFrequencyDisplay() {
    handleSignal();
}

function handlePeriod() {
    period = parseFloat(rangePeriod.value);
    let oPeriod = document.getElementById("opPeriod");
    let text = period;
    oPeriod.textContent = text;
    handleSignal();
}

// gridlines in y axis function
function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(10)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(5)
}

function handleSignal() {
    d3.selectAll("svg > *").remove();

    let name;
    if (selectSig.selectedIndex === 0) {
        name = 'square';
    } else if (selectSig.selectedIndex === 1) {
        name = 'triangle';
    } else if (selectSig.selectedIndex === 2) {
        name = 'sawtooth';
    } else if (selectSig.selectedIndex === 3) {
        name = 'fullsine';
    }

    wave.setName(name);
    wave.setPeriod(period);
    wave.setNumberTimePoints(noTimePoints);
    wave.setNoCoefficients(noCoefficients);
    waveform = wave.computeWaveform();
    magnitude = wave.getSpectrum();
    if (errorCheck.checked) {
        drawSignalError(waveform);
    } else {
        drawSignal(waveform);
    }
    drawSpectrum(magnitude, svgMagnitude, 'mag');
    drawSpectrum(magnitude, svgPhase, 'phase');
}

function drawSignal(data) {
    let g = svgSignal.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleLinear()
        .rangeRound([0, width]);

    y = d3.scaleLinear()
        .rangeRound([height, 0]);

    x.domain(d3.extent(data, function (d) { return d.xVal * 1.2; }));
    y.domain(d3.extent(data, function (d) { return d.yVal * 1.2; }));

    let line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) { return x(d.xVal); })
        .y(function (d) { return y(d.yVal); })

    let line2 = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) { return x(d.xVal); })
        .y(function (d) { return y(d.synthesis); })

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y)
            .ticks(5));

    // add the X gridlines
    g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        );

    // add the Y gridlines
    g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        );

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1)
        .attr("d", line2)
        .text("Synthesized");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2.5)
        .attr("d", line);

    g.append("text")
        .attr("transform", "translate(" + 400 + "," + 0 + ")")
        .attr("dy", ".05em")
        .attr("text-anchor", "start")
        .style("fill", "red")
        .style("font-size", "14px")
        .text("Synthesized Signal");

    g.append("text")
        .attr("transform", "translate(" + 10 + "," + 0 + ")")
        .attr("dy", ".05em")
        .attr("text-anchor", "start")
        .style("fill", "steelblue")
        .style("font-size", "14px")
        .text("Original Signal");

    // text label for the x axis
    g.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Time (seconds)");

    // text label for the y axis
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Amplitude");
}

function drawSignalError(data) {
    let g = svgSignal.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleLinear()
        .rangeRound([0, width]);

    y = d3.scaleLinear()
        .rangeRound([height, 0]);

    x.domain(d3.extent(data, function (d) { return d.xVal * 1.2 }));
    y.domain(d3.extent(data, function (d) { return d.error * 1.2 }));

    let line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) { return x(d.xVal); })
        .y(function (d) { return y(d.error); })

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y)
            .ticks(5));

    // add the X gridlines
    g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        );

    // add the Y gridlines
    g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        );

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.0)
        .attr("d", line);

    g.append("text")
        .attr("transform", "translate(" + 400 + "," + 0 + ")")
        .attr("dy", ".05em")
        .attr("text-anchor", "start")
        .style("fill", "blue")
        .style("font-size", "14px")
        .text("Error Signal");

    // text label for the x axis
    g.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Time (seconds)");

    // text label for the y axis
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Error");
}

function drawSpectrum(data, svgToDraw, magOrPhase) {
    let g = svgToDraw.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleLinear()
        .range([0, width]);

    y = d3.scaleLinear()
        .range([height, 0]);

    if (coeffCheck.checked) {
        x.domain(d3.extent(data, function (d) { return d.coeff * 1.2; }));
    } else {
        x.domain(d3.extent(data, function (d) { return d.xVal * 1.2; }));
    }

    if (magOrPhase === 'mag') {
        y.domain(d3.extent(data, function (d) { return d.yVal * 1.2; }));
    }
    else {
        y.domain(d3.extent(data, function (d) { return d.phase * 1.2; }));
    }

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y));

    // add the X gridlines
    g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        );

    // add the Y gridlines
    g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        );

    // Lines
    if (magOrPhase === 'mag') {
        if (coeffCheck.checked) {
            g.selectAll("myline")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function (d) { return x(d.coeff); })
                .attr("x2", function (d) { return x(d.coeff); })
                .attr("y1", function (d) { return y(d.yVal); })
                .attr("y2", height)
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5);

            // Circles
            g.selectAll("mycircle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return x(d.coeff); })
                .attr("cy", function (d) { return y(d.yVal); })
                .attr("r", "4")
                .style("fill", "steelblue")
                .attr("stroke", "steelblue");
        } else {
            g.selectAll("myline")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function (d) { return x(d.xVal); })
                .attr("x2", function (d) { return x(d.xVal); })
                .attr("y1", function (d) { return y(d.yVal); })
                .attr("y2", height)
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5);

            // Circles
            g.selectAll("mycircle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return x(d.xVal); })
                .attr("cy", function (d) { return y(d.yVal); })
                .attr("r", "4")
                .style("fill", "steelblue")
                .attr("stroke", "steelblue");
        }

    } else {
        if (coeffCheck.checked) {
            g.selectAll("myline")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function (d) { return x(d.coeff); })
                .attr("x2", function (d) { return x(d.coeff); })
                .attr("y1", function (d) { return y(0); })
                .attr("y2", function (d) { return y(d.phase); })
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5);

            // Circles
            g.selectAll("mycircle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return x(d.coeff); })
                .attr("cy", function (d) { return y(d.phase); })
                .attr("r", "4")
                .style("fill", "steelblue") 
                .attr("stroke", "steelblue");

        } else {
            g.selectAll("myline")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function (d) { return x(d.xVal); })
                .attr("x2", function (d) { return x(d.xVal); })
                .attr("y1", function (d) { return y(0); })
                .attr("y2", function (d) { return y(d.phase); })
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5);

            // Circles
            g.selectAll("mycircle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return x(d.xVal); })
                .attr("cy", function (d) { return y(d.phase); })
                .attr("r", "4")
                .style("fill", "steelblue") 
                .attr("stroke", "steelblue");
        }
    }

    // text label for the x axis
    if (coeffCheck.checked) {
        g.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 9) + ")")
            .style("text-anchor", "middle")
            .text("Coefficient");
    } else {
        g.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 9) + ")")
            .style("text-anchor", "middle")
            .text("Frequency (Hz)");
    }

    let yLabel = 'Phase';
    if (magOrPhase === 'mag') {
        yLabel = 'Amplitude';
    }

    // text label for the y axis
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yLabel);
}
