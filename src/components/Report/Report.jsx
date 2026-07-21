import React, { useContext, useState } from "react";

import { context } from "../../context/context";
import { API_ENDPOINTS, apiPostFormData } from "../../services/api";

export const Report = () => {
  const { user } = useContext(context);

  const [file, setFile] = useState(null);
  const [micrographType, setMicrographType] = useState("TEM");
  const [scaleValue, setScaleValue] = useState("");
  const [scaleUnit, setScaleUnit] = useState("nm");
  const [description, setDescription] = useState("");

  const [uploadedMicrograph, setUploadedMicrograph] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clearForm = () => {
    setFile(null);
    setMicrographType("TEM");
    setScaleValue("");
    setScaleUnit("nm");
    setDescription("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a micrograph image.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setUploadedMicrograph(null);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("micrograph_type", micrographType);
    formData.append("scale_unit", scaleUnit);
    formData.append("description", description);

    if (scaleValue !== "") {
      formData.append("scale_value", scaleValue);
    }

    if (user?.id) {
      formData.append("user_id", user.id);
    }

    try {
      const data = await apiPostFormData(
        API_ENDPOINTS.micrographs.upload,
        formData,
      );

      setUploadedMicrograph(data.micrograph);
      clearForm();
    } catch (error) {
      setErrorMessage(
        error.message || "There was an error uploading the micrograph.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 80px" }}>
      <h1>New micrograph analysis</h1>

      <p>Upload a TEM or SEM micrograph to start the analysis process.</p>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "650px", marginTop: "30px" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Micrograph image</strong>
          </label>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,.bmp"
            onChange={(event) => setFile(event.target.files[0])}
            style={{ display: "block", marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Micrograph type</strong>
          </label>

          <select
            value={micrographType}
            onChange={(event) => setMicrographType(event.target.value)}
            style={{
              display: "block",
              marginTop: "8px",
              padding: "8px",
              width: "100%",
            }}
          >
            <option value="TEM">TEM</option>
            <option value="SEM">SEM</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Scale value</strong>
          </label>

          <input
            type="number"
            step="any"
            placeholder="Example: 100"
            value={scaleValue}
            onChange={(event) => setScaleValue(event.target.value)}
            style={{
              display: "block",
              marginTop: "8px",
              padding: "8px",
              width: "100%",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Scale unit</strong>
          </label>

          <select
            value={scaleUnit}
            onChange={(event) => setScaleUnit(event.target.value)}
            style={{
              display: "block",
              marginTop: "8px",
              padding: "8px",
              width: "100%",
            }}
          >
            <option value="nm">nm</option>
            <option value="µm">µm</option>
            <option value="px">px</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Description</strong>
          </label>

          <textarea
            placeholder="Add a short description for this analysis."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows="4"
            style={{
              display: "block",
              marginTop: "8px",
              padding: "8px",
              width: "100%",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 24px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Uploading..." : "Upload micrograph"}
        </button>
      </form>

      {errorMessage && (
        <div style={{ marginTop: "25px", color: "red" }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {uploadedMicrograph && (
        <div
          style={{
            marginTop: "35px",
            padding: "20px",
            border: "1px solid #dddddd",
            borderRadius: "8px",
            maxWidth: "750px",
          }}
        >
          <h2>Micrograph uploaded successfully</h2>

          <p>
            <strong>ID:</strong> {uploadedMicrograph.id}
          </p>

          <p>
            <strong>Original filename:</strong>{" "}
            {uploadedMicrograph.original_filename}
          </p>

          <p>
            <strong>Stored filename:</strong>{" "}
            {uploadedMicrograph.stored_filename}
          </p>

          <p>
            <strong>Type:</strong> {uploadedMicrograph.micrograph_type}
          </p>

          <p>
            <strong>Scale:</strong>{" "}
            {uploadedMicrograph.scale_value
              ? `${uploadedMicrograph.scale_value} ${uploadedMicrograph.scale_unit}`
              : "Not specified"}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {uploadedMicrograph.description || "Not specified"}
          </p>

          <a
            href={API_ENDPOINTS.micrographs.originalFile(
              uploadedMicrograph.stored_filename,
            )}
            target="_blank"
            rel="noreferrer"
          >
            Open uploaded micrograph
          </a>
        </div>
      )}
    </div>
  );
};
