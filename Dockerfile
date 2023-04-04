
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

EXPOSE 27017

CMD ["npm", "start"]





## Use the official Node.js runtime as a parent image
#FROM node:14
#
## Set the working directory to /app
#WORKDIR /app
#
## Copy the package.json and package-lock.json files to the container
#COPY package*.json ./
#
## Install the application's dependencies
#RUN npm install
#
## Copy the rest of the application files to the container
#COPY . .
#
## Expose port 3000 for the Node.js application
#EXPOSE 3000
#
## Expose port 27017 for MongoDB
#EXPOSE 27017
#
## Start MongoDB and the Node.js application
#CMD ["npm", "start"]

