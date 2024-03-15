import { Router } from "express";
import { getAllFloatCap, getAllMarketCap, getAllStock} from "../Controllers/stock.controller.js";

const router = Router();

router.route("/getAllMarketCap").get(getAllMarketCap);

router.route("/getAllFloatCap").get(getAllFloatCap);

router.route("/getAllStocks").get(getAllStock);



export default router;
