# MininetBuilder: Fully Featured Mininet Editor

## Introduction:
Welcome to the MininetBuilder Git repository! Here you will find a powerful tool designed to enhance your experience with Mininet, a popular software-defined network (SDN) emulator. MininetBuilder offers a range of features, including the ability to effortlessly edit your Mininet network configurations and conveniently visualize network statistics. Additionally, MininetBuilder goes a step further by providing experimental support to configure switches with external protocols like sFlow and NetFlow. This groundbreaking capability allows you to gather detailed flow-level information and gain deeper insights into your network's performance and traffic patterns. Whether you're a network engineer, researcher, or developer, MininetBuilder empowers you to unlock new possibilities and fine-tune your SDN deployments. Get ready to revolutionize your Mininet experience with MininetBuilder!

## Demo:
Try out MininetBuilder whithout any installation: https://ryu-dashboard.vercel.app

## Installation:
### Gui installation:
Clone the git repository:
```
git clone https://github.com/daviFrag/ryu-dashboard.git
```
Build and start the gui interface:
```
cd ryu-dashboard
docker compose up
```
Access the editor with this url http://localhost:3000

Or build it from source:
Clone the repo and then:
```
cd ryu-dashboard
npm run build
npm run start
```
Access the editor with this url http://localhost:3000

## Mininet SDN installation:
Follow instructions in the repo https://git.comnets.net/public-repo/comnetsemu for a fully automated Vagrant installation
After the installation enter in the comnetsemu VM and clone this repository in home and start the service
```
git clone https://github.com/daviFrag/ryu-dashboard.git
cd ryu-dashboard

```

## Sflow dashboard:
If you want to view network statistics we suggest to install a supported sFlow dashboard

For Sflow-RT follow instructions -> https://sflow-rt.com/download.php

Then install mininet-dashboard -> https://github.com/sflow-rt/mininet-dashboard

## Trubleshooting
If during buildtime with docker you get this error
```
0.182 runc run failed: unable to start container process: can't get final child's PID from pipe: EOF
```
try the solution proposed here: https://github.com/moby/moby/issues/40835
so run: 
```
sudo sysctl -w user.max_user_namespaces=15000
```


