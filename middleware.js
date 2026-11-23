// Passwortschutz für alle Demos (Vercel Routing Middleware, ohne Abhängigkeiten)
const PASSWORT = '85540';
const COOKIE = 'demo_zugang';
const TOKEN = 'ok-7f3a9c2e51d84b06';

export const config = { matcher: '/:path*' };

function weiter() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

function loginSeite(ziel, fehler) {
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Demo-Zugang</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;background:linear-gradient(180deg,#8fd3ec,#e3f5fb 70%,#5fa82a 70%);color:#1b1f1b;padding:16px}
form{background:#fff;border-radius:18px;padding:28px;width:100%;max-width:360px;box-shadow:0 12px 40px rgba(27,31,27,.18);display:grid;gap:14px}
h1{margin:0;font-size:22px}p{margin:0;color:#5e6a5e;font-size:14px}
label{display:grid;gap:6px;font-size:13px;font-weight:700;color:#5e6a5e}
input{font:inherit;padding:11px 12px;border:1px solid #dde4da;border-radius:10px}
input:focus{outline:3px solid #8fd3ec;outline-offset:1px}
button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:12px;background:#5fa82a;color:#fff;cursor:pointer}
button:hover{background:#3d7a17}.err{color:#d42a2f;font-weight:700}
</style></head><body>
<form method="POST" action="/__login">
<h1>Demo-Zugang</h1>
<p>Diese Demo ist geschützt. Bitte geben Sie das Passwort ein, das Sie erhalten haben.</p>
${fehler ? '<p class="err">Das Passwort stimmt nicht. Bitte noch einmal versuchen.</p>' : ''}
<label for="pw">Passwort<input id="pw" name="pw" type="password" inputmode="numeric" autocomplete="current-password" required autofocus></label>
<input type="hidden" name="ziel" value="${ziel.replace(/"/g, '')}">
<button type="submit">Demo öffnen</button>
</form></body></html>`;
  return new Response(html, {
    status: fehler ? 401 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const cookies = request.headers.get('cookie') || '';
  const angemeldet = cookies.split(';').some((c) => c.trim() === `${COOKIE}=${TOKEN}`);

  if (url.pathname === '/__login' && request.method === 'POST') {
    const form = await request.formData();
    let ziel = String(form.get('ziel') || '/');
    if (!ziel.startsWith('/') || ziel.startsWith('//')) ziel = '/';
    if (String(form.get('pw') || '').trim() === PASSWORT) {
      return new Response(null, {
        status: 303,
        headers: {
          location: ziel,
          'set-cookie': `${COOKIE}=${TOKEN}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }
    return loginSeite(ziel, true);
  }

  if (angemeldet) return weiter();
  return loginSeite(url.pathname + url.search, false);
}
