import Category from "../models/Category.schema.js";

// List all categories for a user
export async function listCategories(req, res) {
  try {
    const userId = req.user.id;
    const categories = await Category.find({ userId }).sort({ path: 1 });
    res.json(categories.map(cat => ({
      id: cat._id.toString(),
      path: cat.path,
      keywords: cat.keywords || [],
      parentPath: cat.parentPath || "",
      description: cat.description || ""
    })));
  } catch (error) {
    console.error("List categories error:", error);
    res.status(500).json({ error: "Failed to load categories" });
  }
}

// Import categories from CSV/JSON
export async function importCategories(req, res) {
  try {
    const userId = req.user.id;
    const { categories } = req.body; // Array of { path, keywords, parentPath, description }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array" });
    }

    // Delete existing categories for this user
    await Category.deleteMany({ userId });

    // Insert new categories
    const categoryDocs = categories.map(cat => ({
      userId,
      path: cat.path || "",
      keywords: cat.keywords || [],
      parentPath: cat.parentPath || "",
      description: cat.description || ""
    }));

    const inserted = await Category.insertMany(categoryDocs);

    res.json({
      message: `Imported ${inserted.length} categories`,
      count: inserted.length
    });
  } catch (error) {
    console.error("Import categories error:", error);
    res.status(500).json({ error: "Failed to import categories" });
  }
}

// Auto-match products to categories
export async function matchCategories(req, res) {
  try {
    const userId = req.user.id;
    const { products } = req.body; // Array of { distributorCategory, productName, description, ... }

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Products must be an array" });
    }

    // Load all user categories
    const categories = await Category.find({ userId });
    
    // Build keyword index for faster matching
    const keywordIndex = {};
    categories.forEach(cat => {
      cat.keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        if (!keywordIndex[lowerKeyword]) {
          keywordIndex[lowerKeyword] = [];
        }
        keywordIndex[lowerKeyword].push(cat);
      });
    });

    // Match each product
    const matches = products.map(product => {
      const distributorCat = (product.distributorCategory || "").toLowerCase();
      const productName = (product.productName || product.name || product.title || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      const searchText = `${distributorCat} ${productName} ${description}`;

      // Find best matching category
      let bestMatch = null;
      let bestScore = 0;

      categories.forEach(cat => {
        let score = 0;

        // Exact path match
        if (distributorCat && cat.path.toLowerCase().includes(distributorCat)) {
          score += 10;
        }

        // Keyword matching
        cat.keywords.forEach(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          if (searchText.includes(lowerKeyword)) {
            score += 5;
          }
        });

        // Category name in path
        const categoryName = cat.path.split("/").pop().toLowerCase();
        if (searchText.includes(categoryName)) {
          score += 3;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = cat.path;
        }
      });

      return {
        productIndex: product.index || products.indexOf(product),
        suggestedCategory: bestMatch,
        confidence: bestScore > 0 ? Math.min(100, (bestScore / 20) * 100) : 0
      };
    });

    res.json({ matches });
  } catch (error) {
    console.error("Match categories error:", error);
    res.status(500).json({ error: "Failed to match categories" });
  }
}

// Delete all categories for a user
export async function deleteAllCategories(req, res) {
  try {
    const userId = req.user.id;
    await Category.deleteMany({ userId });
    res.json({ message: "All categories deleted" });
  } catch (error) {
    console.error("Delete categories error:", error);
    res.status(500).json({ error: "Failed to delete categories" });
  }
}

