FROM node:18-bullseye-slim

# Install TeX Live, luatex, dvisvgm, and ghostscript (for optimal SVG compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-luatex \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-science \
    texlive-pictures \
    texlive-lang-other \
    dvisvgm \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server files
COPY . .

# Expose port
EXPOSE 10000

# Start server
CMD ["node", "server.js"]
