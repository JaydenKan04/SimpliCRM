function showDisconnectedDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('disconnectedDialog')
    .setWidth(400)
    .setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Connection Required');
}

function showCustomerInquiryDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerInquiryDialog')
    .setWidth(400)
    .setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Add to Customer Inquiry');
}

function openInquiryLoading() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerInquiryLoading')
    .setWidth(200)
    .setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sending Data...');
}

function showCustomerListDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerListDialog')
    .setWidth(400)
    .setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Add to Customer List');
}

function openCustomerLoading() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerListLoading')
    .setWidth(200)
    .setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sending Data...');
}

function showCustomerInvoiceDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerInvoiceDialog')
    .setWidth(400)
    .setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Add to Customer Invoice');
}

function openInvoiceLoading() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('CustomerInvoiceLoading')
    .setWidth(200)
    .setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sending Data...');
}

// Code.gs
function onHomepage(e) {
  var builder = CardService.newCardBuilder();

  // Button for generating the 3 sheets
  var generateAction = CardService.newAction().setFunctionName('generateAllSheets');
  var generateSheetsBtn = CardService.newImageButton().setAltText("Run").setOnClickAction(generateAction).setIconUrl("https://img.icons8.com/?size=100&id=yZXTvV3Fz6vE&format=png&color=8D8D8D");
  var generateKeyValue = CardService.newKeyValue().setContent("Generate all required sheets").setButton(generateSheetsBtn);
  var generateSection = CardService.newCardSection().addWidget(generateKeyValue);

  // Create actions for each button (Add Inquiry, Customer, Invoice record)
  var action1 = CardService.newAction().setFunctionName('customerInquiry');
  var action2 = CardService.newAction().setFunctionName('customerList');
  var action3 = CardService.newAction().setFunctionName('customerInvoice');

  // Create buttons and set their actions
  var button1 = CardService.newTextButton()
    .setText('Add')
    .setOnClickAction(action1);
  var button2 = CardService.newTextButton()
    .setText('Add')
    .setOnClickAction(action2);
  var button3 = CardService.newTextButton()
    .setText('Add')
    .setOnClickAction(action3);

  // Create KeyValue widgets with the text on the left and button on the right
  var keyValue1 = CardService.newDecoratedText()
    .setText("Customer Inquiries")
    .setButton(button1)
    .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.DESCRIPTION));

  var keyValue2 = CardService.newDecoratedText()
    .setText("New Customers")
    .setButton(button2)
    .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.PERSON));

  var keyValue3 = CardService.newDecoratedText()
    .setButton(button3)
    .setText("New Invoices")
    .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.DOLLAR));

  var submitDataHeader = CardService.newDecoratedText().setText("Submit data").setBottomLabel("Select an option below");

  // Create a card section and add the KeyValue widgets
  var section = CardService.newCardSection()
    .addWidget(submitDataHeader)
    .addWidget(keyValue1)
    .addWidget(keyValue2)
    .addWidget(keyValue3);

  // Button for connecting to Notion Workspace
  var connectAction = CardService.newAction().setFunctionName('showAuthorizationPrompt');
  var connectBtn = CardService.newImageButton().setAltText("Run").setOnClickAction(connectAction).setIconUrl("https://img.icons8.com/?size=100&id=yZXTvV3Fz6vE&format=png&color=8D8D8D");
  var connectKeyValue = CardService.newKeyValue().setContent("Connect to your Notion Workspace").setButton(connectBtn);
  let workspaceName = "None";
  if (PropertiesService.getUserProperties().getProperty('workspace_name')) {
    // Find the connected workspace name
    workspaceName = PropertiesService.getUserProperties().getProperty('workspace_name');
  }
  var connectText = CardService.newDecoratedText()
    .setText("Connected: " + workspaceName)
    .setStartIcon(CardService.newIconImage().setIconUrl("https://img.icons8.com/?size=100&id=nZoJhBpPfVev&format=png&color=4C3BCF"));
  var connectSection = CardService.newCardSection().addWidget(connectKeyValue).addWidget(connectText);

  // Create a card header
  var header = CardService.newCardHeader()
    .setTitle('Welcome to SimpliCRM')
    .setSubtitle('A robust add-on to generate sheets and submit data')
    .setImageUrl("https://i.ibb.co/DG9F8hg/crm-logo2.png");

  // Add the header to the card builder
  builder.setHeader(header);

  // Add the section to the card builder
  builder.addSection(generateSection).addSection(section).addSection(connectSection);

  // Build and return the card
  return builder.build();
}

// Customer Inquiry
function customerInquiry() {
  // Check whether the user connect to their Notion or not
  if (!PropertiesService.getUserProperties().getProperty('ACCESS_TOKEN')) {
    showDisconnectedDialog();
  } else {
    addInquiryToDBS1();
  }
}

// Customer List
function customerList() {
  const ui = SpreadsheetApp.getUi();
  const allData = getAllData("Customer List");

  // Check whether the user connect to their Notion or not
  if (!PropertiesService.getUserProperties().getProperty('ACCESS_TOKEN')) {
    showDisconnectedDialog();
  } else {

    if (checkEmailInDatabase()) {
      ui.alert('The highlighted phone number(s) or email(s) are already registered in our database. Please use a new one.');
    } else {
      addCustomersToDBS1(allData);
    }
  } 
}

// Invoice List
function customerInvoice() {
  // Check whether the user connect to their Notion or not
  if (!PropertiesService.getUserProperties().getProperty('ACCESS_TOKEN')) {
    showDisconnectedDialog();
  } else {
    addInvoicesToDBS1();
  }
}

// Jayden's solutions
let NOTION_ACCESS_TOKEN;
let CUSTOMER_INQUIRY_DBS_ID;
let CUSTOMER_LIST_DBS_ID;
let CUSTOMER_INVOICE_DBS_ID;
let STAFF_LIST_DBS_ID;

NOTION_ACCESS_TOKEN = PropertiesService.getUserProperties().getProperty('ACCESS_TOKEN');
CUSTOMER_INQUIRY_DBS_ID = PropertiesService.getUserProperties().getProperty('Customer Inquiry History');
CUSTOMER_LIST_DBS_ID = PropertiesService.getUserProperties().getProperty('Customer List');
CUSTOMER_INVOICE_DBS_ID = PropertiesService.getUserProperties().getProperty('Customer Invoice List');
STAFF_LIST_DBS_ID = PropertiesService.getUserProperties().getProperty('Staff List');

function testing() {
  Logger.log("Customer List ID: " + PropertiesService.getUserProperties().getProperty('Staff List'));
}

const headers = {
  'Authorization': 'Bearer ' + NOTION_ACCESS_TOKEN,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28'
};

// Send Customer Inquiry data to notion database
function addInquiryToDBS1() {

  //After grabbing the variable add from google sheets to here
  const allData = getAllData("Customer Inquiry");

  if (allData.length < 2) {
    // If users didn't insert any data, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Fill in at least one row of data.');
    return false;
  }

  if (isEmptyValues(allData, "Customer Inquiry")) {
    // If any required field is empty, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Please fill in all required fields before submitting.');
    return false;
  }

  for (let i = 1; i < allData.length; i++) {
    const customerName = allData[i][0];
    const customerPhone = allData[i][1];
    let customerPageId = null;

    // Get the customer info from the database
    const cnameIdMapping = newFetchCustomerName();
    cnameIdMapping.forEach(page => {
      if (customerName === page.name && customerPhone === page.phone) {
        customerPageId = page.pageId;
      }
    })

    if (!customerPageId) {
      // If couldn't find the customer in our notion database
      SpreadsheetApp.getUi().alert('Please check the customer name or customer phone, we couldn\'t find any customer that matches both the name and the phone number provided');
      return false;
    }
  }

  showCustomerInquiryDialog();

  // return true;
}

function addInquiryToDBS2() {
  //After grabbing the variable add from google sheets to here
  const allData = getAllData("Customer Inquiry");

  for (let i = 1; i < allData.length; i++) {
    const customerName = allData[i][0]; //Need to query from customer data for this page id (production)
    const customerPhone = allData[i][1];
    const staffName = allData[i][2]; //Need to query from staff data for this page id (production)
    const inquiryType = allData[i][3];
    const inquiryDesc = allData[i][4];
    const inquiryPriority = allData[i][5];
    const status = allData[i][6];
    let customerPageId = null;

    // Get the customer info from the database
    const cnameIdMapping = newFetchCustomerName();
    cnameIdMapping.forEach(page => {
      if (customerName === page.name && customerPhone === page.phone) {
        // customerId = page.customerId
        customerPageId = page.pageId;
      }
    })

    // // Get the customer ID from the cnameIdMapping
    // const cnameIdMapping = fetchCustomerName();
    // const customerPageId = cnameIdMapping[customerName];
    // Get the staff ID from the snameIdMapping
    const snameIdMapping = fetchStaffName();
    const staffPageId = snameIdMapping[staffName];

    //insert properties
    const properties = {
      "Customer": {
        "type": "relation",
        "relation": [{ "id": customerPageId }]
      },
      "Staff": {
        "type": "relation",
        "relation": [{ "id": staffPageId }]
      },
      "Inquiry Type": {
        "type": "select",
        "select": { "name": inquiryType }
      },
      "Inquiry Description": {
        "type": "title",
        "title": [{ "type": "text", "text": { "content": inquiryDesc } }]
      }
      ,
      "Inquiry Priority": {
        "type": "select",
        "select": { "name": inquiryPriority }
      },
      "Status": {
        "type": "status",
        "status": { "name": status }
      }
    }

    const data = {
      "parent": { "type": "database_id", "database_id": CUSTOMER_INQUIRY_DBS_ID },
      "properties": properties
    }

    try {
      var options = {
        'method': 'post',
        'headers': headers,
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true // This allows handling non-2xx responses
      }

      const response = UrlFetchApp.fetch("https://api.notion.com/v1/pages", options);
      Logger.log('Response Code: ' + response.getResponseCode());
      Logger.log('Response Body: ' + response.getContentText());

    } catch (exception) {
      Logger.log("Exception : " + exception);
    }

  }

  // After successfully submit the data
  // Clear all the values after sending the data
  clearSheet("Customer Inquiry");
  SpreadsheetApp.getUi().alert('Customer Inquiry data is submitted to Notion Database successfully!');
}
// Jayden's solutions

// Send Customer data to notion database
function addCustomersToDBS1(allData) {

  if (allData.length < 2) {
    // If users didn't insert any data, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Fill in at least one row of data.');
    return false;
  }

  if (isEmptyValues(allData, "Customer List")) {
    // If any required field is empty, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Please fill in all required fields before submitting.');
    return false;
  }

  showCustomerListDialog();

  // return true;
}

function addCustomersToDBS2() {
  const allData = getAllData("Customer List");

  for (let i = 1; i < allData.length; i++) {
    const customerName = allData[i][0];
    const phoneNo = allData[i][1];
    const email = allData[i][2];

    //insert properties
    const properties = {
      "Name": {
        "type": "title",
        "title": [{ "type": "text", "text": { "content": customerName } }]
      },
      "Phone Number": {
        "type": "phone_number",
        "phone_number": phoneNo
      },
      "Email Address": {
        "type": "email",
        "email": email
      }
    }

    const data = {
      "parent": { "type": "database_id", "database_id": CUSTOMER_LIST_DBS_ID },
      "properties": properties
    }

    try {
      var options = {
        'method': 'post',
        'headers': headers,
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true // This allows handling non-2xx responses
      }

      const response = UrlFetchApp.fetch("https://api.notion.com/v1/pages", options);
      Logger.log('Response Code: ' + response.getResponseCode());
      Logger.log('Response Body: ' + response.getContentText());

    } catch (exception) {
      Logger.log("Exception : " + exception);
    }
  }

  // After successfully submit the data
  // Clear all the values after sending the data
  clearSheet("Customer List");
  SpreadsheetApp.getUi().alert('Customer data is submitted to Notion Database successfully!');
}

// Send Invoice data to notion database
function addInvoicesToDBS1() {
  //After grabbing the variable add from google sheets to here
  const allData = getAllData("Customer Invoice Generator");

  if (allData.length < 2) {
    // If users didn't insert any data, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Fill in at least one row of data.');
    return false;
  }

  if (isEmptyValues(allData, "Customer Invoice Generator")) {
    // If any required field is empty, show an alert and stop the function
    SpreadsheetApp.getUi().alert('Please fill in all required fields before submitting.');
    return false;
  }

  for (let i = 1; i < allData.length; i++) {
    // const customerId = allData[i][0];
    let customerId;
    const customerName = allData[i][0];
    const customerPhone = allData[i][1];
    let customerPageId = null;

    // Get the customer info from the database
    const cnameIdMapping = newFetchCustomerName();
    cnameIdMapping.forEach(page => {
      if (customerName === page.name && customerPhone === page.phone) {
        customerId = page.customerId
        customerPageId = page.pageId;
      }
    })

    if (!customerPageId) {
      // If couldn't find the customer in our notion database
      SpreadsheetApp.getUi().alert('Please check the customer name or customer phone, we couldn\'t find any customer that matches both the name and the phone number provided');
      return false;
    }
  }

  showCustomerInvoiceDialog();

  // return true;
}

function addInvoicesToDBS2() {
  //After grabbing the variable add from google sheets to here
  const allData = getAllData("Customer Invoice Generator");

  for (let i = 1; i < allData.length; i++) {
    // const customerId = allData[i][0];
    let customerId;
    const customerName = allData[i][0];
    const customerPhone = allData[i][1];
    const companyName = allData[i][2];
    const companyAddress = allData[i][3];
    let invoiceFileName = "Unknown";
    let googleDriveFile = "https://www.notion.so";
    let customerPageId = null;

    // Get the customer info from the database
    const cnameIdMapping = newFetchCustomerName();
    cnameIdMapping.forEach(page => {
      if (customerName === page.name && customerPhone === page.phone) {
        customerId = page.customerId
        customerPageId = page.pageId;
      }
    })

    //insert properties
    const properties = {
      "Customer": {
        "relation": [{
          "id": customerPageId
        }]
      },
      "Company Name": {
        "rich_text": [{
          "type": "text",
          "text": {
            "content": companyName,
            "link": null
          }
        }]
      },
      "Invoice File Name": {
        "title": [{
          "type": "text",
          "text": {
            "content": invoiceFileName
          }
        }]
      },
      "Google Drive File": {
        "files": [{
          "name": invoiceFileName,
          "type": "external",
          "external": {
            "url": googleDriveFile
          }
        }]
      }
    };

    const data = {
      "parent": { "type": "database_id", "database_id": CUSTOMER_INVOICE_DBS_ID },
      "properties": properties
    }

    try {
      var options = {
        'method': 'post',
        'headers': headers,
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true // This allows handling non-2xx responses
      }

      const response = UrlFetchApp.fetch("https://api.notion.com/v1/pages", options);
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();

      Logger.log('Response Code: ' + responseCode);
      Logger.log('Response Body: ' + responseBody);

      if (responseCode === 200) {
        const jsonResponse = JSON.parse(responseBody);

        // Extract the unique ID of the newly created invoice record in notion database
        const newPageId = jsonResponse.id;
        Logger.log("New Page ID: " + newPageId);

        // Fetch the newly created page to get the properties
        const fetchOptions = {
          'method': 'get',
          'headers': headers,
          'muteHttpExceptions': true
        };

        const fetchResponse = UrlFetchApp.fetch(`https://api.notion.com/v1/pages/${newPageId}`, fetchOptions);
        const fetchResponseBody = fetchResponse.getContentText();
        Logger.log('Fetch Response Body: ' + fetchResponseBody);

        // Finally, we got the invoice's unique id
        const fetchJsonResponse = JSON.parse(fetchResponseBody);
        const uniqueId = Object.values(fetchJsonResponse.properties).find(prop => prop.type === 'unique_id').unique_id.number;

        Logger.log('Invoice\'s Unique ID: ' + uniqueId);

        // ** Generate Invoice File in Google Drive, using previous field and unique id**
        newInvoice = createCopyOfInvoice(uniqueId, customerId, customerName, companyName, companyAddress, customerPhone);
        updateInvoiceNameAndUrl(newPageId, newInvoice.invoiceFileName, newInvoice.googleDriveFile);

      } else {
        Logger.log('Error: ' + responseBody);
      }

    } catch (exception) {
      Logger.log("Exception : " + exception);
    }

  }

  // After successfully submit the data
  // Clear all the values after sending the data
  clearSheet("Customer Invoice Generator");
  SpreadsheetApp.getUi().alert('Customer Invoice data is submitted to Notion Database successfully!');
}

// ** Generate Invoice File in Google Drive, using previous field and unique id**
function createCopyOfInvoice(invoiceId, customerId, customerName, companyName, companyAddress, customerPhone) {
  //Should be changed when put into production
  const rootFolder = DriveApp.getFolderById("1P8UI6pJOlYR34aD4G9QQU2lDIR0Pebup");
  const invoiceSampleFile = DriveApp.getFileById("1rsEhh1GMYuTFNcaidfAeUnJ6A7Bna97qbwIsoWqHNlM");

  // Arrow function to format the date as "YYYY-MM-DD"
  const formattedDate = getFormattedDate();

  const invoiceFileName = `${customerId}-${invoiceId}-INV-${formattedDate}`;

  try {
    let customerIdFolder = null;

    // If no customer id folder found, then make a new one
    if (!rootFolder.getFoldersByName(customerId).hasNext()) {
      customerIdFolder = rootFolder.createFolder(customerId);
    } else {
      // Get customerFolder
      customerIdFolder = rootFolder.getFoldersByName(customerId).next();
    }

    // Make new invoice file at customerIdFolder and name it as invoiceFileName
    const newInvoiceFile = invoiceSampleFile.makeCopy(invoiceFileName, customerIdFolder);

    // Change formatted cell to sales input
    changeFormattedCell(newInvoiceFile.getId(), invoiceId, customerId, customerName, companyName, companyAddress, customerPhone);
    Logger.log("Invoice created successfully: " + newInvoiceFile.getUrl());

    //Get invoice file name and google drive url and store in notion 
    return {
      invoiceFileName: invoiceFileName,
      googleDriveFile: newInvoiceFile.getUrl()
    };

  } catch (error) {
    Logger.log("Error occurred: " + error);
  }
}

// Replace placeholders in the new document
function changeFormattedCell(invoiceFileId, invoiceId, customerId, customerName, companyName, companyAddress, customerPhone) {
  try {
    var doc = DocumentApp.openById(invoiceFileId);
    var body = doc.getBody();
    const formattedDate = getFormattedDate();

    body.replaceText("\\[invoiceId\\]", invoiceId);
    body.replaceText("\\[date\\]", formattedDate);
    body.replaceText("\\[customerName\\]", customerName);
    body.replaceText("\\[companyName\\]", companyName);
    body.replaceText("\\[companyAddress\\]", companyAddress);
    body.replaceText("\\[customerPhone\\]", customerPhone);

    Logger.log("Invoice placeholders replaced successfully.");
  } catch (error) {
    Logger.log("Error encountered: " + error);
  }
}

function getFormattedDate() {
  const date = new Date(); // Get the current date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Update the invoice file name and its google drive file url
function updateInvoiceNameAndUrl(pageId, invoiceFileName, googleDriveFile) {
  const properties = {
    "Invoice File Name": {
      "title": [{
        "type": "text",
        "text": {
          "content": invoiceFileName
        }
      }]
    },
    "Google Drive File": {
      "files": [{
        "name": invoiceFileName,
        "type": "external",
        "external": {
          "url": googleDriveFile
        }
      }]
    }
  };

  const data = {
    "properties": properties
  };

  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const options = {
    'method': 'patch',
    'headers': headers,
    'payload': JSON.stringify(data)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('Response Code: ' + response.getResponseCode());
    Logger.log('Response Body: ' + response.getContentText());
  } catch (exception) {
    Logger.log("Exception : " + exception);
  }
}

// Check if the email is registered in our database
function checkEmailInDatabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Customer List");
  const emailRange = sheet.getRange("C2:C"); // Assuming emails are in column C starting from row 2
  const emailValues = emailRange.getValues().flat(); // Get all email values

  const phoneNumberRange = sheet.getRange("B2:B"); // Assuming emails are in column C starting from row 2
  const phonNumberValues = phoneNumberRange.getValues().flat(); // Get all email values

  let foundRegisteredEmailOrPhone = false;

  // For phone numbers
  const registeredPhones = getRegisteredPhones();
  phonNumberValues.forEach((phoneNumber, index) => {
    if (phoneNumber && registeredPhones.includes(phoneNumber)) {
      sheet.getRange(index + 2, 2).setBackground("#F28B82"); // Highlight cell if phone number is registered
      foundRegisteredEmailOrPhone = true;
    } else {
      sheet.getRange(index + 2, 2).setBackground(null); // Clear highlight if phone number is not registered
    }
  });

  // For emails
  const registeredEmails = getRegisteredEmails();
  emailValues.forEach((email, index) => {
    if (email && registeredEmails.includes(email)) {
      sheet.getRange(index + 2, 3).setBackground("#F28B82"); // Highlight cell if email is registered
      foundRegisteredEmailOrPhone = true;
    } else {
      sheet.getRange(index + 2, 3).setBackground(null); // Clear highlight if email is not registered
    }
  });

  return foundRegisteredEmailOrPhone;
}

// Fetch all the customer phone numbers in our database
function getRegisteredPhones() {

  // Can reuse the fetchCustomerName but this time need to fetch phone number and email
  const url = `https://api.notion.com/v1/databases/${CUSTOMER_LIST_DBS_ID}/query`;

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      const results = jsonResponse.results;

      const phoneNumbers = results.map(page => {
        const phoneNumbersProp = Object.values(page.properties).find(prop => prop.type === "phone_number");
        return phoneNumbersProp ? phoneNumbersProp.phone_number : null;
      }).filter(phone => phone !== null);

      Logger.log(phoneNumbers);
      return phoneNumbers;

    } else {
      Logger.log('Error: ' + responseBody);
    }
  } catch (exception) {
    Logger.log('Exception: ' + exception);
  }
}

// Fetch all the customer emails in our database
function getRegisteredEmails() {

  // Can reuse the fetchCustomerName but this time need to fetch phone number and email
  const url = `https://api.notion.com/v1/databases/${CUSTOMER_LIST_DBS_ID}/query`;

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      const results = jsonResponse.results;

      const emails = results.map(page => {
        const emailProp = Object.values(page.properties).find(prop => prop.type === "email");
        return emailProp ? emailProp.email : null;
      }).filter(email => email !== null);

      return emails;

    } else {
      Logger.log('Error: ' + responseBody);
    }
  } catch (exception) {
    Logger.log('Exception: ' + exception);
  }
}


// Fetch Staff name from Notion Database (name id mapping)
function fetchStaffName() {

  if(!STAFF_LIST_DBS_ID) {
    // If user hasn't connected to their Notion, then just return empty object because we can't fetch any data
    return {};
  }

  const url = `https://api.notion.com/v1/databases/${STAFF_LIST_DBS_ID}/query`;

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      const results = jsonResponse.results;

      // Prepare name to page ID mapping, then show it in drop-down selection in column B (staff)
      const nameIdMapping = results.map(page => {
        const nameProperty = Object.values(page.properties).find(prop => prop.type === 'title');
        if (nameProperty && nameProperty.title.length > 0) {
          return {
            name: nameProperty.title[0].text.content,
            id: page.id
          };
        }
        return null;
      }).filter(entry => entry !== null);

      // Convert the array to an object with the format {"John": id}
      const reducedNameIdMapping = nameIdMapping.reduce((acc, entry) => {
        acc[entry.name] = entry.id;
        return acc;
      }, {});

      // // Log the reducedNameIdMapping object to verify the format
      // Logger.log('Name to ID Mapping: ' + JSON.stringify(reducedNameIdMapping));

      return reducedNameIdMapping;

    } else {
      Logger.log('Error: ' + responseBody);
    }
  } catch (exception) {
    Logger.log('Exception: ' + exception);
  }
}

function setStaffColumn(nameIdMapping) {
  // Write data to the active Google Sheets
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Customer Inquiry");

  // Create a dropdown selection in column B for each row
  const names = Object.keys(nameIdMapping); // Extract the names from the object
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(names, true)
      .setAllowInvalid(false) // Reject input if invalid
      .setHelpText('Staff Column: Please select a valid option from the drop-down list.') // Set custom help text
      .build();
  // const lastRow = sheet.getLastRow();
  const numRows = sheet.getMaxRows(); // Get the total number of rows in the sheet

  // Apply the dropdown to column C (starting from row 2 to avoid headers)
  for (let i = 2; i <= numRows; i++) {
    const cell = sheet.getRange(i, 3);
    cell.setDataValidation(rule);

    // Set default value to nothing
    cell.setValue('');
  }
}



// Fetch Customer name from Notion Database (name id mapping)
function fetchCustomerName() {
  const url = `https://api.notion.com/v1/databases/${CUSTOMER_LIST_DBS_ID}/query`;

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      const results = jsonResponse.results;

      // Prepare name to page ID mapping, then show it in drop-down selection in column B (staff)
      const nameIdMapping = results.map(page => {
        const nameProperty = Object.values(page.properties).find(prop => prop.type === 'title');
        if (nameProperty && nameProperty.title.length > 0) {
          return {
            name: nameProperty.title[0].text.content,
            id: page.id
          };
        }
        return null;
      }).filter(entry => entry !== null);

      Logger.log(nameIdMapping);

      // Convert the array to an object with the format {"John": id}
      const reducedNameIdMapping = nameIdMapping.reduce((acc, entry) => {
        acc[entry.name] = entry.id;
        return acc;
      }, {});

      // // Log the reducedNameIdMapping object to verify the format
      // Logger.log('Name to ID Mapping: ' + JSON.stringify(reducedNameIdMapping));

      return reducedNameIdMapping;

    } else {
      Logger.log('Error: ' + responseBody);
    }
  } catch (exception) {
    Logger.log('Exception: ' + exception);
  }
}

// Fetch Customer name from Notion Database (name id mapping)
function newFetchCustomerName() {
  const url = `https://api.notion.com/v1/databases/${CUSTOMER_LIST_DBS_ID}/query`;

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseBody);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      const results = jsonResponse.results;

      // Prepare name to page ID mapping, then show it in drop-down selection in column B (staff)
      const nameIdMapping = results.map(page => {
        const idProperty = Object.values(page.properties).find(prop => prop.type === 'unique_id');
        const nameProperty = Object.values(page.properties).find(prop => prop.type === 'title');
        const phoneProperty = Object.values(page.properties).find(prop => prop.type === 'phone_number');
        if (nameProperty && nameProperty.title.length > 0) {
          return {
            customerId: String(idProperty.unique_id.number),
            name: nameProperty.title[0].text.content,
            phone: phoneProperty ? phoneProperty.phone_number : null,
            pageId: page.id
          };
        }
        return null;
      }).filter(entry => entry !== null);

      Logger.log(nameIdMapping);

      return nameIdMapping;

    } else {
      Logger.log('Error: ' + responseBody);
    }
  } catch (exception) {
    Logger.log('Exception: ' + exception);
  }
}


function setCustomerColumn(nameIdMapping) {
  // Write data to the active Google Sheets
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Customer Inquiry");

  // Create a dropdown selection in column A for each row
  const names = Object.keys(nameIdMapping); // Extract the names from the object
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(names, true).build();
  // const lastRow = sheet.getLastRow();
  const numRows = sheet.getMaxRows(); // Get the total number of rows in the sheet

  // Apply the dropdown to column B (starting from row 2 to avoid headers)
  for (let i = 2; i <= numRows; i++) {
    const cell = sheet.getRange(i, 1);
    cell.setDataValidation(rule);

    // Set default value to nothing
    cell.setValue('');
  }
}

function isEmptyValues(allData, sheetName) {
  let columns;
  if (sheetName == "Customer Inquiry") {
    columns = 7;
  } else if (sheetName == "Customer List") {
    columns = 3;
  } else if (sheetName == "Customer Invoice Generator") {
    columns = 4;
  }

  for (let i = 1; i < allData.length; i++) {
    for (let j = 0; j < columns; j++) {
      const cellValue = allData[i][j];

      if (!cellValue) {
        return true;
      }
    }
  }

  return false;
}

function getAllData(sheetName) {
  // Open the active spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();


  // Get the first sheet (you can also get a specific sheet by name)
  const sheet = spreadsheet.getSheetByName(sheetName);

  // Get the entire range of data in the sheet
  const dataRange = sheet.getDataRange();

  // Get the values in the data range as a 2D array
  const data = dataRange.getValues();

  // Log the data to the console (optional)
  for (let i = 1; i < data.length; i++) {
    Logger.log(data[i]);
  }

  Logger.log("Data length: " + data.length);

  return data;
}

function clearSheet(sheetName) {
  // Get the active spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Get the first sheet (you can also get a specific sheet by name)
  const sheet = spreadsheet.getSheetByName(sheetName);

  // Get the range of all the cells except the first row
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());

  // Clear the values in the range
  range.clearContent();
}
