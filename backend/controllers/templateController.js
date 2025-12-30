let templates = [];

export function listTemplates(req, res) {
  res.json(templates);
}

export function createTemplate(req, res) {
  const { name, type, rules } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Name and type required" });
  }

  const t = {
    id: Math.random().toString(36).slice(2),
    name,
    type,
    rules,
    createdAt: new Date()
  };

  templates.push(t);
  res.json(t);
}

export function deleteTemplate(req, res) {
  const { id } = req.params;
  templates = templates.filter(t => t.id !== id);
  res.json({ success: true });
}
