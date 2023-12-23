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
			// console.log(email);
			const query = { email: email };
			const result = await taskCollection.find(query).toArray();
			res.send(result);
		});

		//task status update
		app.put("/tasks/:id", async (req, res) => {
			try {
			  const { status } = req.body;
			  const taskId = req.params.id;
		  
			  if (!["ToDo", "In-Progress", "Done"].includes(status)) {
				// Return an error response for invalid status
				return res.status(400).json({ error: "Invalid status" });
			  }
		  
			  const update = {
				$set: {
				  status: status,
				},
			  };
		  
			  const result = await taskCollection.updateOne(
				{ _id: new ObjectId(taskId) },
				update
			  );
		  
			  if (result.modifiedCount > 0) {
				// Task status updated successfully
				res.json({ success: true, message: "Task status updated successfully" });
			  } else {
				// Task not found or no changes made
				res.status(404).json({ error: "Task not found" });
			  }
			} catch (error) {
			  console.error("Error updating task status:", error);
			  res.status(500).json({ error: "Internal server error" });
			}
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
