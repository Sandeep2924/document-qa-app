import React, { useState } from "react";
import axios from "axios";
import "./DocumentUpload.css"; // Optional: if you want custom styles

const DocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Document uploaded successfully!");
    } catch (error) {
      alert("❌ Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload a document</h2>
      <button
        onClick={() => document.getElementById("file-upload")?.click()}
        disabled={isUploading}
        className="upload-button"
      >
        {isUploading ? "Uploading..." : "Choose File"}
      </button>
      <input
        id="file-upload"
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default DocumentUpload;
