+++
draft = false
title = "Using Linux on Windows"
date = "2019-01-05T14:30:04-05:00"
tags = ["Linux", "How-to"]
categories = ["Quick tip"]
banner = "/img/banners/gear.jpeg"
bannercaption = "Photo by Shane Aldendorff from Pexels"
author = "Alp Cay"
+++

Linux is arguably the most developer-friendly operating system.
From automation to feature-rich text editors, I see Linux as a must for any programmer.
Powerful and hackable Linux ecosystem and the huge community make finding solutions to common problems very trivial.

If you need to use Windows for a variety of reasons, you are not out of options when it comes to using Linux.
Over the years, I have tried a lot of different ways to enable Linux functionality on Windows, some are better than others but all of them have specific use cases.
Windows 10 started supporting Linux subsystem natively a while ago which is called Windows Subsystem for Linux (WSL).
WSL basically enables you to run Linux executables on Windows 10, natively.
In this blog post, I will show how you can enable the Linux subsystem support on Windows 10, install Ubuntu and do some customization without an arm and a leg.

## Alternatives

Before I start, let me point out two different methods that you can use instead of WSL.

- *Cygwin* is a tool that provides Linux-like functionalities on Windows.
  It is an emulator hence there are lots of restrictions, but it is my to-go choice for basic Linux functionalities.
- *VirtualBox*, *VMWare Workstation* and similar programs help you to run a guest operating system on your machine (host).
  They often provide more functionalities than other alternatives, since you actually run an actual OS on your machine.
  For example, you can easily use a graphical user interface with them or make them boot with your system.
  I use VirtualBox for my home server (TeamSpeak, Dokuwiki, etc..) for quite some time and am very happy with its reliability so far.
  But I find WSL to be enough for most of my programming work.

The real advantage of using WSL is to access Linux functionality without paying the cost of hosting a full OS which uses lots of resources to make it happen.

## Installing Windows Subsystem for Linux

Installing WSL is very, very easy.

Right-click on Windows Start button and choose `Windows PowerShell (Admin)`.

{{< img src="/img/ss/powershell.png" class="lazy screenshot" caption="Start PowerShell as an Admin" figcls="img-responsive" >}}

In PowerShell, simply run the following command:

{{< highlight posh >}}
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
{{< /highlight >}}

{{< img src="/img/ss/wsl1.png" class="lazy screenshot" figcls="img-responsive" >}}

Voila! You have enabled WSL on your system.
You may need to restart your PC at this point.

Now, it's time to install a Linux version.

## Installing Linux Distributions

You can download Ubuntu from Microsoft Store.
Simply type `Microsoft Store` on your Start Menu and search for the Linux distribution of your choice such as [Ubuntu](https://www.microsoft.com/store/productId/9NBLGGH4MSV6).

If you prefer command line, use PowerShell in admin mode and run the following code.
This command will download the Ubuntu from Microsoft Store and then run the installer.

{{< highlight posh >}}
Invoke-WebRequest -Uri https://aka.ms/wsl-ubuntu-1804 -OutFile Linux.appx -UseBasicParsing; .\Linux.appx
{{< /highlight >}}

{{< img src="/img/ss/wsl2.png" class="lazy screenshot" figcls="img-responsive" >}}

Replace `-Uri` parameter with Linux distribution of your choice.
A list of Linux distros are available at [Microsoft's website](https://docs.microsoft.com/en-us/windows/wsl/install-manual#downloading-distros).
Here is a list of available distros as of writing this post:

Distro           | Link
-----------------|---------------------------------------
Ubuntu 18.04     | https://aka.ms/wsl-ubuntu-1804
Ubuntu 18.04 ARM | https://aka.ms/wsl-ubuntu-1804-arm
Ubuntu 16.04     | https://aka.ms/wsl-ubuntu-1604
Debian GNU/Linux | https://aka.ms/wsl-debian-gnulinux
Kali Linux       | https://aka.ms/wsl-kali-linux
OpenSUSE         | https://aka.ms/wsl-opensuse-42
SLES             | https://aka.ms/wsl-sles-12

You will instantly see the Linux console opens after the installation.
It will ask you for a username and a password.
Linux console will open with this default username from now on.
The password is only asked when you want to perform an admin (sudo) command.

Now you should have a Linux terminal on your Windows machine.
How cool is that?
Before you dive into the Linux ocean, I have some quick tips for you below.

## Tips and further settings

I have installed Ubuntu on my machine, so some of the settings might differ if you are using a different distro.

After the installation, you should be able to search Ubuntu on your Start Menu and see the icon.

{{< img src="/img/ss/ubuntu.png" class="lazy screenshot" caption="Ubuntu icon on Windows Start Menu" figcls="img-responsive" >}}

### Terminal colors

Probably the most difficult step you will face today is changing the terminal colors.
Default terminal colors are just.. ugly.
Changing them to popular choices like Solarized, Monokai, or default Ubuntu terminal colors requires some heavy lifting.

James Garijo-Garde [wrote about changing WSL colors to default Ubuntu colors](https://medium.com/@jgarijogarde/make-bash-on-ubuntu-on-windows-10-look-like-the-ubuntu-terminal-f7566008c5c2).
You essentially need to change 16 colors on the `Properties` menu one by one.

If you want, you can use a Regedit file to import colors at once to your Registry.
The tricky part is that your Ubuntu might be at a different location.
Therefore, you need to change a setting to create a Registry entry, and use the name of the console.
Here are the four steps you need to follow:

1. Go to `Properties` menu, `Colors` tab and change a single color --does not matter which one-- and save it.
   <br/>(This step will make sure that you have a Registry entry for the console)
2. Run the .reg file (link to the repository is below).
3. Go to Registry Editor (Windows + R, `regedit`) and navigate to `HKEY_CURRENT_USER\Console`
4. Copy name of your Ubuntu editor, delete the entry, and replace the name `ReplaceNameWithUbuntu` with the name you copied.

See the gif below:

{{< img src="/img/uploads/ubuntu-colors.gif" class="lazy screenshot" caption="Changing the terminal colors via Registry" figcls="img-responsive" >}}

[Registry file](https://github.com/alpscode/notebooks/blob/master/linux-on-windows/UbuntuColors.reg) is on my Github repository.

### Disabling the bell (beep) on Linux

Tab completion beep on Linux terminal is one of the most annoying sound known to humankind.
Although it serves a purpose, you may soon get irritated during long working sessions or listening your favorite workout mix in the background.

You need to open `/etc/inputrc` file and uncomment the line `set bell-style none`.

{{< img src="/img/ss/inputrc.png" class="lazy screenshot" caption="Uncomment `set bell-style none` to disable beep on terminal" >}}

After uncommenting the line, restart the terminal and you will no longer hear the beep sound.

### Increasing the buffer size

If you right click on the title bar and click `Properties` you may further customize your terminal.
One thing that you will find valuable is to increase the buffer size, so that you can scroll back to your recent commands and output.
Go to `Layout` tab and change the `Height`value under the `Screen Buffer Size` settings.

{{< img src="/img/ss/ubuntu-settings.png" class="lazy screenshot" figcls="img-responsive" >}}

Also enable `QuickEdit mode` option under the `Options` tab to be able to copy text by selecting them and right-clicking.

### Accessing the Windows username

You have [access to Windows Command Line](https://docs.microsoft.com/en-us/windows/wsl/interop) using `cmd.exe` command even if you are working inside the Linux terminal.
Using `cmd.exe` you can do lots of things, like accessing the Windows username.
Adding

{{< highlight bash >}}
export USERNAME="cmd.exe /c echo %USERNAME%"
{{< /highlight >}}

to your `.bashrc` file enables `$USERNAME` variable on Linux terminal.
Accessing the Windows username may come handy when writing scripts.

### Changing the username

If you need to change the default username when you open the Ubuntu terminal, use

{{< highlight posh >}}
ubuntu config --default-user new_username
{{< /highlight >}}

on PowerShell as an admin.

### Accessing Windows folders

Your Windows folders should be accessible under `/mnt` folder.
Simply navigate to your desktop using

{{< highlight bash >}}
cd /mnt/c/Users/your-username/Desktop/
{{< /highlight >}}

### Creating a shortcut

Windows does not provide an option for creating a shortcut when you right-click on store apps on Windows 10.
The trick is to find the app on Start Menu and simply drag the app and drop it on the desktop.

## End

So, that's all folks.
I hope you are happy with your brand new Linux terminal.
Leave a reply below (or make a merge request) if you have a useful tip on mind that can be added here.

Happy new year!

## Resources

- [WSL interoperability with Windows](https://docs.microsoft.com/en-us/windows/wsl/interop)
- [SuperUser Q/A for changing the default user](https://superuser.com/a/1266977)
- [Reddit community for Bash on Ubuntu on Windows](https://www.reddit.com/r/bashonubuntuonwindows/)
- [Ubuntu on Windows Store](https://www.microsoft.com/store/productId/9NBLGGH4MSV6)