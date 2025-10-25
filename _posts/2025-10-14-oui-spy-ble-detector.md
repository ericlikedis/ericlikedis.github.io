---
layout: post
title: oui spy ble scanner - what is it? how does it work?
category: blog
---

### oui-spy

"Professional BLE scanning system that detects specific devices by MAC address or OUI with audio feedback."

![image](/assets/images/ouispy.png)

So far I am working on installing the `flock-you` firmware. [here](https://github.com/colonelpanichacks/flock-you)


### useage:

Setup Instructions
Clone the repository:
```
git clone <repository-url>
cd flock-you
```

Connect your Oui-Spy device via USB-C

Flash the firmware:
```
pio run --target upload
```

Set up the web interface:
```
cd api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Start the web server:
```
python flockyou.py
```
Access the dashboard:

Open your browser to http://localhost:5000

The web interface provides real-time detection monitoring

Serial terminal for device output
Detection history and export capabilities
Monitor device output (optional):
```
pio device monitor
```