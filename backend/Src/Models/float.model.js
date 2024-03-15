import mongoose from "mongoose";
import { Schema } from "mongoose";

const floatCapSchema = new Schema(
    {
      symbol: String,
      company_Name: String,
      macro: String,
      sector: String,
      industry: String,
      basic_Industry: String,
      last_Price: Number,
      previous_Last_Price: Number,
      free_float: Number,
      date: Date,
      categorizationData: String,
    },{
        timestamps: true
    })


    export const Floatcap = mongoose.model("Floatcap",floatCapSchema);