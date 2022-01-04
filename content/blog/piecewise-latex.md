+++
draft = false
title = "Plotting a piecewise function graph in LaTeX"
date = "2019-03-15T14:09:55-04:00"
tags = ["LaTeX", "Math"]
categories = ["Quick-tip"]
banner = "img/banners/graph.jpg"
bannercaption = "Photo by Lukas from Pexels"
author = "Sertalp B. Cay"
+++

I absolutely adore LaTeX generated documents and personally use it pretty much for anything I can.
Plotting graphs is one of my favorite thing to do.
TikZ library makes it quite easy.

To plot a piecewise function, I happened to learn about `\tikzmath` which I have never used before.
Using it, you can define values and also perform math operations.
I used this approach to set values and plot the graph dynamically.
This approach saved me quite some to fine tune the graph in the long run.

Here's the LaTeX code:

{{< highlight latex >}}
\begin{tikzpicture}
% Definitions
\tikzmath{
\r1 = 4;
\r2 = 3;
\r3 = 2;
\q1 = 5;
\q2 = 10;
\q3 = 20;
\x1 = \q1; \y1 = \r1*\q1;
\x2 = \q2; \y2 =\r2 * \q2;
\x3 = \q3; \y3 = \r3 * \q3;
 } 
% Axis
\begin{axis}[
axis x line=middle,
axis y line=middle,
ylabel=Total Price,
xlabel=Quantity,
xtick={0,\x1,\x2,\x3},
xticklabels={0,$q_1$, $q_2$, $q_3$,{ }},
xlabel near ticks,
ytick={0, \y1, \y2, \y3},
yticklabels={0,$p_1$, $p_2$, $p_3$},
ylabel near ticks,
xmax=\x3+5,
ymax=\y3+5,
xmin=0,
ymin=0
]
% Plots
\addplot[domain=0:\q1] {\r1*x};
\addplot[domain=\q1:\q2] {\r2*x};
\addplot[domain=\q2:\q3] {\r3*x};
\draw[dotted] (axis cs:\x1,\y1) -- (axis cs:\x1, 0);
\draw[dotted] (axis cs:\x2,\y2) -- (axis cs:\x2, 0);
\draw[dotted] (axis cs:\x3,\y3) -- (axis cs:\x3, 0);
\draw[dotted] (axis cs:\x1,\y1) -- (axis cs:0, \y1);
\draw[dotted] (axis cs:\x2,\y2) -- (axis cs:0, \y2);
\draw[dotted] (axis cs:\x3,\y3) -- (axis cs:0, \y3);
\addplot[only marks,mark=*] coordinates{(0,0)(\q1,\r2*\q1)(\q2,\r3*\q2)};
\addplot[fill=white,only marks,mark=*] coordinates{(\x1,\y1)(\x2,\y2)(\x3,\y3)};
\end{axis}
\end{tikzpicture}
{{< /highlight >}}

The first part `tikzmath` is for declaration.
When we start `axis` we first set properties (such as axis labels).
Finally, you can use pre-defined values inside pretty much anything: `\addplot`, `\draw`, `coordinates`, ...

Here's the final result:

{{< img src="/img/ss/piecewise.png" class="lazy screenshot" caption="Piecewise function at LaTeX using \tikzmath" >}}

To make this work, include `\usetikzlibrary{math}` in your code after imports.

See my [.tex file at GitHub](https://github.com/alpscode/notebooks/blob/master/piecewise-function/piecewise.tex) for a minimal working example.

Inspired by [this answer](https://tex.stackexchange.com/a/76438/56459) at TeX StackExchange.
