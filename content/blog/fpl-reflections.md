+++ 
draft = false 
title = "Reflections from my first FPL season" 
date = "2021-07-25T22:00:00-04:00" 
tags = ["sports", "analytics", "fantasy sports", "FPL", "Fantasy Premier League"] 
categories = ["analytics"] 
banner = "/img/banners/field.png" 
bannercaption = "" 
author = "Alp Cay" 
js = ["https://d3js.org/d3.v6.min.js", "https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js"] 
+++ 

If you ask any Fantasy Premier League (FPL) player on Twitter about what word has been beaten to death last season, they'd likely respond with "optimal". 
I must admit that I played a part in starting or fuelling more than my fair share of these discussions... 

{{< tweet 1376578600854519808 >}} 

It might come as a suprise to some that I had never heard of FPL before August of 2020, just a week before I went on vacation. 
It's fair to say that my time off was spoiled (to a degree) after my dear colleague, Bas Belfi, challenged me in the upcoming FPL season with the aid of analytics. 
Like any sane person, I spent most of my time after that reading through rules, reviewing academic papers, and taking notes from every guide I came across on Reddit. 

My personal aim of beating Bas in FPL turned into something different when I realized optimization had a reputation in the community as a tool that wouldn't work well for FPL. 
Looking back, I understand people's skepticism towards "optimization"-like tools as there are many nuances to FPL that these tools tend to gloss over. 
Part of the problem of having a bad reputation was the overuse of the word "optimal" without giving any context or clearly describing model restrictions. 

## Modeling FPL 

FPL is a fantasy sports game, where every player creates a squad of 15 players from the Premier League that they manage for 38 gameweeks. 
It's not a difficult game by definition but playing from the perspective of a "bot" requires significant work. 

When people hear "model" in FPL, they immediately think of prediction models like those produced by FPLReview, Fantasy Football Fix, as well as individuals like Mikkel Tokvam. 
For this discussion, it's important to explain what I mean by "model" since there are several types of models. 
The models I mentioned above are called "predictive models", since they try to predict future performance. 
There is also another class of models called "prescriptive models" like optimization models which are used for generating decisions. 

An optimization model could consume any kind of predictive model in order to produce a clear set of decisions. 
This is what's mostly missing in FPL circles: optimization models. 
While there are certainly many bots attempting to play well in FPL, I never encountered anyone else discussing optimization when I started playing aside from seeing occasional posts about people using it for a week or two. 

## First few weeks 

I finished a basic model based on [FPLReview](https://fplreview.com)'s prediction data before GW1 (gameweek 1, AKA the start of the season), but I didn't have all the details due to limited time. 
My first GW in FPL went great! 
I was able to get 40 points from a single player (Salah as captain) and finished with 76 points. 
My rank was 475K out of over 6 million players. 
Over the following weeks I kept climbing ranks until GW5 and at which point I had reached 151K overall rank. 

I have to confess that after a few GWs I felt that FPL, after all, seemed like a relatively easy game. 
Everything was going smooth until I had to add a chip policy to my model, as I had no idea what to do with my chips. 
Chips are “benefits” you can use at certain moments during the game. There are different chips and each chip can only played once[^wildcard], so a specific strategy needs to be considered for it. 
Unfortunately, adding a premature chip policy logic forced me to use my WC (wildcard) chip by GW6. 
I received only 31 points in the GW that I used my first WC in... 
That was the GW I started to take things a bit more seriously as my competitive side had started to kick in. 

## Challenging the *status quo* 

Around this time, I started mentioning on Twitter how I was using optimization for FPL purposes. 
The first knee-jerk reaction you often get from people after mentioning the use of optimization models for FPL is "okay, but how did it perform?". 
This reaction is due in part to the exaggerated expectation that these models should be perfect, similar to the AlphaZero program playing chess. 
Measuring a model’s performance using realized points is the wrong way to look at things though. 
FPL is a noisy problem with huge variance so asking how an algorithm has performed after only a few weeks (or even after a single season) will result in a poor answer. 

If you are going to remember one thing from this post, it should be this: 

**Optimization models are approximations of real-life problems under measurable and controllable conditions to help the decision making process.** 

If a model can perfectly imitate the real-life problem, then you can apply its outcomes as-is. 
In order to reach that level of maturity, though, you need to iterate over infeasibilities and missing pieces. 
That's how I approach business problems in my work: you build a model, talk to the customer, identify model weaknesses, and find ways to improve it until the model can capture the essence of the problem. 
If for some reason it's not possible to create a perfect model, then you can use optimization as an intermediate step in the pipeline. 

We have some complicated problems in real life that require significant time to make the optimization model the best it can be. 
If you have been following my journey on Twitter, the first model I used at the beginning of the FPL season is unrecognizable from the one I ended up with by week 38. 
Week-by-week I added features such as: 

- Transfer policy (*by GW2*) 
- Chip usage (*by GW6*) 
- Multiple objectives for short-term vs long-term gains (*by GW17*) 

Along the way, I have got in touch with other players who are using optimization themselves, as well as others who are interested in hearing more about how optimization works and how I've applied it to FPL. 
I have certainly raised some awareness (or at least I hope) in the community about what optimization looks like in the real world. 
There is definitely a distaste towards "bots" playing FPL, which I understand. 
However, that doesn't give cause to just ignoring the fact that optimization can work well in FPL. 

## The good, the bad, & the ugly 

I spent the rest of last season furthering my understanding of how to apply optimization within FPL. 
I have built a few different models for it: 

- The base model that follows the MS thesis[^thesis] on the topic. 
- A *robust optimization model* to protect my rank against highly owned players. 
- A *multi-objective optimization model* to balance short-term (1 GW) and long-term (8 GWs) returns. 
- A *max-min optimization model* to maximize the lowest rated player on my team. 

Some of these models certainly worked better than others, but their shortcomings were not always readily apparent. 
The model I have used the most was the multi-objective model where I also benefited from visually seeing the [efficient frontier](https://en.wikipedia.org/wiki/Efficient_frontier). 

The good things about my initial season were that:  
1. I managed to beat my colleague Bas by 14 points, and I also won the Bots vs Bots mini-league by 3 points. 
2. I fully developed my model based on prediction data, which can work with multiple configurations. 
3. I met many fascinating people who are interested in analytics and sports. 
4. I saw people's perception of optimization and optimal play starting to change for the better. 
5. I learned more about the finer details of FPL, like dealing with DGWs (double gameweeks, where at least one team plays 2 games), the importance of carrying a positive budget ITB (in the bank) and rolling free transfers, and the impact of ownership ratios. 

<!-- {{< tweet 1396512449642254341 >}} --> 

{{< img src="/img/uploads/mini_league.jpg" figcls="img-responsive" class="lazy">}} 

Among other things, I also started collecting my Python scripts within a public repo, which I later turned into an open-source webpage under the [fploptimized.com](https://fploptimized.com) domain. 
In turn, this also led me to learn about GitHub actions, CI/CD operations, d3 library, and many more useful tools because of my newfound interest in FPL. 

{{< img src="/img/uploads/fpl_collage.jpg" caption="A collage of various visuals I have generated during last season" figcls="img-responsive" class="lazy">}} 

The bad part was dealing with fixture uncertainties. 
As if it was not enough that football itself is a low-scoring game with lots of variance, erratic changes (like the MUN-LIV game getting cancelled and COVID-19 postponements) caused many weird schedule changes that I was not prepared for. 

The ugly part was struggling to keep developing the models while having to submit decisions on a weekly basis. 
Some GWs I had no time to run the model closer to the deadline due to other responsibilities so I was forced to run models one day early and submit decisions based on it. 
I remember transferring out Rashford for a hit (points deduction) due to a possible injury, only for him to end up playing. 

## Now and future of optimization in FPL 

I feel like I contributed to the FPL community by further explaining what optimization does and advocating for how useful it was throughout the season. 
It wasn't my original purpose, but I enjoyed my transformation from a casual quantitative player to someone who applies optimization, writes about it, and creates tutorials for others to follow and learn from. 

Anyone can build a model that can capture, say, 80%-90% of the FPL planning optimization problem easily. 
I have made a few videos on this very topic that make it easy to get into things. 
(Link to [Python](https://youtube.com/playlist?list=PLrIyJJU8_viOags1yudB_wyafRuTNs1Ed) and [Excel](https://youtube.com/playlist?list=PLrIyJJU8_viOLw3BovPDx5QLKkCb8XOTp) playlist.) 

A closer-to-reality FPL model is unfortunately non-linear. 
Roughly, it means that the problem is difficult to solve perfectly. 
The non-linear nature of the problem comes from three sources as I can see: 
1. The probabilistic nature of player points. 
2. The probabilistic nature of players being in the starting line-up or on the bench. 
3. The auto-sub rules regarding valid formations. 

These are some of the things that still make FPL quite interesting for me, even after spending a full season playing it and dealing with *negative variance*. 

I believe the next logical step for me is to determine the best input parameters that I can use. 
For this purpose, I have organized a "re-optimization competition" to find good values for optimization parameters that a decision maker should control.[^hyperparameter] 
Basically, competitors submitted their belief of how certain actions should be valued which I ran through my optimization model for the entire season, using [FPLReview](https://fplreview.com) data. 
At the end, I saw what I was thinking: even following an oversimplified setting, you can score a great amount of points (2482 was the maximum among entries) by only using optimization. 
It might be a hard pill to swallow, but I think there is a silver lining. 

## Augmented Intelligence 

The ideal setting for FPL optimization is that it should be used by people who follow the news about players, understand the game to a certain extent, and are open to analytical approaches. 

Rather than dictating their decisions on gut feelings, optimization can provide them answers to complex questions that we cannot reach quickly. 
This human-centered concept is called *[Augmented Intelligence](https://www.gartner.com/en/information-technology/glossary/augmented-intelligence)* (aka Intelligence Amplification) where analytics enhance the decision making process of the user. 
Optimization can turn a good FPL player into a great one by highlighting the hidden information behind all the numbers and revealing solid moves for each GW. 

I believe we'll reach a point where thoroughly disregarding analytical methods will become a thing of the past. 

Currently, I'm working on an experiment where I will provide these types of practical insights to even the most seasoned FPL veterans. 
It will be an interesting exercise as it will give me the opportunity to peek into how successful managers think of possible player combinations while allowing them to to see what's hidden beneath the prediction data. 

## Closing note 

I truly enjoyed my first year of FPL and the opportunity to clarify many of the misconceptions towards optimization. 
I cannot wait until the new season starts on August 13 to collect more data in order to improve my analytical models, beat Bas (and others), and claim the SAS mini-league title (and maybe even win the goody bag myself or help others to win it)! 

I'm sure it will be a great year as I'll have a chance to apply my full model from the beginning, but this time using my experience from my first season to fine-tune certain things. 
My perception of FPL being too easy has certainly changed and it fuelled my addiction for building better tools for both myself and community. 

If you are wondering, I finished last season with 2315 points and a rank of 304,304. 
That is the benchmark for years to come for myself as it is the rank I achieved while only relying on an analytical model. 

{{< tweet 1396615571278532617 >}} 


[^hyperparameter]: Finding good input parameters for a black-box process (like optimization, or machine learning model) is called *Hyperparameter Optimization* and taking expert opinion is a good way to start tackling the problem. 
[^thesis]: https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2577003
[^wildcard]: The wildcard chip can be played twice during a season, but there are a specific set of gameweeks in which each wildcard can be played in. 

