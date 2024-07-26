import fetch from 'node-fetch'

exports.handler = async function(event, context) {
  const notionKey = process.env.VITE_NOTION_KEY;
  const { id } = JSON.parse(event.body);

  try {
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
          property: 'Customer',
          relation: {
            contains: id,
          },
        },
      }),
    };

    const response = await fetch('https://api.notion.com/v1/databases/2b7c842132264ae2b075cc37f628329a/query', options);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to query customer inquiry database' }),
    };
  }
};