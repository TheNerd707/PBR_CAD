const fs = require("fs");
const path = require("path");

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function checkData() {
  const dataTypes = ["chars", "guilds", "users"];
  const missingFiles = [];

  for (const type of dataTypes) {
    const typePath = path.join(__dirname, "data", type);
    if (!fs.existsSync(typePath)) {
      missingFiles.push(type);
    }
  }

  if (missingFiles.length > 0) {
    for (const file of missingFiles) {
      fs.mkdirSync(path.join(__dirname, "data", file), { recursive: true });
    }
    console.log("Data folders created.");
  } else {
    return;
  }
}

async function getData(type, id) {
  if (!id) {
    const data = fs.readdirSync(path.join(__dirname, "data", type));
    return data;
  } else if (id) {
    if (isNumeric(id)) {
      id = `${id}.json`;
      const filePath = path.join(__dirname, "data", type, id);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        const returnData = JSON.parse(fileData);
        return returnData;
      } else {
        return null;
      }
    } else {
      let finalData = null;
      for (const file of fs.readdirSync(path.join(__dirname, "data", type))) {
        const filePath = path.join(__dirname, "data", type, file);
        const fileData = fs.readFileSync(filePath, "utf-8");
        const returnData = JSON.parse(fileData);
        if (returnData.name === id) {
          finalData = returnData;
          break;
        }
      }
      if (finalData) {
        return finalData;
      } else {
        return null;
      }
    }
  } else {
    return null;
  }
}
async function updateData(type, id, data) {
  id = `${id}.json`;
  const filePath = path.join(__dirname, "data", type, id);
  const stringData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, stringData);
}

async function createData(type, data) {
  const id = data.id;
  const fileName = `${id}.json`;
  const filePath = path.join(__dirname, "data", type, fileName);
  const stringData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, stringData);
}

async function deleteData(type, id) {
  if (!id) {
    throw new Error("Id is required to delete data.");
  } else if (!isNumeric(id)) {
    throw new Error("Id must be numeric.");
  }
  id = `${id}.json`;
  const filePath = path.join(__dirname, "data", type, id);
  fs.unlinkSync(filePath);
}

module.exports = { getData, updateData, createData, deleteData, checkData };
