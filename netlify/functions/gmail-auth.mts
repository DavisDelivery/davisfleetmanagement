import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  if (!clientId) {
    return new Response("GOOGLE_CLIENT_ID not configured", { status: 500 });
  }

  const url = new URL(req.url);
  const redirectUri = `${url.origin}/api/gmail-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return Response.redirect(authUrl, 302);
};

export const config: Config = {
  path: "/api/gmail-auth",
};
