FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY favicon.ico site.webmanifest /usr/share/nginx/html/
COPY service-worker.js offline.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src
COPY assets /usr/share/nginx/html/assets

EXPOSE 80

COPY places /usr/share/nginx/html/places
COPY journeys /usr/share/nginx/html/journeys
COPY methodology /usr/share/nginx/html/methodology
COPY data /usr/share/nginx/html/data
COPY robots.txt sitemap.xml /usr/share/nginx/html/
