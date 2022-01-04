+++
draft = false
title = "What to do for a better password security and management"
date = "2019-01-27T21:22:45-05:00"
tags = ["Security", "Python", "Script"]
categories = ["Quick-tip"]
banner = "/img/banners/lock.jpeg"
bannercaption = "Photo by Pexels"
author = "Sertalp B. Cay"
+++

> "I don't know that much about cyber, but I do think that's the number one problem with mankind."
> 
> Warren Buffett


We should be talking about password safety after [773 million records exposed][Col1].

I'm one of those people who complain when IT forces to change passwords at regular intervals.
It is a nightmare for me to come up with secure passwords and even when I can, I have a hard time remembering them.
So, believe me when I say that I know the struggle of dealing with passwords.
My colleagues are the same.
Last week one of my colleagues was saying that "Ah damn, I got that password change notification again".
Passwords are unfortunately a burden we need to carry, an artifact of the technology.

I take password security seriously and recently made some changes on how I manage them.
Here, I will a few steps that I have followed for a better password security and management:

1.  Reviewed which accounts have already been exposed
2.  Identified insecure passwords and replaced them with safer alternatives
3.  Came up with a better password management system and sticked to it

## Accounts

Every now and then we hear that personal information of thousands of people got exposed.
Companies tend to announce this stuff pretty late.
God knows how many of these leaks goes unreported.
They try to hide it (or give a false sense of security) by stating that the sensitive information were hashed.
I have no faith in companies for handling these kinds of leaks.
I remember Experian's help site was [limiting our right to a class-action lawsuit][EX] after the big breach.

Deep down we all know that it is only a matter of time until someone hacks into our accounts.
A few weeks ago my Rockstar account got breached and I still couldn't get it back[^1].
I'm glad that it is only a gaming account without any payment information in it, but it could have been worse.

I hate being the bearer of the bad news but "[you have almost certainly been hacked][NW]".
Even companies spending millions of dollars into security gets hacked.
So, there we go.
We all get hacked.

Account security is only a piece of the puzzle, but it is a piece that we can control.
[*HaveIBeenPwned*][HIBP] is an awesome resource to learn if an email has ever been found in one of the data breaches.

{{< img src="/img/ss/pwned.png" >}}

*HaveIBeenPwned* also shows a list of leaks where the email/account is exposed.
I urge everyone to give it a try.
My personal email have been found on 11 breached sites and 1 paste (dump).
Learning about which accounts got compromised brings the second step.
Yes, passwords.

## Passwords

It is obvious that passwords like *123456, qwerty, password* are not safe.
If a password is combination of common words then there is a big risk.
The danger of using these passwords is the key of understanding why leaks are dangerous:
Even if passwords are hashed, a common password can be detected within blink of an eye.
The problem only gets worse when reusing the same password in other websites.
Using the same password increases risk, and chance of getting hacked one day.

So there are two types of problems: weak passwords, and repeated usage.

The creator of the *HaveIBeenPwned*, Troy Hunt, says:

> "In other words, 86% of subscribers were using passwords already leaked in other data breaches and available to attackers in plain text."[^2]

This is terrible news.
The solution to the problem is this: Use a unique strong password.
There is no way around it.
There will be always new leaks, hashed passwords will be exposed.

### Figuring out exposed passwords

It is difficult to find out which one of your passwords have been compromised.
*HaveIBeenPwned* has a tool called [Pwned Passwords][PP].
It shows if a specific password appears in any of the data breaches they cover.
It does not have to be your password, if it is exposed do not use it.

I learned a while ago that, Chrome provides a way to download all stored passwords.
I still remember my amazement seeing that it was very easy to download my passwords in a plain CSV file.
Here's how to do it:

- Go to `chrome://settings/passwords`. 
- Click three dots on the right side and click Export Passwords...

{{< img src="/img/ss/export_passwords.png" class="screenshot" >}}

That's it.
Chrome asks the current user's password and asks for a place the file.
I urge against putting it on a shared folder, like a Dropbox folder, USB, or network drive.
Once I had the file, I filtered by email address and checked where I have used my regular passwords.
The result shocked me.
I was using the same email and "safe" password combination on **more than 150 websites**.
That's insane.
Following this, I have started changing my passwords.
I changed 20 passwords every weekend and to be honest still working on it whenever I find time.

For those who are using Firefox, there is ways to export passwords on JSON format.
See [FF Password Exporter][FFP].

When I first started changing passwords, I faced with the real question:
How to choose unique and strong passwords?

## Password Management

There are a few ways to manage passwords.
It is virtually impossible to come up with "secure" password.
Any password can be broken with enough time and correct algorithm.
Yet, it is possible to reduce the potential risk.

A few criteria to keep in mind:

- Longer passwords are better
- Unique passwords reduce the damage in case of a breach
- Combination of lowercase and uppercase letters, signs, and numbers are better

My options for manaing my passwords were these:

**Trusting my memory**

People tend to trust into their memories to remember passwords.
But there is only so much passwords we can remember.
It's not realistic to come up with a safe way to remember passwords.

**Keeping them in piece of paper**

I don't need to even say this, but it sounds like an invitation to disaster.
It is possible to lose all passwords at once.
Even I keep it in a safe place, the main problem here is that, this method is not convenient.
When convenience is out of window, it's hard to stick to.

**Saving them in an Excel sheet**

Ok, keeping passwords on my PC makes a little bit sense to me, but we can do better.
This is a reasonable approach as long as you can use a *safe* password to protect it.

**Using my browser**

This was my main method before.
Auto-fill feature is  very convenient but my feelings have changed when I learned [it can be exploited][CHR].
I have no problem with Google Smart Lock except maybe giving all my passwords to Google.
Chrome also syncs all your passwords, so I was able to use my passwords at home and at work easily.

**Using an online password manager**

This is a thing that many people swear by.
LastPass, Dashlane, and 1Password are some of the managers that comes to mind.
I have tried LastPass and Dashlane in past, but to be honest I didn't feel secure when I used them.
Security experts recommends these tools, but as a paranoid person, I don't feel comfortable sharing my passwords with a 3rd party.
Not for me, but give it a try if you don't want to give up the convenience of storing everything in your browser.

**Using a local password manager**

Ok, here we are.
I cannot recommend using [KeePass][KPas] enough.
First of all, keeping passwords by myself is awesome.
Second, customization is good enough to make it convenient.
My setup requires me to enter my master password when I log on to my PC and locks itself if not used for more than 30 minutes.
With this way, I can only open it when I need to login somewhere and keep it closed for the rest of my session.
I currently store my KeePass database on cloud and can use my passwords everywhere.
I recommend [Kee][] plugin if you are using Chrome or Vivaldi.

{{< img src="/img/ss/keepass.png" class="screenshot" >}}

The real advantage of using a password manager is here:
It can generate you a safer password.
This is almost a standard feature nowadays.
KeePass handles is quite well, I was able to choose what to include in a random password.
The Kee extension even shows you the option of generating one when you right click on a field.

## 2-Factor

Something I need to mention right here is 2-Factor Authentication (2FA).
2FA binds your account to a device of your choice which needs to be present when you are logging in.
I'm sure everyone has heard and used it at one point, but it is becoming an industry standard.
Especially while changing passwords, it's a good practice to see if the website offers 2FA.
It makes security much much better.

There are some really nice apps.
*Authy* is a trending 2FA app although I have never used it.
Google's Authenticator is a popular choice, although it doesn't have a desktop version like Authy.
I heard that there are 2FA apps with hardware, [feel free to check alternatives](https://www.cloudwards.net/best-2fa-apps/).

# TL;DR

- Password management is important, something you need to handle right now.
- Check *[HaveIBeenPwned][HIBP]* to see if your email address is exposed.
- Check *[Pwned Passwords][PP]* to see if your passwords are ever exposed.
- Start using a password manager like [KeePass][KPas].
- Replace your passwords with random one generated by your password manager.
- Enable 2FA everywhere, use a 2FA app like [Authy][AU], Authenticator or [Yubikey][YB].

In a follow-up blog post, I will show how to automate some of these steps using Python.


[Col1]: https://www.wired.com/story/collection-one-breach-email-accounts-passwords/ "Wired's story on the issue"
[NW]:   https://theweek.com/articles/730439/have-almost-certainly-been-hacked
[HIBP]: https://haveibeenpwned.com/
[PP]:   https://haveibeenpwned.com/Passwords
[FFP]:  https://github.com/kspearrin/ff-password-exporter
[KPas]: https://keepass.info/
[Kee]:  https://www.kee.pm/
[AU]:   https://authy.com/
[CHR]:  https://gizmodo.com/autofill-on-chrome-and-safari-can-give-hackers-access-t-1791030208
[EX]:   https://www.businessinsider.com/equifax-help-site-mandatory-arbitration-clause-waive-right-to-class-action-lawsuit-2017-9
[YB]:   https://www.yubico.com/products/yubikey-hardware/
[^1]:   I keep responsible myself for a weak password, but I mostly blame Rockstar.
        They don't send a link to your current email to verify changing the email address on your account.
        Anyone who happened to log in to your account can steal it very easily, which is madness.
        Moreover, their support website doesn't work, which adds insult to the injury.
[^2]:   Troy Hunt is the guru to follow for these topics.
        See the aformentioned post at [here](https://www.troyhunt.com/86-of-passwords-are-terrible-and-other-statistics/).