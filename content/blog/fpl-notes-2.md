+++
draft = false
title = "Notes from FPL Gameweek 2 and Optimization"
date = "2020-09-20T19:13:13-05:00"
tags = ["optimization", "analytics", "fpl", "fantasy-sports"]
categories = ["optimization"]
banner = "img/banners/fpl2.jpg"
bannercaption = "Photo by Mike from Pexels"
author = "Alp Cay"
+++

I am playing Fantasy Premier League this seasons for the first time and I can already tell you that it is frustrating, despite using a mathematical model.
Even though I put no manual input of my own (all decisions are up to the mathematical model), I am watching almost all EPL games to improve the model and I can say that it is very addictive.

Growing up, I never liked watching live sports that much.
Many people find football (soccer) very boring, and I always had similar ideas except big tournaments like World Cup or important games.
To be honest, I never expected FPL to change my view this much.
The pure enjoyment and excitement to see the outcome of my mathematical model is something else; it is strong enough to wake me up at 7 am on weekends to catch games between teams I have never watched before.
Amazing.

Ok, going back to FPL.
My model purely relies on the expected points from [fplreview.com massive data](https://fplreview.com/massive-data-planner/).
A common problem with bots that are playing FPL online is often choosing the team.
Most of the people seems to be stuck at setting up their lineup after spending so many hours on predicting the player points per game.
The answer is optimization.

I will explain my optimization model another time, but here are some of the notes from this week:

1. Instead of using McCarthy (SOU) as the goalkeeper, the model suggested using Ryan (BHA).
   This advice worked really well: McCarthy allowed 5 goals this week, while Ryan had a clean sheet (0 points versus 6 points).
2. My initial model (from GW1) suggested me to save the free transfer this week.
   However, Vinagre (WOL) did not play last week, so the model suggested tranferring out him for Ayling (LEE).
   Wolves will play their game tomorrow, but Ayling only brough 1 points to the team, so it was disappointing.
3. My captain for the week was Aubameyang (ARS) with only 5 points.
   Obviously 5 points was not enough to make a difference.
4. A bigger disappointment (for me) was Tottenham's terrific performance (and Bale is not even back).
   Kane and Son had 21 and 24 points, respectively. Neither were on my team.
   A colleague in our mini league captained the former and earned a whooping 42 points. From a single player... :(
   I am checking the expected points of Aubameyang and Kane before the deadline and it is 6.50 versus 4.96, respectively. Aubameyang was on my squad from last week, so even if I had a free transfer, the model was going to pick Aubameyang. Football is a low scoring game, so the numbers often do not tell the whole story, but at least I know that it picked it correctly, for the most part.
5. Allison's (LIV) penalty save was incredible and he also saved 9 points for me by defending his clean sheet.
   As a Liverpool fan I enjoyed it twice!

I observed 2 possible improvements.
I had both Werner (CHE) (due to an auto sub, since Wan-Bissaka (MUN) did not play) and 2 Liverpool defenders in my lineup.
This is obviously very counter intuitive. If Werner had scored, I was going to lose lots of points.
He only brought 2 base points for me.
Perhaps a better optimization model should consider the correlations between players, which I do not use for now.

The second possible improvement is regarding the formation.
My selected formation was 5-3-2.
Since Wan-Bissaka did not play, he is swapped with Werner, so the formation turned to 4-3-3.
The model should be mindful of the formation it plays, perhaps.

I am waiting to see Monday's game results, but all my players played their games and I scored 67 points this week.
I had 76 points last week thanks to Salah (LIV) who brought a total of 40 points for me.
In our mini league I got the third highest gameweek ponts (the top player got 73 and has 3 players to play on Monday).
My team is in second position overall for now, 6 points away from the top player (149 vs 143).

{{< img src="/img/uploads/league_gw2.png" class="lazy screenshot" caption="League Rankings as of GW 2" >}}
