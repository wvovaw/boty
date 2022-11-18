import { create } from "https://deno.land/x/djwt@v2.7/mod.ts";
import credentials from "./credentials.json" assert { type: "json" };
/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
/*
Import a PEM encoded RSA private key, to use for RSA-PSS signing.
Takes a string containing the PEM encoded key, and returns a Promise
that will resolve to a CryptoKey representing the private key.
*/
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .substring(pemHeader.length, pem.length - pemFooter.length - 1)
    .replaceAll(" ", "")
    .replaceAll("\n", "");

  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-V1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
}
export async function getGoogleToken(): Promise<string> {
  const privateKey = credentials["private_key"];
  const kid = credentials["private_key_id"];
  const iss = credentials["client_email"];
  const scope = "https://www.googleapis.com/auth/drive";

  const key = await importPrivateKey(privateKey);

  // const time = Date.now();
  const time = Math.floor(Date.now() / 1000);
  const jwt = await create(
    { alg: "RS256", typ: "JWT", kid },
    {
      iss,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: time,
      exp: time + 3600,
    },
    key
  );
  // console.log("JWT: ", jwt);
  return jwt;
}
