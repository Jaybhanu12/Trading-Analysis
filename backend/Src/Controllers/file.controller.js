import { ApiHandler } from "../Utils/apiHandler.js";
import { AsyncHandler } from "../Utils/asyncHandler.js";
import {
  processCSV,
  processCategorizationCSV,
  processThirdCSV,
} from "../Utils/files.utils.js";
// import fs from "fs";
  
const sectorfileUpload = AsyncHandler(async (req, res) => {
  try {
    const sectorName = req.file?.originalname;
    const sectorfilePath = req.file?.path;

    const uploadfile = await processCSV(sectorName, sectorfilePath, res);


  } catch (error) {
    throw new ApiHandler(400,error?.message)
  }
});

const categorizationfileUpload = AsyncHandler(async (req, res) => {
  try {
    const categorizationName = req.file?.originalname;
    const categorizationfilePath = req.file?.path;

    const uploadfile = await processCategorizationCSV(
      categorizationName,
      categorizationfilePath,
      res
    );

  } catch (error) {
    throw new ApiHandler(400, error?.message);
  }
});
const thirdfileUpload = AsyncHandler(async (req, res) => {
  try {
    const thirdfileName = req.file?.originalname;
    const thirdfileUploadfilePath = req.file?.path;

    const uploadfile = await processThirdCSV(
      thirdfileName,
      thirdfileUploadfilePath,
      res
    );
   
  } catch (error) {
    throw new ApiHandler(400, error?.message);
  }
});

export { sectorfileUpload, categorizationfileUpload, thirdfileUpload };
