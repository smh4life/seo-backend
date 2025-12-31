import Template from "../models/Template.schema.js";

export async function listTemplates(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json([]); // Return empty if not authenticated
    }
    const templates = await Template.find({ userId });
    // Convert MongoDB _id to id for frontend compatibility
    const formatted = templates.map(t => ({
      id: t._id.toString(),
      name: t.name,
      type: t.type,
      rules: t.rules,
      createdAt: t.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    console.error("List templates error:", error);
    res.status(500).json({ error: "Failed to load templates" });
  }
}

export async function createTemplate(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { name, type, rules } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "Name and type required" });
    }

    const template = new Template({
      userId,
      name,
      type,
      rules: rules || {}
    });

    await template.save();
    
    res.json({
      id: template._id.toString(),
      name: template.name,
      type: template.type,
      rules: template.rules,
      createdAt: template.createdAt
    });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
}

export async function deleteTemplate(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const result = await Template.deleteOne({ _id: id, userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
}
