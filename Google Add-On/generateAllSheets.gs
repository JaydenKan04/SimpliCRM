//To generate 3 sheets for add inquiry / add customer / add invoice
function generateAllSheets() {
  var currentSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  //Check how many sheets in currently in spreadsheet
  let sheets = currentSpreadSheet.getSheets();

  try {
    //Remove all until last sheet if more than 1
    if (sheets.length !== 1) {
      for (let i = sheets.length - 1; i > 0; i--) {
        currentSpreadSheet.deleteSheet(sheets[i]);
      }
    }

    //Rename first sheet to a Temporary Sheet Name
    sheets[0].setName("Temporary Sheet Name")

    //Insert two additional sheets into spreadsheet
    for (let i = 0; i < 2; i++) {
      currentSpreadSheet.insertSheet();
    }

    Logger.log("Successfully created 3 sheets");
  } catch (error) {
    Logger.log("Issue with generating sheets : " + error);
  }

  try {
    //Get current sheets
    sheets = currentSpreadSheet.getSheets();

    //Generate format for each sheets
    generateInquiryFormat(sheets[0]);
    generateCustomerFormat(sheets[1]);
    generateInvoiceFormat(sheets[2]);

  } catch (error) {
    Logger.log("Issue with generating format : " + error);
  }

  var activeSheetNum = currentSpreadSheet.getNumSheets();
  Logger.log("Current active sheets : " + activeSheetNum);
}

//Generate inquiry format onto currentsheet 
function generateInquiryFormat(currentSheet) {
  try {
    //Clear current sheet of format and content
    currentSheet.clear();
    // Clear all data validation rules
    currentSheet.getRange(1, 1, currentSheet.getMaxRows(),  currentSheet.getMaxColumns()).clearDataValidations();

    // Delete and Insert three columns to handle the placeholder problem
    currentSheet.deleteColumns(1, 3);
    currentSheet.insertColumns(1, 3);

    const newInquirySheet = currentSheet.setName("Customer Inquiry");
    newInquirySheet.setTabColor('#3c78d8');

    //Add column named
    newInquirySheet.getRange("A1").setValue("Customer Name");
    newInquirySheet.getRange("B1").setValue("Customer Phone");
    newInquirySheet.getRange("C1").setValue("Staff");
    newInquirySheet.getRange("D1").setValue("Inquiry Type");
    newInquirySheet.getRange("E1").setValue("Inquiry Description");
    newInquirySheet.getRange("F1").setValue("Inquiry Priority");
    newInquirySheet.getRange("G1").setValue("Status");

    // Format the header row background color and set font style to bold
    const headerRange = newInquirySheet.getRange(1, 1, 1, 7);
    headerRange.setBackground('#3c78d8'); // Change to desired background color
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');

    // Set column widths
    newInquirySheet.setColumnWidth(1, 150); // Customer Name
    newInquirySheet.setColumnWidth(2, 150); // Customer Phone
    newInquirySheet.setColumnWidth(3, 150); // Staff
    newInquirySheet.setColumnWidth(4, 150); // Inquiry Type
    newInquirySheet.setColumnWidth(5, 250); // Inquiry Description
    newInquirySheet.setColumnWidth(6, 150); // Inquiry Priority
    newInquirySheet.setColumnWidth(7, 150); // Status

    // Format the phone number column as plain text
    newInquirySheet.getRange("B2:B").setNumberFormat('@STRING@');

    // Add drop-down selection, fetch staff data from database (Staff)
    const snameIdMapping = fetchStaffName();
    setStaffColumn(snameIdMapping);
  
    // Add drop-down selection (Inquiry Type)
    var typeRange = newInquirySheet.getRange("D2:D"); // Adjust the range as needed
    var type = ["General Inquiry", "Shipping", "Warranty", "Return & Refund"];
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(type, true)
      .setAllowInvalid(false) // Reject input if invalid
      .setHelpText('Inquiry Type Column: Please select a valid option from the drop-down list.') // Set custom help text
      .build();
    typeRange.setDataValidation(rule);

    // Add drop-down selection (Inquiry Priority)
    var priorityRange = newInquirySheet.getRange("F2:F"); // Adjust the range as needed
    var priorities = ["P1🔥", "P2", "P3", "P4", "P5"];
    rule = SpreadsheetApp.newDataValidation().requireValueInList(priorities, true)
      .setAllowInvalid(false) // Reject input if invalid
      .setHelpText('Priority Column: Please select a valid option from the drop-down list.') // Set custom help text
      .build();
    priorityRange.setDataValidation(rule);

    // Add drop-down selection (Status)
    var statusRange = newInquirySheet.getRange("G2:G"); // Adjust the range as needed
    var status = ["Not started", "In progress", "Done"];
    rule = SpreadsheetApp.newDataValidation().requireValueInList(status, true)
      .setAllowInvalid(false) // Reject input if invalid
      .setHelpText('Status Column: Please select a valid option from the drop-down list.') // Set custom help text
      .build();
    statusRange.setDataValidation(rule);

    Logger.log("Created inquiry format successfully");
  } catch (error) {
    Logger.log("Issue with creating inquiry format : " + error);
  }
}

//Generate customer format onto currentsheet 
function generateCustomerFormat(currentSheet) {
  try {
    //Clear current sheet of format and content
    currentSheet.clear();
    // Clear all data validation rules
    currentSheet.getRange(1, 1, currentSheet.getMaxRows(),  currentSheet.getMaxColumns()).clearDataValidations();

    // Delete and Insert three columns to handle the placeholder problem
    currentSheet.deleteColumns(1, 3);
    currentSheet.insertColumns(1, 3);

    const newInquirySheet = currentSheet.setName("Customer List");
    newInquirySheet.setTabColor('#6aa84f');

    // Clear specific cell content and data validation
    newInquirySheet.getRange("A1").clearContent();

    //Add column named
    newInquirySheet.getRange("A1").setValue("Name");
    newInquirySheet.getRange("B1").setValue("Phone Nubmer");
    newInquirySheet.getRange("C1").setValue("Email Address");

    // Format the header row background color and set font style to bold
    const headerRange = newInquirySheet.getRange(1, 1, 1, 3);
    headerRange.setBackground('#6aa84f'); // Change to desired background color
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');

    // Set column widths
    newInquirySheet.setColumnWidth(1, 150);
    newInquirySheet.setColumnWidth(2, 150);
    newInquirySheet.setColumnWidth(3, 150);

    // Format the phone number column as plain text
    newInquirySheet.getRange("B2:B").setNumberFormat('@STRING@');

    // Check invalid Customer Email
    var typeRange = newInquirySheet.getRange("C2:C"); // Adjust the range as needed
    var rule = SpreadsheetApp.newDataValidation()
      .requireTextIsEmail()
      .setAllowInvalid(false) // Reject input if invalid
      .setHelpText('Please enter a valid Email.') // Set custom help text
      .build();
    typeRange.setDataValidation(rule);

    Logger.log("Created customer format successfully");
  } catch (error) {
    Logger.log("Issue with creating customer format : " + error);
  }
}

//Generate invoice format onto currentsheet 
function generateInvoiceFormat(currentSheet) {
  try {
    //Clear current sheet of format and content
    currentSheet.clear();
    // Clear all data validation rules
    currentSheet.getRange(1, 1, currentSheet.getMaxRows(),  currentSheet.getMaxColumns()).clearDataValidations();

    // Delete and Insert three columns to handle the placeholder problem
    currentSheet.deleteColumns(1, 3);
    currentSheet.insertColumns(1, 3);

    const newInquirySheet = currentSheet.setName("Customer Invoice Generator");
    newInquirySheet.setTabColor('#674ea7');

    //Add column named
    newInquirySheet.getRange("A1").setValue("Customer Name");
    newInquirySheet.getRange("B1").setValue("Customer Phone");
    newInquirySheet.getRange("C1").setValue("Company Name");
    newInquirySheet.getRange("D1").setValue("Company Address");

    // Format the header row background color and set font style to bold
    const headerRange = newInquirySheet.getRange(1, 1, 1, 4);
    headerRange.setBackground('#674ea7'); // Change to desired background color
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');

    // Set column widths
    newInquirySheet.setColumnWidth(1, 150);
    newInquirySheet.setColumnWidth(2, 150);
    newInquirySheet.setColumnWidth(3, 150);
    newInquirySheet.setColumnWidth(4, 200);

    // Format the phone number column as plain text
    newInquirySheet.getRange("B2:B").setNumberFormat('@STRING@');

    Logger.log("Created invoice format successfully");
  } catch (error) {
    Logger.log("Issue with creating invoice format : " + error);
  }
}
