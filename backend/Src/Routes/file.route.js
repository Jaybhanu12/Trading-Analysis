import { Router } from "express";
import { categorizationfileUpload, sectorfileUpload, thirdfileUpload } from "../Controllers/file.controller.js";
import { upload } from "../Utils/multer.js";

const router = Router();

router.route("/sectorFileUpload").post(upload.single('uploaded_file'),sectorfileUpload);

router.route("/categorizationFileUpload").post(upload.single('uploaded_file_second'),categorizationfileUpload);

router.route("/thirdFileUpload").post(upload.single('uploaded_file_third'),thirdfileUpload);



export default router;