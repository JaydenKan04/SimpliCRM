import fetch from 'node-fetch'

exports.handler = async function(event, context) {
  const notionKey = process.env.VITE_NOTION_KEY;
  const headers = {
    'Authorization': 'Bearer ' + notionKey,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  const options = {
    method: 'POST',
    headers: headers
  };

  try {
    const response = await fetch('https://api.notion.com/v1/databases/6db812ec22604aa397a22d79802428c4/query', options);
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