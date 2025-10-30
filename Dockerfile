# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./

# build-time argument
ENV VITE_AI_BACKEND_URL=http://localhost:8001  
ENV VITE_CMS_URL=http://localhost:8000         

RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
