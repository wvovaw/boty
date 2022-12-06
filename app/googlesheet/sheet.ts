import "https://deno.land/std@0.167.0/dotenv/load.ts";
import { getGoogleToken } from "./lib/auth.ts";

const sheetUrl =
  "https://sheets.googleapis.com/v4/spreadsheets/" +
  Deno.env.get("SPREADSHEET_ID")?.toString();

export async function getColumns(codeType: "active" | "deactive") {
  // About
  // https://developers.google.com/identity/protocols/oauth2/service-account#httprest

  // Generating jwt token
  const jwt = await getGoogleToken();

  // request for bearer token from google
  const token_req = await fetch(
    new Request("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: `{ "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": "${jwt}" }`,
    })
  );
  const token = (await token_req.json()).access_token;

  // working with sheets using the token we got
  let range = "";
  if (codeType == "active") range = `Лист1!A3:C`;
  if (codeType == "deactive") range = `Лист1!E3:G`;

  const res = await fetch(`${sheetUrl}/values/${range}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.values;
}

export async function writeSpreadsheet(
  codeType: "active" | "deactive",
  codes: string[],
  city: string,
  date: string
) {
  // About
  // https://developers.google.com/identity/protocols/oauth2/service-account#httprest

  // Generating jwt token
  const jwt = await getGoogleToken();

  // request for bearer token from google
  const token_req = await fetch(
    new Request("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: `{ "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": "${jwt}" }`,
    })
  );
  const token = (await token_req.json()).access_token;

  // working with sheets using the token we got
  let range = "";
  if (codeType == "active") range = `Лист1!A3:C`;
  if (codeType == "deactive") range = `Лист1!E3:G`;
  // let stringIndex = 0;
  let cols = await getColumns(codeType);
  if (cols == undefined) cols = [];
  for (const code of codes) cols.push([date, city, code]);

  const response = await fetch(
    `${sheetUrl}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        range: range,
        majorDimension: "ROWS",
        values: cols,
      }),
    }
  );
  // const result = await response.json();
  // console.log(result);
}

// console.log(await getColumns("active"));
// writeSpreadsheet("active", ["foo", "bar", "bas"], "Пермь", "06.12.2022");
// writeSpreadsheet(
//   "deactive",
//   ["1", "2", "3", "123", "456"],
//   "Пермь",
//   "06.12.2022"
// );
// getFreeKeyRow("moscow40");
