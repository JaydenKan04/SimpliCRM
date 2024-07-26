const OAUTH_CLIENT_ID = 'NOTION_CLIENT_ID';
const OAUTH_CLIENT_SECRET = 'NOTION_CLIENT_SECRET';

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Authorize Notion', 'showAuthorizationPrompt')
    // .addItem('Get all database', 'searchDbsId')
    .addToUi();
}

//When user press connect to Notion
function getNotionService() {
  return OAuth2.createService('Notion')
                .setAuthorizationBaseUrl('https://api.notion.com/v1/oauth/authorize')
                .setTokenUrl('https://api.notion.com/v1/oauth/token')
                .setClientId(OAUTH_CLIENT_ID)
                .setClientSecret(OAUTH_CLIENT_SECRET)
                .setCallbackFunction('authCallback')
                .setPropertyStore(PropertiesService.getUserProperties())
                .setParam('response_type', 'code')
                .setParam('owner', 'user')
}

//Let end user connect to Notion through OAuth2 flow
function showAuthorizationPrompt() {
  var authorizationUrl = getNotionService().getAuthorizationUrl();
  Logger.log(authorizationUrl);
  var htmlOutput = HtmlService
    .createHtmlOutput('<h2 style="text-align: center;"><a href="' + authorizationUrl + '" target="_blank">Authorize Notion</a></h2>')
    .setWidth(300)
    .setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Authorization');
}

//After connecting get request
function authCallback(request) {
  Logger.log('Inside authCallback');
  
  // Extract the authorization code from the request
  var code = request.parameter.code;
  var error = request.parameter.error;

  if (error) {
    if (error == 'access_denied') {
      Logger.log('Authorization denied');
      return HtmlService.createHtmlOutput('Denied. You can close this tab.');
    } else {
      Logger.log('Error authorizing token: ' + error);
      return HtmlService.createHtmlOutput('Error during authorization: ' + error);
    }
  }
  
  // Log the authorization code
  Logger.log('Authorization code: ' + code);

  // Proceed to exchange the authorization code for an access token
  try {
    let jsonResponse = exchangeCodeForToken(code);

    Logger.log('Access Token: ' + jsonResponse.access_token);
    Logger.log('Workspace Name: ' + jsonResponse.workspace_name);

    storeAccessToken(jsonResponse.access_token);

    // if(userProperties.getProperty('workspace_name')){
    //   removeWorkspaceName();
    // }
    storeWorkspaceName(jsonResponse.workspace_name);

    searchDbsId();
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } catch (error) {
    Logger.log('Error exchanging code for token: ' + error.message);
    return HtmlService.createHtmlOutput('An error occurred: ' + error.message);
  }
}

function exchangeCodeForToken(code) {
  const tokenUrl = 'https://api.notion.com/v1/oauth/token';
  const clientId = OAUTH_CLIENT_ID;
  const clientSecret = OAUTH_CLIENT_SECRET;
  const redirectUri = 'https://script.google.com/macros/d/1FRgpDLeCT2nNKq-qoQeQ55DMikMb8FePbCDVkTs2Cxg8Tt7F9ABa3H-P/usercallback';

  // encode in base 64
  const encoded = Utilities.base64Encode(`${clientId}:${clientSecret}`);

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'payload': JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    }),
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(tokenUrl, options);
    const jsonResponse = JSON.parse(response.getContentText());

    if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
      return jsonResponse;
    } else {
      throw new Error(`Error retrieving token: ${jsonResponse.error_description || response.getContentText()}`);
    }
  } catch (error) {
    Logger.log('Error exchanging code for token: ' + error.message);
    throw error; // Rethrow the error to handle it in the caller function
  }
}

//Store access token into script properties
function storeAccessToken(accessToken) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ACCESS_TOKEN', accessToken);
  Logger.log('Access Token stored successfully.');
}

//Get access token from script properties
function getAccessToken() {
  var userProperties = PropertiesService.getUserProperties();
  var accessToken = userProperties.getProperty('ACCESS_TOKEN');
  
  if (accessToken) {
    Logger.log('Retrieved Access Token: ' + accessToken);
    return accessToken;
  } else {
    Logger.log('No access token found. Please authorize first.');
    return null;
  }
}

//Store workspace name into script properties
function storeWorkspaceName(workspaceName) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('workspace_name', workspaceName);
  Logger.log('Workspace Name stored successfully.');
}

//Get workspace name from script properties
function getWorkspaceName() {
  var userProperties = PropertiesService.getUserProperties();
  var workspaceName = userProperties.getProperty('workspace_name');
  
  if (workspaceName) {
    Logger.log('Retrieved Workspace Name: ' + workspaceName);
    return workspaceName;
  } else {
    Logger.log('No Workspace Name found. Please authorize first.');
    return null;
  }
}

//Send a http request for dbs in linked page using notion api key
function searchDbsId() {
  let userProperties = PropertiesService.getUserProperties();
  //Remove existing keys value
  if(userProperties.getProperty('Customer Invoice List') ||
  userProperties.getProperty('Customer Inquiry History') ||
  userProperties.getProperty('Customer List') ||
  userProperties.getProperty('Staff List')){
    removeDbsId();
  }

  // If any of the properties are not set, fetch from the database
  storeDbsId();

  Logger.log(`Database Customer Invoice List : ${userProperties.getProperty("Customer Invoice List")}`);
  Logger.log(`Database Customer Inquiry History : ${userProperties.getProperty("Customer Inquiry History")}`);
  Logger.log(`Database Customer List : ${userProperties.getProperty("Customer List")}`);
  Logger.log(`Database Staff List : ${userProperties.getProperty("Staff List")}`);
}

function storeDbsId(){
  // Get query object from getDbsId
  const jsonResponse = getDbsId();

  // Check if jsonResponse is valid
  if (!jsonResponse || !jsonResponse.results) {
    Logger.log('Invalid response from getDbsId');
    return;
  }

  // Persist the properties
  try {
    var userProperties = PropertiesService.getUserProperties();
    for (let i = 0; i < 4; i++) {
      const result = jsonResponse.results[i];
      const titleArray = result.title;

      // Logger.log("In for loop for storeDbsId: " + titleArray[0].text.content + " " + result.id);

      // Ensure title array and its first element are valid
      if (titleArray && titleArray.length > 0) {
        // Logger.log("In if statement storeDbsId");
        const titleText = titleArray[0].text;

        // Ensure text and content are defined
        if (titleText && titleText.content) {
          const dbsTitle = titleText.content;
          const dbsId = result.id;

          // Logger.log(`dbsTitle : ${dbsTitle}, dbsId : ${dbsId}`);

          // Store the database title and ID
          userProperties.setProperty(dbsTitle, dbsId);
        } else {
          Logger.log(`Title text or content is undefined for index ${i}`);
        }
      } else {
        Logger.log(`Title array is empty or undefined for index ${i}`);
      }
    }
  } catch (error) {
    Logger.log('Error persisting Notion DBS id: ' + error.message);
  }
}

function getDbsId() {
  const notionAPIKey = getAccessToken();

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': `Bearer ${notionAPIKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28' // Ensure this is the correct version
    },
    'payload': JSON.stringify({
      "filter": {
        "property": "object",
        "value": "database"
      }
    }),
    'muteHttpExceptions': true
  };

  //Test this part
  Utilities.sleep(5000*4);

  try {
    const response = UrlFetchApp.fetch(`https://api.notion.com/v1/search`, options);
    const jsonResponse = JSON.parse(response.getContentText());
    
    if (jsonResponse && jsonResponse.results && jsonResponse.results.length > 0) {
      Logger.log(JSON.stringify(jsonResponse));
      return jsonResponse;
    } else {
      Logger.log('Template not found yet. Retrying...');
    }
  } catch (error) {
    Logger.log('Error querying Notion database: ' + error.message);
  }
}

function removeDbsId(){
  let userProperties = PropertiesService.getUserProperties();

  try{
    userProperties.deleteProperty('Customer Invoice List');
    userProperties.deleteProperty('Customer Inquiry History');
    userProperties.deleteProperty('Customer List');
    userProperties.deleteProperty('Staff List');
  }catch(error){
    Logger.log('Error when removing persistance database id : ' + error);
  }
}

function removeWorkspaceName(){
  let userProperties = PropertiesService.getUserProperties();

  try{
    userProperties.deleteProperty('workspace_name');
  }catch(error){
    Logger.log('Error when removing persistance workspace name: ' + error);
  }
}

function removeToken(){
  let userProperties = PropertiesService.getUserProperties();

  try{
    userProperties.deleteProperty('ACCESS_TOKEN');
  }catch(error){
    Logger.log('Error when removing persistance access token: ' + error);
  }
}