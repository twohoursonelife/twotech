server {
  root /usr/local/twotech/public;
  index index.html;
  server_name twotech.twohoursonelife.com edge.twotech.twohoursonelife.com localhost;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(ico|css|js|gif|jpe?g|png|json|svg)$ {
    # try the file directly
  }

  #listen 443 ssl;
  #ssl_certificate /etc/letsencrypt/live/twotech.twohoursonelife.com/fullchain.pem;
  #ssl_certificate_key /etc/letsencrypt/live/twotech.twohoursonelife.com/privkey.pem;
  #include /etc/letsencrypt/options-ssl-nginx.conf;
  #ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
  #listen 80 default_server;
  #listen [::]:80 default_server;
  server_name _;
  return 301 https://$host$request_uri;
}
