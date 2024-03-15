import React from "react";
import Navbar from "./Navbar";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
const { Dragger } = Upload;

const fileTypes = [
  { label: "Mutual Fund File (CSV)", name: "uploaded_file_second", action: "http://localhost:5000/api/v1/files/categorizationFileUpload" },
  { label: "Sector File (CSV)", name: "uploaded_file", action: "http://localhost:5000/api/v1/files/sectorFileUpload" },
  { label: "BhavCopy File (CSV)", name: "uploaded_file_third", action: "http://localhost:5000/api/v1/files//thirdFileUpload" },
];

const UploadFile = () => {
  const commonProps = {
    multiple: false,
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.response.message}`);
        setTimeout(() => {
          const errorElements = document.querySelectorAll('.ant-upload-list-item-done');
          errorElements.forEach(element => {
            element.style.display = 'none';
          });
        }, 4000);
      } else if (status === "error") {
        message.error(`${info.file.response.message}`);
        setTimeout(() => {
          const errorElements = document.querySelectorAll('.ant-upload-list-item-error');
          errorElements.forEach(element => {
            element.style.display = 'none';
          });
        }, 4000);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <>
      <section>
        <div>
          <Navbar />
        </div>
        <div className="file-wrapper container">
          {fileTypes.map((fileType) => (
            <div key={fileType.label} className="file-inner-wrapper">
              <label>{fileType.label}</label>
              <Dragger {...commonProps} name={fileType.name} action={fileType.action}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
              </Dragger>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default UploadFile;
