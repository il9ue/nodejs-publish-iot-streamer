nodejs-publish-iot-streamer
===========================

nodejs iot streamer app project

# Basic Internet of Things Streaming Application

This application is derived from iot project on the book. The initial project has multiple scenarios in it, so I thought categorized as partial projects based on scenarios seemed good start point.

## README version 0.1.0

Basic IoT (Internet of Things) application which streams captured mjpeg image from device (Beaglebone black + WebCam). The device options could be differed and switched by developer or user. This repository only deals with streaming application, however, this application could be expanded and merged with other IoT application of the author, such as IoT sensor application, IoT Configuration application, and so forth.

IoT stream application is divided into few features as the following : 

* *stream data collection* : capture raw image data using webcam and convert to mjpeg image.
* *stream data distribution* : converted mjpeg image are streamed over http or websocket, socket.io. Users may define the method to stream images. Any accessed clients are allowed to get real time image.
* *stream Status Configuration* : stream image can be easily monitored through configuration web page

## Getting Started

### Running Server

The following are general sequences to run the application :

1. setting hostname and port for iot-stream server

2. run the server by typing "node app.js" on terminal

3. monitor and manage the stream surroundings by visit "http://{hostname}:{port}"

4. corresponding sensors are published to any clients that are accessed. 

### Environments

- OS which supports Node.js & Javascript : Linux, MacOS, Windows
- For Client or viewing config/status web page, one needs to access browsers which supports websockets, socket.io


### Application Boundaries

Although none of new settings need to be applied, application's boundary needs to be considered before running at least once. Some properties are as follows:

- only stream data are distributed and parsed to clients
- web server, stream server, and client are included

### Application Binding with other IoT Application

Multiple IoT Applications can be bound by sharing and connecting web server and streaming server.


## Contact

