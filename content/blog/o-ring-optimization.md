+++
draft = false
title = "O-Ring Optimization for FPL"
date = "2021-01-12T11:30:00-04:00"
tags = ["FPL", "optimization", "analytics", "math"]
categories = ["optimization"]
banner = "/img/banners/pexels-pixabay-73871.jpg"
bannercaption = "Photo by Pixabay from Pexels"
author = "Sertalp B. Cay"
js = ["https://d3js.org/d3.v6.min.js"]
+++

"The Numbers Game"[^TNG] is a great read for anyone interested in football (soccer) analytics.
The book covers a wide range of events where numbers give insights to football professionals on topics like possession, short/long passes, and team evaluation.
I have recently read the section about the "O-Ring theory", which brought a couple of new ideas regarding FPL.

*O-Ring theory* says that a team (or a system) is as strong as its weakest link.
The idea itself is coming from the Space Shuttle *Challenger*, where the failure of O-ring seals caused the [catastrophic event in 1986](https://en.wikipedia.org/wiki/Space_Shuttle_Challenger_disaster).
When applied to football, the theory points out that clubs should be improving (or replacing) their weakest players in the field, instead of focusing on superstars.

I have been talking about applying optimization to FPL for a while now, but this theory brings a whole new aspect to it.
I accept that the *O-Ring theory* does not make a lot of sense when thinking about FPL initially.
After all, our teams are not actually playing together.
However, we all have £100M (more or less) that we have to spend on a 15-players squad and our distribution of the budget determines our expected points.
It is tempting for managers to go after that shiny and expensive premium midfield, but it may force you to end up with a few players who has low expected points.
So, I will talk about how we can use optimization to have an FPL team where the weakest link is optimized.

## O-Ring Model

Before we go into details of the O-Ring model, let me point out the paper "Testing the O-Ring theory using data from the English Premier League"[^O-Ring] by Syzmanski and Wilkinson.
The paper concludes that the superstar theory is more effective than the O-Ring theory based on their study on EPL.
This might be the case for FPL as well, but the following models can still give you new ideas to improve your own models.

Quick note, mathematical details regarding following models are placed [at the bottom of the post](#technical-details).

In a typical FPL optimization model, our aim is to maximize the expected points (xP).
You are simply choosing 11 players out of over 600 players that will maximize your total xP.
If you maximize GW16 expected values (using [FPL Review MD data](https://fplreview.com/massive-data-planner/)), you will get the following optimal team (under £100M budget).
This is our base model.

```Pope, Robertson, Alexander-Arnold, Maguire, Alderweireld, Dier, Salah, Fernandes, Bamford, Adams, Kane``` [^FPLOpt]

{{< img src="/img/uploads/fpl_optimized_oring_1.png"  figcls="img-responsive" class="lazy">}}

The total xP of this lineup is **54.970** (excluding captaincy).
As strange as it looks, this is indeed the optimal solution that maximizes the total xP.
However, it is curious how unbalanced and unorthodox the team looks with its 5-2-3 formation.
But it is valid!

The main logic of the O-Ring model is to assess a team with is worst player.
In this case, the worst player we have on the field is Pope -- 4.04 xP.

In order to improve this lineup, suppose that you have decided to iterate over all the goalkeepers and found Lloris with 4.21 xP.
For the replacement, you need to check if you have enough budget.
Since GK is no longer the weakest link, you can focus the next one: Maguire with 4.10 xP.
You can iterate defenders, or maybe drop Maguire and get a midfield or perhaps a forward from the bench.
It should be obvious that the problem quickly spirals out of control.
There are simply too many possibilities to iterate.
This is where optimization comes into play and saves the day.

There is a definite answer to the question of *"How much can we increase our worst player?"*.
Or *"What is the optimal lineup that will maximize the minimum xP I have on the field?"*.
To answer this, we can write a "maximin optimization" model. (See details at the end)

Solving the problem will yield us the following lineup with xP of 52.17:

```
Lloris
Robertson, Alexander-Arnold, Dier
Pulisic, Fernandes, Ward-Prowse, Son
Bamford, Firmino, Adams
```

Since we maximized the minimum xP on field, note that *this model does not care about the total xP at all*.
Minimum xP among all this 11 players is 4.19.
As our next step, we can use this value as a constraint in our base model (maximize lineup xP), forcing all players to have at least this much xP.
This method is called "epsilon-constraint", where the optimal solution of a model is fed into the second model with a different objective.[^Multiobj]


By enforcing the minimum (O-Ring player) to have at least 4.19 xP and maximizing the lineup xP, we get the following solution:

```
Lloris
Robertson, Alexander-Arnold, Dier
Pulisic, Salah, Ward-Prowse, Son
Werner, Bamford, Adams
```

Fernandes and Firmino out, Salah and Werner in. Total xP is **53.448**, and formation is 3-4-3. Not bad!
Our weakest link in the new lineup is Ward-Prowse -- 4.19 xP.
See how the distribution of xPs change in the new lineup.

<script>
o_ring_data = [
    {"web_name":"Lloris","points_md":4.218},
    {"web_name":"Robertson","points_md":4.859},
    {"web_name":"Alexander-Arnold","points_md":5.004},
    {"web_name":"Dier","points_md":4.196},
    {"web_name":"Pulisic","points_md":4.329},
    {"web_name":"Salah","points_md":7.575},
    {"web_name":"Ward-Prowse","points_md":4.19},
    {"web_name":"Son","points_md":5.296},
    {"web_name":"Werner","points_md":4.417},
    {"web_name":"Bamford","points_md":5.155},
    {"web_name":"Adams","points_md":4.209}
]
base_data = [
    {"web_name":"Pope","points_md":4.035},
    {"web_name":"Robertson","points_md":4.859},
    {"web_name":"Alexander-Arnold","points_md":5.004},
    {"web_name":"Maguire","points_md":4.099},
    {"web_name":"Alderweireld","points_md":4.183},
    {"web_name":"Dier","points_md":4.196},
    {"web_name":"Salah","points_md":7.575},
    {"web_name":"Fernandes","points_md":5.568},
    {"web_name":"Bamford","points_md":5.155},
    {"web_name":"Adams","points_md":4.209},
    {"web_name":"Kane","points_md":6.087}
]
</script>

<div id="plot1">

</div>

<script type="text/javascript">

$(document).ready( function () {

var margin = { top: 20, right: 30, bottom: 40, left: 45 },
    width = 450 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

let cnv = d3.select("#plot1")
    .append("svg")
    .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
    .attr('class', 'pull-center').style('display', 'block');

let svg = cnv.append('g').attr('transform', 'translate('+margin.left+','+margin.top+')');
svg.append('rect').attr('fill','#f1f1f1').attr('width', width).attr('height', height);

let sorted_base = base_data.sort((a,b) => a.points_md - b.points_md);
let sorted_new = o_ring_data.sort((a,b) => a.points_md - b.points_md);
let pairs = base_data.map((x,i) => [x, sorted_new[i]]);
let all_vals = sorted_base.concat(sorted_new)
let min_y = Math.min(...all_vals.map(i => i.points_md)) - 0.5;
let max_y = Math.max(...all_vals.map(i => i.points_md)) + 0.5;

var x = d3.scaleBand().domain(sorted_base.map((x,i) => i+1)).range([0, width]).padding([0.3]);
svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x));

var y = d3.scaleLinear().domain([min_y, max_y]).range([height, 0])
svg.append('g').call(d3.axisLeft(y));

svg.append("text")
.attr("text-anchor", "middle")
.attr("x", width / 2)
.attr("y", height + 30)
.attr("font-size", "7pt")
.text("Players (ordered by xP)");

svg.append("text")
.attr("text-anchor", "middle")
.attr("x", -5)
.attr("y", -5)
.attr("font-size", "7pt")
.text("xP");

svg.call(s => s.selectAll(".tick").attr("font-size", "6pt"))

svg.append("g")
.append("line")
.attr("x1", (d, i) => x(0))
.attr("x2", (d, i) => x(11)+33)
.attr("y1", (d, i) => y(4.19))
.attr("y2", (d, i) => y(4.19))
.attr("stroke", "black")
.attr("stroke-width", "1px")
.attr("stroke-dasharray", "4,3")
.attr("stroke-opacity", 0.3)
.attr("opacity", 0.7);

svg.append("g")
.selectAll()
.data(pairs)
.enter()
.append("line")
.attr("x1", (d, i) => x(i+1) + x.bandwidth()/2)
.attr("x2", (d, i) => x(i+1) + x.bandwidth()/2)
.attr("y1", (d, i) => y(d[0].points_md))
.attr("y2", (d, i) => y(d[1].points_md))
.attr("stroke", "black")
.attr("stroke-width", "2px")
.attr("opacity", 0.7);

svg.append("g")
.selectAll()
.data(sorted_base)
.enter()
.append("circle")
.attr("r", 4)
.attr("cx", (d, i) => x(i+1) + x.bandwidth()/2)
.attr("cy", (d) => y(d.points_md))
.attr("fill", "blue")
.attr("stroke-width", "0px")
.attr("opacity", 0.5);

svg.append("g")
.selectAll()
.data(sorted_new)
.enter()
.append("circle")
.attr("r", 4)
.attr("cx", (d, i) => x(i+1) + x.bandwidth()/2)
.attr("cy", (d) => y(d.points_md))
.attr("fill", "red")
.attr("stroke-width", "0px")
.attr("opacity", 0.5);

let gt = svg.append("g")
.selectAll()
.data(pairs.map(i => i.sort((a,b) => a.points_md - b.points_md)))
.enter()
.append("g");

gt.append("text")
.attr("x", (d,i) => x(i+1) + x.bandwidth()/2)
.attr("y", (d) => y(d[0].points_md - 0.15))
.text((d) => d[0].web_name)
.style("font-size", "6px")
.attr("alignment-baseline","middle")
.attr("text-anchor", "middle");

gt.append("text")
.attr("x", (d,i) => x(i+1) + x.bandwidth()/2)
.attr("y", (d) => y(d[1].points_md + 0.15))
.text((d) => d[1].web_name)
.style("font-size", "6px")
.attr("alignment-baseline","middle")
.attr("text-anchor", "middle");

let legend = svg.append("g").attr("transform", "translate("+ 10 + ","+ 10 +")");
legend.append("circle").attr("cx",0).attr("cy", 0).attr("r", 3).style("fill", "blue").attr("opacity", 0.5)
legend.append("text").attr("x", 7).attr("y", 1).text("Base Model").style("font-size", "6px").attr("alignment-baseline","middle")
legend.append("circle").attr("cx",50).attr("cy", 0).attr("r", 3).style("fill", "red").attr("opacity", 0.5)
legend.append("text").attr("x", 57).attr("y", 1).text("O-Ring Model").style("font-size", "6px").attr("alignment-baseline","middle")


});

</script>

Compared to the base model, apparently the budget we gained from dropping Kane and Fernandes is used to upgrade low xP players: Pope, Maguire, Alderweireld.

## Positional O-Ring Model

As you may have noticed, our new lineup has a very strong midfield setup.
Our total xP allocation for each position is as follows:

| Total xP | GK    | DF     | MD     | FW     |
| -------- | ----: | -----: | -----: | -----: |
| 53.448   | 4.218 | 14.059 | 21.390 | 13.781 |

Notice the total xP of MD and FW positions.
The lineup still feels unbalanced, even though we improved the weakest link.
This one is not unbalanced because of the formation (3-4-3 is quite balanced) but in terms of where we are expecting our points from.
We are expecting 21 points from midfields, while only 14 from forwards.

So what if we try to increase our FW expected points by dropping one of our premium midfields and upgrade one of our forwards.
We have another O-Ring model, but this time we are maximizing the minimum among total xPs of each position (excluding GK).
The objective is to "maximize the minimum among total positional xP values".
We need to use the 2-stage optimization again as I have mentioned:
1. Maximize the minimum of position xP totals (DF, MD, FW)
2. Maximize the lineup xP where total of each position is bounded below

The first stage model finds that you can increase positional sum all the way up to 16.395.
After the second stage is completed, we have the following lineup:

```
Lloris, 
Pieters, Alexander-Arnold, Maguire, Dier
Harrison, Salah, Fernandes
Bamford, Firmino, Kane
```

We have a 4-3-3 formation, with positional xP sums below.


| Total xP | GK    | DF     | MD     | FW     |
| -------- | ----: | -----: | -----: | -----: |
| 54.454   | 4.218 | 16.826 | 17.015 | 16.395 |

Notice that we are only 0.52 away from the overall optimal and have a very balanced squad now.
It worth mentioning that FPL has too many suboptimal solutions, and having multiple objectives help us to break ties.

<script>
type_names = ["GK", "DF", "MD", "FW"].slice(1)
base_type_data = [4.035, 22.341, 13.143, 15.451].slice(1)
model2_type_data = [4.218, 14.059, 21.39, 13.781].slice(1)
model3_type_data = [4.218, 16.826, 17.015, 16.395].slice(1)
</script>

<div id="plot2">

</div>

<script type="text/javascript">

$(document).ready( function () {

var margin = { top: 20, right: 30, bottom: 40, left: 45 },
    width = 450 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

let cnv = d3.select("#plot2")
    .append("svg")
    .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
    .attr('class', 'pull-center').style('display', 'block');

let svg = cnv.append('g').attr('transform', 'translate('+margin.left+','+margin.top+')');
svg.append('rect').attr('fill','#f1f1f1').attr('width', width).attr('height', height);

let grouped_vals = type_names.map((x,i) => [x, base_type_data[i], model2_type_data[i], model3_type_data[i]]);
let all_vals = base_type_data.concat(model2_type_data).concat(model3_type_data)
let min_y = Math.min(...all_vals) - 1;
let max_y = Math.max(...all_vals) + 2;

var x = d3.scaleBand().domain(type_names).range([0, width]).padding([0.3]);
svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x));

console.log(min_y);
console.log(max_y);

var y = d3.scaleLinear().domain([min_y, max_y]).range([height, 0])
svg.append('g').call(d3.axisLeft(y));

svg.append("text")
.attr("text-anchor", "middle")
.attr("x", width / 2)
.attr("y", height + 30)
.attr("font-size", "7pt")
.text("Positions");

svg.append("text")
.attr("text-anchor", "middle")
.attr("x", -5)
.attr("y", -5)
.attr("font-size", "7pt")
.text("xP Sum");

svg.call(s => s.selectAll(".tick").attr("font-size", "6pt"))

svg.append("g")
.selectAll()
.data(grouped_vals)
.enter()
.append("line")
.attr("x1", (d) => x(d[0]) + x.bandwidth()/2)
.attr("x2", (d) => x(d[0]) + x.bandwidth()/2)
.attr("y1", (d, i) => y(Math.min(...d.slice(1))) )
.attr("y2", (d, i) => y(Math.max(...d.slice(1))) )
.attr("stroke", "black")
.attr("stroke-width", "2px")
.attr("opacity", 0.5);

var symbolGenerator = d3.symbol()
	.size(50);

svg.append("g")
.selectAll()
.data(grouped_vals)
.enter()
.append('path')
.attr('transform', (d, i) => 'translate(' + (x(d[0]) + x.bandwidth()/2) + ', ' + (y(d[1])) + ')')
.attr('d', (d) => {
    symbolGenerator.type(d3.symbolCircle);
    return symbolGenerator();
})
.attr("fill", "blue")
.attr("opacity", 0.7);


svg.append("g")
.selectAll()
.data(grouped_vals)
.enter()
.append('path')
.attr('transform', (d, i) => 'translate(' + (x(d[0]) + x.bandwidth()/2) + ', ' + (y(d[2])) + ')')
.attr('d', (d) => {
    symbolGenerator.type(d3.symbolSquare);
    return symbolGenerator();
})
.attr("fill", "red")
.attr("opacity", 0.7);


svg.append("g")
.selectAll()
.data(grouped_vals)
.enter()
.append('path')
.attr('transform', (d, i) => 'translate(' + (x(d[0]) + x.bandwidth()/2) + ', ' + (y(d[3])) + ')')
.attr('d', (d) => {
    symbolGenerator.type(d3.symbolTriangle);
    return symbolGenerator();
})
.attr("fill", "orange")
.attr("opacity", 0.7);

let legend = svg.append("g").attr("transform", "translate("+ 10 + ","+ 10 +")");
legend.append('rect').attr("transform", "translate(185, -10)").attr('fill','darkgray').attr('width', 180).attr('height', 20).attr("opacity", 0.2);
legend.append("g").attr("transform", "translate(195, -1)").append("path").attr('d', (d) => {symbolGenerator.type(d3.symbolCircle); return symbolGenerator();}).attr("fill", "blue").attr("opacity", 0.7)
legend.append("g").attr("transform", "translate(203, 0)").append("text").attr("x", 0).attr("y", 0).text("Base Model").style("font-size", "6px").attr("alignment-baseline","middle")
legend.append("g").attr("transform", "translate(250, -1)").append("path").attr('d', (d) => {symbolGenerator.type(d3.symbolSquare); return symbolGenerator();}).attr("fill", "red").attr("opacity", 0.7)
legend.append("g").attr("transform", "translate(258, 0)").append("text").attr("x", 0).attr("y", 0).text("O-Ring Model").style("font-size", "6px").attr("alignment-baseline","middle")
legend.append("g").attr("transform", "translate(305, 0)").append("path").attr('d', (d) => {symbolGenerator.type(d3.symbolTriangle); return symbolGenerator();}).attr("fill", "orange").attr("opacity", 0.7)
legend.append("g").attr("transform", "translate(313, 0)").append("text").attr("x", 0).attr("y", 0).text("O-Ring Pos. Model").style("font-size", "6px").attr("alignment-baseline","middle")

});

</script>

As you see, our Positional O-Ring model expected values are much closer to each other than the base and O-Ring models.

## Value and Ownership

FPL Review defines *value* as the total xP divided by the player's buy cost.
So, I wondered what if we try to maximize the minimum *value* in our lineup.

After the 2-stage optimization process, we get the following lineup:

```
Lloris
Robertson, Alexander-Arnold, Maguire, Alderweireld, Dier
Harrison, Ward-Prowse, Raphinha
Bamford, Adams
```

This is quite an interesting team!
In the base model, lowest value among the lineup is 0.502.
The lowest value in the lineup above is 0.665!
Total xP, on the other hand, drops massively from 54.970 to 47.722.
Unfortunate.

There is another model with a weirder result.

Since I'm pretty obsessed with ownership lately, I have tried maximizing the minimum ownership in the lineup.
This should force model to find **the template**.
I should mention that the player with the minimum ownership ratio in the original optimal solution is Alderweireld with 1.7%.

| Name             | xP    | Ownership (%) |
|------------------|------:|--------------:|
| Pope             | 4.035 | 10.1          |
| Robertson        | 4.859 | 22.6          |
| Alexander-Arnold | 5.004 | 14.6          |
| Maguire          | 4.099 | 3.4           |
| Alderweireld     | 4.183 | 1.7           |
| Dier             | 4.196 | 5.7           |
| Salah            | 7.575 | 45.5          |
| Fernandes        | 5.568 | 46.2          |
| Bamford          | 5.155 | 46.9          |
| Adams            | 4.209 | 9.5           |
| Kane             | 6.087 | 42.1          |

The O-Ring model for ownership ratio gives the following lineup.

| Name          | xP    | Ownership (%) |
|---------------|------:|--------------:|
| McCarthy      | 3.604 | 23.0          |
| Zouma         | 3.495 | 27.1          |
| Chilwell      | 3.405 | 24.2          |
| Justin        | 3.152 | 25.8          |
| Robertson     | 4.859 | 22.6          |
| Grealish      | 3.467 | 41.8          |
| Fernandes     | 5.568 | 46.2          |
| Son           | 5.296 | 62.5          |
| Calvert-Lewin | 3.235 | 58.9          |
| Bamford       | 5.155 | 46.9          |
| Kane          | 6.087 | 42.1          |

Well, as you see, the minimum ownership ratio of the players jumped from 1.7% to 22.6%.
You might be thinking that this lineup looks solid.
But the total xP actually fell even more. It is 47.323.

Yes, this 11 is worse than the "poor man's value team" with 47.722 total xP:

| Name             | xP    | Ownership (%) |
|------------------|------:|--------------:|
| Lloris           | 4.218 | 7.2           |
| Robertson        | 4.859 | 22.6          |
| Alexander-Arnold | 5.004 | 14.6          |
| Maguire          | 4.099 | 3.4           |
| Alderweireld     | 4.183 | 1.7           |
| Dier             | 4.196 | 5.7           |
| Harrison         | 3.872 | 2.3           |
| Ward-Prowse      | 4.190 | 17.6          |
| Raphinha         | 3.737 | 1.5           |
| Bamford          | 5.155 | 46.9          |
| Adams            | 4.209 | 9.5           |

## Comparison and Conclusion

It is time to list all the models we have seen for comparison purposes.

<style>
#final strong { color: darkred;}
</style>

<div id="final">

| Problem           | Total xP      | Pos. Total xP                       | Min xP      | Min Value     | Min Own  |
|-------------------|--------------:|:-----------------------------------:|------------:|--------------:|---------:|
| Base              | **54.970**    | [4.035, 22.341, 13.143, 15.451]     | 4.035       | 0.502         | 1.7      |
| O-Ring            | 53.448        | [4.218, 14.059, 21.39, 13.781]      | **4.190**   | 0.475         | 2.5      |
| Positional O-Ring | 54.454        | [4.218, 16.826, 17.015, **16.395**] | 3.527       | 0.502         | 0.3      |
| Value O-Ring      | 47.722        | [4.218, 22.341, 11.799, 9.364]      | 3.737       | **0.665**     | 1.5      |
| Ownership O-Ring  | 47.323        | [3.604, 14.911, 14.331, 14.477]     | 3.152       | 0.404         | **22.6** |

</div>

There is no clear winner, so it is up to your personal taste.
I think Positional O-Ring is pretty promising.

I have decided to put my FPL lineup where my mouth is.
My regular FPL model is a multi-period variant of the base model, but I have used Positional O-Ring for GW18 inside a 3-step process for the FH chip.
I switched from having an unbalanced 21/19/13 xP (5-3-2) to 17/17/18 (4-3-3) which decreased the overall xP by about 2 points.
I'm curious to see if it will be a successful experiment.

{{< img src="/img/uploads/fpl_gw18_squad.png"  figcls="img-responsive" class="lazy">}}

I'm not sure how I'll proceed for the rest of the season.
Positional O-Ring produces a suboptimal solution where I have to lose a bit of an xP, but I can keep using it if the difference is small enough.
These models will be especially useful when I use my WC somewhere down the line.

It was an interesting exercise.
I could add some of these models (and their daily solutions) to FPL Optimized's "[Optimal Squads](https://sertalpbilal.github.io/fpl_optimized/week.html)" page if anyone is interested.
I am open to any feedback or suggestions.

---

## Technical Details

Our base FPL Model maximizes the expected points, as follows:

<script>
  MathJax = {
    tex: {
        inlineMath: [['$', '$']]
    }
  };
</script>

$$
\text{maximize: } \sum_{e \in E} P_e \cdot x_e
$$

Here, $P$ is the expected points of player $e$ in the following gameweek, and $x$ is the binary value (1 if we have the player in our lineup, 0 otherwise).
This sum gives us the total xP of the lineup.

In order to apply the O-Ring idea, we need to use a "maximin optimization" model.
Our target now is to maximize the minimum xP in our lineup.
It looks like this:

$$
\text{maximize: } \min \left \\{ P_e, e \in E : x_e=1 \right \\}
$$

With a well-known trick, we can introduce variable $w$, maximize its value, while forcing everyone in the team to have a higher value:

<p>
\begin{align}
\text{maximize: } \; & w \\
\text{subject to: } \; & \dots \\
& w \leq P_e \cdot x_e + M \cdot (1-x_e) \quad \forall e \in E
\end{align}
</p>

Here, we are using the "[Big-M method](https://en.wikipedia.org/wiki/Big_M_method)" to force $w$ to be smaller than every player in our linuep.

Positional O-Ring model is quite similar and simpler.
We don't need the Big-M for this one:

<p>
\begin{align}
\text{maximize: } \; & w \\
\text{subject to: } \; & \dots \\
& w \leq \sum_{e \in E[t]} P_e \cdot x_e \quad \forall t \in T
\end{align}
</p>

Here, $T$ is the set of positions (DF, MD, FW), and $E[t]$ is the subset of all players for the specific position $t$.

See my source code and how I solve these problems using sasoptpy and CBC on [GitHub](https://github.com/sertalpbilal/fpl_optimized/blob/engine/src/working_problems.py).





[^TNG]: Anderson, Christopher, and David Sally. The numbers game: Why everything you know about soccer is wrong. Penguin, 2013. [(Amazon Link)](https://www.amazon.com/Numbers-Game-Everything-About-Soccer/dp/0143124560)
[^O-Ring]: Szymanski, Stefan, and Guy Wilkinson. "Testing the O-Ring theory using data from the English Premier League." Research in Economics 70.3 (2016): 468-481. [(Science Direct Link)](https://www.sciencedirect.com/science/article/pii/S1090944316300904)
[^FPLOpt]: Optimal lineups/squads at [FPL Optimized](https://sertalpbilal.github.io/fpl_optimized/week.html) are generated 4 times everyday. You can go back in time and check old optimals.
[^Multiobj]: I have mentioned multiobjective optimization in the previous post, as well.
             In that one we have used "weighted-sum method".