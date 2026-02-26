const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// HTTPS activé uniquement si HTTPS_ENABLED=true ET les certificats sont présents.
// En mode K8s (Minikube), HTTPS est terminé à l'ingress → false ici.
const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const requestHandler = async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  };

  if (httpsEnabled) {
    const certPath = path.join(__dirname, 'secrets', 'cert.pem');
    const keyPath  = path.join(__dirname, 'secrets', 'key.pem');

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      console.error('❌ HTTPS_ENABLED=true mais les certificats sont introuvables.');
      console.error('   Lancez : bash scripts/infra/gen-certs.sh');
      process.exit(1);
    }

    const httpsOptions = {
      key:  fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    createHttpsServer(httpsOptions, requestHandler).listen(port, hostname, () => {
      console.log(`🔒 Frontend HTTPS server running on https://${hostname}:${port}`);
    });
  } else {
    createHttpServer(requestHandler).listen(port, hostname, () => {
      console.log(`Frontend HTTP server running on http://${hostname}:${port}`);
    });
  }
});
