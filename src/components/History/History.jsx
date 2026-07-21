import React, { useCallback, useContext, useEffect, useState } from "react";

import { context } from "../../context/context";
import { API_ENDPOINTS, apiGet } from "../../services/api";

export const History = () => {
  const { user } = useContext(context);

  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getFilenameFromPath = (filePath) => {
    if (!filePath) {
      return "";
    }

    return filePath.split("\\").pop().split("/").pop();
  };

  const userId = user?.id;

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

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div style={{ padding: "40px 80px" }}>
      <h1>Analysis history</h1>

      <p>
        This section shows the micrograph analyses performed by the current
        user.
      </p>

      <button
        type="button"
        onClick={loadHistory}
        disabled={isLoading}
        style={{
          marginTop: "20px",
          padding: "10px 24px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Loading..." : "Refresh history"}
      </button>

      {errorMessage && (
        <div style={{ marginTop: "25px", color: "red" }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {!isLoading && analyses.length === 0 && !errorMessage && (
        <div style={{ marginTop: "35px" }}>
          <p>No analyses were found for this user.</p>
        </div>
      )}

      <div style={{ marginTop: "35px" }}>
        {analyses.map((item) => {
          const analysis = item.analysis;
          const micrograph = item.micrograph;
          const result = item.result;

          const originalFilename = micrograph?.stored_filename || "";
          const segmentedFilename = result?.segmented_image_path
            ? getFilenameFromPath(result.segmented_image_path)
            : "";

          return (
            <div
              key={analysis.id}
              style={{
                marginBottom: "25px",
                padding: "20px",
                border: "1px solid #dddddd",
                borderRadius: "8px",
                maxWidth: "850px",
              }}
            >
              <h2>Analysis #{analysis.id}</h2>

              <p>
                <strong>Status:</strong> {analysis.status}
              </p>

              <p>
                <strong>Model:</strong> {analysis.model_name}
              </p>

              <p>
                <strong>Started at:</strong> {analysis.started_at}
              </p>

              <p>
                <strong>Completed at:</strong>{" "}
                {analysis.completed_at || "Not completed"}
              </p>

              {micrograph && (
                <>
                  <hr />

                  <h3>Micrograph</h3>

                  <p>
                    <strong>Original filename:</strong>{" "}
                    {micrograph.original_filename}
                  </p>

                  <p>
                    <strong>Stored filename:</strong>{" "}
                    {micrograph.stored_filename}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {micrograph.micrograph_type || "Not specified"}
                  </p>

                  <p>
                    <strong>Scale:</strong>{" "}
                    {micrograph.scale_value
                      ? `${micrograph.scale_value} ${micrograph.scale_unit}`
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {micrograph.description || "Not specified"}
                  </p>

                  {originalFilename && (
                    <a
                      href={API_ENDPOINTS.micrographs.originalFile(
                        originalFilename,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open original micrograph
                    </a>
                  )}
                </>
              )}

              {result && (
                <>
                  <hr />

                  <h3>Result</h3>

                  <p>
                    <strong>Particle count:</strong> {result.particle_count}
                  </p>

                  <p>
                    <strong>Total masks:</strong> {result.total_masks}
                  </p>

                  <p>
                    <strong>Valid masks:</strong> {result.valid_masks}
                  </p>

                  <p>
                    <strong>Rejected masks:</strong> {result.rejected_masks}
                  </p>

                  {segmentedFilename && (
                    <a
                      href={API_ENDPOINTS.micrographs.segmentedFile(
                        segmentedFilename,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block", marginTop: "10px" }}
                    >
                      Open segmented image
                    </a>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
