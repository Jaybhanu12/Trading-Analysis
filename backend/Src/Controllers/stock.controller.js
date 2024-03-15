import { Stock } from "../Models/stock.model.js";
import { Marketcap } from "../Models/marketcap.model.js";
import { AsyncHandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { ApiHandler } from "../Utils/apiHandler.js";
import { Floatcap } from "../Models/float.model.js";
import mongoose from "mongoose";

const getAllMarketCap = AsyncHandler(async (req, res) => {
  try {
    const marketExists = await Marketcap.find();

    if (!marketExists) {
      throw new ApiHandler(400, "Market-Floatcap not found");
    }

    const marketcap = await Marketcap.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
          free_float: 0,
          createdAt: 0,
          total_Market_Cap: 0,
          total_shares: 0,
          float_shares: 0,
          updatedAt: 0,
        },
      },
    ]);

    if (!marketcap) {
      throw new ApiHandler(400, "Something Went Wrong While Updating Stock");
    }

    return res
      .status(200)
      .json(new ApiResponse(201, marketcap, "Market and Float Fetch Success"));
  } catch (error) {
    return res.status(400).json({ error: error?.message });
  }
});

const getAllFloatCap = AsyncHandler(async (req, res) => {
  try {
    const marketfloatExists = await Floatcap.find();

    if (!marketfloatExists) {
      throw new ApiHandler(400, "Market-Floatcap not found");
    }

    const marketfloatcap = await Floatcap.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
          free_float: 0,
          createdAt: 0,
          total_Market_Cap: 0,
          total_shares: 0,
          float_shares: 0,
          updatedAt: 0,
        },
      },
    ]);

    if (!marketfloatcap) {
      throw new ApiHandler(400, "Something Went Wrong While Updating Stock");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(201, marketfloatcap, "Market and Float Fetch Success")
      );
  } catch (error) {
    return res.status(400).json({ error: error?.message });
  }
});

const getAllStock = AsyncHandler(async (req, res) => {
  try {
    const stockExists = await Stock.find();

    if (!stockExists) {
      throw new ApiHandler(400, "Market-Floatcap not found");
    }

    const stock = await Stock.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);

    if (!stock) {
      throw new ApiHandler(400, "Something Went Wrong While Updating Stock");
    }

    return res
      .status(200)
      .json(new ApiResponse(201, stock, "Market and Float Fetch Success"));
  } catch (error) {
    throw new ApiHandler(400, error?.message);
  }
});

const GetAllMarketandFloatCaps = async () => {
  try {
    const stock = await Stock.find();

    if (!stock) {
      throw new ApiHandler(400, "Stock not found");
    }

    const [newdate] = stock;

    let date = new Date(newdate.date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase()
      .replace(/ /g, "");

    const stockCalculation = await Stock.aggregate([
      {
        $addFields: {
          total_shares: {
            $divide: ["$total_Market_Cap", "$previous_Last_Price"],
          },
        },
      },
      {
        $addFields: {
          [`marketcap_${date}`]: {
            $cond: {
              if: [`$marketcap_${date}`, false],
              then: { $multiply: ["$total_shares", "$last_Price"] },
              else: "",
            },
          },
        },
      },
      {
        $merge: "marketcaps",
      },
    ]);

    const floatcalcution = await Stock.aggregate([
      {
        $addFields: {
          float_shares: {
            $divide: ["$free_float", "$previous_Last_Price"],
          },
        },
      },
      {
        $addFields: {
          [`floatcap_${date}`]: {
            $cond: {
              if: [`$floatcap_${date}`, false],
              then: { $multiply: ["$float_shares", "$last_Price"] },
              else: "",
            },
          },
        },
      },
      {
        $merge: "floatcaps",
      },
    ]);
  } catch (error) {
    // return res.status(400).json({ error: error?.message });
  }
};

const getCurrentSectorCap = async () => {
  try {
    const stock = await Stock.find();

    if (!stock) {
      throw new ApiHandler(400, "Stock not found");
    }

    const [newdate] = stock;

    let date = new Date(newdate.date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase()
      .replace(/ /g, "");

    const marketcapCalculation = await Stock.aggregate([
      {
        $addFields: {
          [`marketcap_${date}`]: "$total_Market_Cap",
        },
      },
      {
        $merge: "marketcaps",
      },
    ]);

    const floatcapCalculation = await Stock.aggregate([
      {
        $addFields: {
          [`floatcap_${date}`]: "$free_float",
        },
      },
      {
        $merge: "floatcaps",
      },
    ]);
  } catch (error) {
    return res.status(400).json({ error: error?.message });
  }
};

const getCurrentFivedays = async () => {
  try {
    console.log("two");

    const MarketArray = [];
    const FloatArray = [];
    const dateArray = [];
    const previousDates = [];
    const FloatpreviousDates = [];
    const marketdata = await Marketcap.find().lean();
    const floatdata = await Floatcap.find().lean();
    const data = marketdata[0];
    const floatdatas = floatdata[0];
    const newfield = Object.keys(data);
    const newfieldfloat = Object.keys(floatdatas);
    const db = mongoose.connection;
    const collectionMarket = db.collection("marketcaps");
    const collectionFloat = db.collection("floatcaps");
    const collectionMarketBackup = db.collection("marketCapBackup");
    const collectionFloatBackup = db.collection("floatCapBackup");

    // Previous dates from current date
    for (let i = 10; i >= 0; i--) {
      let date = new Date(data.date);
      date.setDate(date.getDate() - i);
      let previousDate = new Date(date)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase()
        .replace(/ /g, "");
      MarketArray.push(`marketcap_${previousDate}`);
      FloatArray.push(`floatcap_${previousDate}`);
    }

    MarketArray.forEach((value) => {
      if (newfield.includes(value)) {
        previousDates.push(value);
      }
    });

    // console.log(previousDates[0]);

    FloatArray.forEach((value) => {
      if (newfieldfloat.includes(value)) {
        FloatpreviousDates.push(value);
      }
    });

    if (newfield.length >= 23 && previousDates.length > 0) {
      //market cap pervious day store in backup and delete from current market cap
      const marketData = await collectionMarket.find({}).toArray();

      for (const marketDoc of marketData) {
        const previousDateValue = marketDoc[previousDates[0]];

        const updateMarketlastDate = await collectionMarketBackup.updateMany(
          { symbol: marketDoc.symbol },
          { $set: { [previousDates[0]]: previousDateValue } }
        );
      }

      const removeMarketlastDate = await collectionMarket.updateMany(
        {},
        { $unset: { [previousDates[0]]: "" } }
      );

      //float cap pervious day store in backup and delete from current float cap
      const floatData = await collectionFloat.find({}).toArray();

      for (const floatDoc of floatData) {
        const previousDateValue = floatDoc[FloatpreviousDates[0]];

        const updateFloatlastDate = await collectionFloatBackup.updateMany(
          { symbol: floatData.symbol },
          { $set: { [FloatpreviousDates[0]]: previousDateValue } }
        );
      }

      const removeFloatlastDate = await collectionFloat.updateMany(
        {},
        { $unset: { [FloatpreviousDates[0]]: "" } }
      );
    }
    // else {
    //   console.log("Conditions not met for update.");
    // }
  } catch (error) {
    console.log(error?.message);
  }
};
const updateMarketFloatCap = async () => {
  try {
    const stock = await Stock.find();

    if (!stock) {
      throw new ApiHandler(400, "Stock not found");
    }

    const [newdate] = stock;

    let date = new Date(newdate.date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase()
      .replace(/ /g, "");

    await Stock.aggregate([
      {
        $lookup: {
          from: "marketcaps",
          foreignField: "symbol",
          localField: "symbol",
          as: "total_Market_Cap",
          pipeline: [
            {
              $project: {
                _id: 0,
                [`marketcap_${date}`]: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "floatcaps",
          foreignField: "symbol",
          localField: "symbol",
          as: "free_float",
          pipeline: [
            {
              $project: {
                _id: 0,
                [`floatcap_${date}`]: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          total_Market_Cap: {
            $first: `$total_Market_Cap.marketcap_${date}`,
          },
        },
      },
      {
        $addFields: {
          free_float: {
            $first: `$free_float.floatcap_${date}`,
          },
        },
      },
      {
        $merge: "stocks",
      },
    ]);
  } catch (error) {
    console.log(error?.message);
  }
};

const createbackupMarketFloat = async (req, res) => {
  try {
    const stock = await Stock.find();

    if (!stock) {
      throw new ApiHandler(400, "Stock not found");
    }

    const addMarketBackup = await Stock.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
          free_float: 0,
          createdAt: 0,
          total_Market_Cap: 0,
          total_shares: 0,
          float_shares: 0,
          updatedAt: 0,
          last_Price: 0,
          previous_Last_Price: 0,
        },
      },
      {
        $out: "marketCapBackup",
      },
    ]);

    const addFloatBackup = await Stock.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
          free_float: 0,
          createdAt: 0,
          total_Market_Cap: 0,
          total_shares: 0,
          float_shares: 0,
          updatedAt: 0,
          last_Price: 0,
          previous_Last_Price: 0,
        },
      },
      {
        $out: "floatCapBackup",
      },
    ]);
  } catch (error) {
    console.log(error?.message);
  }
};

export {
  getAllMarketCap,
  getAllStock,
  getAllFloatCap,
  getCurrentSectorCap,
  GetAllMarketandFloatCaps,
  getCurrentFivedays,
  updateMarketFloatCap,
  createbackupMarketFloat,
};
