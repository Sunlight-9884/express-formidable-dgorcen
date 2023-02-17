import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import formidable from "formidable";
import aws from "aws-sdk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
let port = 3000;
dotenv.config();

app.use(express.static("public"));
const username = [{ name: "sai", age: 18, id: uuidv4 }];
const htmlFile = `<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <script type="text/javascript">
      localStorage.setItem('url', '${process.env.API_URL}')
      window.location.href = '/'
    </script>
  </body>
</html>`;

const s3 = new aws.S3({
  endpoint: "sgp1.digitaloceanspaces.com",
  accessKeyId: process.env.SPACES_ACCESS_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY,
});

app.get("/api", (req: Request, res: Response) => {
  res.send(htmlFile);
});

app.get("/api/users", (req: Request, res: Response) => {
  res.send(username);
});

app.post("/api/upload", (req: Request, res: Response) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files: any) => {
    if (err) {
      console.log("error is", err);
    }

    if (!files.file) {
      return;
    }

    const file = fs.readFileSync(files.file.filepath);
    const fileName = `${uuidv4()}${files.file.originalFilename}`;
    s3.upload(
      {
        Bucket: "msquarefdc",
        ACL: "public-read",
        Key: `${fileName}`,
        Body: file,
      },
      {
        partSize: 10 * 1024 * 1024,
        queueSize: 10,
      }
    ).send((err, data) => {
      if (err) {
        console.log("error is", err);
        return res.status(500);
      }
      // Unlink file
      fs.unlinkSync(files.file.filepath || "");

      // Return file url or other necessary details
      return res.send({
        url: data.Location,
      });
    });
  });
});

app.listen(port, () => console.log("server listening on port: 3000"));
