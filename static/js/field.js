const draw_field = (p, {opacity = 1, fieldColor = undefined, lineColor = undefined} = {}) => {

    var linecolour = lineColor ? lineColor : "#ffffff";
    var fillcolour = fieldColor ? fieldColor : "#A1C349";

    var scaled_parent = p.append('g'); // .attr('transform', 'scale('+(s / 1109)+')')
    var holder = scaled_parent.append('g')
    // .attr('transform', 'translate(-50,-50)')
    .attr('opacity', opacity)

    // Total Grass    
    holder.append("rect") // attach a rectangle
        .attr("x", 0) // position the left of the rectangle
        .attr("y", 0) // position the top of the rectangle
        .attr("height", 780) // set the height
        .attr("width", 1150) // set the width
        .style("fill", fillcolour); // set the fill colour    

    // draw a rectangle pitch outline    
    holder.append("rect") // attach a rectangle
        .attr("x", 50) // position the left of the rectangle
        .attr("y", 50) // position the top of the rectangle
        .attr("height", 680) // set the height
        .attr("width", 1050) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", fillcolour); // set the fill colour     

    // draw a rectangle - half 1
    holder.append("rect") // attach a rectangle
        .attr("x", 50) // position the left of the rectangle
        .attr("y", 50) // position the top of the rectangle
        .attr("height", 680) // set the height
        .attr("width", 525) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 


    // draw a rectangle - half 2
    holder.append("rect") // attach a rectangle
        .attr("x", 575) // position the left of the rectangle
        .attr("y", 50) // position the top of the rectangle
        .attr("height", 680) // set the height
        .attr("width", 525) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 


    // draw a circle - center circle
    holder.append("circle") // attach a circle
        .attr("cx", 575) // position the x-centre
        .attr("cy", 390) // position the y-centre
        .attr("r", 91.5) // set the radius
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour


    // draw a rectangle - penalty area 1
    holder.append("rect") // attach a rectangle
        .attr("x", 50) // position the left of the rectangle
        .attr("y", 188.5) // position the top of the rectangle
        .attr("height", 403) // set the height
        .attr("width", 165) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 


    // draw a rectangle - penalty area 2
    holder.append("rect") // attach a rectangle
        .attr("x", 935) // position the left of the rectangle
        .attr("y", 188.5) // position the top of the rectangle
        .attr("height", 403) // set the height
        .attr("width", 165) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 

    // draw a rectangle - six yard box 1
    holder.append("rect") // attach a rectangle
        .attr("x", 50) // position the left of the rectangle
        .attr("y", 298.5) // position the top of the rectangle
        .attr("height", 183) // set the height
        .attr("width", 55) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 

    // draw a rectangle - six yard box 2
    holder.append("rect") // attach a rectangle
        .attr("x", 1045) // position the left of the rectangle
        .attr("y", 298.5) // position the top of the rectangle
        .attr("height", 183) // set the height
        .attr("width", 55) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour 

    // draw a rectangle - goalmouth 1
    holder.append("rect") // attach a rectangle
        .attr("x", 25) // position the left of the rectangle
        .attr("y", 353.4) // position the top of the rectangle
        .attr("height", 73.2) // set the height
        .attr("width", 25) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour

    // draw a rectangle - goalmouth 2
    holder.append("rect") // attach a rectangle
        .attr("x", 1100) // position the left of the rectangle
        .attr("y", 353.4) // position the top of the rectangle
        .attr("height", 73.2) // set the height
        .attr("width", 25) // set the width
        .style("stroke-width", 5) // set the stroke width
        .style("stroke", linecolour) // set the line colour
        .style("fill", "none"); // set the fill colour


    // draw a circle - penalty spot 1
    holder.append("circle") // attach a circle
        .attr("cx", 160) // position the x-centre
        .attr("cy", 390) // position the y-centre
        .attr("r", 5) // set the radius
        .style("fill", linecolour); // set the fill colour

    // draw a circle - penalty spot 2
    holder.append("circle") // attach a circle
        .attr("cx", 990) // position the x-centre
        .attr("cy", 390) // position the y-centre
        .attr("r", 5) // set the radius
        .style("fill", linecolour); // set the fill colour

    // draw a circle - center spot
    holder.append("circle") // attach a circle
        .attr("cx", 575) // position the x-centre
        .attr("cy", 390) // position the y-centre
        .attr("r", 5) // set the radius
        .style("fill", linecolour); // set the fill colour


    var arc = d3.arc()
        .innerRadius(89)
        .outerRadius(94)
        .startAngle(0.64) //radians
        .endAngle(2.5) //just radians

    var arc2 = d3.arc()
        .innerRadius(89)
        .outerRadius(94)
        .startAngle(-0.64) //radians
        .endAngle(-2.5) //just radians
    holder.append("path")
        .attr("d", arc)
        .attr("fill", linecolour)
        .attr("transform", "translate(160,390)")
    holder.append("path")
        .attr("d", arc2)
        .attr("fill", linecolour)
        .attr("transform", "translate(990,390)");

}