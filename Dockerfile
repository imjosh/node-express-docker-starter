FROM node:8.11.3

EXPOSE 8000

# Install app dependencies
RUN npm i npm@latest -g && npm cache clean --force

WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .

# check every 5s to ensure this service returns HTTP 200
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://localhost:8000/status || exit 1

CMD ["node","app.js"]