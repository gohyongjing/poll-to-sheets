const ID_TO_NAME = "id_to_name";
const ID_TO_NAME_START_COORDS = [1, 1]; // row, column

var botToken = "<your telegram bot token>"; 
var webAppUrl = "<your web app url>";
// Deploying a new app changes the webAppUrl, remember to replace the webAppUrl and run deleteWebhook and setWebhook manually.
var spreadsheetId = "<your spreadsheet id>";

var botUrl = "https://api.telegram.org/bot" + botToken;

function encodeIntoUrl(method, params) {
  //encodes the text so that escape characters send properly as a message (e.g. allows the use of \n)
  url = botUrl + "/" + method + "?parsemode=Markdown";
  for(var param in params) {
    url += "&" + param + "=" + encodeURIComponent(params[param]);
  }
  return url;
}

function post(method, params) {
  var response = UrlFetchApp.fetch(encodeIntoUrl(method, params));
  console.info(response.getContentText());
  return response.getContentText();
}

function setWebhook() {
  post("setWebhook", {"url": webAppUrl});
}

function deleteWebhook() {
  post("deleteWebhook", {});
}

function resetWebhook() {
  deleteWebhook();
  setWebhook();
}

function createSheet(poll) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).insertSheet(poll.id);
  sheet.appendRow([poll.question]);
  headers = ['Name'];
  headers.push(...poll.options.map(option => option.text))
  sheet.appendRow(headers);
  return sheet;
}

function getSheet(sheetName) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (sheet == null) {
    console.error("id_to_name sheet with name '" + sheetName + "' not found");
  }
  return sheet;
}

/**
 * Replaces the first row in the sheet where its first column is equal to the first element in the data_array.
 * Creates a new row with data_array if such a row is not found.
 */
function updateRow(sheet, data_array) {
  var lastRow = sheet.getLastRow();
  for (var i = ID_TO_NAME_START_COORDS[0]; i <= lastRow; i++) {
    if (sheet.getRange(i, ID_TO_NAME_START_COORDS[1]).getValue() == data_array[0]) {
      sheet
        .getRange(i, ID_TO_NAME_START_COORDS[0], ID_TO_NAME_START_COORDS[1], data_array.length)
        .setValues([data_array]);
      return;
    }
  }
  sheet.getRange(lastRow + 1, ID_TO_NAME_START_COORDS[0], ID_TO_NAME_START_COORDS[1], data_array.length).setValues([data_array]);
}

function updateSheetWithName(message) {
  var sheet = getSheet(ID_TO_NAME);
  var id = message.from.id;
  var name = message.text.substring(6);
  updateRow(sheet, [id, name]);
  return [id, name];
}

function getName(telegramId) {
  var sheet = getSheet(ID_TO_NAME);
  var lastRow = sheet.getLastRow();
  for (var i = ID_TO_NAME_START_COORDS[0]; i <= lastRow; i++) {
    if (sheet.getRange(i, ID_TO_NAME_START_COORDS[1]).getValue() == telegramId) {
      return sheet.getRange(i, ID_TO_NAME_START_COORDS[1] + 1).getValue();
    }
  }
  console.log("id '" + telegramId + "' not found in id_to_name sheet");
}

/**
 * Converts a list of selected option ids into a spreadsheet row.
 * 
 * e.g. (name: "adam", option_ids: [2,3,5], num_options: 7 -> ["adam", "", "", 1, 1, "", 1, ""]
 */
function formatOptionsIntoSpreadSheetRow(name, option_ids, num_options) {
  var row = [name];
  for (var i = 0; i < num_options; i++) {
    if (option_ids.includes(i)) {
      row.push(1);
    } else {
      row.push("");
    }
  }
  return row;
}

function updateSheetWithPoll(poll_answer) {
  var sheet = getSheet(poll_answer.poll_id);
  var name = getName(poll_answer.user.id);
  var lastCol = sheet.getLastColumn();
  var row = formatOptionsIntoSpreadSheetRow(name, poll_answer.option_ids, lastCol - 1);
  updateRow(sheet, row);
}

function sendText(id, text) {
  post("sendMessage", {"chat_id": id, "text": text});
}

function sendPoll(id, poll) {
  return post("sendPoll",
    {
      "chat_id": id,
      "question": poll.question,
      "options": JSON.stringify(poll.options.map(option => option.text)),
      "is_anonymous": poll.is_anonymous
    }
  );
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  if ("message" in contents) {
    var message = contents.message;
    var chat_id = message.chat.id;    
    if ("text" in message) {
      if (message.text.includes("/name")) {
        var result = updateSheetWithName(message);
        sendText(chat_id, "Successfully updated telegram user with id '" + result[0] + "' with name '" + result[1] + "'");
      }
    } else if ("poll" in message) {
      var response = sendPoll(chat_id, message.poll);
      var result = JSON.parse(response).result;
      createSheet(result.poll);
    }
  }
  if ("poll_answer" in contents) {
    updateSheetWithPoll(contents.poll_answer);
  }
}


