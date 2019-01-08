+++
draft = false
title = "How to use Reddit API"
date = "2018-12-17T23:28:00-05:00"
tags = ["How-to", "Reddit", "API", "Python"]
categories = ["Programming"]
banner = "img/banners/reddit-1.jpeg"
bannercaption = "Photo by JESHOOTS.com from Pexels"
author = "Alp Cay"
+++

One of the most valuable things I learned in recent years was learning how to use Public APIs to develop tools.
An API (Application program interface) is a set of tools to communicate with another service.
Learning how to use APIs is very valuable for web applications, but beyond that it is a useful skill to expand your horizon.
Once you get the hang of it, there is endless possibilities what you can do with it.

The best way to learn something is actually trying it.
Following this wisdom, we will develop a Reddit bot but I will split the blog posts into smaller, easier pieces.
The whole point of this very first post is to understand how Reddit API works and how to get started.

## Setup

Before I start doing any of the work, I would like to describe what I will use here.
I will be doing the actual work on Python, since it is a great language for writing scripts and prototyping.
At the end, I will share a Jupyter Notebook link if you would like to clone and use.

## Creating an app

Almost all public APIs requires registration.
This is partly due to tracking the usage and preventing users to abuse available resources.

Reddit's registration is at this address after signing in: https://old.reddit.com/prefs/apps/

{{< img src="/img/uploads/reddit-api-1.gif" class="lazy screenshot" caption="Registering an app to use Reddit API" >}}

In this page, I only fill name `puppy-parser` app type `script` and redirect uri `http://localhost:8080`.
Since my script will be working locally, I don't need a redirect uri, but redirecting to `localhost` will work fine for our purposes.

After submitting the app details, we get a public key (right under the app name) and a secret key.
This key pair is required to use the Reddit API.
Based on which type of app you request, you may not get a secret key.
The secret key, as the name suggests, should be secret.
Only the user can hold on to this, as it will give access to the API itself.

## Getting an access token

{{< img src="/img/uploads/padlock.jpg" class="lazy" caption="Access tokens are required to access Reddit API" figcls="pull-right" >}}

Reddit API requires users to obtain an access token before making queries.
This token will tell the API server that we have authorization to reach information.
Reddit (as of writing this post) uses OAuth2 authorization framework.
It is very easy to use and I will demonstrate how to do it here.

The official Reddit API documentation is at https://old.reddit.com/dev/api/

Simply put, I will pass my Reddit username, password, app id and app secret to generate a token.
This token will be user for the rest of our requests.

In Python, using the `requests` package (install it with `pip install requests` if you get an error) you can request an access token as follows:

{{< highlight python3 >}}
import requests
base_url = 'https://www.reddit.com/'
data = {'grant_type': 'password', 'username': REDDIT-USERNAME, 'password': REDDIT-PASSWORD}
auth = requests.auth.HTTPBasicAuth(APP-ID, APP-SECRET)
r = requests.post(base_url + 'api/v1/access_token',
                  data=data,
                  headers={'user-agent': 'APP-NAME by REDDIT-USERNAME'},
		  auth=auth)
d = r.json()
{{< /highlight >}}

At the end of this request the dictionary `d` should have a similar output to this one:
```
{'access_token': '216912536673-vRVst4XgHf8SaYQrGlfWEd8zAOo', 'token_type': 'bearer', 'expires_in': 3600, 'scope': '*'}
```

After obtaining the token, API requests should be made to `https://oauth.reddit.com` instead of `https://www.reddit.com`.
Let's see how we can access the user information:

{{< highlight python3 >}}
token = 'bearer ' + d['access_token']

base_url = 'https://oauth.reddit.com'

headers = {'Authorization': token, 'User-Agent': 'APP-NAME by REDDIT-USERNAME'}
response = requests.get(base_url + '/api/v1/me', headers=headers)

if response.status_code == 200:
    print(response.json()['name'], response.json()['comment_karma'])
{{< /highlight >}}

```
alpscode 0
```

It worked! Two things to note here:

  1. Instead of passing our password every time, only thing we need to use is the authentication token.
  2. We add `bearer` in front of the token as a requirement. This is a common practice.

You may have noticed earlier that each auth token expires after a while.
The token is only valid for 1 hour.
When it expires, we need to request a new token.
Tracking the status code of the request helps to identify when the token expires.


{{< highlight python3 >}}
print(r.status_code)
{{< /highlight >}}

```
200
```

If the status_code is not `200` (which corresponds to `OK` in [HTTP Response Codes](https://www.restapitutorial.com/httpstatuscodes.html)), then the token needs to be refreshed.
An invalid token will return `401` (Unauthorized) error code.

## Playing with the API

Perhaps the best way to learn the API is to play with it.
Reddit's API documentation has almost everything there is to know.

Let us try to search for a keyword and list the obtained subreddits.
The API says the url is `subreddits/search` with a few parameters.
We will put `puppies` for the query string, and also a limit of 5 subreddits and sort by relevance.

{{< img src="/img/ss/reddit-2.png" class="lazy screenshot" caption="Reddit API inserted as a Python HTTP request" >}}

{{< highlight python3 >}}
payload = {'q': 'puppies', 'limit': 5, 'sort': 'relevance'}
response = requests.get(api_url + '/subreddits/search', headers=headers, params=payload)
print(response.status_code)
{{< /highlight >}}

The very first thing you need to check is always whether the request type is `GET` or `POST`.
Then, check the url.
Remember that the url is always added at the end of the base url, which is `https://oauth.reddit.com` in our case.
Last, pass the parameters as a Python dictionary.
You can see that the response code is 200, which means the query is alright.
Let's see the content.

In a typical API request, we can get the reply as a JSON object.
There are various types, but JSON is almost an industry standard nowadays.
Grab the content as follows:

{{< highlight python3 >}}
values = response.json()
{{< /highlight >}}

As far as JSON response of Reddit API is concerned, the response dictionary is usually very loaded.
The first thing you can check is the dictionary keys.
After the keys, we can grab the piece we want, and move progressively.
An easy way if you are using a new request is to print the content using
{{< highlight python3 >}}
print(response.text)
{{< /highlight >}}
and copy it to https://jsonviewer.stack.hu.

{{< img src="/img/ss/reddit-3.png" class="lazy screenshot" caption="An easy way to see the JSON content is to use JSON Viewer" >}}

We will see the details later, but we can print the list of subreddits as follows:

{{< highlight python3 >}}
for i in range(len(values['data']['children'])):
    print(values['data']['children'][i]['data']['display_name'])
{{< /highlight >}}

```
puppies
aww
dogpictures
corgi
lookatmydog
```

You can find all the codes in my [Jupyter notebook repository](https://nbviewer.jupyter.org/github/alpscode/notebooks/blob/master/reddit-api/RedditAPI-1.ipynb).

## Next steps

In the following post, we will create a Python script to parse posts from certain subreddits and show them as a gallery.
For this step, we will investigate the Reddit API documentation in more detail and also create a simple web page.

## Resources

  - [API overview](https://github.com/reddit-archive/reddit/wiki/API)
  - [API documentation](https://www.reddit.com/dev/api)
  - [OAUth2 details](https://github.com/reddit-archive/reddit/wiki/OAuth2)
  - [Quick Start example](https://github.com/reddit-archive/reddit/wiki/OAuth2-Quick-Start-Example)
