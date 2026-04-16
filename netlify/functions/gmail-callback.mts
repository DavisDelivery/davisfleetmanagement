import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return new Response("OAuth not configured", { status: 500 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return htmlResponse(`<h2>Gmail connection cancelled</h2><p>${error}</p><a href="/">Back to app</a>`);
  }
  if (!code) {
    return htmlResponse(`<h2>Missing authorization code</h2><a href="/">Back to app</a>`);
  }

  const redirectUri = `${url.origin}/api/gmail-callback`;

  // Exchange code for tokens
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResp.json();

  if (!tokenResp.ok || !tokenData.refresh_token) {
    return htmlResponse(`<h2>Token exchange failed</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre><a href="/">Back to app</a>`);
  }

  // Get user's email from tokeninfo
  let userEmail = "unknown";
  try {
    const profileResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/profile`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profile = await profileResp.json();
    userEmail = profile.emailAddress || "unknown";
  } catch {}

  // Store refresh token in Firestore via REST API (using Firebase Web API key for public writes)
  // We'll write it through the client-side after redirect, via a script on the success page
  // More secure: store server-side in Netlify Blobs

  // Return HTML page that posts token data back to the app via postMessage, then closes
  return htmlResponse(`
<!DOCTYPE html>
<html>
<head><title>Gmail Connected</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f7fa; color: #1e293b; padding: 40px; text-align: center; }
  .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 400px; margin: 40px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  h1 { color: #27ae60; margin: 0 0 12px; }
  .email { color: #1e5b92; font-weight: 700; margin: 16px 0; }
  .btn { display: inline-block; padding: 10px 24px; background: #1e5b92; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
<h1>✅ Gmail Connected</h1>
<div class="email">${userEmail}</div>
<p>Saving connection...</p>
<a href="/" class="btn" id="back" style="display:none">Back to app</a>
</div>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script>
firebase.initializeApp({
  apiKey: "AIzaSyCaaHZ0GuBoxl696-PzlgBQLPEad1xyiqw",
  authDomain: "davisfleetmanagement.firebaseapp.com",
  projectId: "davisfleetmanagement",
  storageBucket: "davisfleetmanagement.firebasestorage.app",
  messagingSenderId: "397276214754",
  appId: "1:397276214754:web:aa7bd4723c301fb876b5bb"
});
const db = firebase.firestore();
db.collection("kv").doc("fl-gmail-token").set({
  v: JSON.stringify({
    refresh_token: ${JSON.stringify(tokenData.refresh_token)},
    email: ${JSON.stringify(userEmail)},
    connected_at: new Date().toISOString()
  }),
  ts: new Date().toISOString()
}).then(() => {
  document.querySelector("p").textContent = "Connected successfully!";
  document.getElementById("back").style.display = "inline-block";
  setTimeout(() => { window.location.href = "/"; }, 2000);
}).catch(err => {
  document.querySelector("p").textContent = "Error saving: " + err.message;
  document.getElementById("back").style.display = "inline-block";
});
</script>
</body>
</html>
  `);
};

function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config: Config = {
  path: "/api/gmail-callback",
};
