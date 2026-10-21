# Use the official Node.js 24 (active LTS) image as a parent image, pinned by tag
# and digest. 24.22.1 is the first 24.x that rejects the compromised eMudhra
# intermediates (nodejs/node#66871); keep engines.node in package.json equal.
FROM node:24.22.1@sha256:5630d96570d4ca4a8523fda3d169d0114554d0f48293e1ae3db6be7c79b42a17

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the container
COPY . .

CMD [ "node", "app.js" ]
