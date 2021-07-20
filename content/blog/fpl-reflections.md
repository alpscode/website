+++
draft = false
title = "Reflections from my first FPL season"
date = "2021-07-20T09:00:00-04:00"
tags = ["sports", "analytics", "fantasy sports", "FPL", "Fantasy Premier League"]
categories = ["analytics"]
banner = "/img/banners/field.png"
bannercaption = ""
author = "Alp Cay"
js = ["https://d3js.org/d3.v6.min.js", "https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js"]
+++

If you ask someone from Fantasy Premier League (FPL) players on Twitter about the concept that had been discussed (almost too much), the answer will likely be "optimal".
I must admit that I played a part in starting or fueling some of these discussions...

{{< tweet 1376578600854519808 >}}

It might be surprising to hear that I had not played or even heard of FPL before August of 2020, just a week before my first vacation of that year.
It's fair to say that my vacation got ruined (to a degree) by reading rules, taking notes from guides on Reddit and academic papers to prove my dear colleague Bas Belfi that I could give him a run for his money just by using analytics.

My personal aim of beating Bas on FPL turned into something different when I realized optimization had a reputation in the community as a tool that wouldn't work for FPL.
Looking back, I understand people's skepticism towards "optimization"-like tools as there are lots of nuances to FPL that these do not capture.
Part of the problem (of having a bad reputation) was the overuse of the word "optimal" without giving a context or clearly describing model restrictions.

## Modeling FPL

FPL is a fantasy sports game, where every player creates a squad of 15 players among Premier League players and manages it for 38 game weeks.
It's not a difficult game by description but playing from a perspective of a "bot" requires significant work.

When people hear "model" in FPL, they immediately think of prediction models like the ones produced by FPLReview, Fantasy Football Fix, and Mikkel Tokvam.
It is better to separate what we mean by "model", and perhaps call such models "predictive models" because there are also "prescriptive models" like optimization models.

An optimization model would be consuming any kind of predictive model for producing a clear set of decisions.
This is what's mostly missing in FPL circles: optimization models.
There are certainly bots playing FPL but besides a few occasional posts about someone using optimization for a single week, I haven't seen anybody discussing about optimization when I first started playing.

## First few weeks

I finished a basic model based on [FPLReview](https://fplreview.com) prediction data before GW1 (gameweek 1, or in other words the start of the season), but I didn't have all the details due to limited time.
My first GW in FPL went great!
I was able to get 40 points from a single player (Salah as captain) and finished with 76 points.
My rank was 475K out of over 6 million players.
Then I kept climbing ranks until GW5 and reach 151K.

I have to confess that after a few GWs I felt that FPL, after all, seemed like an easy game.
Everything was going smooth until I had to add a chip policy to my model, as I had no idea what to do with my chips.
(Chips are ‘benefits’ you can use at certain moments during the game. There are different chips and each chip can only played once, so there a strategy needs to be considered for it.)
Adding a premature chip policy logic forced me to use my WC (wildcard) chip by GW6.
That GW I spent my first WC, I received only 31 points...
That was the GW I started to take things a bit more seriously, as I'm a competitive person.

## Challenging the *status quo*

Around this time, I started mentioning how I use optimization on Twitter for FPL purposes.
The first knee-jerk reaction you can get from someone by mentioning the optimization models for FPL is "but how did it perform?".
This reaction is mostly due to the exaggerated expectation that these models should be perfect, like AlphaZero playing chess.
Measuring a model performance using realized points is the wrong way to look at things though.
FPL is a noisy problem with huge variance; and asking how an algorithm has performed in only a few weeks (even after a season) might give you a biased answer.

If you are going to remember one thing from this post, it should be this one:

**Optimization models are approximations of real-life problems under measurable and controllable conditions to help decision making process.**

If a model can perfectly imitate the real-life problem, then you can apply its outcomes as-is.
In order to reach that level of maturity, though, you need to iterate over infeasibilities and missing pieces.
That's what we do for business problems: you build a model, talk to the customer, identify model weaknesses, and find ways to improve it until the model can capture the essence of the problem.
If for some reason it's not possible to create a perfect model, then you can use optimization as an intermediate step in the pipeline.

We have some complicated problems in real life that requires significant time to make the optimization model as best as it can be.
If you have been following me on Twitter, the first model I used at the beginning of the FPL season is unrecognizable from the one I ended up with by week 38.
Week-by-week I added things like:

- Transfer policy (*by GW2*)
- Chip usage (*by GW6*)
- Multiple objectives for short-term vs long-term gains (*by GW17*)

Along the way, I have got into touch with other players who are using optimization themselves, some other who are interested in hearing how optimization works and how I apply it to FPL.
We have certainly created some awareness in the community about what optimization is.
There is definitely a distaste towards "bots" playing FPL, which I understand.
However, ignoring the fact that optimization would work for FPL is probably not an optimal policy.

## The good, the bad, the ugly

I spent the rest of last season to develop my understanding of how to apply optimization in FPL.
I have built a few different models for it:

- The base model that follows the MS thesis[^thesis] on the topic
- A *robust optimization model* to protect my rank against highly owned players
- A *multi-objective optimization model* to balance short-term (1 GW) and long-term (8 GWs) returns
- A *max-min optimization model* to maximize the lowest rated player on my team.

Some of these models certainly worked better than others, but lines were not always clear.
The model I have used the most was the multi-objective model where I also benefited from visually seeing the [efficient frontier](https://en.wikipedia.org/wiki/Efficient_frontier).

The good things about the season are: 
1. I managed to beat my colleague Bas with 14 points, and also won the Bots vs Bots mini-league with only 3 points
2. I fully developed my model based on prediction data, which can work with multiple configurations
3. I met many people who are interested in analytics and sports
4. People's perception of optimization and optimal play started to change for the better
5. I learned more about finer details of FPL, like dealing with DGWs (double gameweeks, where at least a team plays 2 games), the importance of carrying positive ITB (in the bank, budget) and rolling free transfers, and impact of ownership ratios

{{< tweet 1396512449642254341 >}}

The bad part was dealing with fixture uncertainties.
As if it was not enough that football itself is a low-scoring game and has lots of variance, erratic changes (like the MUN-LIV game getting cancelled and COVID-19 postponements) caused lots of weird schedule changes that I was not prepared for.

The ugly part was struggling to keep developing the models while having to submit decisions on a weekly basis. 
Some GWs I had no time to run the model closer to the deadline due to other responsibilities so I had to run models 1 day early and submit decisions based on it.
I remember transferring out Rashford for a hit (points deduction) due to a possible injury, which turned out to be false.

## Now and future of optimization in FPL

I feel like I contributed to the FPL community by explaining what optimization does and how useful it is throughout the season.
It wasn't my original purpose, but I enjoyed my transformation from a casual quantitative player to a person who applies optimization, writes about it, and records tutorials on how others could follow.


Anyone can build a model that can capture, say, 80% of the FPL planning optimization problem easily.
I have produced tutorials on this very topic.
(Link to [Python](https://youtube.com/playlist?list=PLrIyJJU8_viOags1yudB_wyafRuTNs1Ed) and [Excel](https://youtube.com/playlist?list=PLrIyJJU8_viOLw3BovPDx5QLKkCb8XOTp) playlist.)

A closer-to-reality FPL model is unfortunately non-linear.
Roughly, it means that the problem is difficult to solve perfectly.
Non-linear nature of the problem comes from three sources as I can see:
- Probabilistic nature of player points
- Probabilities nature of players starting in 11 or substitution,
- Auto-sub rules regarding valid formations

This is probably one of the things that makes FPL quite interesting for me, even after spending a full season and dealing with *negative variance*.

I believe the next logical step for me is to determine input parameters that I can use.
For this purpose, I have organized a "re-optimization competition" to find good values for optimization parameters that a decision maker should control.[^hyperparameter]
Basically, competitors submitted their belief of how certain actions should be valued, and I ran the optimization model for the entire season from the beginning, using [FPLReview](https://fplreview.com) data.
At the end, I have seen what I was thinking: even under an oversimplified setting, you can reach great points (2482 was max among entries) by only using optimization.
It might be a hard pill to swallow, but I think there is a silver lining.

## Augmented Intelligence

The ideal setting for FPL optimization is that it should be used by people who follow the news about players, understand the game to a certain degree and are open to analytical approaches.

Rather than dictating their decisions, optimization should provide them answers to complex questions we cannot calculate quickly.
This human-centered concept is called *[Augmented Intelligence](https://www.gartner.com/en/information-technology/glossary/augmented-intelligence)* (aka Intelligence Amplification) where analytics enhance the decision making process of the user.
Optimization can turn a good FPL player into a great one by highlighting the hidden information behind all the numbers and showing the solid moves for each GW.

I believe a time will come where not using any kind of analytical methods will be a novelty.

I'm working on an experiment where I will provide this kind of insights to a veteran FPL player.
It will be an interesting exercise as I will have a chance to peek into how a successful player thinks of possible combination of players, and the player will have a chance to see what's hidden under prediction data.

## Closing Note

I truly enjoyed my first year of FPL and the crusade against clarifying the misconception towards optimization.
I cannot wait until the new season starts (on August 13) to collect more data to improve my analytical models, beat Bas (and others) and claim the SAS mini-league title (and maybe win the goody bag)!

I'm sure it will be a great year, as I will have a chance to applying my full model from the beginning, but this time using my experience from the first season to manually control some knobs.
My perception of FPL being too easy has certainly changed and it fueled my addiction for building better tools for it.

If you are wondering, I have finished last season with 2315 points and a rank of 304,304.
That is the benchmark for years to come for myself, as the rank I have achieved with only relying on an analytical model.

{{< tweet 1396615571278532617 >}}


[^hyperparameter]: Finding good input parameters for a black-box process (like optimization, or machine learning model) is called *Hyperparameter Optimization* and taking expert opinion is a good way to start tackling the problem.
[^thesis]: https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2577003

