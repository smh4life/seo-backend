import Distributor from "../models/Distributor.schema.js";

export async function listDistributors(req, res) {
  try {
    const userId = req.user.id; // Already authenticated by middleware
    const distributors = await Distributor.find({ userId });
    // Convert MongoDB _id to id for frontend compatibility
    const formatted = distributors.map(d => ({
      id: d._id.toString(),
      name: d.name,
      columnMap: d.columnMap,
      schema: d.schema,
      createdAt: d.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    console.error("List distributors error:", error);
    res.status(500).json({ error: "Failed to load distributors" });
  }
}

export async function createDistributor(req, res) {
  try {
    const userId = req.user.id; // Already authenticated by middleware

    const { name, columnMap, schema } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const distributor = new Distributor({
      userId,
      name,
      columnMap: columnMap || {},
      schema: schema || {}
    });

    await distributor.save();
    
    res.json({
      id: distributor._id.toString(),
      name: distributor.name,
      columnMap: distributor.columnMap,
      schema: distributor.schema,
      createdAt: distributor.createdAt
    });
  } catch (error) {
    console.error("Create distributor error:", error);
    res.status(500).json({ error: "Failed to create distributor" });
  }
}

export async function deleteDistributor(req, res) {
  try {
    const userId = req.user.id; // Already authenticated by middleware

    const { id } = req.params;
    const result = await Distributor.deleteOne({ _id: id, userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Distributor not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete distributor error:", error);
    res.status(500).json({ error: "Failed to delete distributor" });
  }
}
