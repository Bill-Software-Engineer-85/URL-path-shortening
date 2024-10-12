# Use Node.js LTS version
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the slug-service port
EXPOSE 8081

# Run the application
CMD ["npm", "run", "start"]
