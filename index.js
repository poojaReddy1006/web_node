const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Port number that server listens to
const PORT = 7128;

const spaceMissionDetails = async (client) => {
    //Fetches records from given database
    const cursor = await client.db("SpaceMissionDB").collection("Missions").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);
}

//Creates HTTP Server(i.e our system acts as server)
http.createServer(async (req, res) => {
    if (req.url === "/api") {
        const URL = "mongodb+srv://PoojaReddyGujju:Education%401@cluster0.vtdng2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try {
            // Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const spaceMissionData = await spaceMissionDetails(client);
            // Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200, { "content-type": "application/json" });
            res.end(spaceMissionData);
        }
        catch (err) {
            console.error("Error in connecting database", err);
        }
        finally {
            //Closing connection to database
            await client.close();
            console.log("Database connection is closed");
        }
    }
    else {
        let contentType;
        let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
        let fileExtension = path.extname(filePath);
        switch (fileExtension) {
            case ".html":
                contentType = "text/html";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".js":
                contentType = "application/javascript";
                break;
            case ".json":
                contentType= "application/json";
                break;
            case ".svg":
                contentType = "image/svg+xml";
                break;
            default:
                contentType = "text/plain";
                break;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(500, { "content-type": "text/html" });
                    res.end("<h1>404 Page Not Found!</h1>");
                }
                else {
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else {
                //Assigning content-type based on file extension
                res.writeHead(200, { "content-type": contentType });
                res.end(data);
            }
        })
    }
}).listen(PORT, () => console.log(`Server is running on ${PORT}`));