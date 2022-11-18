import { getGoogleToken } from "./lib/auth.ts";

export async function getAllRows() {
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
  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1ACMkP6-dJZ6y2djy1gsVQqaKecalyd-af3W41hJ2NnA/values/Лист1!A:H",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();
  console.log(result);
}

export async function getFreeKeyRow(itemId: string) {
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
  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1ACMkP6-dJZ6y2djy1gsVQqaKecalyd-af3W41hJ2NnA/values/Лист1!A:F/?valueRenderOption=UNFORMATTED_VALUE",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = (await response.json()).values;

  let row, id, index, city, amount, trafic, key;
  for (const r of result) {
    if (String(r[0]).toLowerCase() == itemId && r[5] == undefined) {
      row = r;
      [id, city, trafic, amount, key] = [...r];
      index = result.indexOf(row) + 1;
      break;
    }
  }
  // console.log(index);
  // console.log(row);
  // console.log(id);
  // console.log(city);
  // console.log(trafic);
  // console.log(amount);
  // console.log(key);

  return { index, row, id, city, amount, trafic, key };
}

export async function writePaymentData(
  userId: number,
  stringIndex: number,
  timestamp: Date,
  amount: number
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
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1ACMkP6-dJZ6y2djy1gsVQqaKecalyd-af3W41hJ2NnA/values/'Лист1'!F${String(
      stringIndex
    )}:H${stringIndex}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        range: `'Лист1'!F${stringIndex}:H${stringIndex}`,
        majorDimension: "ROWS",
        values: [[userId, timestamp.toUTCString(), amount]],
      }),
    }
  );
  const result = await response.json();
  console.log(result);
}

// getAllRows();
// writePaymentData("246669779", 8, new Date(), 139);
// getFreeKeyRow("moscow40");
