import React from "react";
import image from "../../image/micro/4.jpg";

export const How = () => {
  return (
    <>
      <div className="index-container">
        <div className="data-container">
          <div className="text-container">
            <h1>HOW DOES IT WORK?</h1>
          </div>

          <div className="half-line"></div>

          <div className="description-container">
            <p>
              The Micrograph Analysis System (MAS) allows users to analyze
              TEM/SEM micrographs through a simple workflow. The system supports
              micrograph upload, model selection, automatic segmentation,
              particle counting, result visualization and PDF report generation.
            </p>

            <ol>
              <li>
                <strong>Registration and Login:</strong> Create an account or
                log in to access the analysis workflow and keep track of
                previous micrograph analyses.
              </li>

              <li>
                <strong>Uploading Micrographs:</strong> Go to the "Report"
                module and upload a TEM or SEM micrograph. You can also register
                basic metadata such as image type, scale and description.
              </li>

              <li>
                <strong>Model Selection:</strong> Select the segmentation model
                to be used. MAS supports SAM classic and SAM 2. When SAM 2 is
                selected, the system allows choosing an overlap profile and an
                execution mode according to the available computational
                resources.
              </li>

              <li>
                <strong>Automatic Analysis:</strong> The backend processes the
                micrograph, generates segmentation masks, applies filtering
                rules and counts the detected nanoparticles.
              </li>

              <li>
                <strong>Results and Reports:</strong> After the analysis, MAS
                generates a segmented image, a summary figure with area and
                length distributions, and a downloadable PDF report. Previous
                analyses can be reviewed from the "History" section.
              </li>
            </ol>
          </div>
        </div>

        <div className="image-container-mid">
          <img
            className="image-mid"
            src={image}
            alt="Micrograph analysis workflow"
          />
        </div>
      </div>
    </>
  );
};
