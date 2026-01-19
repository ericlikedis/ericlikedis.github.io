---
layout: post
title: attempt 2 notes
category: blog
---


### tools 

- `Fern` tool
- `EAPHammer` tool
- `Rubeus` tool

- `LPD` - port `515` otherwise known as `Line Printer Daemon`

### wireshark

-  Wireshark predefined columns: 

```
No | Time | Source | Destination | Protocol | Length | Info
```

![img](/assets/images/file-20260118120538087.png)

> [!note] REMEMBER **NO, TIME, SOURCE**

### Metasploit Architecture

https://www.linkedin.com/pulse/metasploit-framework-explained-understanding-its-joel-mutiso-yvihf

It is important to know that there are 3 components in the Metasploit Architecture: 

- Libraries
- Interfaces
- Modules
**Classes** **DO NOT** exist in this architecture

![img](/assets/images/file-20260118120827598.png)

### MITRE Caldera

SandCat Agent plugin in Caldera `54ndc47` ability

Abilities like `54ndc47` are commonly tied to **discovery-phase techniques**, not destructive payloads.

So the most realistic simulation is:

> ✔️ Enumerating users and gathering process/host information (T1087, T1057, T1033, etc.)

### concepts

`stacked query` - SQL injection where multiple SQL statements or procedures are executed together in the same call to the database. (Chapter 9 - Exploiting Application Vulnerabilities, Exploiting Injection Vulnerabilities)

> will add more later lol