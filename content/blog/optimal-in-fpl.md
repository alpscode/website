+++
draft = false
title = "On the meaning of optimal in FPL"
date = "2021-01-08T11:00:00-04:00"
tags = ["FPL", "optimization", "analytics", "math"]
categories = ["optimization"]
banner = "/img/banners/optimization_arrow.jpg"
bannercaption = "Photo by Jens Johnsson from Pexels"
author = "Alp Cay"
js = ["https://d3js.org/d3.v6.min.js"]
+++

The amount of available content for Fantasy Premier League (FPL) is unbelivable and hard to follow.
Among all, one of my favorite resources is the "[Corridor of Uncertainty](https://twitter.com/uncertainty_pod)" podcast as they focus on modeling and analytics part of FPL.
Their guest in the latest episode was Abdul Rehman ([FPL Salah](https://twitter.com/FPL_Salah)), who is a well-known manager in the FPL community.
I truly enjoyed their discussion and noticed that the word "optimal" is thrown around quite a bit.
Since I do optimization for a living, it makes me happy to hear it in everyday conversations, especially regarding FPL.

FPL is the picture-perfect example for demonstrating how optimization could be useful.
Why? Because (mathematical) optimization deals with making the best out of limited resources under restrictions.
Fantasy sports --with their well-defined rules, and standard ways of measuring the performance-- are great showcases.

As I have mentioned before, so-called "Effective Ownership" (EO) is a controversial topic among FPL managers.

{{< tweet 1341805255646998529 >}}

{{< tweet 1341817006266470405 >}}

Yes, AZ is right, optimal decision is independent of EO, **but we need to take a step back to understand why**.

## The role 'ownership' plays in optimal solution

There are two schools of thought:

- The first group says that if you try to maximize your points, you will be doing the best you could regardless of what others are doing. Period.
- The second group claims that the Effective Ownership makes it useless to own highly-owned players (unless you captain them), so EO does matter.

As far as I can tell, the confusion comes from the missing part of the equation when we think of EO.
I made the same mistake in my earlier blog post, so I will talk a little bit more about EO here.

Suppose Salah will get 8 points next game and he is owned by 40% of all FPL managers including you.
To keep things simple, let me leave out the captaincy points.
You and 40% of all FPL managers will get 8 points. 60% will get 0 out of him.
The average benefit you get is the difference between your gain and your loss.
There is no loss to you in this case, but 40% of players will get the same benefit as you do, which will reduce your relative gain.
The average that Salah will bring to FPL managers is (overall average):

$$
8 \cdot \frac{40}{100} - 0 \cdot \frac{60}{100} = 3.2
$$

When you take your 8 points, the net gain (relative to all FPL managers) you get from Salah is 8-3.2=4.8. Awesome.
For people who don't own him, there is no gain but only loss, which is simply -3.2.

We can write down this idea in the following mathematical equation.

$$
\text{Average gain} - \text{Average loss} =
$$

$$
 p_i \cdot (1-o_i) \cdot x_i - p_i \cdot o_i \cdot (1-x_i)
$$

Here, $x$ is a binary value, which takes value 1 if you own the player, and takes value 0 otherwise.
$p$ is the (expected) points for the player, and $o$ is the ownership ratio of the player.
In our earlier example, $p$ was 8, $o$ was 0.4, and for you $x$ was equal to 1.
Which gives us the same result: 
- If you own: $8 \cdot (1-0.4) \cdot 1  - 8 \cdot 0.4 \cdot 0= 4.8$
- If you don't: $8 \cdot (1-0.4) \cdot 0  - 8 \cdot 0.4 \cdot 1 = -3.2$

The equation above reduces to
$$
p_i x_i - p_i o_i
$$

This is very intuitive: The first part $p_i \cdot x_i$ becomes 0 if you don't own the player, and it becomes $p_i$ if you do.
So, the first term is your absolute gain.
The second part is simply the average points of all FPL managers getting from this particular player.
The good news? The second part is constant: you cannot do anything about it, so you don't need to care at all!
If other managers own Fernandes heavily, the average will be the same regardless of what you do.
The only thing you can control here is the value $x$, whether you have the player or not.

This is why EO is not important.
It only changes your relative position to other FPL managers.

**Maximizing your relative difference to average of all FPL managers is the same thing as maximizing your own points!**

In the context of optimization, second term does not have any effect.
**But**, the question you are probably wondering if there is a catch. There is.
Enter multiobjective optimization.

## Multiobjective optimization with FPL

When I defined average gain and loss, we had ownership rate appearing in both terms.
So, you might be suspecting that EO changes your gain and loss, which is totally correct.
Like all FPL managers we are trying to
1. Maximize the gain
2. Minimize the loss

These two may sound like parallel to each other, but they are actually **conflicting objectives**.
Mainly because you have limited budget and need to decide on one player or the other.
Let me explain it on an example below.

Suppose Mane and Fernandes both has the same expected points, 10, but Mane's ownership ratio is 5% and Fernandes' is 90%.
The average gain you get from Mane (suppose they both get 10 points exactly) is $10 \cdot (1-0.05) = 9.5$.
However you will lose $10 \cdot 0.9 = 9$ by not owning Fernandes.
Similarly, the gain you get from Fernandes if you own him is $10 \cdot (1-0.9) = 1$, while the loss from not owning Mane is $10 \cdot 0.05 = 0.5$.

The math says that the net benefit you get by owning either of them is the same!
- Owning Mane: Gain - Loss = 9.5 - 9 = 0.5
- Owning Fernandes: Gain - Loss = 1 - 0.5 = 0.5

However, as you see there is a difference on how we reached 0.5.
The first path is high risk, high reward.
- If you have Mane, and Fernandes blanks (2 points): you will jump in rank massively: $9.5 - 2 \cdot 0.9 = 7.7$.
- If you have Mane, and he blanks: you will lose quite a bit of rank: $2 \cdot (1-0.05) - 9 = -7.1$.
- If you have Fernandes, and Mane blanks: your net benefit is $1 - 2 \cdot 0.05 = 0.9$.
- If you have Fernandes, and he blanks: your net benefit is $2 \cdot (1-0.9) - 0.5 = -0.3$.

See the payoff table below.

| Scenario          | Own Mane | Own Fernandes |
|-------------------|---------:|--------------:|
| Both get 10       |      0.5 |           0.5 |
| Fernandes blanks  |      7.7 |          -0.3 |
| Mane blanks       |     -7.1 |           0.9 |
| Both blanks       |      0.1 |           0.1 |

It is easy to see why owning Mane could make or break things for you now.

The problem gets more complicated when you include all the players, not only 2.
There are number of ways to solve multiobjective optimization problems like this one, but I will use *weighted-sum* method.

On my [FPL Optimized](https://sertalpbilal.github.io/fpl_optimized/team_summary.html) page, I show the following expected gain / loss graph depending on the ownership rates:

{{< img src="/img/uploads/fpl_optimized_graph1.png"  figcls="img-responsive" class="lazy">}}

- When you try to only "maximize the gain", the optimization will pick the players higher on the x-axis.
  This will mean that you prefer players with "high expected points and low ownership".

- When you "minimize the loss", the optimization will pick the players higher on the y-axis.
  This will mean that you prefer players with "high expected points and high ownership".

- When you "maximize the net benefit" or "maximize expected points", the optimization will pick the players higher on the diagonal (50% own direction).
  This will mean that you prefer players with "high expected points, regardless of ownership ratio".

But, we can aim for something in between instead of these three extremes.
Since we have two different objectives here, we can assign a weight on how much we think gain and loss are important.

$$
w \cdot \text{Expected Gain} - (1-w) \cdot \text{Expected Loss}
$$

{{< img src="/img/uploads/fpl_optimized_graph2.png"  figcls="img-responsive" class="lazy">}}

Notice that when $w=1$, you are maximizing your gain; when $w=0$ you are minimizing the loss, and when $w=0.5$, you are maximizing your points.
Solving this problem using an optimization solver (algorithm) will give you what is called a "[Pareto-optimal](https://en.wikipedia.org/wiki/Pareto_efficiency)".
It means that, for the specified weight $w$, you will get the best solution.
There could be other solutions that has the same value (weak Pareto optimality), but nothing can exceed this point on both objectives at the same time.

Yes, all FPL managers are trying to balance between their gains and losses, but there is an optimal selection of players for each selection of $w$ between 0 and 1.
In case you are wondering how much this weight affects the optimal solution, I solved the resulting optimization problem (under 100M budget) for 21 different values of $w$.
Here's how the gain, loss and benefit changes for GW16:

| Gain Weight (w) | Exp Gain | Exp Loss | Exp Benefit (Net) |
|-----------------|---------:|---------:|------------:|
| 0               | 28.850   | 27.736   | 1.114       |
| 0.05            | 28.850   | 27.736   | 1.114       |
| 0.1             | 30.576   | 27.896   | 2.680       |
| 0.15            | 30.576   | 27.896   | 2.680       |
| 0.2             | 33.740   | 28.664   | 5.076       |
| 0.25            | 35.172   | 29.138   | 6.034       |
| 0.3             | 35.172   | 29.138   | 6.034       |
| 0.35            | 36.801   | 29.951   | 6.850       |
| 0.4             | 36.801   | 29.951   | 6.850       |
| 0.45            | 39.216   | 31.686   | 7.530       |
| 0.5             | 40.885   | 33.090   | 7.795       |
| 0.55            | 43.116   | 35.548   | 7.568       |
| 0.6             | 43.116   | 35.548   | 7.568       |
| 0.65            | 45.277   | 39.203   | 6.074       |
| 0.7             | 46.487   | 41.486   | 5.001       |
| 0.75            | 46.487   | 41.486   | 5.001       |
| 0.8             | 47.376   | 44.378   | 2.998       |
| 0.85            | 47.376   | 44.378   | 2.998       |
| 0.9             | 47.376   | 44.378   | 2.998       |
| 0.95            | 47.376   | 44.378   | 2.998       |
| 1               | 47.376   | 44.378   | 2.998       |

The following chart might help to understand what is going on.
You can hover (or touch) the circles below to see the actual lineup.

<div id="plot1" style="max-width: 700px; margin: 0 auto;">
</div>

<script type="text/javascript">

var gw16_data = [
    {"gain_weight":0,"loss_weight":1,"gain":28.85,"loss":27.736,"net":1.114,"lineup":"Martínez, Zouma, Justin, Walker-Peters, Johnson, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.05,"loss_weight":0.95,"gain":28.85,"loss":27.736,"net":1.114,"lineup":"Martínez, Zouma, Justin, Walker-Peters, Johnson, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.1,"loss_weight":0.9,"gain":30.576,"loss":27.896,"net":2.68,"lineup":"McCarthy, Pieters, Zouma, Justin, Walker-Peters, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.15,"loss_weight":0.85,"gain":30.576,"loss":27.896,"net":2.68,"lineup":"McCarthy, Pieters, Zouma, Justin, Walker-Peters, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.2,"loss_weight":0.8,"gain":33.74,"loss":28.664,"net":5.076,"lineup":"McCarthy, Taylor, Justin, Robertson, Walker-Peters, Salah, Fernandes, Ward-Prowse, Son, Bamford, Kane"},
    {"gain_weight":0.25,"loss_weight":0.75,"gain":35.172,"loss":29.138,"net":6.034,"lineup":"McCarthy, Pieters, Justin, Robertson, Dier, Salah, Fernandes, Ward-Prowse, Son, Bamford, Kane"},
    {"gain_weight":0.3,"loss_weight":0.7,"gain":35.172,"loss":29.138,"net":6.034,"lineup":"McCarthy, Pieters, Justin, Robertson, Dier, Salah, Fernandes, Ward-Prowse, Son, Bamford, Kane"},
    {"gain_weight":0.35,"loss_weight":0.65,"gain":36.801,"loss":29.951,"net":6.85,"lineup":"McCarthy, Taylor, Robertson, Dier, Harrison, Salah, Fernandes, Son, Bamford, Adams, Kane"},
    {"gain_weight":0.4,"loss_weight":0.6,"gain":36.801,"loss":29.951,"net":6.85,"lineup":"McCarthy, Taylor, Robertson, Dier, Harrison, Salah, Fernandes, Son, Bamford, Adams, Kane"},
    {"gain_weight":0.45,"loss_weight":0.55,"gain":39.216,"loss":31.686,"net":7.53,"lineup":"Pope, Robertson, Alexander-Arnold, Maguire, Dier, Salah, Ward-Prowse, Son, Bamford, Adams, Kane"},
    {"gain_weight":0.5,"loss_weight":0.5,"gain":40.885,"loss":33.09,"net":7.795,"lineup":"Pope, Robertson, Alexander-Arnold, Maguire, Alderweireld, Dier, Salah, Fernandes, Bamford, Adams, Kane"},
    {"gain_weight":0.55,"loss_weight":0.45,"gain":43.116,"loss":35.548,"net":7.568,"lineup":"Pope, Alexander-Arnold, Maguire, Alderweireld, Dier, Mané, Salah, Ward-Prowse, Bamford, Adams, Kane"},
    {"gain_weight":0.6,"loss_weight":0.4,"gain":43.116,"loss":35.548,"net":7.568,"lineup":"Pope, Alexander-Arnold, Maguire, Alderweireld, Dier, Mané, Salah, Ward-Prowse, Bamford, Adams, Kane"},
    {"gain_weight":0.65,"loss_weight":0.35,"gain":45.277,"loss":39.203,"net":6.074,"lineup":"Lloris, Pieters, Maguire, Alderweireld, Dier, Mané, Salah, Sterling, Bamford, Firmino, Adams"},
    {"gain_weight":0.7,"loss_weight":0.3,"gain":46.487,"loss":41.486,"net":5.001,"lineup":"Lloris, Maguire, Alderweireld, Dier, Harrison, Mané, Salah, Sterling, Raphinha, Firmino, Adams"},
    {"gain_weight":0.75,"loss_weight":0.25,"gain":46.487,"loss":41.486,"net":5.001,"lineup":"Lloris, Maguire, Alderweireld, Dier, Harrison, Mané, Salah, Sterling, Raphinha, Firmino, Adams"},
    {"gain_weight":0.8,"loss_weight":0.2,"gain":47.376,"loss":44.378,"net":2.998,"lineup":"Lloris, Alexander-Arnold, Maguire, Alderweireld, Dier, Pulisic, Harrison, Mané, Sterling, Firmino, Martial"},
    {"gain_weight":0.85,"loss_weight":0.15,"gain":47.376,"loss":44.378,"net":2.998,"lineup":"Lloris, Alexander-Arnold, Maguire, Alderweireld, Dier, Pulisic, Harrison, Mané, Sterling, Firmino, Martial"},
    {"gain_weight":0.9,"loss_weight":0.1,"gain":47.376,"loss":44.378,"net":2.998,"lineup":"Lloris, Alexander-Arnold, Maguire, Alderweireld, Dier, Pulisic, Harrison, Mané, Sterling, Firmino, Martial"},
    {"gain_weight":0.95,"loss_weight":0.05,"gain":47.376,"loss":44.378,"net":2.998,"lineup":"Lloris, Alexander-Arnold, Maguire, Alderweireld, Dier, Pulisic, Harrison, Mané, Sterling, Firmino, Martial"},
    {"gain_weight":1,"loss_weight":0,"gain":47.376,"loss":44.378,"net":2.998,"lineup":"Lloris, Alexander-Arnold, Maguire, Alderweireld, Dier, Pulisic, Harrison, Mané, Sterling, Firmino, Martial"}
];

function draw_plot(id, plot_data) {
    var margin = { top: 20, right: 30, bottom: 40, left: 45 },
        width = 450 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

	let cnv = d3.select(id)
		.append("svg")
		.attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block');
    
	let svg = cnv.append('g').attr('transform', 'translate('+margin.left+','+margin.top+')');
	svg.append('rect').attr('fill','#f1f1f1').attr('width', width).attr('height', height);

    var x = d3.scaleBand().domain(plot_data.map(i => i.gain_weight)).range([0, width]).padding([0.2])
    svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x));

    var xSub = d3.scaleBand()
        .domain(["gain", "loss"])
        .range([0, x.bandwidth()])
        .padding([0])

    var y1 = d3.scaleLinear()
        .domain([0, d3.max(plot_data, d => d.gain)+2])
        .range([height, 0])
    svg.append('g').call(d3.axisLeft(y1));

    var y2 = d3.scaleLinear()
        .domain([0, d3.max(plot_data, d => d.net)+1])
        .range([height, 0])
    svg.append('g').attr('transform', 'translate('+width+',0)').call(d3.axisRight(y2));

    svg.call(s => s.selectAll(".tick").attr("font-size", "6pt"))

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("font-size", "7pt")
        .text("Gain weight (w)");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -5)
        .attr("y", -5)
        .attr("font-size", "7pt")
        .text("Gain/Loss");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width+5)
        .attr("y", -5)
        .attr("font-size", "7pt")
        .text("Net");


    svg.append("g")
      .attr("fill", "#146d5e")
      .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(plot_data)
    .join("rect")
      .attr("transform", function(d) { return "translate(" + x(d.gain_weight) + ",0)"; })
      .attr("x", d => xSub(d.gain_weight))
      .attr("width", xSub.bandwidth())
      .attr("y", d => y1(d.gain))
      .attr("height", d => y1(0) - y1(d.gain))
      .attr("opacity", 0.7);
    
    svg.append("g")
      .attr("fill", "#ff742c")
      .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(plot_data)
    .join("rect")
      .attr("transform", function(d) { return "translate(" + x(d.gain_weight) + ",0)"; })
      .attr("x", d => xSub.bandwidth())
      .attr("width", xSub.bandwidth())
      .attr("y", d => y1(d.loss))
      .attr("height", d => y1(0) - y1(d.loss))
      .attr("opacity", 0.7);
    
    let line = d3.line()
        .x(d => x(d.gain_weight) + x.bandwidth() / 2)
        .y(d => y2(d.net))

    svg.append("path")
      .attr("id", "graph")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", line(plot_data))
      .attr("opacity", 0.8);


    // Tooltip
    var tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip-p3")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("color", "black")
        .style("border", "solid")
        .style("border-color", "black")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "small");

    // Mouse events
    var mouseover = function(d) {
        tooltip.style("opacity", 1)
        d3.select(this)
            .style("fill", "red")
    }
    var mouseleave = function(d) {
        tooltip.style("opacity", 0)
        tooltip.html("")
        d3.select(this)
            .style("fill", "black");
        tooltip.style("left", "0px")
            .style("top", "0px");
    }
    var mousemove = function(d) {
        debugger;
        players = d.target.dataset.lineup.split(", ");
        tooltip
            .html(`
                <div style="display:block; margin: 0 auto; text-align: center"><b>Lineup</b></div>
                <table id="lineup_table">
                </table>
            `)
            .style("left", (d.pageX + 5) + "px")
            .style("top", (d.pageY + 5) + "px")
            for (p of players) {
                document.getElementById("lineup_table").insertRow().innerHTML=`<td>${p}</td>`;
            }
            debugger;
    }
    
    svg
      .append("g")
      .selectAll("dot")
      .data(plot_data)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.gain_weight) + x.bandwidth()/2 } )
        .attr("cy", function(d) { return y2(d.net) } )
        .attr("r", 4)
        .attr("fill", "black")
        .attr("data-lineup", function(d) { return d.lineup; })
        .attr("opacity", 1)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    let legend = svg.append("g").attr("transform", "translate(300,"+(height+margin.top+7)+")");
    legend.append("rect").attr("x",0).attr("y",-4).attr("height", 6).attr("width", 6).style("fill", "#146d5e").attr("opacity", 0.7)
    legend.append("text").attr("x", 10).attr("y", 0).text("Gain").style("font-size", "6px").attr("alignment-baseline","middle")
    legend.append("rect").attr("x",34).attr("y",-4).attr("height", 6).attr("width", 6).style("fill", "#ff742c").attr("opacity", 0.7)
    legend.append("text").attr("x", 44).attr("y", 0).text("Loss").style("font-size", "6px").attr("alignment-baseline","middle")
    legend.append("rect").attr("x",68).attr("y",-3).attr("height", 3).attr("width", 10).style("fill", "black").attr("opacity", 0.8)
    legend.append("text").attr("x", 82).attr("y", 0).text("Net").style("font-size", "6px").attr("alignment-baseline","middle")
}


$(document).ready( function () {
    draw_plot("#plot1", gw16_data);
});
</script>

For GW17, the graph looks quite similar.

<div id="plot2" style="max-width: 700px; margin: 0 auto;">

</div>

<script type="text/javascript">

gw17_data = [
    {"gain_weight":0,"loss_weight":1,"gain":27.498555,"loss":26.58007,"obj":-26.58007,"net":0.918485,"lineup":"Martínez, Zouma, Mitchell, Dallas, Justin, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.05,"loss_weight":0.95,"gain":29.556744,"loss":26.638259,"obj":-23.82850885,"net":2.918485,"lineup":"McCarthy, Mitchell, Justin, Johnson, Zaha, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.1,"loss_weight":0.9,"gain":30.439241,"loss":26.700756,"obj":-20.9867563,"net":3.738485,"lineup":"Martínez, Bellerín, Mitchell, Justin, Salah, Fernandes, Son, Neto, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.15,"loss_weight":0.85,"gain":30.439241,"loss":26.700756,"obj":-18.12975645,"net":3.738485,"lineup":"Martínez, Bellerín, Mitchell, Justin, Salah, Fernandes, Son, Neto, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.2,"loss_weight":0.8,"gain":30.439241,"loss":26.700756,"obj":-15.2727566,"net":3.738485,"lineup":"Martínez, Bellerín, Mitchell, Justin, Salah, Fernandes, Son, Neto, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.25,"loss_weight":0.75,"gain":30.439241,"loss":26.700756,"obj":-12.41575675,"net":3.738485,"lineup":"Martínez, Bellerín, Mitchell, Justin, Salah, Fernandes, Son, Neto, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.3,"loss_weight":0.7,"gain":30.439241,"loss":26.700756,"obj":-9.5587569,"net":3.738485,"lineup":"Martínez, Bellerín, Mitchell, Justin, Salah, Fernandes, Son, Neto, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.35,"loss_weight":0.65,"gain":32.028863,"loss":27.390378,"obj":-6.59364365,"net":4.638485,"lineup":"Sánchez, Pieters, Mitchell, Justin, Zaha, Salah, Fernandes, Son, Calvert-Lewin, Bamford, Kane"},
    {"gain_weight":0.4,"loss_weight":0.6,"gain":35.325744,"loss":29.377259,"obj":-3.4960578,"net":5.948485,"lineup":"Leno, Mitchell, Justin, Robertson, Saka, Zaha, Salah, Son, Bamford, Vardy, Kane"},
    {"gain_weight":0.45,"loss_weight":0.55,"gain":35.325744,"loss":29.377259,"obj":-0.26090765,"net":5.948485,"lineup":"Leno, Mitchell, Justin, Robertson, Saka, Zaha, Salah, Son, Bamford, Vardy, Kane"},
    {"gain_weight":0.5,"loss_weight":0.5,"gain":37.917439,"loss":31.686954,"obj":3.1152425,"net":6.230485,"lineup":"Leno, Holding, Tierney, van Aanholt, Mitchell, Salah, Rashford, Son, Bamford, Vardy, Kane"},
    {"gain_weight":0.55,"loss_weight":0.45,"gain":39.044981,"loss":32.989496,"obj":6.62946635,"net":6.055485,"lineup":"Leno, Holding, van Aanholt, Mitchell, Zaha, Salah, Rashford, Son, Lookman, Vardy, Kane"},
    {"gain_weight":0.6,"loss_weight":0.4,"gain":39.985339,"loss":34.303854,"obj":10.2696618,"net":5.681485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Evans, Saka, Salah, Rashford, Son, Vardy, Kane"},
    {"gain_weight":0.65,"loss_weight":0.35,"gain":43.170086,"loss":39.637601,"obj":14.18739555,"net":3.532485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Zaha, Rashford, Lookman, Vardy, Firmino, Kane"},
    {"gain_weight":0.7,"loss_weight":0.3,"gain":43.170086,"loss":39.637601,"obj":18.3277799,"net":3.532485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Zaha, Rashford, Lookman, Vardy, Firmino, Kane"},
    {"gain_weight":0.75,"loss_weight":0.25,"gain":43.170086,"loss":39.637601,"obj":22.46816425,"net":3.532485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Zaha, Rashford, Lookman, Vardy, Firmino, Kane"},
    {"gain_weight":0.8,"loss_weight":0.2,"gain":43.431854,"loss":40.582369,"obj":26.6290094,"net":2.849485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Evans, Aubameyang, Sigurdsson, Rashford, Vardy, Firmino, Kane"},
    {"gain_weight":0.85,"loss_weight":0.15,"gain":43.864406,"loss":42.964921,"obj":30.84000695,"net":0.899485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Sigurdsson, Mané, Rashford, Lookman, Vardy, Firmino"},
    {"gain_weight":0.9,"loss_weight":0.1,"gain":43.864406,"loss":42.964921,"obj":35.1814733,"net":0.899485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Sigurdsson, Mané, Rashford, Lookman, Vardy, Firmino"},
    {"gain_weight":0.95,"loss_weight":0.05,"gain":43.864406,"loss":42.964921,"obj":39.52293965,"net":0.899485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Sigurdsson, Mané, Rashford, Lookman, Vardy, Firmino"},
    {"gain_weight":1,"loss_weight":0,"gain":43.864406,"loss":42.964921,"obj":43.864406,"net":0.899485,"lineup":"Guaita, Holding, Tierney, van Aanholt, Aubameyang, Sigurdsson, Mané, Rashford, Lookman, Vardy, Firmino"}
];

$(document).ready( function () {
    draw_plot("#plot2", gw17_data);
});

</script>

## How to use this information?

That's the million dollar question!
As far as I can see, **"Elite Managers" tends to minimize their losses**.
I assume if they need to select a $w$ value, it could be between 0.35 and 0.55, depending on how risk-averse they are.
I was inspecting FPL Salah's decisions for the last few weeks, and they are mostly on the conservative side.
Check the expected and realized values for FPL Salah and Optimized FC (my team) for GW16:

{{< img src="/img/uploads/fpl_optimized_salah_gw16.png"  figcls="img-responsive" class="lazy">}}
{{< img src="/img/uploads/fpl_optimized_sertalp_gw16.png"  figcls="img-responsive" class="lazy">}}

The expected net change is usually around these numbers, but FPL Salah's expected gain and loss values are significantly lower.
It indicates that my opponent goes for highly owned players more than I do.

Since it's my first season in FPL, I'm not 100% sure what brings success in long-term, but I'm sure stable performance is quite important.
Sudden jumps is not sustainable for obvious reasons.
Another issue is that we only know the ownership rates for the current GW, so planning a few weeks in advance is tricky.

That's why my optimization model focuses on total points for the planning horizon (8 gameweeks based on [FPL Review data](https://fplreview.com)).
I also keep an eye on ownership rates to see how much risk I'm taking.
Since I'm committed to apply optimization model solutions as is, I expect a high Massive-Data (MD) value when using FPL Review's "Season Review" tool.
I suspect all the people who have high MD-points are using some sort of optimization in their decision making.

I created a page listing FPL managers who use analytics (and optimization) and sorted them by their MD points, rather than FPL points.

[FPL Analytics xP League](https://sertalpbilal.github.io/fpl_optimized/fpl_analytics_league.html)

And if you are wondering how things look for your team for the upcoming (or past) gameweeks, visit FPL Optimized to see your expected gain and loss.

[GW Summary](https://sertalpbilal.github.io/fpl_optimized/team_summary.html)

## Conclusion

EO is a controversial issue and it will probably stay that way, but I think we demistified the role of EO in decision making.
It's not something FPL managers should be actively chasing, but an important component to adjust your expectations.

FPL is a multi-dimensional problem to solve, which I enjoy attacking using optimization models.
Soon, I will share more on how a basic optimization formulation looks like for FPL.
Meanwhile, you can see the [source code on this Pareto-Analysis on my GitHub repository](https://github.com/sertalpbilal/fpl_optimized/blob/engine/src/working_problems.py) I keep for FPL Optimized.
