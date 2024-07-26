import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import cookieEncrypter from "cookie-encrypter";
import cookieParser from "cookie-parser";

dotenv.config(".env");

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const generateSecureKey = (length = 32) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    key += charset[randomIndex];
  }
  return key;
};

const secretKey = generateSecureKey();

app.use(cookieParser(secretKey));

app.post("/queryCustomerDb", async (req, res) => {
  const { phoneNo } = req.body;
  const cookieData = req.cookies.dbsId;
  const notionAuthData = req.cookies.notionAuthData;

  if (!cookieData || !notionAuthData) {
    throw "cookie not found";
  }

  const { customerDbId } = JSON.parse(cookieData);
  const { accessToken } = JSON.parse(notionAuthData);

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${customerDbId}/query`,
      {
        filter: {
          property: "Phone Number",
          phone_number: {
            equals: phoneNo,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.results[0]);
  } catch (err) {
    console.error("Error query customer table in database: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/queryInquiryDb", async (req, res) => {
  const { customerId } = req.body;
  const cookieData = req.cookies.dbsId;
  const notionAuthData = req.cookies.notionAuthData;

  if (!cookieData || !notionAuthData) {
    throw "cookie not found";
  }

  const { inquiryDbId } = JSON.parse(cookieData);
  const { accessToken } = JSON.parse(notionAuthData);

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${inquiryDbId}/query`,
      {
        filter: {
          property: "Customer",
          relation: {
            contains: customerId,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.results);
  } catch (err) {
    console.error("Error query customer inquiry table in database: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/queryStaffDb", async (req, res) => {
  const cookieData = req.cookies.dbsId;
  const notionAuthData = req.cookies.notionAuthData;

  if (!cookieData || !notionAuthData) {
    throw "cookie not found";
  }

  const { staffDbId } = JSON.parse(cookieData);
  const { accessToken } = JSON.parse(notionAuthData);

  try {
    const resp = await axios.post(
      `https://api.notion.com/v1/databases/${staffDbId}/query`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(resp.data.results);
  } catch (err) {
    console.error("Error query staff table in database: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/queryInvoiceDb", async (req, res) => {
  const { customerId } = req.body;
  const cookieData = req.cookies.dbsId;
  const notionAuthData = req.cookies.notionAuthData;

  if (!cookieData || !notionAuthData) {
    throw "cookie not found";
  }

  const { invoiceDbId } = JSON.parse(cookieData);
  const { accessToken } = JSON.parse(notionAuthData);

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${invoiceDbId}/query`,
      {
        filter: {
          property: "Customer",
          relation: {
            contains: customerId,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.results);
  } catch (err) {
    console.error("Error query invoice table in database: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/updateInquiryDb", async (req, res) => {
  const { pageId, status } = req.body;
  const notionAuthData = req.cookies.notionAuthData;

  if (!notionAuthData) {
    throw "cookie not found";
  }
  const { accessToken } = JSON.parse(notionAuthData);

  try {
    const response = await axios.patch(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        properties: {
          Status: {
            status: {
              name: status,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error update inquiry table in database: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//link to notion oauth prompt
app.get("/auth", (req, res) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${process.env.OAUTH_REDIRECT_URI}&response_type=code`;
  res.redirect(authUrl);
});

//notion send back a request to this url after auth
app.get("/callback", async (req, res) => {
  const { error, code } = req.query;

  if (error) {
    console.error("Failed getting authorisation code: ", error);

    //return a html page to indicate error
    return res.send(`<html>
        <body>
          <h1>Authorization Failed</h1>
          <p>You cancelled the authorization or an error occurred.</p>
          <p>Error: ${error}</p>
        </body>
      </html>`);
  }

  //use the code exchange for access token
  try {
    const response = await exchangeToken(code);

    if (response) {
      if (response.error && response.error_description) {
        throw response.error_description;
      }

      if (response.access_token && response.workspace_name) {
        console.log(response.access_token, response.workspace_name);

        setTokenAndWSnameCookie(
          res,
          response.access_token,
          response.workspace_name
        );

        const dbsIdList = await getDbsId(response.access_token);

        if (dbsIdList) {
          setDbsIdCookie(
            res,
            dbsIdList["Customer List"],
            dbsIdList["Customer Inquiry History"],
            dbsIdList["Customer Invoice List"],
            dbsIdList["Staff List"]
          );
        }

        return res.send(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>You have successfully connected your Notion account.</p>
            </body>
          </html>
        `);
      }
    }
  } catch (err) {
    console.error("Failed to exchange for token: ", err);
    return res.send(`<html>
      <body>
        <h1>Authorization Failed</h1>
        <p>An error occurred while processing your request.</p>
        <p>Error: ${err}</p>
      </body>
    </html>`);
  }
});

const exchangeToken = async (code) => {
  const encoded = Buffer.from(
    `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${encoded}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error exchanging for access token: ", err);
    throw err;
  }
};

//use cookies to store data
app.use(cookieEncrypter(secretKey));

const setTokenAndWSnameCookie = (res, token, name) => {
  const data = JSON.stringify({
    accessToken: token,
    workspaceName: name,
    isAuthorised: true,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  res.clearCookie("notionAuthData");

  res.cookie("notionAuthData", data, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    encrypted: true,
  });
};

const refreshTokenAndWSnameCookie = (req, res, next) => {
  const data = req.cookies.notionAuthData;

  if (data) {
    const parsedData = JSON.parse(data);

    if (parsedData.expiresAt - Date.now() < 0) {
      setTokenAndWSnameCookie(
        res,
        parsedData.accessToken,
        parsedData.workspaceName
      );
    }
  }

  next();
};

app.use(refreshTokenAndWSnameCookie);

const setDbsIdCookie = (res, custId, inquiryId, invoiceId, staffId) => {
  const data = JSON.stringify({
    customerDbId: custId,
    inquiryDbId: inquiryId,
    invoiceDbId: invoiceId,
    staffDbId: staffId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  res.clearCookie("dbsId");

  res.cookie("dbsId", data, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    encrypted: true,
  });
};

const refreshDbsIdCookie = (req, res, next) => {
  const data = req.cookies.DbsId;

  if (data) {
    const parsedData = JSON.parse(data);

    if (parsedData.expiresAt - Date.now() < 0) {
      setTokenAndWSnameCookie(
        res,
        parsedData.customerDbId,
        parsedData.inquiryDbId,
        parsedData.inquiryDbId,
        parsedData.staffDbId
      );
    }
  }

  next();
};

const getDbsId = async (apiKey) => {
  try {
    const res = await axios.post(
      "https://api.notion.com/v1/search",
      {
        filter: {
          property: "object",
          value: "database",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );

    //return an object wtih the name of dbs as keys, and their id as values
    if (res.data.results) {
      const dbsId = res.data.results.reduce((acc, item) => {
        acc[item.title[0].text.content] = item.url.slice(-32);
        return acc;
      }, {});

      console.log(dbsId);
      return dbsId;
    }

    if (res.data.message) {
      throw res.data.message;
    }
  } catch (err) {
    console.error("Error retrieving database id: ", err);
  }
};

app.use(refreshDbsIdCookie);

app.get("/check-auth", (req, res) => {
  const notionData = req.cookies.notionAuthData;

  if (!notionData) {
    return res.status(401).json({
      error: "No Notion authorisation data found",
      isAuthorised: false,
    });
  }

  return res.json(JSON.parse(notionData));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
