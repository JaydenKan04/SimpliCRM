import fetch from 'node-fetch'

exports.handler = async function(event, context) {
  const notionKey = process.env.VITE_NOTION_KEY;
  const { input } = JSON.parse(event.body);

  const headers = {
    'Authorization': 'Bearer ' + notionKey,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      filter: {
        property: "Phone Number",
        phone_number: {
          equals: input.phone,
        },
      },
    })
  };

  try {
    const response = await fetch('https://api.notion.com/v1/databases/bdc9f4e0dc12420b98fb15562980f823/query', options);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Notion API' }),
    };
  }
};