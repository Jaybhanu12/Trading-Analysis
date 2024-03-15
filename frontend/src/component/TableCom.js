import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import EmptyContainer from "./EmptyContainer";
import * as XLSX from "xlsx";
import { HiOutlineSearch } from "react-icons/hi";
import { BsFiletypeXlsx } from "react-icons/bs";
import { BsFiletypeCsv } from "react-icons/bs";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { BsTable } from "react-icons/bs";
import { Tooltip } from "antd";
import { BarChart } from "@mui/x-charts/BarChart";
import { VscGraph } from "react-icons/vsc";
const TableCom = (props) => {
  const [data, setData] = useState([]);
  const [FistObject, setFirstObject] = useState([]);
  const [currentdate, setCurrentdate] = useState([]);
  const [groupCriterion, setGroupCriterion] = useState("macro");
  const [capFilter, setCapFilter] = useState("All"); // Default to 'All'
  const [dateArray, setDateArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const [toggleSearch, settoggleSearch] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/${props.url}`
        );
        // console.log(response)
        setData(response.data.data);
        const field = response.data.data[0];
        setFirstObject(Object.keys(field));
        setCurrentdate(response.data.data[0].date);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (props.url) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [`${process.env.REACT_APP_API_URL}/${props.url}`]);

  useEffect(() => {
    const generateDynamicDates = () => {
      const newArray = [];
      const previousDates = [];

      for (let i = 10; i >= 0; i--) {
        let coldate = new Date(currentdate);
        coldate.setDate(coldate.getDate() - i);
        let strdate = new Date(coldate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase()
          .replace(/ /g, "");
        newArray.push(`${props.name}_${strdate}`);
      }

      for (let i = 1; i < 7; i++) {
        let coldate = new Date(currentdate);
        coldate.setDate(coldate.getDate() + i);
        let strdate = new Date(coldate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase()
          .replace(/ /g, "");
        newArray.push(`${props.name}_${strdate}`);
      }
      newArray.forEach((value) => {
        if (FistObject.includes(value)) {
          previousDates.push(value);
        }
      });
      setDateArray(previousDates);
    };

    generateDynamicDates();
  }, [currentdate, FistObject, props.name]);

  const calculatePercentageChange = (current, previous) => {
    return ((current - previous) / previous) * 100;
    // return (current - previous) / previous;
  };

  const groupBy = (data, groupCriterion, capFilter, currentDate) => {
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return {};
    }

    const filteredData =
      capFilter === "All"
        ? data
        : data.filter((item) => item.categorizationData === capFilter);

    const result = filteredData.reduce((acc, item) => {
      const key = item[groupCriterion];
      if (!acc[key]) {
        acc[key] = { count: 0, dynamicSums: {}, percentageChanges: {} };
      }
      acc[key].count += 1;

      currentDate.forEach((date, index) => {
        if (!acc[key].dynamicSums[date]) {
          acc[key].dynamicSums[date] = 0;
        }
        acc[key].dynamicSums[date] += parseFloat(item[date] || 0);

        if (index > 0) {
          const previousDate = currentDate[index - 1];
          const currentCap = acc[key].dynamicSums[date];
          const previousCap = acc[key].dynamicSums[previousDate];
          const percentageChange = calculatePercentageChange(
            currentCap,
            previousCap
          );
          acc[key].percentageChanges[date] = percentageChange;
        }
      });

      return acc;
    }, {});

    return result;
  };

  const handleCriterionChange = (e) => {
    setGroupCriterion(e.target.value);
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 18; // Set the number of items per page
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const groupedData = groupBy(data, groupCriterion, capFilter, dateArray);

  // Filter grouped data based on the search term
  const filteredGroupedData = Object.entries(groupedData).reduce(
    (acc, [key, value]) => {
      if (key.toLowerCase().includes(search.toLowerCase())) {
        acc[key] = value; // Only include groups that match the search
      }
      return acc;
    },
    {}
  );

  // Now calculate the slice for pagination on the filtered data
  const slicedGroupedData = Object.entries(filteredGroupedData).slice(
    startIndex,
    endIndex
  );

  window.addEventListener("load", function () {
    const table = document.querySelector(".table");
    const headerCells = document.querySelectorAll(".table thead th");

    table.addEventListener("scroll", function () {
      const scrollLeft = table.scrollLeft;
      headerCells.forEach((cell, index) => {
        cell.style.transform = `translateX(${scrollLeft}px)`;
      });
    });
  });

  const handleFocus = () => {
    const arrow = document.getElementById("arrow");
    const newIsOpen = !isOpen;
    arrow.style.transform = `rotateZ(${newIsOpen ? 118 : 180}deg)`;
    setIsOpen(newIsOpen);
  };

  const NewhandleFocus = () => {
    const arrow = document.getElementById("arrow2");
    const newNewOpen = !newOpen;
    arrow.style.transform = `rotateZ(${newNewOpen ? 118 : 180}deg)`;
    setNewOpen(newNewOpen);
  };

  const downloadCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // CSV Header with formatted dates
    const headerDates = dateArray.slice(1).map((date) => {
      const datePart = date.split("_")[1]; // Extracting the date part
      return `${datePart}%`; // Appending '%' to the extracted date
    });

    csvContent += "Group,Count of Symbols," + headerDates.join(",") + "\n";

    // CSV Rows
    Object.entries(filteredGroupedData).forEach(([group, details]) => {
      // Skip the entry if the key (group) is blank or doesn't meet your criteria
      if (!group.trim()) return;

      let row = [
        group,
        details.count,
        ...dateArray
          .slice(1)
          .map((date) => details.percentageChanges[date]?.toFixed(2) ?? ""),
      ].join(",");
      csvContent += row + "\n";
    });

    // Create a link and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Group",
        "Count of Symbols",
        ...dateArray.slice(1).map((date) => date.split("_")[1] + "%"),
      ], // Header row with formatted dates
      ...Object.entries(filteredGroupedData).map(([group, details]) => {
        if (!group.trim()) return []; // Skip the entry if the key (group) is blank or doesn't meet your criteria

        return [
          group,
          details.count,
          ...dateArray
            .slice(1)
            .map((date) => details.percentageChanges[date]?.toFixed(2) ?? ""),
        ];
      }),
    ]);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");

    // Save the workbook and trigger download
    XLSX.writeFile(wb, "filtered_data.xlsx");
  };

  const handleSearch = () => {
    settoggleSearch(!toggleSearch);
  };
  // Function to close search if clicked outside
  window.addEventListener("click", function (event) {
    const search = document.getElementById("search");
    const searchInput = document.getElementById("search-input");

    if (!search.contains(event.target)) {
      search.style.overflow = "hidden";
      searchInput.style.right = "-195px";
      settoggleSearch(false);
    }
  });

  // Parameters
  const barWidth = 200; // The width you want for each bar
  const barMargin = 10; // Space between bars
  const fixedPadding = 50; // Fixed padding for axis labels, chart padding, etc.
  const initialWidth = 800; // Initial fixed width

  const calculateChartWidth = (numberOfBars) => {
    const dynamicWidth = numberOfBars * (barWidth + barMargin) + fixedPadding;
    return Math.max(initialWidth, dynamicWidth);
  };

  const chartWidth = calculateChartWidth(
    slicedGroupedData.filter(([key]) => key).length
  );

  return (
    <>
      <div>
        <div className="select-main-wrapper">
          <div className="select-wrapper">
            <select
              className="custom-select"
              onChange={handleCriterionChange}
              value={groupCriterion}
              onClick={handleFocus}
            >
              <option value="macro">Macro</option>
              <option value="sector">Sector</option>
              <option value="industry">Industry</option>
              <option value="basic_Industry">Basic Industry</option>
            </select>
            <div
              className={`select-arrow ${isOpen ? "open" : ""}`}
              id="arrow"
            ></div>
          </div>

          <div className="select-wrapper">
            <select
              className="custom-select"
              onChange={(e) => setCapFilter(e.target.value)}
              value={capFilter}
              id="mySelect"
              onClick={NewhandleFocus}
            >
              <option value="All">All</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>
            <div
              className={`select-arrow ${newOpen ? "open" : ""}`}
              id="arrow2"
            ></div>
          </div>
        </div>
        <div className="tab-main-wrappe">
          <div className="files-wrapper">
            <Tooltip placement="top" title="Download Csv">
              <button
                className="file-button"
                onClick={() => downloadCsv(filteredGroupedData)}
              >
                <BsFiletypeCsv className="file-icon" />
              </button>
            </Tooltip>
            <Tooltip placement="top" title="Download Xlsx">
              <button
                className="file-button"
                onClick={() => downloadExcel(filteredGroupedData)}
              >
                <BsFiletypeXlsx className="file-icon" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tabs defaultActiveKey="table" id="uncontrolled-tab-example">
              <Tab eventKey="table" title={<BsTable className="tab-icon" />}>
                <div className="table-main-wrapper">
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>
                            <div className="Search" tabIndex="0" id="search">
                              Group
                              <div className="icon">
                                <input
                                  type="text"
                                  placeholder="Search groups..."
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  id="search-input"
                                  style={{
                                    right: toggleSearch ? "35px" : "-195px",
                                  }}
                                />
                                <button
                                  className="btn-search"
                                  onClick={handleSearch}
                                >
                                  <HiOutlineSearch className="search-icon" />
                                </button>
                              </div>
                            </div>
                          </th>
                          <th>Count of Symbols</th>
                          {dateArray.slice(1).map((date) => {
                            const datePart = date.split("_")[1]; // Split by underscore and take the second part
                            return (
                              <th
                                key={`percentage_${date}`}
                              >{`${datePart}%`}</th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {slicedGroupedData.length > 0 ? (
                          data &&
                          slicedGroupedData.map(
                            ([key, { count, percentageChanges }]) =>
                              key ? (
                                <tr key={key}>
                                  <td className="group">{key}</td>
                                  <td>{count}</td>
                                  {dateArray.slice(1).map((date) => (
                                    <td key={`percentage_${date}`}>
                                      {percentageChanges[date].toFixed(2)}%
                                    </td>
                                  ))}
                                </tr>
                              ) : null
                          )
                        ) : (
                          <tr>
                            <td style={{ border: "none" }}>
                              <EmptyContainer />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="Bottom">
                    <ReactPaginate
                      pageCount={Math.ceil(
                        Object.keys(groupedData).length / itemsPerPage
                      )}
                      pageRangeDisplayed={5}
                      marginPagesDisplayed={2}
                      onPageChange={handlePageChange}
                      containerClassName={"pagination"}
                      activeClassName={"active"}
                    />
                  </div>
                </div>
              </Tab>
              <Tab eventKey="Graph" title={<VscGraph className="tab-icon" />}>
                <div className="bar-wrapper">
                  <div className="graph">
                    {slicedGroupedData && slicedGroupedData.length > 0 ? (
                      <BarChart
                        xAxis={dateArray.slice(1).map((date) => ({
                          scaleType: "band",
                          data: slicedGroupedData
                            .filter(([key]) => key)
                            .map(([key, { count, percentageChanges }]) => key),
                        }))}
                        series={dateArray.slice(1).map((date) => ({
                          data: slicedGroupedData
                            .filter(([key]) => key)
                            .map(([key, { count, percentageChanges }]) =>
                              // percentageChanges[date].toFixed(2)
                              parseFloat(percentageChanges[date].toFixed(2))
                            ),
                          label: date.split("_")[1],
                        }))}
                        width={chartWidth}
                        height={500}
                      />
                    ) : (
                      <EmptyContainer />
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};


export default TableCom;

