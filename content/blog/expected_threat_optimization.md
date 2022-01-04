+++
draft = false
title = "Using Optimization Modeling for Expected Threat"
date = "2021-03-24T21:00:00-05:00"
tags = ["sports", "analytics", "soccer", "optimization"]
categories = ["Optimization"]
banner = "img/banners/pexels-kevin-ku-577585.jpg"
bannercaption = "Photo by Kevin Ku from Pexels"
author = "Sertalp B. Cay"
js = ["https://d3js.org/d3.v6.min.js"]
+++

If you know little about football analytics, I can safely assume that you have heard of expected goals (xG).
For those who don't know, xG is a metric showing the probability of a shot to be successful with the information we have, such as position, body part, and defender positions.[^xG]
Another of such metrics is expected assists (xA) which can measure the probability that a pass leads to a goal.

A while ago, Karun Singh wrote a blog post and introduced [expected threat (xT)](https://karun.in/blog/expected-threat.html) which measures the offensive contribution of any non-shot action (pass, dribble, cross).[^sb360]
The main idea revolves around **rewarding individual player actions** on how much they contribute offensively using probabilistic outcomes.
If a player sends a cross into the box, for example, how much it increases the change of a goal.
Such measures play a critical role in evaluation player performances even if the outcome of the attack is not successful.

Most recently, Abhishek Sharma implemented the $\mathrm{xT}$ idea in Julia and [shared a Jupyter notebook and data](https://sharmaabhishekk.github.io/projects/xt-derivation-julia) for the analysis.
For a while I was looking for a way to bring optimization lens into the mix and finally noticed a nice opportunity.

Before I go into the optimization part, let me start with reviewing the basic idea.

## xT Idea and Solution Approach

Suppose we have created a 16 by 12 grid representing the field as follows [^grid]:

<script>
    initial_data = [
        {'name': 'Grealish', 'action': 'pass', 'from': [77.07, 33.38], 'to': [92.75,22.91], 'bins': [[11,5],[14,4]]},
        {'name': 'James', 'action': 'pass', 'from': [74.65, 22.10], 'to': [93.24,10.94], 'bins': [[11,3],[14,1]]},
        {'name': 'Mané', 'action': 'dribble', 'from': [89.67, 60.79], 'to': [100.38, 47.46], 'bins': [[13,10],[15,8]]},
        {'name': 'Gündogan', 'action': 'cross', 'from': [97.86, 58.072], 'to': [96.70, 27.47], 'bins': [[14,10],[14,4]]},
        {'name': 'Zaha', 'action': 'dribble', 'from': [90.40, 9.52], 'to': [95.34,18.63], 'bins': [[13,1], [14,3]]},
        {'name': 'Lindelöf', 'action': 'pass', 'from': [32.44,5.57], 'to': [98.28,26.79], 'bins':[[4,0],[14,4]]},
        {'name': 'Traoré', 'action': 'pass', 'from': [78.54,37.74], 'to': [91.98,46.98], 'bins':[[11,6],[14,8]]},
        {'name': 'Calvert-Lewin', 'action': 'pass', 'from': [78.64,6.05], 'to': [104.16,9.38], 'bins':[[11,1],[15,1]]},
        {'name': 'Willian', 'action': 'shot', 'from': [80.745, 30.736], 'to': [105, 36.516], 'bins': [[12,5],[15,6]]},
        {'name': 'Fernandes', 'action': 'shot', 'from': [77.595, 42.5], 'to': [105, 35.904], 'bins': [[11,7], [15,6]]}
    ]
</script>

<div id="initial_visual" class="row">
    <div id="initial_field" class="col-12 col-md-8"></div>
    <div id="initial_table" class="col-12 col-md-4">
        <table class="table table-sm table-hover" id="table1">
            <thead>
                <tr><th>Name</th><th>Action</th><th>From</th><th>To</th></tr>
            </thead>
            <tbody>
            </tbody>
            <caption style="caption-side: bottom">Sample actions from 2019/20 data. Click/hover on action to see on the pitch.</caption>
        </table>
    </div>
</div>

<script type="text/javascript">

if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
        value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
        }
    });
}

initial_data.forEach((x) => {
    $('#table1 tbody').append(`<tr style="cursor: pointer" data-from="${x.from}" data-to="${x.to}" class="table1-row"><td>${x.name}</td><td>${x.action}</td><td>${x.bins[0]}</td><td>${x.bins[1]}</td></tr>`);
})

$(document).on('mouseover', '.table1-row', function(e) {
    let from_coord = e.currentTarget.dataset.from.split(',').map(i => parseFloat(i))
    let to_coord = e.currentTarget.dataset.to.split(',').map(i => parseFloat(i))
    addLine(from_coord, to_coord)
});


</script>

<script src="/js/field.js"></script>

<script type="text/javascript">

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;


    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#initial_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        // .attr('width', width).attr('height', height)
        // .attr('transform', 'translate('+margin.left+','+margin.top+')')
        // .attr('x', 0).attr('y', 0)
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b"; //"#00b1ff";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var row = grid.selectAll()
        .data(griddata)
        .enter().append("g")
        .attr("class", "row");

    var on_hover = (event, d) => {
        let o = d3.select(event.target)
        o.style('fill', '#82f1ff')
    }

    var on_leave = (event, d) => {
        let o = d3.select(event.target)
        o.style('fill', '#00000000')
    }

    var column = row.selectAll()
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d[0] * sW; })
        .attr("y", function(d) { return (L-d[1]-1) * sL; })
        .attr("width", sW)
        .attr("height", sL)
        .style("fill", "#00000000")
        .style("stroke", gridColor)
        .attr("stroke-width", 0.3)
        .on("mouseover", on_hover)
        .on("mousemove", on_hover)
        .on("mouseleave", on_leave);

    row.selectAll()
        .data(function(d) { return d; })
        .enter()
        .append("text")
        .attr("x", function(d) { return d[0] * sW + sW/2; })
        .attr("y", function(d) { return (L-d[1]-1) * sL + sL/2; })
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', '15pt')
        .style('text-shadow', '0px 0px 2px gray')
        .text(function(d) { return d[0] + ',' + d[1] })
        .style('pointer-events', 'none');
    
    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    defs.append('marker')
        .attr('id', 'redarrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'red')
        .attr('fill', 'red');

    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");

    window.addLine = (from_c, to_c) => {
        d3.select('#action_line').remove()
        console.log(svg)
        grid.append('line')
            .attr('id', 'action_line')
            .attr('x1', from_c[0]*10)
            .attr('y1', 680-from_c[1]*10)
            .attr('x2', to_c[0]*10)
            .attr('y2', 680-to_c[1]*10)
            .attr('stroke-width', 4)
            .attr('stroke', 'red')
            .attr('marker-end', 'url(#redarrow)')
            .attr('fill', 'none');
    }

});

</script>

I will use letter $G$ to represent set of all grid pairs in this representation.

Calculating the expected threat consists of two parts:

<p>
$$
\mathrm{xT}_{x,y} = \underbrace{s_{x,y} \cdot g_{x,y}}_{\text{shot threat}} + \underbrace{m_{x,y} \cdot \sum_{(z,w) \in G} T_{(x,y)\to (z,w)} \cdot \mathrm{xT}_{z,w} }_{\text{move threat}}
$$
</p>

This equation defines expected threat at grid $(x,y)$ as the sum of all possible actions and their contribution to scoring probability.
By having this nested structure[^nested], and we are calculating the threat based on steady-state.[^sstate]

Let me go over each term in here:

- $\mathrm{xT}\_{x,y}$ is the expected threat of having the ball in grid position $x,y$ (possession value), where $x$ and $y$ are x-axis and y-axis grid numbers, respectively.
- $s_{x,y}$ is the historical percentage of taking a shot at grid position $x,y$.
- $g_{x,y}$ is the probability of scoring if a shot is taken at grid location $x,y$.
  We are not differentiating what kind of shot it is, but details can be added based on available data; but think this as an oversimplified xG.
- $m_{x,y}$ is the historical percentage of moving the ball.
  This is the counterpart of $s_{x,y}$ so we assume $s_{x,y} + m_{x,y} = 1$.
- Finally, we have the transition matrix $T$ that represents the historical percentage of moving ball from grid $x,y$ to $z,w$ successfully, denoted by $T_{(x,y) \to (z,w)}$.

Karun originally proposed solving these equations using an iterative approach: set $\mathrm{xT}$ to 0 initially, calculate all corresponding values, and repeat until convergence.
Since we have $16 \times 12 = 192$ variables and $192$ equalities, it is actually a linear system of equations in the form of:
$$
Ax = b
$$
where $b$ is the vector of constants coming from shot threat and matrix $A$ is produced by move threat and $\mathrm{xT}$ multipliers.
Assuming this is a full-rank matrix, solving this system is as easy as calling `A\b` in MATLAB.

## Base Model for xT

Even though it is an overkill to use optimization modeling to solve the base problem, I would like to do it before moving to the next step.
Essentially, the whole thing can be written as 

<p class="x-scroll">
\begin{align}
\textrm{minimize: } \; & 0 \\
\text{subject to: } \; 
& \mathrm{xT}_{x,y} = s_{x,y} \cdot g_{x,y}   + m_{x,y} \cdot \sum_{(z,w) \in G} T_{(x,y)\to (z,w)} \cdot \mathrm{xT}_{z,w} \quad \forall (x,y) \in G
\end{align}
</p>

As you see, we don't really need an objective function as this is a feasibility problem.
There is a unique solution that satisfies all these constraints at the same time, and we reach it once we solve the problem.
The model can be written using *sasoptpy* in Python and can be solved with *CBC* solver as follows:

``` python
model = so.Model(name='xThreatModel')
indices = [(x,y) for x in range(w) for y in range(l)]
xT = model.add_variables(indices, name='xT')
model.add_constraints(
    (xT[x,y] == shots.loc[x,y] * scores.loc[x,y] + moves.loc[x,y] * so.expr_sum(T.loc[(x,y),(z,w)] * xT[z,w] for (z,w) in indices) for (x,y) in indices), name='relation')
model.set_objective(0, name='zero', sense='N')
model.export_mps(filename='export.mps')
command = 'cbc export.mps solve solu solution.txt'
os.system(command)
```

I used the data Abhishke shared (entire 2019-2020 EPL data) and solved the problem to get expected threat values.
Hover/click over the pitch below to display expected threat values and where the threat is getting generated from.
Remember, $\mathrm{xT}$ consists of move and shot threat values.

<div id="model1" class="row">
    <div id="model1_field" class="col-12 col-md-8"></div>
    <div id="model1_info" class="col-12 col-md-4">
        <table class="table table-sm table-hover" id="model1_table" style="table-layout: fixed;">
            <thead>
                <tr><th></th><th>Value</th></tr>
            </thead>
            <tbody>
                <tr><td>Grid</td><td id="m1_grid_no">-</td></tr>
                <tr><td>xT</td><td id="m1_xT">-%</td></tr>
                <tr><td>Move Threat</td><td id="m1_mT">-%</td></tr>
                <tr><td>Shot Threat</td><td id="m1_sT">-%</td></tr>
                <tr><td>Move/Shot Ratio</td><td id="m1_split">-% / -%</td></tr>
            </tbody>
            <caption style="caption-side: bottom">Click/hover on pitch to see xT levels.</caption>
        </table>
    </div>
</div>

<script type="text/javascript">

var shots_data = {"0":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"1":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0003615329,"12":0.0,"13":0.0,"14":0.0008361204,"15":0.0},"2":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0004125413,"9":0.0003314551,"10":0.0,"11":0.0007426662,"12":0.0046811001,"13":0.0026041667,"14":0.0021978022,"15":0.0},"3":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0003853565,"11":0.0080681309,"12":0.0705734089,"13":0.1693121693,"14":0.1897233202,"15":0.083503055},"4":{"0":0.0,"1":0.0008084074,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0009242144,"11":0.0459770115,"12":0.1891891892,"13":0.3629764065,"14":0.4356060606,"15":0.412371134},"5":{"0":0.0117340287,"1":0.0013648772,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0005275653,"8":0.0006837607,"9":0.0,"10":0.0015625,"11":0.0714700755,"12":0.2575757576,"13":0.4704861111,"14":0.6374570447,"15":0.7988826816},"6":{"0":0.0101596517,"1":0.0005279831,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0005461496,"7":0.000295858,"8":0.0003469813,"9":0.0,"10":0.0021691974,"11":0.0729225551,"12":0.2414231258,"13":0.4619205298,"14":0.6884422111,"15":0.7875647668},"7":{"0":0.0023640662,"1":0.0009302326,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0004230118,"9":0.0,"10":0.0004321521,"11":0.0482180294,"12":0.1620771046,"13":0.3158730159,"14":0.4770318021,"15":0.3036649215},"8":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0006779661,"11":0.012406015,"12":0.0692921236,"13":0.1930541369,"14":0.1843891403,"15":0.08},"9":{"0":0.0,"1":0.0,"2":0.0,"3":0.0004957858,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.001003009,"12":0.0092307692,"13":0.015576324,"14":0.0097560976,"15":0.0037453184},"10":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0011547344,"14":0.0,"15":0.0},"11":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0022883295}}
var moves_data = {"0":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":1.0,"11":1.0,"12":1.0,"13":1.0,"14":1.0,"15":1.0},"1":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":1.0,"11":0.9996384671,"12":1.0,"13":1.0,"14":0.9991638796,"15":1.0},"2":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":0.9995874587,"9":0.9996685449,"10":1.0,"11":0.9992573338,"12":0.9953188999,"13":0.9973958333,"14":0.9978021978,"15":1.0},"3":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":0.9996146435,"11":0.9919318691,"12":0.9294265911,"13":0.8306878307,"14":0.8102766798,"15":0.916496945},"4":{"0":1.0,"1":0.9991915926,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":0.9990757856,"11":0.9540229885,"12":0.8108108108,"13":0.6370235935,"14":0.5643939394,"15":0.587628866},"5":{"0":0.9882659713,"1":0.9986351228,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":0.9994724347,"8":0.9993162393,"9":1.0,"10":0.9984375,"11":0.9285299245,"12":0.7424242424,"13":0.5295138889,"14":0.3625429553,"15":0.2011173184},"6":{"0":0.9898403483,"1":0.9994720169,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":0.9994538504,"7":0.999704142,"8":0.9996530187,"9":1.0,"10":0.9978308026,"11":0.9270774449,"12":0.7585768742,"13":0.5380794702,"14":0.3115577889,"15":0.2124352332},"7":{"0":0.9976359338,"1":0.9990697674,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":0.9995769882,"9":1.0,"10":0.9995678479,"11":0.9517819706,"12":0.8379228954,"13":0.6841269841,"14":0.5229681979,"15":0.6963350785},"8":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":0.9993220339,"11":0.987593985,"12":0.9307078764,"13":0.8069458631,"14":0.8156108597,"15":0.92},"9":{"0":1.0,"1":1.0,"2":1.0,"3":0.9995042142,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":1.0,"11":0.998996991,"12":0.9907692308,"13":0.984423676,"14":0.9902439024,"15":0.9962546816},"10":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":1.0,"11":1.0,"12":1.0,"13":0.9988452656,"14":1.0,"15":1.0},"11":{"0":1.0,"1":1.0,"2":1.0,"3":1.0,"4":1.0,"5":1.0,"6":1.0,"7":1.0,"8":1.0,"9":1.0,"10":1.0,"11":1.0,"12":1.0,"13":1.0,"14":1.0,"15":0.9977116705}}
var shot_threat = {"0":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"1":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"2":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"3":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0003853565,"11":0.0,"12":0.0006301197,"13":0.003968254,"14":0.0079051383,"15":0.0020366599},"4":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0005473454,"12":0.0057915058,"13":0.0344827586,"14":0.0587121212,"15":0.0463917526},"5":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0005810575,"12":0.0113636364,"13":0.046875,"14":0.1494845361,"15":0.3407821229},"6":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0016958734,"12":0.0114358323,"13":0.0546357616,"14":0.149078727,"15":0.378238342},"7":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.001572327,"12":0.0047206924,"13":0.0333333333,"14":0.0971731449,"15":0.0471204188},"8":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.000997009,"13":0.0081716037,"14":0.0147058824,"15":0.0048},"9":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"10":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0},"11":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0,"5":0.0,"6":0.0,"7":0.0,"8":0.0,"9":0.0,"10":0.0,"11":0.0,"12":0.0,"13":0.0,"14":0.0,"15":0.0022883295}}
var model1_data = {"(0, 0)":0.0010137465,"(0, 1)":0.0014895051,"(0, 2)":0.0017626221,"(0, 3)":0.0023059601,"(0, 4)":0.0026353818,"(0, 5)":0.0028199839,"(0, 6)":0.0028492916,"(0, 7)":0.0026168113,"(0, 8)":0.002217744,"(0, 9)":0.0020714449,"(0, 10)":0.0015299613,"(0, 11)":0.0010293822,"(1, 0)":0.0015161562,"(1, 1)":0.0019289599,"(1, 2)":0.0025351159,"(1, 3)":0.003045511,"(1, 4)":0.003250135,"(1, 5)":0.0034477526,"(1, 6)":0.003396268,"(1, 7)":0.0032063441,"(1, 8)":0.0031317776,"(1, 9)":0.0028102041,"(1, 10)":0.0021905317,"(1, 11)":0.0017080986,"(2, 0)":0.0021175682,"(2, 1)":0.0025149797,"(2, 2)":0.0030222468,"(2, 3)":0.0035329673,"(2, 4)":0.0039894128,"(2, 5)":0.0038556857,"(2, 6)":0.0039813232,"(2, 7)":0.0035536845,"(2, 8)":0.0035300555,"(2, 9)":0.0032798607,"(2, 10)":0.0028241826,"(2, 11)":0.0021125396,"(3, 0)":0.0026094887,"(3, 1)":0.0031064672,"(3, 2)":0.003549767,"(3, 3)":0.0037837206,"(3, 4)":0.0039877092,"(3, 5)":0.0041089269,"(3, 6)":0.0043115078,"(3, 7)":0.0041447367,"(3, 8)":0.0040417086,"(3, 9)":0.0038444172,"(3, 10)":0.0033866494,"(3, 11)":0.002897617,"(4, 0)":0.0033123317,"(4, 1)":0.0038301007,"(4, 2)":0.0042168136,"(4, 3)":0.0046272634,"(4, 4)":0.0047786918,"(4, 5)":0.005045642,"(4, 6)":0.0050140999,"(4, 7)":0.0049554767,"(4, 8)":0.0047716339,"(4, 9)":0.0044177651,"(4, 10)":0.0041796994,"(4, 11)":0.0035616395,"(5, 0)":0.0040900792,"(5, 1)":0.0045578511,"(5, 2)":0.0050499939,"(5, 3)":0.0055858327,"(5, 4)":0.0057388079,"(5, 5)":0.0060263929,"(5, 6)":0.0059332262,"(5, 7)":0.0059737272,"(5, 8)":0.0057208161,"(5, 9)":0.0054026688,"(5, 10)":0.0049148352,"(5, 11)":0.0042593728,"(6, 0)":0.0050038546,"(6, 1)":0.0057380969,"(6, 2)":0.0063638844,"(6, 3)":0.0065933246,"(6, 4)":0.0069994267,"(6, 5)":0.0074032792,"(6, 6)":0.0072550547,"(6, 7)":0.0071936238,"(6, 8)":0.0070003556,"(6, 9)":0.0066122338,"(6, 10)":0.0060559912,"(6, 11)":0.0053229156,"(7, 0)":0.0061718503,"(7, 1)":0.0071920251,"(7, 2)":0.0075221016,"(7, 3)":0.0083635022,"(7, 4)":0.0084760088,"(7, 5)":0.0080748633,"(7, 6)":0.0084131445,"(7, 7)":0.0086681695,"(7, 8)":0.0084386981,"(7, 9)":0.0081447163,"(7, 10)":0.0074726151,"(7, 11)":0.0065875607,"(8, 0)":0.0076152284,"(8, 1)":0.0086210005,"(8, 2)":0.0091212267,"(8, 3)":0.0095962695,"(8, 4)":0.010310119,"(8, 5)":0.010008555,"(8, 6)":0.010251164,"(8, 7)":0.010071763,"(8, 8)":0.0098269147,"(8, 9)":0.0094493929,"(8, 10)":0.0087711833,"(8, 11)":0.0079051101,"(9, 0)":0.0091646005,"(9, 1)":0.010392345,"(9, 2)":0.011123219,"(9, 3)":0.01153341,"(9, 4)":0.012053684,"(9, 5)":0.012393751,"(9, 6)":0.01264773,"(9, 7)":0.01181903,"(9, 8)":0.011759386,"(9, 9)":0.011308601,"(9, 10)":0.010547638,"(9, 11)":0.009656185,"(10, 0)":0.011689067,"(10, 1)":0.012980591,"(10, 2)":0.014026294,"(10, 3)":0.015220967,"(10, 4)":0.015065975,"(10, 5)":0.014949347,"(10, 6)":0.015159744,"(10, 7)":0.015215868,"(10, 8)":0.015066177,"(10, 9)":0.014426688,"(10, 10)":0.013224333,"(10, 11)":0.012247279,"(11, 0)":0.014957486,"(11, 1)":0.016691703,"(11, 2)":0.01808703,"(11, 3)":0.020823058,"(11, 4)":0.019536792,"(11, 5)":0.019820917,"(11, 6)":0.021144477,"(11, 7)":0.020520949,"(11, 8)":0.019864464,"(11, 9)":0.018670206,"(11, 10)":0.016773026,"(11, 11)":0.015052879,"(12, 0)":0.017676854,"(12, 1)":0.021262103,"(12, 2)":0.024567025,"(12, 3)":0.02505512,"(12, 4)":0.02932236,"(12, 5)":0.036461619,"(12, 6)":0.03616001,"(12, 7)":0.030362958,"(12, 8)":0.025601018,"(12, 9)":0.022497917,"(12, 10)":0.020370325,"(12, 11)":0.017643279,"(13, 0)":0.018394377,"(13, 1)":0.024579592,"(13, 2)":0.028702271,"(13, 3)":0.035148799,"(13, 4)":0.070549955,"(13, 5)":0.077001395,"(13, 6)":0.084869248,"(13, 7)":0.068978394,"(13, 8)":0.038417632,"(13, 9)":0.026263316,"(13, 10)":0.022981516,"(13, 11)":0.01989493,"(14, 0)":0.018630421,"(14, 1)":0.023152044,"(14, 2)":0.033816759,"(14, 3)":0.043170552,"(14, 4)":0.099819404,"(14, 5)":0.19022651,"(14, 6)":0.18711254,"(14, 7)":0.13180591,"(14, 8)":0.05046763,"(14, 9)":0.028164456,"(14, 10)":0.020692096,"(14, 11)":0.018745094,"(15, 0)":0.018812558,"(15, 1)":0.025382159,"(15, 2)":0.030979529,"(15, 3)":0.03959291,"(15, 4)":0.091523037,"(15, 5)":0.38259787,"(15, 6)":0.42825719,"(15, 7)":0.098388491,"(15, 8)":0.029122451,"(15, 9)":0.026837779,"(15, 10)":0.025522446,"(15, 11)":0.023181141};

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#model1_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        // .attr('width', width).attr('height', height)
        // .attr('transform', 'translate('+margin.left+','+margin.top+')')
        // .attr('x', 0).attr('y', 0)
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b"; //"#00b1ff";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var row = grid.selectAll()
        .data(griddata)
        .enter().append("g")
        .attr("class", "row");

    var on_hover = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', 'red')
        o.style("stroke-width", 3)
        let xt_value = model1_data[`(${d[0]}, ${d[1]})`]
        let shot_part = shot_threat[d[1]][d[0]]
        let move_part = xt_value - shot_part
        document.getElementById('m1_grid_no').innerText = d[0] + ', ' + d[1]
        document.getElementById('m1_xT').innerText = (model1_data[`(${d[0]}, ${d[1]})`] * 100).toFixed(2) + "%"
        document.getElementById('m1_split').innerText = (moves_data[d[1]][d[0]] * 100).toFixed(2) + '% / ' + (shots_data[d[1]][d[0]] * 100).toFixed(2) + '%'

        document.getElementById('m1_sT').innerText = (shot_part * 100).toFixed(2) + '%'
        document.getElementById('m1_mT').innerText = (move_part * 100).toFixed(2) + '%'

        // shot_threat
    }

    var on_leave = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', gridColor)
        o.style("stroke-width", 0.3)
    }

    var myColor = (e) => {

        let fnc = d3.scaleLinear()
                    .domain([0, 0.01, 0.03, 0.1, 0.5])
                    .range([
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(138, 255, 104, 0.5)',
                        'rgba(80, 173, 52, 0.5)',
                        'rgba(38, 105, 18, 0.5)',
                        'rgba(22, 82, 4, 0.5)',
                        ])
        return fnc(e)
    }

    var column = row.selectAll()
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d[0] * sW; })
        .attr("y", function(d) { return (L-d[1]-1) * sL; })
        .attr("width", sW)
        .attr("height", sL)
        .style("fill", function(d) { return myColor(model1_data[`(${d[0]}, ${d[1]})`]) })
        .style("stroke", gridColor)
        .attr("stroke-width", 0.3)
        .on("mouseover", on_hover)
        .on("mousemove", on_hover)
        .on("mouseleave", on_leave);

    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text("Base Model")
        .attr("font-size", "8pt");
    
    svg.append('text')
        .attr('x', 490)
        .attr('y', 350)
        .attr('text-anchor', 'end')
        .text("@sertalpbilal")
        .style('fill', '#006fa9')
        .attr("font-size", "6pt");

});

</script>

Since we have expected threat ratings calculated for each grid, we can measure any event in data in terms of its contribution to offense.
For example, Lindelöf's pass from grid `[4,0]` to grid `[14,4]` changes goal scoring probability from 0.33% to 9.98% (+9.65% increase).
Or, Gündogan's cross from `[14,10]` to `[14,4]` changes it from 2.07% to 9.98% (+7.91% increase).

The part I was interested in Karun's original blog post was the difference in left and right side of the field.
It somehow makes sense for a specific team to use one side of the field more effectively, but other than that, 
I think there is little explanation for the difference between $\mathrm{xT}$ of grid `[14,7]` (13.18%) and `[14,4]` (9.98%) besides noise.
If we had more samples, numbers probably would get closer and become almost symmetrical.
So, this is the point optimization could help with.
Assuming we have a noisy sample, we force expected threat levels to be symmetric or balanced and minimize resulting errors.

## Handling Noise with Error Minimization

### Part 1: Symmetricity

Our first change in the model will be making sure that $\mathrm{xT}$ levels of any symmetrical grids are equal to each other.
However, adding these equations to the linear system of equations will make the system infeasible.
Therefore, we will benefit from optimization to reduce the errors we will generate.
This is similar to how linear regression works, we minimize the total error.
For this purpose, we will add error term to each grid position.

There are a few ways to define what total error means (e.g. sum of squared errors), but let us keep the problem simple and assume we are trying to minimize sum of all error terms.
In order to measure the magnitude of the total, we need to minimize the absolute values of each error term.

Our error variable for grid $(x,y)$ will be $e_{x,y}$.
Now, we can write the objective function as
$$
\sum_{(x,y) \in G} \|e_{xy}\|
$$
Absolute value function $|e_{x,y}|$ is not linear, but it consists of two linear expressions: $e_{xy}$ and $-e_{xy}$.
We can introduce a new variable to represent absolute value, $a_{xy}$, and can write the problem now as a linear optimization model.

<div class="alert alert-info" role="alert">
  <b>Update (2021-03-26):</b> I have added an extra constraint to keep total error equal to 0.
</div>

<p class="x-scroll">
\begin{align}
\textrm{minimize: } \; & \sum_{(x,y) \in G} \textcolor{darkblue}{a_{x,y}} \\
\text{subject to: } \; 
& \mathrm{xT}_{x,y} + \textcolor{darkblue}{e_{x,y}} = s_{x,y} \cdot g_{x,y}   + m_{x,y} \cdot \sum_{(z,w) \in G} T_{(x,y)\to (z,w)} \cdot \mathrm{xT}_{z,w} \quad & \forall (x,y) \in G \\
& a_{xy} \geq e_{xy} & \quad \forall (x,y) \in G \\
& a_{xy} \geq -e_{xy} & \quad \forall (x,y) \in G \\
& \mathrm{xT}_{x,y} = \mathrm{xT}_{x,11-y} \quad & \forall (x,y) \in G \\
& \sum_{(x,y) \in G} e_{xy} = 0
\end{align}
</p>

We can write this model using sasoptpy as follows:

``` python
model = so.Model(name='xThreatModel_sym')
indices = [(x,y) for x in range(w) for y in range(l)]
xT = model.add_variables(indices, name='xT')
err = model.add_variables(indices, name='error')
err_abs = model.add_variables(indices, name='error_abs', lb=0)
model.add_constraints(
    (xT[x,y] + err[x,y] == shots.loc[x,y] * scores.loc[x,y] + moves.loc[x,y] * so.expr_sum(T.loc[(x,y),(z,w)] * xT[z,w] for (z,w) in indices) for (x,y) in indices), name='relation')
model.add_constraints(
    (err_abs[x,y] >= err[x,y] for (x,y) in indices), name='abs_values1')
model.add_constraints(
    (err_abs[x,y] >= -err[x,y] for (x,y) in indices), name='abs_values2')
model.add_constraints(
    (xT[x,y] == xT[x, l-y-1] for (x,y) in indices), name='symm_con')
model.add_constraint(so.expr_sum(err[x,y] for (x,y) in indices) == 0, name='zero_error_total')
sum_err_abs = so.expr_sum(err_abs[x,y] for (x,y) in indices)
model.set_objective(sum_err_abs, name='total_error', sense='N')
model.export_mps(filename='export.mps')
command = 'cbc export.mps solve solu solution.txt'
os.system(command)
```

Solving this model gives an objective of `0.146` in 0.06 seconds.
So a total of 14.6% error is accumulating when we try to force symmetricity into model.
Hover/click on the grid locations to see how $\mathrm{xT}$ values look like:

<div id="model2" class="row">
    <div id="model2_field" class="col-12 col-md-8"></div>
    <div id="model2_info" class="col-12 col-md-4">
        <table class="table table-sm table-hover" id="model2_table" style="table-layout: fixed;">
            <thead>
                <tr><th></th><th>Value</th></tr>
            </thead>
            <tbody>
                <tr><td>Grid</td><td id="m2_grid_no">-</td></tr>
                <tr><td>xT</td><td id="m2_xT">-%</td></tr>
                <tr><td>Error (Adj.) Rate</td><td id="m2_err">-%</td></tr>
                <tr><td>Move Threat</td><td id="m2_mT">-%</td></tr>
                <tr><td>Shot Threat</td><td id="m2_sT">-%</td></tr>
                <tr><td>Move/Shot Ratio</td><td id="m2_split">-% / -%</td></tr>
            </tbody>
            <caption style="caption-side: bottom">Click/hover on pitch to see xT levels.</caption>
        </table>
    </div>
</div>

<script type="text/javascript">

var model2_data = {"(0, 0)":0.0010537164,"(0, 1)":0.0015483621,"(0, 2)":0.0020399461,"(0, 3)":0.002367699,"(0, 4)":0.0026635794,"(0, 5)":0.0028628964,"(0, 6)":0.0028628964,"(0, 7)":0.0026635794,"(0, 8)":0.002367699,"(0, 9)":0.0020399461,"(0, 10)":0.0015483621,"(0, 11)":0.0010537164,"(1, 0)":0.0016675666,"(1, 1)":0.0021508951,"(1, 2)":0.0027589027,"(1, 3)":0.0031102643,"(1, 4)":0.0032850754,"(1, 5)":0.003458947,"(1, 6)":0.003458947,"(1, 7)":0.0032850754,"(1, 8)":0.0031102643,"(1, 9)":0.0027589027,"(1, 10)":0.0021508951,"(1, 11)":0.0016675666,"(2, 0)":0.0021893912,"(2, 1)":0.0027640301,"(2, 2)":0.0032202668,"(2, 3)":0.0035819395,"(2, 4)":0.0039818355,"(2, 5)":0.0039601749,"(2, 6)":0.0039601749,"(2, 7)":0.0039818355,"(2, 8)":0.0035819395,"(2, 9)":0.0032202668,"(2, 10)":0.0027640301,"(2, 11)":0.0021893912,"(3, 0)":0.0028165869,"(3, 1)":0.0032926665,"(3, 2)":0.0036026907,"(3, 3)":0.0038162997,"(3, 4)":0.004084849,"(3, 5)":0.0042790168,"(3, 6)":0.0042790168,"(3, 7)":0.004084849,"(3, 8)":0.0038162997,"(3, 9)":0.0036026907,"(3, 10)":0.0032926665,"(3, 11)":0.0028165869,"(4, 0)":0.0034425481,"(4, 1)":0.0040469001,"(4, 2)":0.0042870686,"(4, 3)":0.0046516162,"(4, 4)":0.0048626534,"(4, 5)":0.004991245,"(4, 6)":0.004991245,"(4, 7)":0.0048626534,"(4, 8)":0.0046516162,"(4, 9)":0.0042870686,"(4, 10)":0.0040469001,"(4, 11)":0.0034425481,"(5, 0)":0.0041014554,"(5, 1)":0.004731597,"(5, 2)":0.0050475326,"(5, 3)":0.0055592531,"(5, 4)":0.0058343401,"(5, 5)":0.005934126,"(5, 6)":0.005934126,"(5, 7)":0.0058343401,"(5, 8)":0.0055592531,"(5, 9)":0.0050475326,"(5, 10)":0.004731597,"(5, 11)":0.0041014554,"(6, 0)":0.0051111597,"(6, 1)":0.0058175733,"(6, 2)":0.0063194117,"(6, 3)":0.0065239923,"(6, 4)":0.0070066562,"(6, 5)":0.0072526008,"(6, 6)":0.0072526008,"(6, 7)":0.0070066562,"(6, 8)":0.0065239923,"(6, 9)":0.0063194117,"(6, 10)":0.0058175733,"(6, 11)":0.0051111597,"(7, 0)":0.0061501404,"(7, 1)":0.0071393022,"(7, 2)":0.007441775,"(7, 3)":0.0081927393,"(7, 4)":0.0084456056,"(7, 5)":0.007927271,"(7, 6)":0.007927271,"(7, 7)":0.0084456056,"(7, 8)":0.0081927393,"(7, 9)":0.007441775,"(7, 10)":0.0071393022,"(7, 11)":0.0061501404,"(8, 0)":0.0075690757,"(8, 1)":0.0084568682,"(8, 2)":0.0090173637,"(8, 3)":0.0094811494,"(8, 4)":0.0098699813,"(8, 5)":0.0098725331,"(8, 6)":0.0098725331,"(8, 7)":0.0098699813,"(8, 8)":0.0094811494,"(8, 9)":0.0090173637,"(8, 10)":0.0084568682,"(8, 11)":0.0075690757,"(9, 0)":0.0090871868,"(9, 1)":0.010267872,"(9, 2)":0.011013782,"(9, 3)":0.011560243,"(9, 4)":0.011959163,"(9, 5)":0.012579372,"(9, 6)":0.012579372,"(9, 7)":0.011959163,"(9, 8)":0.011560243,"(9, 9)":0.011013782,"(9, 10)":0.010267872,"(9, 11)":0.0090871868,"(10, 0)":0.011583617,"(10, 1)":0.012883658,"(10, 2)":0.013904632,"(10, 3)":0.014928127,"(10, 4)":0.015098947,"(10, 5)":0.015014389,"(10, 6)":0.015014389,"(10, 7)":0.015098947,"(10, 8)":0.014928127,"(10, 9)":0.013904632,"(10, 10)":0.012883658,"(10, 11)":0.011583617,"(11, 0)":0.014837734,"(11, 1)":0.016532677,"(11, 2)":0.017987771,"(11, 3)":0.019836772,"(11, 4)":0.020427876,"(11, 5)":0.019775419,"(11, 6)":0.019775419,"(11, 7)":0.020427876,"(11, 8)":0.019836772,"(11, 9)":0.017987771,"(11, 10)":0.016532677,"(11, 11)":0.014837734,"(12, 0)":0.017762579,"(12, 1)":0.020589015,"(12, 2)":0.023042766,"(12, 3)":0.02569414,"(12, 4)":0.029827151,"(12, 5)":0.036312957,"(12, 6)":0.036312957,"(12, 7)":0.029827151,"(12, 8)":0.02569414,"(12, 9)":0.023042766,"(12, 10)":0.020589015,"(12, 11)":0.017762579,"(13, 0)":0.018361727,"(13, 1)":0.023646317,"(13, 2)":0.028983155,"(13, 3)":0.038413039,"(13, 4)":0.071209987,"(13, 5)":0.08484851,"(13, 6)":0.08484851,"(13, 7)":0.071209987,"(13, 8)":0.038413039,"(13, 9)":0.028983155,"(13, 10)":0.023646317,"(13, 11)":0.018361727,"(14, 0)":0.018912382,"(14, 1)":0.023088795,"(14, 2)":0.033990967,"(14, 3)":0.04998685,"(14, 4)":0.10012064,"(14, 5)":0.19059158,"(14, 6)":0.19059158,"(14, 7)":0.10012064,"(14, 8)":0.04998685,"(14, 9)":0.033990967,"(14, 10)":0.023088795,"(14, 11)":0.018912382,"(15, 0)":0.023149631,"(15, 1)":0.025733934,"(15, 2)":0.030494316,"(15, 3)":0.039401753,"(15, 4)":0.096433537,"(15, 5)":0.39494357,"(15, 6)":0.39494357,"(15, 7)":0.096433537,"(15, 8)":0.039401753,"(15, 9)":0.030494316,"(15, 10)":0.025733934,"(15, 11)":0.023149631}
var model2_error = {"(0, 0)":0.0,"(0, 1)":0.0,"(0, 2)":-0.0002099968,"(0, 3)":0.0,"(0, 4)":0.0,"(0, 5)":-0.0000243126,"(0, 6)":0.0,"(0, 7)":-0.0000506619,"(0, 8)":-0.000151915,"(0, 9)":0.0,"(0, 10)":-0.0000349168,"(0, 11)":-0.0000406448,"(1, 0)":-0.0000947277,"(1, 1)":-0.0001404713,"(1, 2)":-0.0001359727,"(1, 3)":0.0000002606,"(1, 4)":0.0,"(1, 5)":0.0,"(1, 6)":-0.0000649311,"(1, 7)":-0.0000846822,"(1, 8)":-0.000000062,"(1, 9)":0.0,"(1, 10)":0.0,"(1, 11)":0.0,"(2, 0)":0.0,"(2, 1)":-0.0001598094,"(2, 2)":-0.0001214467,"(2, 3)":0.0,"(2, 4)":0.0,"(2, 5)":-0.0001132186,"(2, 6)":0.0,"(2, 7)":-0.0004529573,"(2, 8)":-0.0000975052,"(2, 9)":0.0,"(2, 10)":0.0,"(2, 11)":-0.0001193719,"(3, 0)":-0.0001283618,"(3, 1)":-0.0001099637,"(3, 2)":0.0,"(3, 3)":0.0,"(3, 4)":-0.000086808,"(3, 5)":-0.0001698314,"(3, 6)":0.0,"(3, 7)":0.0,"(3, 8)":0.0001364564,"(3, 9)":0.0001408714,"(3, 10)":0.0,"(3, 11)":0.0,"(4, 0)":-0.0000751447,"(4, 1)":-0.0001555447,"(4, 2)":-0.0000394152,"(4, 3)":-0.0000161805,"(4, 4)":-0.000095036,"(4, 5)":0.0000004628,"(4, 6)":-0.0000348305,"(4, 7)":0.0,"(4, 8)":0.0,"(4, 9)":0.0,"(4, 10)":0.0,"(4, 11)":0.0,"(5, 0)":0.0000250997,"(5, 1)":-0.0001444545,"(5, 2)":0.0,"(5, 3)":0.0,"(5, 4)":-0.000156888,"(5, 5)":0.0,"(5, 6)":-0.0001151669,"(5, 7)":0.0,"(5, 8)":-0.0000124806,"(5, 9)":0.000163902,"(5, 10)":0.0,"(5, 11)":0.0,"(6, 0)":-0.0000945719,"(6, 1)":-0.0001067636,"(6, 2)":0.0,"(6, 3)":0.0,"(6, 4)":-0.000109373,"(6, 5)":0.0,"(6, 6)":-0.0001613164,"(6, 7)":0.0,"(6, 8)":0.000241954,"(6, 9)":0.0000479492,"(6, 10)":0.0,"(6, 11)":0.0,"(7, 0)":0.0,"(7, 1)":0.0,"(7, 2)":0.0,"(7, 3)":0.0000702756,"(7, 4)":-0.0001055479,"(7, 5)":0.0,"(7, 6)":0.0002840828,"(7, 7)":0.0,"(7, 8)":0.0,"(7, 9)":0.0004024107,"(7, 10)":0.0000490958,"(7, 11)":0.0001830663,"(8, 0)":0.0,"(8, 1)":0.0000924996,"(8, 2)":0.0,"(8, 3)":0.0,"(8, 4)":0.0003009335,"(8, 5)":0.0,"(8, 6)":0.0002055361,"(8, 7)":0.0,"(8, 8)":0.0000946873,"(8, 9)":0.0001398518,"(8, 10)":0.0,"(8, 11)":0.0000363467,"(9, 0)":0.0,"(9, 1)":0.000038507,"(9, 2)":0.0,"(9, 3)":-0.0001083707,"(9, 4)":0.0,"(9, 5)":-0.0002679614,"(9, 6)":0.0,"(9, 7)":-0.0002891022,"(9, 8)":0.0,"(9, 9)":0.0000478507,"(9, 10)":0.0,"(9, 11)":0.0002597383,"(10, 0)":0.0,"(10, 1)":0.0,"(10, 2)":0.0,"(10, 3)":0.0002109179,"(10, 4)":-0.0000929043,"(10, 5)":-0.0001693188,"(10, 6)":0.0,"(10, 7)":0.0,"(10, 8)":0.0,"(10, 9)":0.0003674333,"(10, 10)":0.0001223266,"(10, 11)":0.0004290589,"(11, 0)":0.0,"(11, 1)":0.0,"(11, 2)":0.0,"(11, 3)":0.0009624878,"(11, 4)":-0.0008387475,"(11, 5)":0.0,"(11, 6)":0.00129216,"(11, 7)":0.0,"(11, 8)":0.0,"(11, 9)":0.0006945084,"(11, 10)":0.0001764496,"(11, 11)":0.0001494504,"(12, 0)":-0.0002059562,"(12, 1)":0.0005141413,"(12, 2)":0.001470133,"(12, 3)":-0.0002094388,"(12, 4)":0.0,"(12, 5)":0.0003112953,"(12, 6)":0.0,"(12, 7)":0.0003879266,"(12, 8)":0.0,"(12, 9)":0.0,"(12, 10)":0.0,"(12, 11)":0.0,"(13, 0)":0.0,"(13, 1)":0.0007906701,"(13, 2)":0.0,"(13, 3)":-0.0024486404,"(13, 4)":0.0,"(13, 5)":-0.0071442375,"(13, 6)":0.0,"(13, 7)":-0.0036672657,"(13, 8)":0.0,"(13, 9)":-0.0018782393,"(13, 10)":0.0,"(13, 11)":0.0016739539,"(14, 0)":-0.0000732246,"(14, 1)":0.0,"(14, 2)":0.0,"(14, 3)":-0.0063079608,"(14, 4)":0.0,"(14, 5)":0.0,"(14, 6)":-0.0042316342,"(14, 7)":0.029606562,"(14, 8)":0.0,"(14, 9)":-0.005184347,"(14, 10)":-0.0018833572,"(14, 11)":0.0,"(15, 0)":-0.0039917148,"(15, 1)":-0.0000067542,"(15, 2)":0.0,"(15, 3)":0.0,"(15, 4)":-0.0045501185,"(15, 5)":-0.011966763,"(15, 6)":0.031058238,"(15, 7)":0.0,"(15, 8)":-0.01023487,"(15, 9)":-0.0034133407,"(15, 10)":0.0,"(15, 11)":0.0}

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#model2_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var row = grid.selectAll()
        .data(griddata)
        .enter().append("g")
        .attr("class", "row");

    var on_hover = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', 'red')
        o.style("stroke-width", 3)
        let xt_value = model2_data[`(${d[0]}, ${d[1]})`]
        let err_value = model2_error[`(${d[0]}, ${d[1]})`]
        // let xt_original_value = model1_data[`(${d[0]}, ${d[1]})`]
        let shot_part = shot_threat[d[1]][d[0]]
        let move_part = xt_value + err_value - shot_part
        document.getElementById('m2_grid_no').innerText = d[0] + ', ' + d[1]
        document.getElementById('m2_xT').innerText = (model2_data[`(${d[0]}, ${d[1]})`] * 100).toFixed(2) + "%"
        document.getElementById('m2_err').innerText = (err_value * 100).toFixed(2) + "%"
        document.getElementById('m2_split').innerText = (moves_data[d[1]][d[0]] * 100).toFixed(2) + '% / ' + (shots_data[d[1]][d[0]] * 100).toFixed(2) + '%'
        document.getElementById('m2_sT').innerText = (shot_part * 100).toFixed(2) + '%'
        document.getElementById('m2_mT').innerText = (move_part * 100).toFixed(2) + '%'
    }

    var on_leave = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', gridColor)
        o.style("stroke-width", 0.3)
    }

    var myColor = (e) => {

        let fnc = d3.scaleLinear()
                    .domain([0, 0.01, 0.03, 0.1, 0.5])
                    .range([
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(138, 255, 104, 0.5)',
                        'rgba(80, 173, 52, 0.5)',
                        'rgba(38, 105, 18, 0.5)',
                        'rgba(22, 82, 4, 0.5)',
                        ])
        return fnc(e)
    }

    var column = row.selectAll()
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d[0] * sW; })
        .attr("y", function(d) { return (L-d[1]-1) * sL; })
        .attr("width", sW)
        .attr("height", sL)
        .style("fill", function(d) { return myColor(model2_data[`(${d[0]}, ${d[1]})`]) })
        .style("stroke", gridColor)
        .attr("stroke-width", 0.3)
        .on("mouseover", on_hover)
        .on("mousemove", on_hover)
        .on("mouseleave", on_leave);

    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");

    svg.append('text')
        .attr('x', 250)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text("Symmetric Model")
        .attr("font-size", "8pt");
    
    svg.append('text')
        .attr('x', 490)
        .attr('y', 350)
        .attr('text-anchor', 'end')
        .text("@sertalpbilal")
        .style('fill', '#006fa9')
        .attr("font-size", "6pt");

});

</script>

You will notice that expected threat of grid `[14,7]` and `[14,4]` are equal now: 9.84%.
We have assigned 2.97% error rate for grid `[14,7]`, meaning we reduced the final expected threat level of this grid by this amount.

Note that, instead of forcing hard symmetricity, we could have identified a range on how much two symmetric grids could be away from each other.
For example, we could write
$$
\mathrm{xT}\_{x,11-y} - r \leq \mathrm{xT}_{x,y} \leq \mathrm{xT}\_{x,11-y} + r
$$
where $r$ is a relatively small percentage, say 1%.
It might be expected to have slightly asymmetrical $\mathrm{xT}$ values due higher number of right-footed players.
Regardless, such a correction could be especially handy when working with limited amount of data.

The final issue I will mention here is the weird behavior around grid `[15,9]` and `[15,8]`.
Notice that, our $\mathrm{xT}$ level drops from 2.88% to 2.75% even though we get closer to the goal.
A similar issue exists in base model between grid `[13,10]` (2.30%) and `[14,10]` (2.07%).
I think this is mainly due to lack of instances that originates at these locations.
So, our next step will be enforcing a non-decreasing pattern to have consistent values.


### Part 2: Consistency

On top of the symmetrical model, our final model will feature the consistency of $\textrm{xT}$ values.
As we get closer to goal, we can make sure that $\textrm{xT}$ values follow a non-decreasing pattern.

One way to satify this consistency is to force expected threat of grid $(x,y)$ to be greater than $(z,y)$ (notice that it is the same row) if $(x,y)$ is closer to the goal.
Similarly, we can force expected threat of grid $(x,y)$ to be greater than $(x,w)$ if $(x,y)$ is closer to the goal.

We add two new constraints and get the following model:

<p class="x-scroll">
\begin{align}
\textrm{minimize: } \; & \sum_{(x,y) \in G} a_{x,y} \\
\text{subject to: } \; 
& ... \\
& \mathrm{xT}_{x,y} \geq \mathrm{xT}_{z,w} \qquad \forall (x,y) \in G, \forall (z,w) \in G: d(x,y) \lt d(z,w) \text{ and } x=z \\
& \mathrm{xT}_{x,y} \geq \mathrm{xT}_{z,w} \qquad \forall (x,y) \in G, \forall (z,w) \in G: d(x,y) \lt d(z,w) \text{ and } y=w
\end{align}
</p>

where $d_{x,y}$ is the distance of grid $(x,y)$ to the goal.

We can write this model using sasoptpy as follows:

``` python
model = so.Model(name='xThreatModel_sym_inc')
indices = [(x,y) for x in range(w) for y in range(l)]
xT = model.add_variables(indices, name='xT')
err = model.add_variables(indices, name='error')
err_abs = model.add_variables(indices, name='error_abs', lb=0)
model.add_constraints(
    (xT[x,y] + err[x,y] == shots.loc[x,y] * scores.loc[x,y] + moves.loc[x,y] * so.expr_sum(T.loc[(x,y),(z,w)] * xT[z,w] for (z,w) in indices) for (x,y) in indices), name='relation')
model.add_constraints(
    (err_abs[x,y] >= err[x,y] for (x,y) in indices), name='abs_values1')
model.add_constraints(
    (err_abs[x,y] >= -err[x,y] for (x,y) in indices), name='abs_values2')
model.add_constraints(
    (xT[x,y] == xT[x, l-y-1] for (x,y) in indices), name='symm_con')
model.add_constraint(so.expr_sum(err[x,y] for (x,y) in indices) == 0, name='zero_error_total')
model.add_constraints(
    (xT[x,y] >= xT[z, w] for (x,y) in indices for (z,w) in indices if dist(x,y) < dist(z,w) and x==z), name='same_row')
model.add_constraints(
    (xT[x,y] >= xT[z, w] for (x,y) in indices for (z,w) in indices if dist(x,y) < dist(z,w) and y==w), name='same_col')
sum_err_abs = so.expr_sum(err_abs[x,y] for (x,y) in indices)
model.set_objective(sum_err_abs, name='total_error', sense='N')
model.export_mps(filename='export.mps')
command = 'cbc export.mps presolve off solve solu solution.txt'
os.system(command)
```

This problem takes less than a second to solve with an objective of 15.4% error in total.

Finally, we get our final $\mathrm{xT}$ values:

<div id="model3" class="row">
    <div id="model3_field" class="col-12 col-md-8"></div>
    <div id="model3_info" class="col-12 col-md-4">
        <table class="table table-sm table-hover" id="model3_table" style="table-layout: fixed;">
            <thead>
                <tr><th></th><th>Value</th></tr>
            </thead>
            <tbody>
                <tr><td>Grid</td><td id="m3_grid_no">-</td></tr>
                <tr><td>xT</td><td id="m3_xT">-%</td></tr>
                <tr><td>Error (Adj.) Rate</td><td id="m3_err">-%</td></tr>
                <tr><td>Move Threat</td><td id="m3_mT">-%</td></tr>
                <tr><td>Shot Threat</td><td id="m3_sT">-%</td></tr>
                <tr><td>Move/Shot Ratio</td><td id="m3_split">-% / -%</td></tr>
            </tbody>
            <caption style="caption-side: bottom">Click/hover on pitch to see xT levels.</caption>
        </table>
    </div>
</div>

<script type="text/javascript">

var model3_data = {"(0, 0)":0.0009687587,"(0, 1)":0.0014240984,"(0, 2)":0.0018763042,"(0, 3)":0.0021760979,"(0, 4)":0.0024532596,"(0, 5)":0.0026333693,"(0, 6)":0.0026333693,"(0, 7)":0.0024532596,"(0, 8)":0.0021760979,"(0, 9)":0.0018763042,"(0, 10)":0.0014240984,"(0, 11)":0.0009687587,"(1, 0)":0.0015365121,"(1, 1)":0.0019790055,"(1, 2)":0.0025373776,"(1, 3)":0.0028628962,"(1, 4)":0.0030204472,"(1, 5)":0.003182638,"(1, 6)":0.003182638,"(1, 7)":0.0030204472,"(1, 8)":0.0028628962,"(1, 9)":0.0025373776,"(1, 10)":0.0019790055,"(1, 11)":0.0015365121,"(2, 0)":0.0020156832,"(2, 1)":0.0025431769,"(2, 2)":0.0029625774,"(2, 3)":0.0032919789,"(2, 4)":0.0036401261,"(2, 5)":0.0036401261,"(2, 6)":0.0036401261,"(2, 7)":0.0036401261,"(2, 8)":0.0032919789,"(2, 9)":0.0029625774,"(2, 10)":0.0025431769,"(2, 11)":0.0020156832,"(3, 0)":0.0025923764,"(3, 1)":0.0030270977,"(3, 2)":0.0033120844,"(3, 3)":0.0035098652,"(3, 4)":0.0037552959,"(3, 5)":0.003862156,"(3, 6)":0.003862156,"(3, 7)":0.0037552959,"(3, 8)":0.0035098652,"(3, 9)":0.0033120844,"(3, 10)":0.0030270977,"(3, 11)":0.0025923764,"(4, 0)":0.0031664255,"(4, 1)":0.0037225475,"(4, 2)":0.0039439485,"(4, 3)":0.0042788185,"(4, 4)":0.0044773845,"(4, 5)":0.0046013718,"(4, 6)":0.0046013718,"(4, 7)":0.0044773845,"(4, 8)":0.0042788185,"(4, 9)":0.0039439485,"(4, 10)":0.0037225475,"(4, 11)":0.0031664255,"(5, 0)":0.0037710867,"(5, 1)":0.0043529186,"(5, 2)":0.0046472411,"(5, 3)":0.0051175604,"(5, 4)":0.0053816157,"(5, 5)":0.0054785519,"(5, 6)":0.0054785519,"(5, 7)":0.0053816157,"(5, 8)":0.0051175604,"(5, 9)":0.0046472411,"(5, 10)":0.0043529186,"(5, 11)":0.0037710867,"(6, 0)":0.0046179072,"(6, 1)":0.0053653332,"(6, 2)":0.0058296045,"(6, 3)":0.0060142338,"(6, 4)":0.0063648558,"(6, 5)":0.0067225394,"(6, 6)":0.0067225394,"(6, 7)":0.0063648558,"(6, 8)":0.0060142338,"(6, 9)":0.0058296045,"(6, 10)":0.0053653332,"(6, 11)":0.0046179072,"(7, 0)":0.0056704034,"(7, 1)":0.0065876547,"(7, 2)":0.0068756043,"(7, 3)":0.0075642551,"(7, 4)":0.0076254358,"(7, 5)":0.0076254355,"(7, 6)":0.0076254355,"(7, 7)":0.0076254358,"(7, 8)":0.0075642551,"(7, 9)":0.0068756043,"(7, 10)":0.0065876547,"(7, 11)":0.0056704034,"(8, 0)":0.0069902587,"(8, 1)":0.0078121937,"(8, 2)":0.0083298131,"(8, 3)":0.0087574876,"(8, 4)":0.0091370544,"(8, 5)":0.009339213,"(8, 6)":0.009339213,"(8, 7)":0.0091370544,"(8, 8)":0.0087574876,"(8, 9)":0.0083298131,"(8, 10)":0.0078121937,"(8, 11)":0.0069902587,"(9, 0)":0.0084057865,"(9, 1)":0.0094897079,"(9, 2)":0.010189372,"(9, 3)":0.010564627,"(9, 4)":0.011028053,"(9, 5)":0.011625962,"(9, 6)":0.011625962,"(9, 7)":0.011028053,"(9, 8)":0.010564627,"(9, 9)":0.010189372,"(9, 10)":0.0094897079,"(9, 11)":0.0084057865,"(10, 0)":0.010729743,"(10, 1)":0.011922138,"(10, 2)":0.012843255,"(10, 3)":0.013763959,"(10, 4)":0.013840972,"(10, 5)":0.013840972,"(10, 6)":0.013840972,"(10, 7)":0.013840972,"(10, 8)":0.013763959,"(10, 9)":0.012843255,"(10, 10)":0.011922138,"(10, 11)":0.010729743,"(11, 0)":0.013798014,"(11, 1)":0.015327688,"(11, 2)":0.01666621,"(11, 3)":0.018234825,"(11, 4)":0.01826423,"(11, 5)":0.01826423,"(11, 6)":0.01826423,"(11, 7)":0.01826423,"(11, 8)":0.018234825,"(11, 9)":0.01666621,"(11, 10)":0.015327688,"(11, 11)":0.013798014,"(12, 0)":0.016384206,"(12, 1)":0.019140404,"(12, 2)":0.021415075,"(12, 3)":0.02356495,"(12, 4)":0.027895612,"(12, 5)":0.034470055,"(12, 6)":0.034470055,"(12, 7)":0.027895612,"(12, 8)":0.02356495,"(12, 9)":0.021415075,"(12, 10)":0.019140404,"(12, 11)":0.016384206,"(13, 0)":0.017239673,"(13, 1)":0.022192208,"(13, 2)":0.024795415,"(13, 3)":0.033800012,"(13, 4)":0.065061041,"(13, 5)":0.075473768,"(13, 6)":0.075473768,"(13, 7)":0.065061041,"(13, 8)":0.033800012,"(13, 9)":0.024795415,"(13, 10)":0.022192208,"(13, 11)":0.017239673,"(14, 0)":0.017944726,"(14, 1)":0.022192208,"(14, 2)":0.030232058,"(14, 3)":0.040206773,"(14, 4)":0.09840608,"(14, 5)":0.18591057,"(14, 6)":0.18591057,"(14, 7)":0.09840608,"(14, 8)":0.040206773,"(14, 9)":0.030232058,"(14, 10)":0.022192208,"(14, 11)":0.017944726,"(15, 0)":0.022744935,"(15, 1)":0.025313401,"(15, 2)":0.030232058,"(15, 3)":0.040206773,"(15, 4)":0.09840608,"(15, 5)":0.42917127,"(15, 6)":0.42917127,"(15, 7)":0.09840608,"(15, 8)":0.040206773,"(15, 9)":0.030232058,"(15, 10)":0.025313401,"(15, 11)":0.022744935}
var model3_error = {"(0, 0)":0.0,"(0, 1)":0.0,"(0, 2)":-0.000194127,"(0, 3)":0.0,"(0, 4)":0.0,"(0, 5)":-0.0000221204,"(0, 6)":0.0,"(0, 7)":-0.0000493535,"(0, 8)":-0.0001371597,"(0, 9)":0.0,"(0, 10)":-0.0000310387,"(0, 11)":-0.000036346,"(1, 0)":-0.000088816,"(1, 1)":-0.0001283906,"(1, 2)":-0.0001231525,"(1, 3)":0.0,"(1, 4)":0.0,"(1, 5)":0.0,"(1, 6)":-0.0000611269,"(1, 7)":-0.0000784245,"(1, 8)":-0.0000027027,"(1, 9)":0.0,"(1, 10)":0.0,"(1, 11)":0.0,"(2, 0)":0.0,"(2, 1)":-0.0001486196,"(2, 2)":-0.0001128037,"(2, 3)":0.0,"(2, 4)":0.0000288056,"(2, 5)":-0.0001032244,"(2, 6)":0.0,"(2, 7)":-0.0003966087,"(2, 8)":-0.0000865927,"(2, 9)":0.0,"(2, 10)":0.0,"(2, 11)":-0.00011117,"(3, 0)":-0.0001188874,"(3, 1)":-0.0001000442,"(3, 2)":0.0,"(3, 3)":0.0,"(3, 4)":-0.0000772361,"(3, 5)":-0.0000862491,"(3, 6)":0.0000696779,"(3, 7)":0.0,"(3, 8)":0.0001234513,"(3, 9)":0.0001288972,"(3, 10)":0.0,"(3, 11)":0.0,"(4, 0)":-0.0000670207,"(4, 1)":-0.0001438636,"(4, 2)":-0.0000373605,"(4, 3)":-0.0000118184,"(4, 4)":-0.0000860289,"(4, 5)":0.0,"(4, 6)":-0.0000387783,"(4, 7)":0.0,"(4, 8)":0.0,"(4, 9)":0.0,"(4, 10)":0.0,"(4, 11)":0.0,"(5, 0)":0.0000241868,"(5, 1)":-0.000129397,"(5, 2)":0.0,"(5, 3)":0.0,"(5, 4)":-0.0001458464,"(5, 5)":0.0,"(5, 6)":-0.0001059225,"(5, 7)":0.0,"(5, 8)":-0.0000089522,"(5, 9)":0.0001509412,"(5, 10)":0.0,"(5, 11)":0.0,"(6, 0)":0.0,"(6, 1)":-0.0001010076,"(6, 2)":0.0,"(6, 3)":0.0,"(6, 4)":0.0,"(6, 5)":0.0,"(6, 6)":-0.0001543608,"(6, 7)":0.000109049,"(6, 8)":0.000228291,"(6, 9)":0.0000387298,"(6, 10)":0.0,"(6, 11)":0.0000853701,"(7, 0)":0.0,"(7, 1)":0.0,"(7, 2)":0.0,"(7, 3)":0.0000722499,"(7, 4)":0.0000925466,"(7, 5)":-0.0002667989,"(7, 6)":0.0,"(7, 7)":0.0001939637,"(7, 8)":0.0,"(7, 9)":0.0003772871,"(7, 10)":0.0000454416,"(7, 11)":0.0001692907,"(8, 0)":0.0,"(8, 1)":0.0000846392,"(8, 2)":0.0,"(8, 3)":0.0,"(8, 4)":0.0002766864,"(8, 5)":-0.0001986702,"(8, 6)":0.0,"(8, 7)":0.0,"(8, 8)":0.0000960798,"(8, 9)":0.0001290566,"(8, 10)":0.0,"(8, 11)":0.0000385691,"(9, 0)":0.0,"(9, 1)":0.0000358431,"(9, 2)":0.0,"(9, 3)":0.0,"(9, 4)":0.0,"(9, 5)":-0.0002722566,"(9, 6)":0.0,"(9, 7)":-0.0002599635,"(9, 8)":0.0001079452,"(9, 9)":0.0000267933,"(9, 10)":0.0,"(9, 11)":0.0002409196,"(10, 0)":0.0,"(10, 1)":0.0,"(10, 2)":0.0,"(10, 3)":0.0002240087,"(10, 4)":-0.0000340074,"(10, 5)":-0.00015765,"(10, 6)":0.0,"(10, 7)":0.0000597516,"(10, 8)":0.0,"(10, 9)":0.0003311671,"(10, 10)":0.0000948638,"(10, 11)":0.0003805232,"(11, 0)":0.0,"(11, 1)":0.0,"(11, 2)":0.0,"(11, 3)":0.0009838274,"(11, 4)":-0.0002390364,"(11, 5)":0.0,"(11, 6)":0.0012419133,"(11, 7)":0.0006858614,"(11, 8)":0.0,"(11, 9)":0.0006014359,"(11, 10)":0.000135851,"(11, 11)":0.0001074567,"(12, 0)":0.0,"(12, 1)":0.0006411521,"(12, 2)":0.0014529455,"(12, 3)":0.0,"(12, 4)":0.0,"(12, 5)":0.000192037,"(12, 6)":0.0,"(12, 7)":0.0002412587,"(12, 8)":0.0002012272,"(12, 9)":0.0,"(12, 10)":0.0,"(12, 11)":0.0001277448,"(13, 0)":0.0,"(13, 1)":0.0009694659,"(13, 2)":0.0024846207,"(13, 3)":0.0,"(13, 4)":0.0042117338,"(13, 5)":0.0,"(13, 6)":0.0073165141,"(13, 7)":0.0,"(13, 8)":0.0021346691,"(13, 9)":0.0,"(13, 10)":0.0,"(13, 11)":0.0016157273,"(14, 0)":-0.0000507549,"(14, 1)":-0.0002012632,"(14, 2)":0.002573765,"(14, 3)":0.0024770729,"(14, 4)":0.0007629156,"(14, 5)":0.0037533307,"(14, 6)":0.0,"(14, 7)":0.030443069,"(14, 8)":0.0080315844,"(14, 9)":-0.0026419775,"(14, 10)":-0.0021712142,"(14, 11)":0.0,"(15, 0)":-0.0041283356,"(15, 1)":0.0,"(15, 2)":0.0,"(15, 3)":0.0,"(15, 4)":-0.0046053677,"(15, 5)":-0.043916517,"(15, 6)":0.0,"(15, 7)":0.0,"(15, 8)":-0.01135576,"(15, 9)":-0.0035185522,"(15, 10)":-0.0001095298,"(15, 11)":0.0}

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#model3_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var row = grid.selectAll()
        .data(griddata)
        .enter().append("g")
        .attr("class", "row");

    var on_hover = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', 'red')
        o.style("stroke-width", 3)
        let xt_value = model3_data[`(${d[0]}, ${d[1]})`]
        let err_value = model3_error[`(${d[0]}, ${d[1]})`]
        // let xt_original_value = model1_data[`(${d[0]}, ${d[1]})`]
        let shot_part = shot_threat[d[1]][d[0]]
        let move_part = xt_value + err_value - shot_part
        document.getElementById('m3_grid_no').innerText = d[0] + ', ' + d[1]
        document.getElementById('m3_xT').innerText = (model3_data[`(${d[0]}, ${d[1]})`] * 100).toFixed(2) + "%"
        document.getElementById('m3_err').innerText = (err_value * 100).toFixed(2) + "%"
        document.getElementById('m3_split').innerText = (moves_data[d[1]][d[0]] * 100).toFixed(2) + '% / ' + (shots_data[d[1]][d[0]] * 100).toFixed(2) + '%'
        document.getElementById('m3_sT').innerText = (shot_part * 100).toFixed(2) + '%'
        document.getElementById('m3_mT').innerText = (move_part * 100).toFixed(2) + '%'
    }

    var on_leave = (event, d) => {
        let o = d3.select(event.target)
        o.style('stroke', gridColor)
        o.style("stroke-width", 0.3)
    }

    var myColor = (e) => {

        let fnc = d3.scaleLinear()
                    .domain([0, 0.01, 0.03, 0.1, 0.5])
                    .range([
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(138, 255, 104, 0.5)',
                        'rgba(80, 173, 52, 0.5)',
                        'rgba(38, 105, 18, 0.5)',
                        'rgba(22, 82, 4, 0.5)',
                        ])
        return fnc(e)
    }

    var column = row.selectAll()
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d[0] * sW; })
        .attr("y", function(d) { return (L-d[1]-1) * sL; })
        .attr("width", sW)
        .attr("height", sL)
        .style("fill", function(d) { return myColor(model3_data[`(${d[0]}, ${d[1]})`]) })
        .style("stroke", gridColor)
        .attr("stroke-width", 0.3)
        .on("mouseover", on_hover)
        .on("mousemove", on_hover)
        .on("mouseleave", on_leave);

    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");

    svg.append('text')
        .attr('x', 250)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text("Non-decreasing Symmetric Model")
        .attr("font-size", "8pt");
    
    svg.append('text')
        .attr('x', 490)
        .attr('y', 350)
        .attr('text-anchor', 'end')
        .text("@sertalpbilal")
        .style('fill', '#006fa9')
        .attr("font-size", "6pt");

});

</script>

Now expected threat values for 
  - `[15,9]` is 3.02% (2.68% in base model, 3.02% in symmetric model)
  - `[15,8]` is 4.02% (2.91% in base model, 3.94% in symmetric model)

and their symmetric counterparts:
  - `[15,2]` is 3.02% (3.10% in base model, 3.05% in symmetric model)
  - `[15,3]` is 4.02% (3.96% in base model, 3.94% in symmetric model)


## Comparison and Recap

You can find all 3 values of $\mathrm{xT}$ values below. Hover/click on a grid to see the corresponding levels.

<div id="comparison" class="row">
    <div id="cmp_field" class="col-12 col-md-8"></div>
    <div id="cmp_info" class="col-12 col-md-4">
        <table class="table table-sm table-hover" id="cmp_table" style="table-layout: fixed;">
            <thead>
                <tr><th></th><th>Value</th></tr>
            </thead>
            <tbody>
                <tr><td>Grid</td><td id="cmp_grid_no">-</td></tr>
                <tr><td>xT (Base)</td><td id="cmp_xT1">-%</td></tr>
                <tr><td>xT (Symm)</td><td id="cmp_xT2">-%</td></tr>
                <tr><td>xT (ND-Symm)</td><td id="cmp_xT3">-%</td></tr>
            </tbody>
            <caption style="caption-side: bottom">Click/hover on pitch to see xT levels.</caption>
        </table>
    </div>
</div>

<script type="text/javascript">

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#cmp_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var flat_griddata = griddata.flat()

    const celldata = flat_griddata.map((d) => {
        return {
            index: d,
            values: [
                {'key': 'm1', 'value': model1_data[`(${d[0]}, ${d[1]})`]},
                {'key': 'm2', 'value': model2_data[`(${d[0]}, ${d[1]})`]},
                {'key': 'm3', 'value': model3_data[`(${d[0]}, ${d[1]})`]}
            ]
        };
    })
    console.log(celldata);

    var on_hover = (event, d) => {
        let o = d3.select(event.target)
        o.style('fill', '#82f1ff')
        document.getElementById('cmp_grid_no').innerText = d.index[0] + ', ' + d.index[1]
        document.getElementById('cmp_xT1').innerText = (d.values[0].value * 100).toFixed(2) + '%'
        document.getElementById('cmp_xT2').innerText = (d.values[1].value * 100).toFixed(2) + '%'
        document.getElementById('cmp_xT3').innerText = (d.values[2].value * 100).toFixed(2) + '%'
    }

    var on_leave = (event) => {
        let o = d3.select(event.target)
        o.style('fill', '#ffffff00')
    }
    
    for (var g of celldata) {
        var cell = grid.append('svg')
            .attr('width', sW)
            .attr('height', sL)
            .attr('x', (d) => g.index[0]*sW)
            .attr('y', (d) => (L-g.index[1]-1)*sL);
        
        cell.append("rect")
            .datum(g)
            .attr("class","square")
            .attr("x",0)
            .attr("y",0)
            .attr("width", sW)
            .attr("height", sL)
            .style("fill", "#ffffff00")
            .style("stroke", gridColor)
            .attr("stroke-width", 0.3)
            .on('mouseover', on_hover)
            .on('mouseleave', on_leave);
        
        var x = d3.scaleBand()
            .range([ 1, sW-1 ])
            .domain(['m1', 'm2', 'm3'])
            .padding(0.2);
        
        var y = d3.scaleLinear()
            .domain([-0.05, 0.5])
            .range([ sL-1, 1]);

        cell.selectAll()
            .data(g.values)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", "#69b3a2")
            .attr("opacity", 0.7)
            .style('pointer-events', 'none')
    }

    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");

    svg.append('text')
        .attr('x', 250)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text("Comparison of xT Values")
        .attr("font-size", "8pt");
    
    svg.append('text')
        .attr('x', 490)
        .attr('y', 350)
        .attr('text-anchor', 'end')
        .text("@sertalpbilal")
        .style('fill', '#006fa9')
        .attr("font-size", "6pt");

});

</script>

Now, we have a perfectly symmetrical and non-decreasing model on our hands.
Our final model manages to fix both issues we tackled:
- Possession of the ball on grids `[14,4]` and `[14,7]` are equal to each other
- Passing from grid `[13,10]` to `[14,10]` does not decrease threat level

So, to recap, expected threat is a method for assessing the value of having the ball possession for attacking team in pitch locations.
The detail of the data dictates how accurate the model can get.
When working with limited data, it is important to reduce the noise.
We can use optimization modeling to ensure the final model is valid in terms of defined performance measures, like symmetricity.
This is a simplified take on how to include optimization into these type of analysis.
I hope it is inspiring in terms of tackling similar issues.

If you were wondering here are the contribution of each moves that is shown at the beginning of the post:

<div id="final_visual" class="row">
    <div id="final_field" class="col-12 col-md-6"></div>
    <div id="final_table" class="col-12 col-md-6">
        <table class="table table-sm table-hover" id="table2">
            <thead>
                <tr><th>Name</th><th>Action</th><th>From</th><th>To</th><th>xT Contr. (Base)</th><th>xT Contr. (ND-Symm)</th></tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
</div>

<script type="text/javascript">
initial_data.forEach((x) => {
    let to = x.bins[1]
    let from = x.bins[0]
    let xtv1 = ((model1_data[`(${to[0]}, ${to[1]})`] - model1_data[`(${from[0]}, ${from[1]})`]) * 100).toFixed(2) + '%'
    let xtv3 = ((model3_data[`(${to[0]}, ${to[1]})`] - model3_data[`(${from[0]}, ${from[1]})`]) * 100).toFixed(2) + '%'
    debugger;
    if (x.action != 'shot') {
        $('#table2 tbody').append(`<tr class="table2-row" style="cursor: pointer" data-from="${x.from}" data-to="${x.to}"><td>${x.name}</td><td>${x.action}</td><td>${x.bins[0]}</td><td>${x.bins[1]}</td><td>${xtv1}</td><td>${xtv3}</td></tr>`);
    }
});

$(document).on('mouseover', '.table2-row', function(e) {
    let from_coord = e.currentTarget.dataset.from.split(',').map(i => parseFloat(i))
    let to_coord = e.currentTarget.dataset.to.split(',').map(i => parseFloat(i))
    addLine2(from_coord, to_coord)
});

</script>

<script type="text/javascript">

$(document).ready( function () {

    const raw_width = 500;
    const raw_height = 360;


    const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = raw_width - margin.left - margin.right,
    height = raw_height - margin.top - margin.bottom;

    const svg = d3.select("#final_field")
        .append("svg")
        .attr("viewBox", `0 0  ${(width + margin.left + margin.right)} ${(height + margin.top + margin.bottom)}`)
        .attr('class', 'pull-center').style('display', 'block')
        .style('margin-bottom', '10px');

    svg.append('rect').attr('fill','#f1f1f1').attr('width', raw_width).attr('height', raw_height);

    const svgfield = svg.append('svg')
        .attr('viewBox', '0 0 1150 780')
        .attr('preserveAspectRatio', "xMidYMin meet");
    draw_field(svgfield, {opacity: 1, fieldColor: 'none', lineColor: '#6b6b6b'});
    const gridColor = "#6b6b6b";

    const grid = svgfield.append('g').attr('transform', 'translate(50,50)').attr('width',1050).attr('height', 680);
    const W = 16;
    const L = 12;
    const sW = 1050/W;
    const sL = 680/L;

    const griddata = [];
    for (var x=0; x<W; x++) {
        let row = [];
        for (var y=0; y<L; y++) {
            row.push([x,y]);
        }
        griddata.push(row);
    }

    var row = grid.selectAll()
        .data(griddata)
        .enter().append("g")
        .attr("class", "row");


    var myColor = (e) => {

        let fnc = d3.scaleLinear()
                    .domain([0, 0.01, 0.03, 0.1, 0.5])
                    .range([
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(138, 255, 104, 0.5)',
                        'rgba(80, 173, 52, 0.5)',
                        'rgba(38, 105, 18, 0.5)',
                        'rgba(22, 82, 4, 0.5)',
                        ])
        return fnc(e)
    }

    var column = row.selectAll()
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d[0] * sW; })
        .attr("y", function(d) { return (L-d[1]-1) * sL; })
        .attr("width", sW)
        .attr("height", sL)
        .style("fill", function(d) { return myColor(model3_data[`(${d[0]}, ${d[1]})`]) })
        .style("stroke", gridColor)
        .attr("stroke-width", 0.3);

    row.selectAll()
        .data(function(d) { return d; })
        .enter()
        .append("text")
        .attr("x", function(d) { return d[0] * sW + sW/2; })
        .attr("y", function(d) { return (L-d[1]-1) * sL + sL/2; })
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', '15pt')
        .style('text-shadow', '0px 0px 2px gray')
        .style('opacity', 0.2)
        .text(function(d) { return d[0] + ',' + d[1] })
        .style('pointer-events', 'none');
    
    arrowPoints = [[0, 0], [0, 20], [20, 10]];
    var defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');
    
    defs.append('marker')
        .attr('id', 'redarrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 20)
        .attr('refY', 10)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'red')
        .attr('fill', 'red');

    svg.append('line')
        .attr('x1', 200)
        .attr('y1', 335)
        .attr('x2', 300)
        .attr('y2', 335)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    
    svg.append('text')
        .attr('x', 250)
        .attr('y', 350)
        .attr('text-anchor', 'middle')
        .text("Attack Direction")
        .attr("font-size", "8pt");

    window.addLine2 = (from_c, to_c) => {
        d3.select('#action_line').remove()
        console.log(svg)
        grid.append('line')
            .attr('id', 'action_line')
            .attr('x1', from_c[0]*10)
            .attr('y1', 680-from_c[1]*10)
            .attr('x2', to_c[0]*10)
            .attr('y2', 680-to_c[1]*10)
            .attr('stroke-width', 4)
            .attr('stroke', 'red')
            .attr('marker-end', 'url(#redarrow)')
            .attr('fill', 'none');
    }

});

</script>

Compared to the base model, we identified that Mané's dribble might have a higher importance (0.61% to 1.80%).
Contribution of Traoré's pass, on the other hand, decreases slightly from 2.93% to 2.19%.

## Future Work

One thing I mentioned but didn't cover in details is how the total error is defined.
When using sum of squared errors, the problem becomes an Quadratic Optimization instance and requires a different solver to solve.
We could take a further step and generalize the problem by trying to minimize the *p*-norm as
$$
\text{minimize: } \Vert e \Vert_{p} := \left ( \sum\_{(x,y) \in G}  |e\_{x,y}|^{p} \right )^{1/p}
$$
In this post I used $p=1$ which gives absolute value function, and similarly we could have tried to minimize the maximum error using $p=\infty$.

A totally different direction for involving the optimization is generating $\mathrm{xT}$ values per team, and analyze/find best *n*-step plays.
This obviously requires more data, but assuming some grid connections are blocked by opponent defenders, optimization can find which play maximizes $\mathrm{xT}$ accumulation over next *n* moves.

If you are interested to work on any of these problems or have another idea, please reach out to me.
You can find my [Jupyter Notebook (Python) on GitHub](https://github.com/sertalpbilal/football_analytics/blob/main/notebooks/xT.ipynb) that includes data steps and all models I have generated here.


[^xG]: FBref has a [page on xG](https://fbref.com/en/expected-goals-model-explained/) if you would like to learn more about it.
[^sb360]: Note that, similar (possession value) models are available in market, and recently discussed in [StatsBomb's 360 reveal](https://statsbomb.com/2021/03/what-happened-at-statsbomb-evolve-360-data-quality-obv-and-more/).
[^grid]: Field drawing is based on this [Blocks page](https://bl.ocks.org/balders93/98ff5f77b82eea28f47c72e1e256286d)
[^nested]: Here $\mathrm{xT}\_{x,y}$ depends on $\mathrm{xT}\_{z,w}$ and vice versa. Therefore, we have a nested structure.
[^sstate]: We can think this as a Markov chain and $\mathrm{xT}$ as the steady-state probabilities.

<!-- Further Reference
[^GridSize]: Grid size tweet: https://twitter.com/karun1710/status/1156282335865651200
[^Symm]: Tweet about symmetricity discussion: https://twitter.com/karun1710/status/1156993495644528640 -->
