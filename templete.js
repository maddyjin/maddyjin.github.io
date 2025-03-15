// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 70, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Unique platforms
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) // Minimum to maximum Likes
        .range([height, 0]);
  
    // Add scales     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
    .attr("x", -(height / 2))
    .attr("y", -margin.left + 10)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Number of Likes");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        return {min, q1};
    };

    // This line groups the data by 'species' and then calculates the quartile values for each species using the 'rollupFunction'.
    // The method 'd3.rollup()' applies the 'rollupFunction' to the dataset in order to calculate quartiles for each of the species
    // Calculates the values min, q1, median, q3, max for each species, and organizes the results as a map with species as the key 
    // and calculated quartiles as the value.
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.species);

    // This iterates through each of the species and their quartile data. For each of the species, it uses 'xScale'
    // to calculates its x-coordinate based on its categorical position, then retrieving the width of the corresponding
    // box dimensions in the boxplot.
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "steelblue")
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
        .attr("x1", x)
        .attr("x2", x + boxWidth)
        .attr("y1", yScale(quantiles.median))
        .attr("y2", yScale(quantiles.median))
        .attr("stroke", "black");
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
// Load the data for the side-by-side bar plot
// Load the data for the side-by-side bar plot
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes; // Convert AvgLikes to numeric
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 70, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Unique platforms
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))]) // Unique post types
        .range([0, x0.bandwidth()])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)]) // Range based on max AvgLikes
        .nice() // Make domain cleaner
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Colors for Post Types

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("x", -(height / 2))
        .attr("y", -margin.left + 10)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Average Number of Likes");

    // Group container for bars
    const barGroups = svg.selectAll(".bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType)) // Position based on PostType within Platform
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const postTypes = [...new Set(data.map(d => d.PostType))];

    postTypes.forEach((type, i) => {
        // Add legend rectangles
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        // Add legend text
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
          d.AvgLikes = +d.AvgLikes;
      });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 70, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const xScale = d3.scalePoint()
        .domain(data.map(d => d.Date)) // Dates on the x-axis
        .range([0, width]);


    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("x", -(height / 2))
        .attr("y", -margin.left + 10)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Average Number of Likes");

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);

    // Append the line path
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

});
console.log("templete.js is linked correctly!");

