FROM node:20-alpine

WORKDIR /app

# คัดลอก dependencies และติดตั้ง
COPY package.json package-lock.json ./
RUN npm install --production 

# คัดลอกโค้ดทั้งหมด (รวมถึง index.js/server.js)
COPY . .

# EXPOSE พอร์ตที่ Express Server ฟังอยู่
EXPOSE 5000 

# คำสั่งรัน Server
CMD ["node", "index.js"]