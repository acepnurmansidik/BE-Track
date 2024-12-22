# Menggunakan Node.js versi 20.15.0 dengan Alpine
FROM node:20.18.1-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin semua file aplikasi ke dalam container
COPY . .

# Expose port yang digunakan oleh aplikasi
EXPOSE 9000

# Perintah untuk menjalankan aplikasi
CMD ["npm","run", "prod"]