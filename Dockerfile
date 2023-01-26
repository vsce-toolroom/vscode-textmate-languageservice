FROM ubuntu:22.04

RUN sudo apt-get update
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y build-essential
RUN sudo apt-get install -y xvfb
RUN sudo npm install -g npm@latest

COPY build build
RUN chmod +x build
