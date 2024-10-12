# Stage 1: Build the React app
FROM node:16 AS build

# Set the working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the production version of the React app
RUN npm run build

# Stage 2: Set up the Node.js server to serve the app
FROM node:16 AS server

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for server dependencies
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the TypeScript source code
COPY ./server.ts ./server.ts
COPY ./tsconfig.json ./
COPY ./.env ./.env

# Install TypeScript compiler for the build
RUN npm install typescript @types/node @types/express --save-dev

# Compile TypeScript to JavaScript
RUN npx tsc

# Copy the React build files to the dist folder
COPY --from=build /usr/src/app/build ./dist/build

# Change working directory to dist for running the server
WORKDIR /usr/src/app/dist

# Expose the port for the server
EXPOSE 3000

# Run the compiled Node.js server from dist/server.js
CMD ["node", "server.js"]
