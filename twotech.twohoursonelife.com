server {
    listen 80;
    listen [::]:80;

    server_name _;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 default_server ssl http2;
    listen [::]:443 ssl http2;

    server_name twotech.twohoursonelife.com edge.twotech.twohoursonelife.com;

    ssl_certificate /etc/nginx/ssl/live/twotech.twohoursonelife.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/twotech.twohoursonelife.com/privkey.pem;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(ico|css|js|gif|jpe?g|png|json|svg)$ {
        # try the file directly
    }
}
