import { getGoogleToken } from "./lib/auth.ts";

async function main() {
  const jwt = await getGoogleToken();

  const token_req = await fetch(
    new Request("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: `{ "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": "${jwt}" }`,
    })
  );

  const token = (await token_req.json()).access_token;

  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1ACMkP6-dJZ6y2djy1gsVQqaKecalyd-af3W41hJ2NnA/values/Лист1!A1:D65000",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();
  console.log(result);
}

main();
