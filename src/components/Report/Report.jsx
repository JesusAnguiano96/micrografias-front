import React, { useContext, useState } from "react";

import { context } from "../../context/context";
import {
  API_ENDPOINTS,
  apiPostFormData,
  apiPostJson,
} from "../../services/api";

export const Report = () => {
  const { user } = useContext(context);

  const [file, setFile] = useState(null);
  const [micrographType, setMicrographType] = useState("TEM");
  const [scaleValue, setScaleValue] = useState("");
  const [scaleUnit, setScaleUnit] = useState("nm");
  const [description, setDescription] = useState("");

  const [uploadedMicrograph, setUploadedMicrograph] = useState(null);
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clearForm = () => {
    setFile(null);
    setMicrographType("TEM");
    setScaleValue("");
    setScaleUnit("nm");
    setDescription("");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a micrograph image.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setUploadedMicrograph(null);
    setAnalysisResponse(null);
    setGeneratedReport(null);

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
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!uploadedMicrograph?.id) {
      setErrorMessage(
        "Please upload a micrograph before running the analysis.",
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisResponse(null);
    setGeneratedReport(null);

    try {
      const data = await apiPostJson(API_ENDPOINTS.analysis.run, {
        micrograph_id: uploadedMicrograph.id,
        user_id: user?.id || null,
        model_name: "SAM2",
        parameters: {
          points_per_side: 44,
          pred_iou_thresh: 0.85,
          stability_score_thresh: 0.97,
          min_mask_region_area: 1000,
          box_nms_thresh: 0.5,
        },
      });

      setAnalysisResponse(data);
    } catch (error) {
      setErrorMessage(
        error.message || "There was an error running the analysis.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysisResponse?.analysis?.id) {
      setErrorMessage("Please run an analysis before generating a report.");
      return;
    }

    setIsGeneratingReport(true);
    setErrorMessage("");
    setGeneratedReport(null);

    try {
      const data = await apiPostJson(API_ENDPOINTS.reports.generate, {
        analysis_id: analysisResponse.analysis.id,
      });

      setGeneratedReport(data.report);
    } catch (error) {
      setErrorMessage(
        error.message || "There was an error generating the report.",
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getFilenameFromPath = (filePath) => {
    if (!filePath) {
      return "";
    }

    return filePath.split("\\").pop().split("/").pop();
  };

  const segmentedFilename = analysisResponse?.result?.segmented_image_path
    ? getFilenameFromPath(analysisResponse.result.segmented_image_path)
    : "";

  return (
    <div style={{ padding: "40px 80px" }}>
      <h1>New micrograph analysis</h1>

      <p>Upload a TEM or SEM micrograph to start the analysis process.</p>

      <form
        onSubmit={handleUpload}
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
          disabled={isUploading}
          style={{
            padding: "10px 24px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Uploading..." : "Upload micrograph"}
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

          <div style={{ marginTop: "25px" }}>
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              style={{
                padding: "10px 24px",
                cursor: isAnalyzing ? "not-allowed" : "pointer",
              }}
            >
              {isAnalyzing ? "Running analysis..." : "Run analysis"}
            </button>
          </div>
        </div>
      )}

      {analysisResponse && (
        <div
          style={{
            marginTop: "35px",
            padding: "20px",
            border: "1px solid #dddddd",
            borderRadius: "8px",
            maxWidth: "750px",
          }}
        >
          <h2>Analysis completed successfully</h2>

          <p>
            <strong>Analysis ID:</strong> {analysisResponse.analysis.id}
          </p>

          <p>
            <strong>Status:</strong> {analysisResponse.analysis.status}
          </p>

          <p>
            <strong>Model:</strong> {analysisResponse.analysis.model_name}
          </p>

          <p>
            <strong>Particle count:</strong>{" "}
            {analysisResponse.result.particle_count}
          </p>

          <p>
            <strong>Total masks:</strong> {analysisResponse.result.total_masks}
          </p>

          <p>
            <strong>Valid masks:</strong> {analysisResponse.result.valid_masks}
          </p>

          <p>
            <strong>Rejected masks:</strong>{" "}
            {analysisResponse.result.rejected_masks}
          </p>

          {segmentedFilename && (
            <a
              href={API_ENDPOINTS.micrographs.segmentedFile(segmentedFilename)}
              target="_blank"
              rel="noreferrer"
            >
              Open segmented image
            </a>
          )}

          <div style={{ marginTop: "25px" }}>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              style={{
                padding: "10px 24px",
                cursor: isGeneratingReport ? "not-allowed" : "pointer",
              }}
            >
              {isGeneratingReport ? "Generating report..." : "Generate report"}
            </button>
          </div>
        </div>
      )}

      {generatedReport && (
        <div
          style={{
            marginTop: "35px",
            padding: "20px",
            border: "1px solid #dddddd",
            borderRadius: "8px",
            maxWidth: "750px",
          }}
        >
          <h2>Report generated successfully</h2>

          <p>
            <strong>Report ID:</strong> {generatedReport.id}
          </p>

          <p>
            <strong>Filename:</strong> {generatedReport.filename}
          </p>

          <p>
            <strong>Generated at:</strong> {generatedReport.generated_at}
          </p>

          <a
            href={API_ENDPOINTS.reports.download(generatedReport.id)}
            target="_blank"
            rel="noreferrer"
          >
            Download report
          </a>
        </div>
      )}
    </div>
  );
};
