# 基础镜像：构建阶段
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 首先复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（使用cache优化）
RUN npm ci --prefer-offline --no-audit

# 复制源代码
COPY . .

# 开发环境
FROM build as development
ENV NODE_ENV=development
# 确保热重载正常工作
ENV WDS_SOCKET_PORT=0
CMD ["npm", "start"]

# 生产环境：构建阶段
FROM build as build-production
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
# 优化构建过程：增加内存限制并使用CI模式
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 生产环境：运行阶段
FROM nginx:alpine as production
COPY --from=build-production /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 