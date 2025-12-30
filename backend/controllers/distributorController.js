let distributors = [];

export function listDistributors(req, res) {
  res.json(distributors);
}

export function createDistributor(req, res) {
  const { name, columnMap, schema } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const distributor = {
    id: Math.random().toString(36).slice(2),
    name,
    columnMap: columnMap || {},
    schema: schema || {},
    createdAt: new Date()
  };

  distributors.push(distributor);
  res.json(distributor);
}

export function deleteDistributor(req, res) {
  const { id } = req.params;
  distributors = distributors.filter(d => d.id !== id);
  res.json({ success: true });
}
