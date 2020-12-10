+++
draft = false
title = "On FPL, Optimization, and Ownership Weights"
date = "2020-12-10T01:30:00-05:00"
tags = ["FPL", "optimization", "soccer", "analytics", "math"]
categories = ["optimization"]
banner = "/img/banners/pexels-pixabay-235990.jpg"
bannercaption = "Photo by Pixabay from Pexels"
author = "Alp Cay"
js = ["https://cdn.datatables.net/1.10.22/js/jquery.dataTables.min.js", "https://cdnjs.cloudflare.com/ajax/libs/d3/6.3.1/d3.js", "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
"https://d3js.org/d3-scale-chromatic.v1.min.js"]
css = ["https://cdn.datatables.net/1.10.22/css/jquery.dataTables.min.css"]
unsafe= true

+++

Roberto Cialdini mentions _scarcity_ as one of the 6 principles of persuasion. 
The nature of seeking something of great interest is embedded inside all of us.
Our first reaction when we see other people do something is to follow them.
Even though it does not make too much sense, we follow the herd even in a competitive game, like Fantasy Premier League.

Last week's (GW11) unfortunate gold rush to Jota proved that we fear being left out.
Of course the potential price changes further trigger and support our knee-jerk reactions, however it is important to separate what we want to do and **feel forced** to do.

This topic is of great interest to me right now, because I am at the other end of the spectrum: 
I am religiously following the results of my optimization model this season.
Up until now, I never thought of including what other people are doing into my model, but it suddenly made sense to me.
Perhaps our cognitive tendencies have something that I can benefit even in a purely mathematical model.

## Analytics in FPL

{{< img src="/img/uploads/pexels-vlada-karpovich-6114964.jpg" caption="Photo by Vlada Karpovich from Pexels" figcls="img-responsive pull-right" class="lazy">}}

Analytics is once seen as an evil in sports.
Many sports unwillingly embraced the edge analytics and data bring.
Soccer/Football is still behind this transformation.[^1]

As a fantasy sports leg of the puzzle, FPL is closely involved with data.
The difficult part of FPL is the vast number of decisions you can give.
Currently there are over 600 soccer players and an abundant volume of data available about each of them.
You might be skeptical about whether analytics and data alone can solve the problem of decision-making each week in FPL.
It depends how you look at it, but **I do not think analytics and data have all the answers**.
However, **they paves the road for well informed decisions** like many sectors have been using for years.

Many of the managers are well aware of how to use basic tools and follow fixture difficulty ratings.
After many hours of work, most of the time we end up with a prediction of what will happen next gameweek, however it might be away from the fact.
Then, the question becomes: given this information, what is my best strategy?
It is easy get overwhelmed with decisions, hence oversimplifying the most important step of the puzzle: decision-making.
Unfortunately, neither statistics nor Machine Learning are decision making tools.
They are called *descriptive* and *predictive* analytics tools, respectively.
The last step of the analytics is what we call *prescriptive*, and the most common tool for this step is **optimization**.

## MADS (Math-as-Decision-Support)

Before we go back to our original discussion about joining the bandwagons, let us define a simple problem to see why *optimization is a great decision support tool* you should be using.
Using [FPL Review](https://fplreview.com/)'s estimated values for GW12 (as of 2020-12-08), let us try to pick 4 midfield players under a certain budget to maximize our expected FPL points.

Expected points of midfield players this GW are as follows:

<div class="embed-table">

| id  | name           | team\_name     | selected\_by\_percent | price | xP     |
|-----|----------------|----------------|-----------------------|-------|--------|
| 254 | Salah          | Liverpool      | 32\.2                 | 12\.3 | 7\.732 |
| 4   | Aubameyang     | Arsenal        | 9\.4                  | 11\.5 | 5\.86  |
| 251 | Mané           | Liverpool      | 9\.5                  | 12    | 5\.808 |
| 272 | De Bruyne      | Man City       | 24\.1                 | 11\.8 | 4\.975 |
| 390 | Son            | Spurs          | 58\.5                 | 9\.5  | 4\.893 |
| 468 | Jota           | Liverpool      | 29\.8                 | 7     | 4\.69  |
| 276 | Sterling       | Man City       | 4                     | 11\.4 | 4\.479 |
| 370 | Ward\-Prowse   | Southampton    | 13\.5                 | 6\.2  | 4\.171 |
| 500 | Havertz        | Chelsea        | 3\.3                  | 8\.3  | 4\.033 |
| 469 | Podence        | Wolves         | 3\.4                  | 5\.4  | 4\.032 |
| 231 | Maddison       | Leicester      | 2\.7                  | 7     | 3\.988 |
| 37  | Grealish       | Aston Villa    | 38\.9                 | 7\.7  | 3\.958 |
| 275 | Mahrez         | Man City       | 9\.1                  | 8\.4  | 3\.937 |
| 570 | Raphinha       | Leeds          | 0\.5                  | 5\.4  | 3\.89  |
| 198 | Klich          | Leeds          | 5\.4                  | 5\.5  | 3\.879 |
| 478 | Willian        | Arsenal        | 3\.7                  | 7\.6  | 3\.83  |
| 306 | Rashford       | Man Utd        | 6\.1                  | 9\.4  | 3\.813 |
| 119 | Pulisic        | Chelsea        | 2\.1                  | 8\.2  | 3\.79  |
| 302 | Fernandes      | Man Utd        | 41                    | 10\.9 | 3\.78  |
| 474 | Neto           | Wolves         | 4\.7                  | 5\.6  | 3\.765 |
| 120 | Mount          | Chelsea        | 4\.9                  | 6\.8  | 3\.764 |
| 508 | Rodríguez      | Everton        | 22\.2                 | 7\.7  | 3\.761 |
| 203 | Harrison       | Leeds          | 1\.3                  | 5\.4  | 3\.488 |
| 465 | Traoré         | Wolves         | 6\.3                  | 6\.2  | 3\.471 |
| 24  | Saka           | Arsenal        | 2\.4                  | 5\.2  | 3\.367 |
| 69  | Trossard       | Brighton       | 0\.9                  | 5\.9  | 3\.322 |
| 321 | Shelvey        | Newcastle      | 0\.1                  | 5\.3  | 3\.305 |
| 141 | Zaha           | Crystal Palace | 16\.8                 | 7\.4  | 3\.235 |
| 445 | Bowen          | West Ham       | 2\.6                  | 6\.3  | 3\.225 |
| 368 | Armstrong      | Southampton    | 0\.7                  | 5\.5  | 3\.223 |
| 228 | Tielemans      | Leicester      | 2\.9                  | 6\.4  | 3\.095 |
| 57  | Groß           | Brighton       | 0\.3                  | 5\.8  | 3\.009 |
| 244 | Henderson      | Liverpool      | 1                     | 5\.4  | 2\.98  |
| 449 | Soucek         | West Ham       | 3\.9                  | 4\.9  | 2\.961 |
| 466 | Neves          | Wolves         | 1\.3                  | 5\.2  | 2\.945 |
| 243 | Wijnaldum      | Liverpool      | 1\.3                  | 5\.3  | 2\.908 |
| 450 | Fornals        | West Ham       | 1\.9                  | 6\.4  | 2\.796 |
| 480 | Sean Longstaff | Newcastle      | 0\.1                  | 4\.7  | 2\.784 |
| 204 | Phillips       | Leeds          | 1\.3                  | 4\.9  | 2\.77  |
| 403 | Lo Celso       | Spurs          | 0\.4                  | 6\.9  | 2\.77  |
| 40  | Trézéguet      | Aston Villa    | 0\.8                  | 5\.3  | 2\.769 |
| 489 | Eze            | Crystal Palace | 0\.7                  | 5\.8  | 2\.765 |
| 100 | McNeil         | Burnley        | 0\.4                  | 5\.7  | 2\.761 |
| 339 | Almirón        | Newcastle      | 0\.4                  | 5\.6  | 2\.752 |
| 113 | Kanté          | Chelsea        | 3\.4                  | 4\.9  | 2\.725 |
| 446 | Diangana       | West Brom      | 0\.3                  | 5\.3  | 2\.696 |
| 464 | Dendoncker     | Wolves         | 0\.9                  | 4\.8  | 2\.643 |
| 221 | Albrighton     | Leicester      | 0\.1                  | 5\.3  | 2\.626 |
| 454 | Moutinho       | Wolves         | 1\.2                  | 5\.2  | 2\.623 |
| 396 | Højbjerg       | Spurs          | 0\.9                  | 4\.9  | 2\.622 |
| 364 | Oriol Romeu    | Southampton    | 4\.5                  | 4\.5  | 2\.616 |
| 137 | Townsend       | Crystal Palace | 1\.9                  | 5\.8  | 2\.615 |
| 38  | McGinn         | Aston Villa    | 1\.7                  | 5\.5  | 2\.596 |
| 286 | Rodrigo        | Man City       | 0\.5                  | 5\.4  | 2\.559 |
| 360 | Berge          | Sheffield Utd  | 0\.2                  | 5     | 2\.549 |
| 392 | Lucas Moura    | Spurs          | 1\.2                  | 6\.7  | 2\.508 |
| 448 | Rice           | West Ham       | 2\.5                  | 4\.8  | 2\.5   |
| 544 | Gallagher      | West Brom      | 0\.1                  | 5\.5  | 2\.498 |
| 89  | Westwood       | Burnley        | 0\.4                  | 5\.3  | 2\.486 |
| 65  | March          | Brighton       | 1\.3                  | 5     | 2\.472 |
| 253 | Fabinho        | Liverpool      | 0\.9                  | 5\.4  | 2\.449 |
| 175 | Cairney        | Fulham         | 0\.2                  | 5\.3  | 2\.445 |
| 512 | Doucouré       | Everton        | 1\.1                  | 5\.3  | 2\.394 |
| 355 | Lundstram      | Sheffield Utd  | 2\.4                  | 5     | 2\.384 |
| 52  | Douglas Luiz   | Aston Villa    | 0\.3                  | 4\.9  | 2\.367 |
| 98  | Brownhill      | Burnley        | 0                     | 4\.9  | 2\.357 |
| 76  | Bissouma       | Brighton       | 3\.2                  | 4\.5  | 2\.313 |
| 235 | Barnes         | Leicester      | 3\.9                  | 6\.9  | 2\.27  |
| 346 | Fleck          | Sheffield Utd  | 0\.1                  | 5\.6  | 2\.249 |
| 107 | Kovacic        | Chelsea        | 0\.3                  | 5\.3  | 2\.202 |
| 271 | Gündogan       | Man City       | 0\.3                  | 5\.4  | 2\.19  |
| 148 | Walcott        | Southampton    | 0\.8                  | 5\.8  | 2\.153 |
| 315 | Greenwood      | Man Utd        | 2\.2                  | 7\.1  | 2\.142 |
| 133 | Kouyaté        | Crystal Palace | 0\.6                  | 5     | 2\.141 |
| 263 | Jones          | Liverpool      | 0\.7                  | 4\.4  | 2\.14  |
| 555 | Krovinovic     | West Brom      | 0                     | 5     | 2\.14  |
| 159 | Iwobi          | Everton        | 0\.2                  | 5\.9  | 2\.134 |
| 382 | Djenepo        | Southampton    | 0\.1                  | 5\.4  | 2\.121 |
| 9   | Xhaka          | Arsenal        | 0\.5                  | 5\.2  | 2\.088 |
| 236 | Ndidi          | Leicester      | 0\.6                  | 4\.8  | 2\.077 |
| 385 | Sissoko        | Spurs          | 0\.5                  | 4\.8  | 2\.064 |
| 411 | Phillips       | West Brom      | 0                     | 5\.1  | 2\.044 |
| 95  | Brady          | Burnley        | 0\.1                  | 5     | 2\.025 |
| 502 | Allan          | Everton        | 0\.9                  | 5\.3  | 1\.99  |
| 400 | Bergwijn       | Spurs          | 0\.4                  | 7     | 1\.977 |
| 130 | McArthur       | Crystal Palace | 0\.1                  | 5\.3  | 1\.964 |
| 413 | Sawyers        | West Brom      | 0                     | 4\.8  | 1\.944 |
| 261 | Keita          | Liverpool      | 0\.2                  | 5\.2  | 1\.939 |
| 191 | Anguissa       | Fulham         | 1\.9                  | 4\.5  | 1\.924 |
| 365 | Redmond        | Southampton    | 0\.2                  | 6\.4  | 1\.9   |
| 501 | Ceballos       | Arsenal        | 1\.1                  | 4\.8  | 1\.87  |
| 115 | Loftus\-Cheek  | Fulham         | 0\.2                  | 5\.9  | 1\.832 |
| 296 | Pogba          | Man Utd        | 1\.1                  | 7\.7  | 1\.826 |
| 309 | McTominay      | Man Utd        | 0\.3                  | 4\.9  | 1\.818 |
| 526 | Elneny         | Arsenal        | 1\.3                  | 4\.4  | 1\.814 |
| 485 | Hendrick       | Newcastle      | 2\.4                  | 4\.8  | 1\.809 |
| 405 | Ndombele       | Spurs          | 0\.4                  | 5\.9  | 1\.793 |
| 540 | Traoré         | Aston Villa    | 0                     | 5\.9  | 1\.783 |
| 557 | Lookman        | Fulham         | 0\.6                  | 5     | 1\.753 |
| 225 | Praet          | Leicester      | 0\.4                  | 5\.5  | 1\.695 |
| 205 | Costa          | Leeds          | 4\.9                  | 5\.4  | 1\.646 |
| 187 | Cavaleiro      | Fulham         | 0\.1                  | 5\.3  | 1\.633 |
| 142 | Schlupp        | Crystal Palace | 0\.1                  | 5\.4  | 1\.601 |
| 349 | Norwood        | Sheffield Utd  | 0\.2                  | 4\.7  | 1\.584 |
| 138 | Milivojevic    | Crystal Palace | 0\.2                  | 5\.6  | 1\.583 |
| 299 | Fred           | Man Utd        | 0\.2                  | 5\.3  | 1\.52  |
| 543 | Bale           | Spurs          | 0\.5                  | 9\.4  | 1\.473 |
| 373 | Reed           | Fulham         | 0\.6                  | 4\.4  | 1\.403 |
| 290 | Mata           | Man Utd        | 0\.2                  | 5\.9  | 1\.388 |
| 190 | Kamara         | Fulham         | 0                     | 4\.8  | 1\.368 |
| 424 | Burke          | Sheffield Utd  | 1\.2                  | 4\.3  | 1\.361 |
| 106 | Barkley        | Aston Villa    | 1\.6                  | 5\.9  | 1\.357 |
| 409 | Livermore      | West Brom      | 0\.1                  | 4\.8  | 1\.336 |
| 33  | Hourihane      | Aston Villa    | 0\.1                  | 6     | 1\.313 |
| 322 | Ritchie        | Newcastle      | 0                     | 4\.9  | 1\.31  |
| 284 | Foden          | Man City       | 5\.2                  | 6\.4  | 1\.307 |
| 336 | Hayden         | Newcastle      | 0\.1                  | 4\.8  | 1\.297 |
| 150 | Sigurdsson     | Everton        | 0\.8                  | 6\.8  | 1\.272 |
| 497 | Murphy         | Newcastle      | 0\.1                  | 4\.9  | 1\.27  |
| 281 | Bernardo Silva | Man City       | 0\.5                  | 7\.4  | 1\.262 |
| 427 | Noble          | West Ham       | 0\.4                  | 4\.7  | 1\.253 |
| 518 | Mendy          | Leicester      | 3\.1                  | 4\.5  | 1\.228 |
| 144 | Riedewald      | Crystal Palace | 1\.9                  | 4\.4  | 1\.215 |
| 71  | Jahanbakhsh    | Brighton       | 0                     | 5\.4  | 1\.2   |
| 287 | Torres         | Man City       | 1\.9                  | 6\.9  | 1\.161 |
| 80  | Mac Allister   | Brighton       | 0                     | 5\.3  | 1\.138 |
| 20  | Willock        | Arsenal        | 0\.1                  | 4\.8  | 1\.103 |
| 149 | Delph          | Everton        | 0                     | 4\.9  | 1\.079 |
| 229 | Pérez          | Leicester      | 0\.8                  | 6     | 1\.061 |
| 439 | Lanzini        | West Ham       | 0\.1                  | 6\.4  | 1\.019 |
| 495 | van de Beek    | Man Utd        | 1\.7                  | 6\.7  | 1\.011 |
| 105 | Jorginho       | Chelsea        | 6\.5                  | 5     | 0\.985 |
| 493 | Lemina         | Fulham         | 0\.3                  | 4\.5  | 0\.94  |
| 45  | El Ghazi       | Aston Villa    | 0\.1                  | 5\.7  | 0\.882 |
| 21  | Nelson         | Arsenal        | 0                     | 5\.2  | 0\.853 |
| 258 | Minamino       | Liverpool      | 0\.1                  | 6     | 0\.824 |
| 206 | Roberts        | Leeds          | 0\.1                  | 4\.8  | 0\.82  |
| 541 | Ünder          | Leicester      | 0\.1                  | 5\.9  | 0\.808 |
| 295 | Matic          | Man Utd        | 0\.2                  | 4\.8  | 0\.725 |
| 131 | McCarthy       | Crystal Palace | 1\.2                  | 4\.4  | 0\.694 |
| 436 | Yarmolenko     | West Ham       | 0\.1                  | 5\.6  | 0\.658 |
| 90  | Gudmundsson    | Burnley        | 0                     | 5\.4  | 0\.612 |
| 158 | André Gomes    | Everton        | 0\.3                  | 5\.4  | 0\.589 |
| 356 | Osborn         | Sheffield Utd  | 0                     | 4\.8  | 0\.578 |
| 507 | Fraser         | Newcastle      | 0\.2                  | 5\.6  | 0\.555 |
| 338 | Saint\-Maximin | Newcastle      | 4\.2                  | 5\.2  | 0\.498 |
| 587 | Benrahma       | West Ham       | 0\.2                  | 6     | 0\.473 |
| 79  | Alzate         | Brighton       | 0\.7                  | 4\.4  | 0\.459 |
| 567 | Partey         | Arsenal        | 0\.5                  | 5     | 0\.447 |
| 209 | Poveda\-Ocampo | Leeds          | 0\.4                  | 4\.4  | 0\.447 |
| 55  | Stephens       | Burnley        | 5\.3                  | 4\.3  | 0\.434 |
| 565 | Diallo         | Southampton    | 0                     | 4\.5  | 0\.355 |
| 515 | Vitinha        | Wolves         | 0                     | 4\.8  | 0\.338 |
| 154 | Bernard        | Everton        | 0\.1                  | 5\.8  | 0\.336 |
| 180 | Kebano         | Fulham         | 0                     | 4\.8  | 0\.333 |
| 535 | Benson         | Burnley        | 0                     | 4\.5  | 0\.307 |
| 394 | Alli           | Spurs          | 0\.6                  | 7\.4  | 0\.301 |
| 428 | Snodgrass      | West Ham       | 0\.1                  | 5\.7  | 0\.292 |
| 163 | Davies         | Everton        | 0\.1                  | 5\.3  | 0\.275 |
| 421 | Edwards        | West Brom      | 0                     | 4\.8  | 0\.275 |
| 311 | James          | Man Utd        | 0\.2                  | 6\.2  | 0\.204 |
| 124 | Gilmour        | Chelsea        | 0\.1                  | 4\.4  | 0\.196 |
| 44  | Nakamba        | Aston Villa    | 0\.4                  | 4\.3  | 0\.189 |
| 397 | Winks          | Spurs          | 0\.1                  | 5\.2  | 0\.167 |
| 550 | Molumby        | Brighton       | 0                     | 4\.5  | 0\.136 |
| 122 | Hudson\-Odoi   | Chelsea        | 0\.2                  | 5\.7  | 0\.113 |
| 554 | Ramsey         | Aston Villa    | 0\.1                  | 4\.5  | 0\.108 |
| 59  | Pröpper        | Brighton       | 0                     | 4\.8  | 0\.104 |
| 581 | Otasowie       | Wolves         | 0                     | 4\.5  | 0\.103 |
| 423 | Field          | West Brom      | 0                     | 4\.8  | 0\.102 |
| 410 | Grosicki       | West Brom      | 0                     | 5\.3  | 0\.091 |
| 72  | Izquierdo      | Brighton       | 0                     | 5\.5  | 0\.088 |
| 379 | Smallbone      | Southampton    | 0\.2                  | 4\.5  | 0\.087 |
| 553 | Shabani        | Wolves         | 0                     | 4\.5  | 0\.086 |
| 23  | Smith Rowe     | Arsenal        | 0\.2                  | 4\.4  | 0\.082 |
| 143 | Meyer          | Crystal Palace | 0                     | 4\.7  | 0\.074 |
| 551 | Goodridge      | Burnley        | 0                     | 4\.5  | 0\.071 |
| 426 | Harper         | West Brom      | 0\.5                  | 4\.4  | 0\.035 |

</div>

<script type="text/javascript">
$(document).ready( function () {
$(".embed-table > table").DataTable({"order": [[5, "desc"]], "pageLength": 12, "lengthMenu": [[12, 24, -1], [12,24,"All"]]});
});
</script>

For a second assume that we have wildcard enabled, and trying to pick 4 out of these 179 feasible midfields.
Under a budget of £28M, could you spot the best pick that will maximize your expected points (xP)?

The correct answer is:
> Salah (12.3M), Podence (5.4M), Raphinha (5.4M), Soucek (4.9M)

The total xP? It is 18.61.

Well, with a limited budget this is what we can do best.
I dare you to give it a try, but this is the true optimal solution under £28M.[^opt]

Somehow, it feels weird, right?
- Raphinha (5.4M) has an xP of 3.89, but only selected by only 0.5% of all managers.
- Rodríguez (7.7M) has an xP of 3.76, but selected by 22.2% of all managers.[^picks]

Total ownership ratio of these 4 players is 40%, with Salah dominating with 32.2% alone.

The picture changes as you would expect when we have more money to spare.

<div id="plot2"></div>

| Budget | Total xP | Players                                  |
|-------:|--------:|:---------------------------------------- |
| £24M   | 16\.783  | Jota, Ward\-Prowse, Podence, Raphinha    |
| £28M   | 18\.615  | Salah, Podence, Raphinha, Soucek         |
| £32M   | 20\.625  | Salah, Jota, Ward\-Prowse, Podence       |
| £36M   | 21\.795  | Salah, Aubameyang, Ward\-Prowse, Podence |
| £40M   | 22\.656  | Salah, Aubameyang, Son, Ward\-Prowse     |
| £44M   | 24\.090  | Salah, Mane, Aubameyang, Jota            |
| £48M   | 24\.375  | Salah, Mane, De Bruyne, Aubameyang       |

<script type="text/javascript">

var plot2_data = [
    {budget:24, xP:16.783, players:'Jota, Ward-Prowse, Podence, Raphinha'},
    {budget:28, xP:18.615, players:'Salah, Podence, Raphinha, Soucek'},
    {budget:32, xP:20.625, players:'Salah, Jota, Ward-Prowse, Podence'},
    {budget:36, xP:21.795, players:'Salah, Aubameyang, Ward-Prowse, Podence'},
    {budget:40, xP:22.656, players:'Salah, Aubameyang, Son, Ward-Prowse'},
    {budget:44, xP:24.090, players:'Salah, Mane, Aubameyang, Jota'},
    {budget:48, xP:24.375, players:'Salah, Mane, De Bruyne, Aubameyang'}
];

$(document).ready( function () {
	var div = d3.select("body").append("div")
    	.attr("class", "plot-tooltip")
    	.style("opacity", 0);
	let cnv = d3.select("#plot2")
		.append("svg")
		.attr('width', '480').attr('height', 350).attr('class', 'pull-center').style('display', 'block');
	let svg = cnv.append('g').attr('transform', 'translate(40,10)');
	svg.append('rect').attr('fill','#f1f1f1').attr('width', 400).attr('height', 300);
    var x = d3.scaleLinear().domain([22,50]).range([0, 400]);
    svg.append('g').attr('transform', 'translate(0,300)').call(d3.axisBottom(x));
    var y = d3.scaleLinear().domain([15, 25]).range([300,0]);
    svg.append('g').call(d3.axisLeft(y));
    svg.selectAll('xy').data(plot2_data).enter().append('circle')
    	.attr('cx', function(d){return x(d.budget); })
    	.attr('cy', function(d){return y(d.xP); })
    	.attr('r', 5)
    	.attr('fill', '#4e8d7c')
    	.on('mouseover', function(d,i) {
    		d3.select(this).transition().duration('100').attr('r', 8);
    		div.transition().duration(100).style("opacity", 1);
    		console.log(i);
    		div.html(i.players)
               .style("left", (d.pageX + 15) + "px")
               .style("top", (d.pageY - 10) + "px");
    	})
    	.on('mouseout', function(d,i) {
    		d3.select(this).transition().duration('100').attr('r', 5);
    		div.transition().duration(200).style("opacity", 0);
    	});
    svg.append("text")
    	.attr("text-anchor", "middle")
    	.attr("x", 200)
    	.attr("y", 335)
    	.text("Budget");
    svg.append("text")
    	.attr("text-anchor", "middle")
    	.attr("transform", "rotate(-90)")
    	.attr("y", -30)
    	.attr("x", -150)
    	.text("Total xP");
});
</script>

## Combining Math and Intuition

Analytics methods, including optimization, become powerful weapons at the hands of an expert.
If you have an intuition about a particular subject, say FPL, then running these kind of analysis can only make you a better manager.
Too often we have to simplify our decisions to "should I buy X and Y, or Z and W?" in the game.
There are too many options out there, and we are trying to reduce our options to 2 or 3 when giving a final decision.
Often, this is what happens when you are making other decisions, like buying a car or choosing a new phone, too.
Since it is much better to use the correct tool at correct task, **optimization can help us to find hidden insights**.

Let me go back to the original discussion.
What if there is something other managers know and you don't?

Suppose you are running an optimization already like I mentioned, but do not think Aubameyang is the right choice when you have only £36M to spend on 4 midfield players.
Why is that?
It is possible that you share the feelings of 91% of managers: perhaps other popular assets worth more in your opinion despite what numbers tell you.

It is indeed quite easy to involve the common belief of other 7 million FPL managers into your own optimization model.
The original objective was simply this:

<div>$$ \sum_{e \in E} \text{pick}_e \cdot \text{xP}_e $$</div>

Here, `E` is the set of all players (elements), `pick` is a binary value, either takes 1 or 0, depending on you do or do not have the player, respectively. `xP` is the expected points of players.
This sum gives you the total objective I have mentioned above.

Assume that you are playing against a single person (consider your mini league, for example).
You can calculate the points difference as

<div>$$ \sum_{e \in E} \text{pick}_e \cdot \text{xP}_e - \sum_{e \in E} \text{opp}_e \cdot \text{xP}_e$$</div>

In this one, denote `opp` as a binary multiplier whether your opponent has the player `e` or not.

For a second, assume all FPL managers are united against you!
Imagine them as single boss you need to defeat :)
The objective can now be written as

<div>$$ \sum_{e \in E} \text{pick}_e \cdot \text{xP}_e - \sum_{e \in E}(1-\text{pick}_e) \cdot \text{own}_e \cdot \text{xP}_e$$</div>

The second term here becomes how much you are being penalized compared to other players. Here, `own` is the percentage ownership of a player.
At the extreme, if no one has a particular player, then you cannot lose anything by not choosing him.
At the other extreme, if everyone has a player and you don't, you are going to be at a disadvantage as much as `xP` of that particular player.[^mo]

## Deciding strategy

The final piece of the puzzle is to re-running optimization model with this objective.
This means that the optimization algorithm will bring you closer to what is called **template** as much as possible.

Instead of running it directly, let us put a weight parameter for how much you believe other managers know the game.
- Weight=0 means that you don't value other manager's picks at all, so you have no faith on others.
- Weight=1 means that you value their opinions as much as your predictions for this week.
- A significantly higher value means you value their opinions more than your own predictions for the week.
You can play the GW really aggressive (weight=0) or really passive and safe (weight \>\> 1)[^neg]

Here is how the optimal solution changes:

<div id="plot3"></div>

<script type="text/javascript">
$(document).ready(function(){var t=80,e=25,a=40,n=40,r=650-n-e,o=750-t-a,d=d3.select("#plot3").append("svg").attr("width",r+n+e).attr("height",o+t+a).attr("class","pull-center").style("display","block").append("g").attr("transform","translate("+n+","+t+")");d3.csv("/data/ownership.csv",function(t){return{budget:+t.budget,ownership_penalty:+t.ownership_penalty,players:t.players,objective:+t.objective,total_price:+t.total_price,expected_points:+t.expected_points}}).then(function(t){var e=t.map(t=>t.ownership_penalty),a=t.map(t=>t.budget);console.log(e);let n=d3.scaleBand().range([0,r]).domain(e);n.padding(.05),d.append("g").style("font-size",15).attr("transform","translate(0,"+o+")").call(d3.axisBottom(n).tickSize(0)).select(".domain").remove();let i=d3.scaleBand().range([o,0]).domain(a);i.padding(.05),d.append("g").style("font-size",15).call(d3.axisLeft(i).tickSize(0)).select(".domain").remove();var l=d3.scaleSequential().interpolator(d3.interpolateMagma).domain([15,24]),s=d3.scaleLinear().domain([15,20]).interpolate(d3.interpolateHcl).range([d3.rgb("#FFFFFF"),d3.rgb("#000000"),d3.rgb("#FFFFFF")]),p=d3.select("body").append("div").style("opacity",0).attr("class","tooltip-p3").style("position","absolute").style("background-color","white").style("border","solid").style("border-width","2px").style("border-radius","5px").style("padding","5px");d.selectAll().data(t,function(t){return t}).enter().append("rect").attr("data-budget",function(t){return t.budget}).attr("data-weight",function(t){return t.ownership_penalty}).attr("x",function(t){return n(t.ownership_penalty)}).attr("y",function(t){return i(t.budget)}).attr("rx",4).attr("ry",4).attr("width",n.bandwidth()).attr("height",i.bandwidth()).style("fill",function(t){return l(t.expected_points)}).style("stroke-width",4).style("stroke","none").style("opacity",.8).on("mouseover",function(t){p.style("opacity",1),d3.select(this).style("stroke","black").style("opacity",1)}).on("mousemove",function(t){p.html("Budget: £"+t.target.dataset.budget+"M<br/>Weight: "+t.target.dataset.weight).style("left",t.pageX+25+"px").style("top",t.pageY+25+"px")}).on("mouseleave",function(t){p.style("opacity",0),d3.select(this).style("stroke","none").style("opacity",.8)}),e1=d.selectAll().data(t,function(t){return t}).enter().append("g").attr("transform",function(t){return"translate("+n(t.ownership_penalty)+","+i(t.budget)+")"}),e2=e1.append("text").attr("x",n.bandwidth()/2).attr("y",i.bandwidth()/2).attr("text-anchor","middle").attr("alignment-baseline","middle").attr("pointer-events","none").style("fill",function(t){return s(t.expected_points)}),e2.append("tspan").attr("dx",0).attr("dy","-1em").text(function(t){return t.expected_points}).attr("font-size","13pt"),e2.selectAll().data(function(t){return t.players.split(",")}).enter().append("tspan").attr("text-anchor","middle").attr("x",n.bandwidth()/2).attr("dy","1.2em").attr("font-size","8pt").text(function(t,e){return t})}),d.append("text").attr("x",0).attr("y",-50).attr("text-anchor","left").style("font-size","22px").text("Expected points for optimal 4 MF picks"),d.append("text").attr("x",0).attr("y",-20).attr("text-anchor","left").style("font-size","14px").style("fill","grey").style("max-width",400).text("Expected xP decreases if the budget goes down or the player follows the trend."),d.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",10-n).attr("x",-o/2).text("Budget (M)"),d.append("text").attr("text-anchor","middle").attr("y",o+35).attr("x",r/2).text("Ownership Penalty Weight")});
</script>

On the other side of the coin, our squad gets closer to the "template".
This means our decision is more "passive" as we will less likely to get affected by wild swings.

<div id="plot4"></div>

<script type="text/javascript">
$(document).ready(function(){var t=80,e=25,a=40,n=40,r=650-n-e,o=750-t-a,l=d3.select("#plot4").append("svg").attr("width",r+n+e).attr("height",o+t+a).attr("class","pull-center").style("display","block").append("g").attr("transform","translate("+n+","+t+")");d3.csv("/data/ownership.csv",function(t){return{budget:+t.budget,ownership_penalty:+t.ownership_penalty,players:t.players,objective:+t.objective,total_price:+t.total_price,expected_points:+t.expected_points,own_total:+t.own_total}}).then(function(t){var e=t.map(t=>t.ownership_penalty),a=t.map(t=>t.budget);console.log(e);let n=d3.scaleBand().range([0,r]).domain(e);n.padding(.05),l.append("g").style("font-size",15).attr("transform","translate(0,"+o+")").call(d3.axisBottom(n).tickSize(0)).select(".domain").remove();let i=d3.scaleBand().range([o,0]).domain(a);i.padding(.05),l.append("g").style("font-size",15).call(d3.axisLeft(i).tickSize(0)).select(".domain").remove();var d=d3.scaleSequential().interpolator(d3.interpolateMagma).domain([45,180]),s=d3.scaleLinear().domain([80,95]).interpolate(d3.interpolateHcl).range([d3.rgb("#FFFFFF"),d3.rgb("#000000"),d3.rgb("#FFFFFF")]),p=d3.select("body").append("div").style("opacity",0).attr("class","tooltip-p3").style("position","absolute").style("background-color","white").style("border","solid").style("border-width","2px").style("border-radius","5px").style("padding","5px");l.selectAll().data(t,function(t){return t}).enter().append("rect").attr("data-budget",function(t){return t.budget}).attr("data-weight",function(t){return t.ownership_penalty}).attr("x",function(t){return n(t.ownership_penalty)}).attr("y",function(t){return i(t.budget)}).attr("rx",4).attr("ry",4).attr("width",n.bandwidth()).attr("height",i.bandwidth()).style("fill",function(t){return d(t.own_total)}).style("stroke-width",4).style("stroke","none").style("opacity",.8).on("mouseover",function(t){p.style("opacity",1),d3.select(this).style("stroke","black").style("opacity",1)}).on("mousemove",function(t){p.html("Budget: £"+t.target.dataset.budget+"M<br/>Weight: "+t.target.dataset.weight).style("left",t.pageX+25+"px").style("top",t.pageY+25+"px")}).on("mouseleave",function(t){p.style("opacity",0),d3.select(this).style("stroke","none").style("opacity",.8)}),e1=l.selectAll().data(t,function(t){return t}).enter().append("g").attr("transform",function(t){return"translate("+n(t.ownership_penalty)+","+i(t.budget)+")"}),e2=e1.append("text").attr("x",n.bandwidth()/2).attr("y",i.bandwidth()/2).attr("text-anchor","middle").attr("alignment-baseline","middle").attr("pointer-events","none").style("fill",function(t){return s(t.own_total)}),e2.append("tspan").attr("dx",0).attr("dy","-1em").text(function(t){return t.own_total+"%"}).attr("font-size","13pt"),e2.selectAll().data(function(t){return t.players.split(",")}).enter().append("tspan").attr("text-anchor","middle").attr("x",n.bandwidth()/2).attr("dy","1.2em").attr("font-size","8pt").text(function(t,e){return t})}),l.append("text").attr("x",0).attr("y",-50).attr("text-anchor","left").style("font-size","22px").text("Ownership total for optimal 4 MF picks"),l.append("text").attr("x",0).attr("y",-20).attr("text-anchor","left").style("font-size","14px").style("fill","grey").style("max-width",400).text("Optimal picks get closer to common picks at the expense of xP."),l.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",10-n).attr("x",-o/2).text("Budget (M)"),l.append("text").attr("text-anchor","middle").attr("y",o+35).attr("x",r/2).text("Ownership Penalty Weight")});
</script>

Here, where your expertise should come into play.
Depending on your current rank, you might want to play it safe, and go for a moderate or very passive approach.
Instead of overall ownership, you can use ownership ratios of top 1000 players, or your FPL mini-league, depending on what you are trying to achieve.
If you are in need for a good jump in your rank, you can take the risk and pick the "differentials".
Of course if you fall, you might fall hard.

---

**If you are going to remember 2 things from this post, remember these:**
1. **Optimization is a great tool that you should have under your belt to gain an edge in FPL.**
2. **It is not surprising that more budget gives you more freedom, hence expected points. However, it is equally important to trust your own instincts. As you get closer to template, you are playing it safe, meaning that you will probably stuck with your current rank.**

## What's next?

While you are here, let me point out that I'm keeping a website for those wondering what is at the end of the spectrum.
"FPL Optimized" (as I call it) gives you the best 11 and squad picks for the week, purely on expected points from FPL Review, updated every day:

https://sertalpbilal.github.io/fpl_optimized/

A final note: Quite a bit number of FPL websites claim they do "optimization", but most of the time they are simplifying and approximating without actual mathematical optimization behind, as it tends to be computationally expensive.
If FPL community is interested, next time I can write about ways to run mathematical optimization on tools you commonly use, such as MS Excel or Python with open-source packages.

Until next time, I wish all of you luck!


[^1]: I'm reading Chris Anderson and David Sally's book "The Number Game" nowadays. It is a great book that I strongly suggest.
[^opt]: I have the optimization formulation available for this simple problem. Reach out to me if you are interested.
[^picks]: Of course Rodríguez's upcoming GW points are better, which could explain the higher pick rate. Still, 0.5% vs 22.2% is a huge difference.
[^mo]: Here, we are using what is known as multi-objective optimization. We are combining two different objectives into a single one.
[^neg]: You can also choose a negative weight, meaning that you think everyone is wrong! Might be a good way to differentiate your team from others actively.
High risk / high reward.