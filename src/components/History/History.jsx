import React, { useCallback, useContext, useEffect, useState } from "react";

import { context } from "../../context/context";
import { API_ENDPOINTS, apiGet, apiPostJson } from "../../services/api";

import "../../styles/analysisPages.css";

export const History = () => {
  const { user } = useContext(context);

  const [analyses, setAnalyses] = useState([]);
  const [generatedReports, setGeneratedReports] = useState({});
  const [generatingReportAnalysisId, setGeneratingReportAnalysisId] =
    useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = user?.id;

  const getFilenameFromPath = (filePath) => {
    if (!filePath) {
      return "";
    }

    return filePath.split("\\").pop().split("/").pop();
  };

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setErrorMessage("No authenticated user found.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const url = `${API_ENDPOINTS.analysis.history}?user_id=${userId}`;
      const data = await apiGet(url);

      setAnalyses(data.analyses || []);
    } catch (error) {
      setErrorMessage(
        error.message || "There was an error loading the analysis history.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleGenerateReport = async (analysisId) => {
    if (!analysisId) {
      setErrorMessage("Analysis ID is required to generate a report.");
      return;
    }

    setGeneratingReportAnalysisId(analysisId);
    setErrorMessage("");

    try {
      const data = await apiPostJson(API_ENDPOINTS.reports.generate, {
        analysis_id: analysisId,
      });

      setGeneratedReports((currentReports) => ({
        ...currentReports,
        [analysisId]: data.report,
      }));
    } catch (error) {
      setErrorMessage(
        error.message || "There was an error generating the report.",
      );
    } finally {
      setGeneratingReportAnalysisId(null);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="analysis-page">
      <header className="analysis-page__header">
        <h1 className="analysis-page__title">Analysis history</h1>

        <p className="analysis-page__description">
          Review previous micrograph analyses, open generated images and create
          downloadable reports.
        </p>

        <div className="analysis-actions">
          <button
            className="analysis-button analysis-button--primary"
            type="button"
            onClick={loadHistory}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh history"}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="analysis-alert analysis-alert--error">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {!isLoading && analyses.length === 0 && !errorMessage && (
        <div className="analysis-empty-state">
          No analyses were found for this user.
        </div>
      )}

      <section>
        {analyses.map((item) => {
          const analysis = item.analysis;
          const micrograph = item.micrograph;
          const result = item.result;

          const originalFilename = micrograph?.stored_filename || "";

          const segmentedFilename = result?.segmented_image_path
            ? getFilenameFromPath(result.segmented_image_path)
            : "";

          const summaryFilename = segmentedFilename.includes(
            "_sam_legacy_annotated.png",
          )
            ? segmentedFilename.replace(
                "_sam_legacy_annotated.png",
                "_sam_legacy_summary.png",
              )
            : "";

          const generatedReport = generatedReports[analysis.id];
          const isGeneratingThisReport =
            generatingReportAnalysisId === analysis.id;

          return (
            <article className="analysis-card" key={analysis.id}>
              <h2 className="analysis-card__title">Analysis #{analysis.id}</h2>

              <div className="analysis-result-list">
                <div className="analysis-result-row">
                  <strong>Status</strong>
                  <span>{analysis.status}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Model</strong>
                  <span>{analysis.model_name}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Started at</strong>
                  <span>{analysis.started_at}</span>
                </div>

                <div className="analysis-result-row">
                  <strong>Completed at</strong>
                  <span>{analysis.completed_at || "Not completed"}</span>
                </div>
              </div>

              {micrograph && (
                <>
                  <hr />

                  <h3 className="analysis-card__title">Micrograph</h3>

                  <div className="analysis-result-list">
                    <div className="analysis-result-row">
                      <strong>Original filename</strong>
                      <span>{micrograph.original_filename}</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Stored filename</strong>
                      <span>{micrograph.stored_filename}</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Type</strong>
                      <span>
                        {micrograph.micrograph_type || "Not specified"}
                      </span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Scale</strong>
                      <span>
                        {micrograph.scale_value
                          ? `${micrograph.scale_value} ${micrograph.scale_unit}`
                          : "Not specified"}
                      </span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Description</strong>
                      <span>{micrograph.description || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="analysis-links">
                    {originalFilename && (
                      <a
                        className="analysis-link"
                        href={API_ENDPOINTS.micrographs.originalFile(
                          originalFilename,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open original micrograph
                      </a>
                    )}
                  </div>
                </>
              )}

              {result && (
                <>
                  <hr />

                  <h3 className="analysis-card__title">Result</h3>

                  <div className="analysis-result-list">
                    <div className="analysis-result-row">
                      <strong>Particle count</strong>
                      <span>{result.particle_count}</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Total masks</strong>
                      <span>{result.total_masks}</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Valid masks</strong>
                      <span>{result.valid_masks}</span>
                    </div>

                    <div className="analysis-result-row">
                      <strong>Rejected masks</strong>
                      <span>{result.rejected_masks}</span>
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
                      onClick={() => handleGenerateReport(analysis.id)}
                      disabled={isGeneratingThisReport}
                    >
                      {isGeneratingThisReport
                        ? "Generating report..."
                        : "Generate report"}
                    </button>
                  </div>

                  {generatedReport && (
                    <div className="analysis-card">
                      <h3 className="analysis-card__title">
                        Report generated successfully
                      </h3>

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
                          href={API_ENDPOINTS.reports.download(
                            generatedReport.id,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download report
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
};
