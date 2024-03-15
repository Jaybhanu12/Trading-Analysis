import React, { useState } from "react";
import TableCom from "./TableCom";
import Navbar from "./Navbar";

const Dashboard = () => {
  const [data, setData] = useState({url: "getAllMarketCap", name: "marketcap" });

  const handleClickMarket = (e) => {
    e.preventDefault()
    setData({url: "getAllMarketCap", name: "marketcap" });
  };
  const handleClickfloat = (e) => {
    e.preventDefault()
    setData({ url: "getAllFloatCap", name: "floatcap" });
  };
  return (
    <>
      <section>
        <div>
          <Navbar />
        </div>
        <div className="Cap-Wrapper">
          <button className="Cap-Buttom" onClick={handleClickMarket}>
            Market Cap
          </button>
          <button className="Cap-Buttom" onClick={handleClickfloat}>
            Float Cap
          </button>
        </div>

        <TableCom url={data.url} name={data.name} />

      </section>
    </>
  );
};

export default Dashboard;
