import csv from "csv-parser";
import moment from "moment";
import fs from "fs";
import { Stock } from "../Models/stock.model.js";
import { Categorization } from "../Models/main.model.js";
import { extname } from "path";
import { ApiHandler } from "./apiHandler.js";
import {
  GetAllMarketandFloatCaps,
  createbackupMarketFloat,
  getCurrentFivedays,
  getCurrentSectorCap,
  updateMarketFloatCap,
} from "../Controllers/stock.controller.js";

let sectorfile = ""; //multer

const processCSV = async (sectors, sectorsfilepath, res) => {
  if (!sectors) return null;
  let headerError = false;
  sectorfile = sectors;

  const stockExist = await Stock.find();
  const updateMarketcap = await getCurrentFivedays();

  const expectedHeaders = [
    "Index",
    "symbol",
    "company_Name",
    "is_in_FNO",
    "macro",
    "sector",
    "industry",
    "basic_Industry",
    "last_Price",
    "vwap",
    "total_Market_Cap",
    "free_float",
    "sector_member",
    "date",
  ];

  fs.createReadStream(sectorsfilepath)
    .pipe(csv())
    .on("headers", async (headers) => {
      // Check if headers match the expected headers
      const isValidHeaders = expectedHeaders.every((header) =>
        headers.includes(header)
      );

      if (!isValidHeaders) {
        console.error(
          "Invalid CSV file headers. Please check the file format."
        );
        if (fs.existsSync(sectorsfilepath)) {
          // File exists, proceed with deletion
          await fs.promises.unlink(sectorsfilepath);
          headerError = true;
          if (headerError) {
            res.status(400).json({
              success: false,
              message: "Invalid CSV file. Please check the file format.",
            });
          }
        }
      }
    })
    .on("data", async (row) => {
      // If there was a header validation error, skip processing data
      if (headerError) {
        return;
      }

      const symbol = row.symbol;
      const existingCompany = await Stock.findOne({ symbol });

      if (stockExist.length !== 0) {
        if (
          row.date ==
          stockExist[0].date
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()
            .replace(/ /g, "")
        ) {
          if (fs.existsSync(sectorsfilepath)) {
            // File exists, proceed with deletion
            await fs.promises.unlink(sectorsfilepath);

            console.error("File Already Exists");
            if (!headerError) {
              res.status(400).json({
                success: false,
                message: "File Already Exists",
              });
              headerError = true;
              return; // Ensure the response is not sent multiple times
            }
          }
        }
      }

      const categorizationData = await Categorization.findOne({
        "NSE Symbol": symbol,
      });
      const categorizationValue =
        categorizationData?.[
          "Categorization as per SEBI Circular dated Oct 6, 2017"
        ] || "";

      const date = row.date ? moment.utc(row.date, "DDMMMYYYY").toDate() : "";
      const companyData = {
        Index: parseInt(row.Index),
        symbol: row.symbol,
        company_Name: row.company_Name,
        macro: row.macro,
        sector: row.sector,
        industry: row.industry,
        basic_Industry: row.basic_Industry,
        last_Price: parseFloat(row["last_Price"])
          ? parseFloat(row["last_Price"].replace(",", "").trim())
          : 1,
        total_Market_Cap: parseFloat(row["total_Market_Cap"])
          ? parseFloat(row["total_Market_Cap"].replace(",", "").trim())
          : 1,
        free_float: parseFloat(row["free_float"])
          ? parseFloat(row["free_float"].replace(",", "").trim())
          : 1,
        date: date, // Assign the parsed date
        categorizationData: categorizationValue,
        previous_Last_Price: 1,
      };

      if (existingCompany) {
        existingCompany.previous_Last_Price = existingCompany.last_Price
          ? existingCompany.last_Price
          : 1;

        if (thirdfile !== "") {
          await processThirdCSV();
        }
        const isDataChanged = existingCompany.set(companyData).isModified();

        if (isDataChanged) {
          existingCompany.categorizationData = categorizationValue;
          existingCompany
            .save()
            .then(async () => {
              await fs.promises.unlink(sectorsfilepath);
              // Only send the response if it hasn't been sent yet
              if (!headerError) {
                res.status(200).json({
                  success: true,
                  message: "File uploaded successfully.",
                });
              }
            })
            .catch((error) => {
              // Handle the error as needed
            });
        }
      } else {
        const newCompany = new Stock(companyData);
        await newCompany
          .save()
          .then(async () => {
            await fs.promises.unlink(sectorsfilepath);
            // Only send the response if it hasn't been sent yet
            if (!headerError) {
              await getCurrentSectorCap();
              await createbackupMarketFloat();
              await res.status(200).json({
                success: true,
                message: "File uploaded successfully.",
              });
            }
          })
          .catch((error) => {
            // Handle the error as needed
          });
      }
    });
};

// Process categorization CSV file
let categorizationfile = ""; // multer path here

const processCategorizationCSV = async (
  categorizationFileName,
  categorizationfilepath,
  res
) => {
  if (!categorizationFileName) return null;
  let headerError = false;

  categorizationfile = categorizationFileName;

  const expectedHeaders = [
    "Sr. No.",
    "Company name",
    "ISIN",
    "BSE Symbol",
    "BSE 6 month Avg Total Market Cap in (Rs. Crs.)",
    "NSE Symbol",
    "NSE 6 month Avg Total Market Cap (Rs. Crs.)",
    "MSEI Symbol",
    "MSEI 6 month Avg Total Market Cap in (Rs Crs.)",
    "Average of All Exchanges (Rs. Cr.)",
    "Categorization as per SEBI Circular dated Oct 6, 2017",
  ];

  fs.createReadStream(categorizationfilepath)
    .pipe(csv())
    .on("headers", async (headers) => {
      // Check if headers match the expected headers
      const isValidHeaders = expectedHeaders.every((header) =>
        headers.includes(header)
      );

      if (!isValidHeaders) {
        console.error(
          "Invalid CSV file headers. Please check the file format."
        );
        if (fs.existsSync(categorizationfilepath)) {
          // File exists, proceed with deletion
          await fs.promises.unlink(categorizationfilepath);
          headerError = true;
          if (headerError) {
            res.status(400).json({
              success: false,
              message: "Invalid CSV file. Please check the file format.",
            });
          }
        }
      }
    })
    .on("data", async (row) => {
      if (headerError) {
        return;
      }

      let filePath = extname(categorizationfilepath);
      // console.log(filePath);

      if (filePath !== ".csv") {
        await fs.promises.unlink(categorizationfilepath);
        throw new ApiHandler(400, "File Path is not corrrect");
      }

      const symbol = row["NSE Symbol"];
      const categorizationValue =
        row["Categorization as per SEBI Circular dated Oct 6, 2017"];

      // Find the existing document in Categorization collection
      const existingCategorization = await Categorization.findOne({
        "NSE Symbol": symbol,
      });

      if (existingCategorization) {
        // Update the existing document
        existingCategorization[
          "Categorization as per SEBI Circular dated Oct 6, 2017"
        ] = categorizationValue;

        await existingCategorization
          .save()
          .then(async () => {
            // console.log('Categorization data updated in MongoDB');
            await fs.promises.unlink(categorizationfilepath);
            if (!headerError) {
              res.status(200).json({
                success: true,
                message: "File uploaded successfully.",
              });
            }
          })
          .catch((error) => {
            // console.error(
            //   "Error updating categorization data in MongoDB:",
            //   error
            // );
          });
      } else {
        // Create a new document if it doesn't exist
        const categorizationData = {
          "NSE Symbol": symbol,
          "Categorization as per SEBI Circular dated Oct 6, 2017":
            categorizationValue,
        };

        const newCategorization = new Categorization(categorizationData);

        await newCategorization
          .save()
          .then(async () => {
            // console.log('Data saved to Categorization collection');
            await fs.promises.unlink(categorizationfilepath);
            if (!headerError) {
              res.status(200).json({
                success: true,
                message: "File uploaded successfully.",
              });
            }
          })
          .catch((error) => {
            // console.error(
            //   "Error saving data to Categorization collection:",
            //   error
            // );
          });
      }
      // console.log("Compleated successfully Mutual fund file!!");
    });
};

let thirdfile = ""; // multer
const processThirdCSV = async (thirdFileName, thirdfilepath, res) => {
  if (!thirdFileName) return null;

  let headerError = false;

  thirdfile = thirdFileName;

  const stock = await Stock.find();

  if (!stock) {
    throw new ApiHandler(400, "Stock not found");
  }

  const [newdate] = stock;

  const updateMarketcap = await getCurrentFivedays();

  const expectedHeaders = [
    "SYMBOL",
    "SERIES",
    "OPEN",
    "HIGH",
    "LOW",
    "CLOSE",
    "LAST",
    "PREVCLOSE",
    "TOTTRDQTY",
    "TOTTRDVAL",
    "TIMESTAMP",
    "TOTALTRADES",
    "ISIN",
  ];

  const myfunction = (thirdfilepath) => {
    const lines = [];
    const stream = fs
      .createReadStream(thirdfilepath)
      .pipe(csv())
      .on("headers", async (headers) => {
        // Check if headers match the expected headers
        const isValidHeaders = expectedHeaders.every((header) =>
          headers.includes(header)
        );

        if (!isValidHeaders) {
          console.error(
            "Invalid CSV file headers. Please check the file format."
          );
          if (fs.existsSync(thirdfilepath)) {
            // File exists, proceed with deletion
            await fs.promises.unlink(thirdfilepath);
            headerError = true;
            if (headerError) {
              res.status(400).json({
                success: false,
                message: "Invalid CSV file. Please check the file format.",
              });
            }
          }
        }
      })
      .on("data", async (row) => {
        lines.push(row.TIMESTAMP);
        if (lines.length === 1) {
          stream.pause(); // Stop reading after the first two lines
        }
        if (
          moment
            .utc(row.TIMESTAMP, "DD-MMM-YYYY")
            .toDate()
            .toLocaleDateString() !== newdate.date.toLocaleDateString()
        ) {
          console.log(
            "File not Exist!!!!",
            moment
              .utc(row.TIMESTAMP, "DD-MMM-YYYY")
              .toDate()
              .toLocaleDateString() !== newdate.date.toLocaleDateString()
          );
          await updateMarketFloatCap();
        } else {
          if (stock.length !== 0) {
            if (
              moment
                .utc(row.TIMESTAMP, "DD-MMM-YYYY")
                .toDate()
                .toLocaleDateString() === newdate.date.toLocaleDateString()
            ) {
              if (fs.existsSync(thirdfilepath)) {
                // File exists, proceed with deletion
                await fs.promises.unlink(thirdfilepath);

                console.error("File Already Exists");
                if (!headerError) {
                  res.status(400).json({
                    success: false,
                    message: "File Already Exists",
                  });
                  headerError = true;
                  return; // Ensure the response is not sent multiple times
                }
              }
            }
          }
        }
      });
  };
  myfunction(thirdfilepath);

  fs.createReadStream(thirdfilepath)
    .pipe(csv())
    .on("data", async (row) => {
      if (headerError) {
        return;
      }
      const symbol = row.SYMBOL; // Assuming "SYMBOL" is the column containing the symbol

      const existingCompany = await Stock.findOne({ symbol });

      if (existingCompany) {
        existingCompany.previous_Last_Price =
          moment
            .utc(row.TIMESTAMP, "DD-MMM-YYYY")
            .toDate()
            .toLocaleDateString() !== newdate.date.toLocaleDateString()
            ? existingCompany.last_Price
            : newdate.previous_Last_Price;

        existingCompany.last_Price = parseFloat(row.LAST)
          ? parseFloat(row.LAST.replace(",", "").trim())
          : 1;
        existingCompany.date = row.TIMESTAMP
          ? moment.utc(row.TIMESTAMP, "DD-MMM-YYYY").toDate()
          : null;
        await existingCompany
          .save()
          .then(async () => {
            await fs.promises.unlink(thirdfilepath);
            if (!headerError) {
              await GetAllMarketandFloatCaps();
              await res.status(200).json({
                success: true,
                message: "File uploaded successfully.",
              });
            }
          })
          .catch((error) => {
            // console.error(
            //   "Error updating company data in MongoDB with third file:",
            //   error
            // );
          });
      }
    });
};
const run = async () => {
  try {
    // Process the categorization CSV file after the main CSV file
    if (categorizationfile !== "") {
      await processCategorizationCSV();
    }
    // Process the main sector CSV file
    if (sectorfile !== "") {
      await processCSV();
    }
    // Process the third CSV file after the main CSV file
    if (thirdfile !== "") {
      await processThirdCSV();
    }

    // console.log("All processes completed successfully");
  } catch (error) {
    console.error("Error:", error);
  }
};

export { run, processCSV, processCategorizationCSV, processThirdCSV };
