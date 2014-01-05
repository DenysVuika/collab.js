## Creating development certificates

```bash
openssl genrsa -out dev-key.pem 1024
openssl req -new -key dev-key.pem -out dev-csr.pem
oepnssl x509 -req -days 300 -in dev-csr.pem -signkey dev-key.pem -out dev-cert.pem
```

Please see TLS (SSL) [documentation](http://nodejs.org/api/tls.html#tls_tls_ssl) for more details.
