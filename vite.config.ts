import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function smsApiPlugin(): Plugin {
  return {
    name: 'sms-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-sms', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { phone, otpCode } = JSON.parse(body || '{}');
              
              let cleanPhone = (phone || '').replace(/[^\d+]/g, '');
              if (!cleanPhone.startsWith('+')) {
                if (cleanPhone.length === 10) {
                  cleanPhone = '+91' + cleanPhone;
                } else {
                  cleanPhone = '+' + cleanPhone;
                }
              }

              console.log('\n========================================');
              console.log(`📲 [SERVER SMS DISPATCH] Sending real SMS to Proxy: ${cleanPhone}`);
              console.log(`🔑 OTP Code Generated: ${otpCode}`);
              console.log('========================================\n');

              const smsMessage = `MediVault Emergency Access OTP: ${otpCode}. Valid for 60 mins.`;

              // 1. Dispatch via Textbelt (Server-to-Server HTTPS POST)
              const postData = JSON.stringify({
                phone: cleanPhone,
                message: smsMessage,
                key: 'textbelt',
              });

              const options = {
                hostname: 'textbelt.com',
                port: 443,
                path: '/text',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData),
                },
              };

              const apiReq = https.request(options, (apiRes) => {
                let responseData = '';
                apiRes.on('data', (d) => {
                  responseData += d;
                });
                apiRes.on('end', () => {
                  console.log('[SMS Gateway Response]', responseData);
                });
              });

              apiReq.on('error', (e) => {
                console.error('[SMS Gateway Error]', e.message);
              });

              apiReq.write(postData);
              apiReq.end();

              // 2. Dispatch via Fast2SMS / 2Factor for Indian numbers (+91)
              const digitsOnly = cleanPhone.replace(/[^\d]/g, '');
              if (cleanPhone.startsWith('+91') || digitsOnly.length === 10) {
                const tenDigits = digitsOnly.slice(-10);
                https.get(`https://2factor.in/API/V1/SMS/${tenDigits}/${otpCode}/AUTOGEN`, () => {}).on('error', () => {});
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'SMS dispatch initiated' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), smsApiPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});
