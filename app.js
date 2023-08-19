const fs = require("fs");
const express = require("express");

const app = express();

const port = 5172;

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const jobsJson = JSON.parse(fs.readFileSync(`${__dirname}/mockData/jobs.json`));

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject("Internal Server Error");
      resolve(JSON.parse(data));
    });
  });
};

const writeFile = (file, body) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, body, (err) => {
      if (err) reject("Internal Server Error");
      resolve("Written Successfully");
    });
  });
};

app.get("/api/v1/jobs", (req, res) => {
  readFile(`${__dirname}/mockData/jobs.json`)
    .then((data) =>
      res.status(200).json({
        status: "success",
        results: data.length,
        data: {
          jobs: data,
        },
      })
    )
    .catch((err) =>
      res.status(404).json({
        status: "error",
        message: err.message ? err.message : err,
      })
    );
});

app.post("/api/v1/jobs", (req, res) => {
  const body = req.body;

  const newId = Number(jobsJson[jobsJson.length - 1].job_id) + 1;

  if (
    body.date_posted &&
    body.author_name &&
    body.job_field &&
    body.job_description &&
    body.job_pay &&
    body.experience_level &&
    body.job_title &&
    body.company &&
    body.company
  ) {
    const newBody = Object.assign({ ...body, job_id: newId });
    jobsJson.push(newBody);

    writeFile(`${__dirname}/mockData/jobs.json`, JSON.stringify(jobsJson))
      .then((data) => {
        res.status(201).json({
          status: "success",
          message: "Job added successfully",
          data: body,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: "failed",
          message: err.message ? err.message : err,
        });
      });
  } else {
    res.status(400).json({
      status: "failed",
      message: "JSON should contain all fields",
    });
  }
});

app.get("/api/v1/jobs/:id", (req, res) => {
  const id = Number(req.params.id);

  const job = jobsJson.find((el) => el.job_id === id);

  if (job) {
    readFile(`${__dirname}/mockData/jobs.json`)
      .then((data) => {
        res.status(200).json({
          status: "success",
          data: {
            job,
          },
        });
      })
      .catch((err) =>
        res.status(404).json({
          status: "error",
          message: err.message ? err.message : err,
        })
      );
  } else {
    res.status(404).json({
      status: "failed",
      message: "id not found",
    });
  }
});

app.listen(port, () => {
  console.log("Listening for events on port:", port);
});
