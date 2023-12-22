const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oh6dvsr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const taskCollection = client.db("TaskManagement").collection("task");

		// post task
		app.post("/tasks", async (req, res) => {
			const newTask = req.body;
			const task = await taskCollection.insertOne(newTask);
			res.send(task);
		});

		
		//get task by email
		app.get("/myTasks", async (req, res) => {
			const email = req.query.email;
			console.log(email);
			const query = { email: email };
			const result = await taskCollection.find(query).toArray();
			res.send(result);
		});

		//task status update
		app.put("/tasks/:id", async (req, res) => {
			const { status } = req.body;
			const taskId = req.params.id;

			let update = {
				$set: {
					status: status,
				},
			};

			const result = await taskCollection.updateOne(
				{ _id: new ObjectId(taskId) },
				update
			);
			res.send(result);
		});

		//delete task
		app.delete("/tasks/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await taskCollection.deleteOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Task Management is running!");
});

app.listen(port, () => {
	console.log(`Task Management listening on port ${port}`);
});
