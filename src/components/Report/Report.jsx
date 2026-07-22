import React, { useContext, useState } from "react";

import { context } from "../../context/context";
import {
  API_ENDPOINTS,
  apiPostFormData,
  apiPostJson,
} from "../../services/api";

import "../../styles/analysisPages.css";

export const Report = () => {
  const { user } = useContext(context);

  const [file, setFile] = useState(null);
  const [micrographType, setMicrographType] = useState("TEM");
  const [modelName, setModelName] = useState("SAM");
  const [sam2Profile, setSam2Profile] = useState("60");
  const [sam2ExecutionMode, setSam2ExecutionMode] = useState("safe_local");
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

  const sam2ProfileOptions = [
    {
      value: "0",
      label: "0% overlap",
      description: "Low or no particle overlap.",
    },
    {
      value: "15",
      label: "15% overlap",
      description: "Low overlap profile.",
    },
    {
      value: "30",
      label: "30% overlap",
      description: "Moderate overlap profile.",
    },
    {
      value: "45",
      label: "45% overlap",
      description: "High overlap profile.",
    },
    {
      value: "60",
      label: "60% overlap",
      description: "Very high overlap profile.",
    },
  ];

  const sam2ExecutionModeOptions = [
    {
      value: "safe_local",
      label: "Safe local",
      maxImageSize: 500,
      pointsPerBatch: 1,
      pointsPerSide: 48,
      description:
        "Most stable option for local GPU tests. It reduces memory usage while preserving acceptable segmentation quality.",
    },
    {
      value: "balanced",
      label: "Balanced",
      maxImageSize: 600,
      pointsPerBatch: 1,
      pointsPerSide: 48,
      description:
        "Intermediate option. Keeps more detail than Safe local, but uses more GPU memory.",
    },
    {
      value: "quality",
      label: "Quality",
      maxImageSize: 700,
      pointsPerBatch: 2,
      pointsPerSide: 48,
      description:
        "Preserves more image detail. It can be slower and may require more GPU memory.",
    },
  ];

  const clearForm = () => {
    setFile(null);
    setMicrographType("TEM");
    setScaleValue("");
    setScaleUnit("nm");
    setDescription("");
  };

  const getFilenameFromPath = (filePath) => {
    if (!filePath) {
      return "";
    }

    return filePath.split("\\").pop().split("/").pop();
  };

  const getSummaryFilename = (filename) => {
    if (!filename) {
      return "";
    }

    if (filename.includes("_sam_legacy_annotated.png")) {
      return filename.replace(
        "_sam_legacy_annotated.png",
        "_sam_legacy_summary.png",
      );
    }

    if (filename.includes("_sam2_") && filename.endsWith("_annotated.png")) {
      return filename.replace("_annotated.png", "_summary.png");
    }

    return "";
  };

  const getSelectedExecutionMode = () => {
    return (
      sam2ExecutionModeOptions.find(
        (mode) => mode.value === sam2ExecutionMode,
      ) || sam2ExecutionModeOptions[0]
    );
  };

  const buildAnalysisParameters = () => {
    const commonParameters = {
      factor: 5.95,
      step_number: 10,
      pixel_threshold: 140,
    };

    if (modelName === "SAM") {
      return {
        ...commonParameters,
        points_per_side: 44,
        pred_iou_thresh: 0.85,
        stability_score_thresh: 0.97,
        crop_n_layers: 1,
        crop_n_points_downscale_factor: 2,
        min_mask_region_area: 1000,
        box_nms_thresh: 0.5,
      };
    }

    const selectedExecutionMode = getSelectedExecutionMode();

    return {
      ...commonParameters,

      sam2_profile: sam2Profile,
      overlap_level: sam2Profile,

      execution_mode: selectedExecutionMode.value,
      max_image_size: selectedExecutionMode.maxImageSize,
      points_per_batch: selectedExecutionMode.pointsPerBatch,
      points_per_side: selectedExecutionMode.pointsPerSide,

      filter_with_legacy_rules: true,
    };
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
        model_name: modelName,
        parameters: buildAnalysisParameters(),
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

  const selectedExecutionMode = getSelectedExecutionMode();

  const segmentedFilename = analysisResponse?.result?.segmented_image_path
    ? getFilenameFromPath(analysisResponse.result.segmented_image_path)
    : "";

  const summaryFilename = getSummaryFilename(segmentedFilename);

  return (
    <div className="analysis-page">
      <header className="analysis-page__header">
        <h1 className="analysis-page__title">New micrograph analysis</h1>
        <p className="analysis-page__description">
          Upload a TEM or SEM micrograph, select the segmentation model and
          generate analysis outputs with particle counting, measurements and
          report files.
        </p>
      </header>

      <div className="analysis-layout">
        <section className="analysis-card">
          <h2 className="analysis-card__title">Upload configuration</h2>
          <p className="analysis-card__subtitle">
            Configure the micrograph metadata before running the segmentation.
          </p>

          <form className="analysis-form" onSubmit={handleUpload}>
            <div className="analysis-form__group">
              <label className="analysis-form__label">Micrograph image</label>
              <input
                className="analysis-form__file"
                type="file"
                accept=".png,.jpg,.jpeg,.tif,.tiff,.bmp"
                onChange={(event) => setFile(event.target.files[0])}
              />
            </div>

            <div className="analysis-form__group">
              <label className="analysis-form__label">Micrograph type</label>
              <select
                className="analysis-form__select"
                value={micrographType}
                onChange={(event) => setMicrographType(event.target.value)}
              >
                <option value="TEM">TEM</option>
                <option value="SEM">SEM</option>
              </select>
            </div>

            <div className="analysis-form__group">
              <label className="analysis-form__label">Segmentation model</label>
              <select
                className="analysis-form__select"
                value={modelName}
                onChange={(event) => {
                  setModelName(event.target.value);
                  setAnalysisResponse(null);
                  setGeneratedReport(null);
                }}
              >
                <option value="SAM">SAM classic</option>
                <option value="SAM2">SAM 2</option>
              </select>

              <small className="analysis-form__help">
                SAM classic runs the legacy SAM model. SAM 2 runs the updated
                SAM 2 pipeline with overlap-specific profiles.
              </small>
            </div>

            {modelName === "SAM2" && (
              <>
                <div className="analysis-form__group">
                  <label className="analysis-form__label">
                    SAM 2 overlap profile
                  </label>

                  <select
                    className="analysis-form__select"
                    value={sam2Profile}
                    onChange={(event) => {
                      setSam2Profile(event.target.value);
                      setAnalysisResponse(null);
                      setGeneratedReport(null);
                    }}
                  >
                    {sam2ProfileOptions.map((profile) => (
                      <option key={profile.value} value={profile.value}>
                        {profile.label}
                      </option>
                    ))}
                  </select>

                  <small className="analysis-form__help">
                    Select the configuration according to the estimated particle
                    overlap level. These profiles were obtained from the PSO
                    optimization stage and are used as fixed configurations in
                    the final prototype.
                  </small>
                </div>

                <div className="analysis-form__group">
                  <label className="analysis-form__label">
                    SAM 2 execution mode
                  </label>

                  <select
                    className="analysis-form__select"
                    value={sam2ExecutionMode}
                    onChange={(event) => {
                      setSam2ExecutionMode(event.target.value);
                      setAnalysisResponse(null);
                      setGeneratedReport(null);
                    }}
                  >
                    {sam2ExecutionModeOptions.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>

                  <small className="analysis-form__help">
                    {selectedExecutionMode.description} Current values:
                    max_image_size={selectedExecutionMode.maxImageSize},
                    points_per_batch={selectedExecutionMode.pointsPerBatch},
                    points_per_side={selectedExecutionMode.pointsPerSide}.
                  </small>
                </div>
              </>
            )}

            <div className="analysis-form__group">
              <label className="analysis-form__label">Scale value</label>
              <input
                className="analysis-form__input"
                type="number"
                step="any"
                placeholder="Example: 100"
                value={scaleValue}
                onChange={(event) => setScaleValue(event.target.value)}
              />
            </div>

            <div className="analysis-form__group">
              <label className="analysis-form__label">Scale unit</label>
              <select
                className="analysis-form__select"
                value={scaleUnit}
                onChange={(event) => setScaleUnit(event.target.value)}
              >
                <option value="nm">nm</option>
                <option value="µm">µm</option>
                <option value="px">px</option>
              </select>
            </div>

            <div className="analysis-form__group">
              <label className="analysis-form__label">Description</label>
              <textarea
                className="analysis-form__textarea"
                placeholder="Add a short description for this analysis."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="4"
              />
            </div>

            <button
              className="analysis-button analysis-button--primary"
              type="submit"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload micrograph"}
            </button>
          </form>

          {errorMessage && (
            <div className="analysis-alert analysis-alert--error">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </section>

        <section>
          {!uploadedMicrograph && !analysisResponse && !generatedReport && (
            <div className="analysis-empty-state">
              Upload a micrograph to see the analysis workflow here.
            </div>
          )}

          {uploadedMicrograph && (
            <div className="analysis-card">
              <h2 className="analysis-card__title">
                Micrograph uploaded successfully
              </h2>

              <div className="analysis-result-list">
                <div className="analysis-result-row">
                  <strong>ID</strong>
                  <span>{uploadedMicrograph.id}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Original filename</strong>
                  <span>{uploadedMicrograph.original_filename}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Stored filename</strong>
                  <span>{uploadedMicrograph.stored_filename}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Type</strong>
                  <span>{uploadedMicrograph.micrograph_type}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Selected model</strong>
                  <span>{modelName}</span>
                </div>

                {modelName === "SAM2" && (
                  <>
                    <div className="analysis-result-row">
                      <strong>SAM 2 profile</strong>
                      <span>{sam2Profile}% overlap</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Execution mode</strong>
                      <span>{selectedExecutionMode.label}</span>
                    </div>
                  </>
                )}

                <div className="analysis-result-row">
                  <strong>Scale</strong>
                  <span>
                    {uploadedMicrograph.scale_value
                      ? `${uploadedMicrograph.scale_value} ${uploadedMicrograph.scale_unit}`
                      : "Not specified"}
                  </span>
                </div>

                <div className="analysis-result-row">
                  <strong>Description</strong>
                  <span>
                    {uploadedMicrograph.description || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="analysis-links">
                <a
                  className="analysis-link"
                  href={API_ENDPOINTS.micrographs.originalFile(
                    uploadedMicrograph.stored_filename,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open uploaded micrograph
                </a>
              </div>

              <div className="analysis-actions">
                <button
                  className="analysis-button analysis-button--accent"
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Running analysis..." : "Run analysis"}
                </button>
              </div>
            </div>
          )}

          {analysisResponse && (
            <div className="analysis-card">
              <h2 className="analysis-card__title">
                Analysis completed successfully
              </h2>

              <div className="analysis-result-list">
                <div className="analysis-result-row">
                  <strong>Analysis ID</strong>
                  <span>{analysisResponse.analysis.id}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Status</strong>
                  <span>{analysisResponse.analysis.status}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Model</strong>
                  <span>{analysisResponse.analysis.model_name}</span>
                </div>

                {analysisResponse.analysis.model_name === "SAM2" && (
                  <>
                    <div className="analysis-result-row">
                      <strong>SAM 2 profile</strong>
                      <span>{sam2Profile}% overlap</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Execution mode</strong>
                      <span>{selectedExecutionMode.label}</span>
                    </div>
                  </>
                )}

                <div className="analysis-result-row">
                  <strong>Particle count</strong>
                  <span>{analysisResponse.result.particle_count}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Total masks</strong>
                  <span>{analysisResponse.result.total_masks}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Valid masks</strong>
                  <span>{analysisResponse.result.valid_masks}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Rejected masks</strong>
                  <span>{analysisResponse.result.rejected_masks}</span>
                </div>
              </div>

              <div className="analysis-links">
                {segmentedFilename && (
                  <a
                    className="analysis-link"
                    href={API_ENDPOINTS.micrographs.segmentedFile(
                      segmentedFilename,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open segmented image
                  </a>
                )}

                {summaryFilename && (
                  <a
                    className="analysis-link"
                    href={API_ENDPOINTS.micrographs.segmentedFile(
                      summaryFilename,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open summary figure
                  </a>
                )}
              </div>

              <div className="analysis-actions">
                <button
                  className="analysis-button analysis-button--secondary"
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport
                    ? "Generating report..."
                    : "Generate report"}
                </button>
              </div>
            </div>
          )}

          {generatedReport && (
            <div className="analysis-card">
              <h2 className="analysis-card__title">
                Report generated successfully
              </h2>

              <div className="analysis-result-list">
                <div className="analysis-result-row">
                  <strong>Report ID</strong>
                  <span>{generatedReport.id}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Filename</strong>
                  <span>{generatedReport.filename}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Generated at</strong>
                  <span>{generatedReport.generated_at}</span>
                </div>
              </div>

              <div className="analysis-links">
                <a
                  className="analysis-link"
                  href={API_ENDPOINTS.reports.download(generatedReport.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download report
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
