"use client";

export default function TrainingPanel({ type }) {
  if (type === "batch") {
    return (
      <aside
        style={{
          position: "fixed",
          right: 0,
          top: "79px",
          width: "360px",
          height: "calc(100vh - 79px)",
          background: "rgba(15, 23, 42, 0.98)",
          padding: "24px",
          paddingBottom: "500px",
          borderLeft: "1px solid #1f2937",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 997,
          color: "#e5e7eb"
        }}
      >
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: "600"
        }}>
          Batch Generator Guide
        </h2>
        
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            What is Batch Generation?
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "12px"
          }}>
            The Batch Generator allows you to process multiple SEO topics at once, saving you time when optimizing many products or pages. Instead of generating one at a time, you can paste a list of topics and generate SEO metadata for all of them simultaneously.
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            How to Use:
          </h3>
          <ol style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Enter Topics:</strong> Paste your topics in the text area, one per line. For example:
              <pre style={{ 
                background: "#1f2937", 
                padding: "8px", 
                borderRadius: "4px", 
                marginTop: "8px",
                fontSize: "12px",
                color: "#9ca3af",
                overflowX: "auto"
              }}>
{`Product Name 1
Product Name 2
Product Name 3`}
              </pre>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Click Generate:</strong> Press the "Generate" button to start processing all topics. The system will process them in batches for optimal speed.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Monitor Progress:</strong> Watch the progress counter to see how many topics have been processed. Processing time depends on the number of topics (approximately 10-15 seconds per topic).
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Review Results:</strong> Each generated result shows:
              <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                <li>SEO Title with pixel count (target: 580px)</li>
                <li>Meta Description with pixel count (target: 990px)</li>
                <li>Relevant Keywords (6-12 keywords per topic)</li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Export CSV:</strong> Once generation is complete, click "Download CSV" to export all results as a spreadsheet file for easy use in your SEO tools.
            </li>
          </ol>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            Key Features:
          </h3>
          <ul style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Parallel Processing:</strong> Topics are processed in parallel batches for faster results
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>State Persistence:</strong> Your work is saved automatically - you can navigate away and come back without losing progress
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Google Pixel Accuracy:</strong> Titles and descriptions are optimized to match Google's exact pixel measurements
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Smart Keywords:</strong> Keywords are extracted from the generated content, not just copied from the topic
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>CSV Export:</strong> Download all results in a format ready for import into SEO tools
            </li>
          </ul>
        </div>

        <div style={{ 
          background: "#1e3a5f", 
          padding: "16px", 
          borderRadius: "6px",
          border: "1px solid #3b82f6",
          marginBottom: "150px"
        }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "14px", 
            fontWeight: "600",
            marginTop: 0,
            marginBottom: "8px"
          }}>
            💡 Pro Tip:
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            For best results, use clear, descriptive product names. The AI will generate more accurate SEO content when it can understand what the product is. You can process hundreds of topics at once - the system will handle them efficiently.
          </p>
        </div>
      </aside>
    );
  }

  if (type === "single") {
    return (
      <aside
        style={{
          position: "fixed",
          right: 0,
          top: "79px",
          width: "360px",
          height: "calc(100vh - 79px)",
          background: "rgba(15, 23, 42, 0.98)",
          padding: "24px",
          paddingBottom: "500px",
          borderLeft: "1px solid #1f2937",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 997,
          color: "#e5e7eb"
        }}
      >
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: "600"
        }}>
          Single Generator Guide
        </h2>
        
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            What is the Single Generator?
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "12px"
          }}>
            The Single Generator creates pixel-perfect SEO metadata for one page at a time. Perfect for blog posts, landing pages, product pages, or any individual page that needs optimized titles, descriptions, and keywords.
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            How to Use:
          </h3>
          <ol style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Enter Your Topic:</strong> Type or paste your product name, blog topic, or page subject in the "Topic" field. Be specific - the more descriptive, the better the results.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Click Generate SEO:</strong> Press the "Generate SEO" button. The AI will create optimized content tailored to your topic.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Review the Results:</strong> You'll see:
              <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                <li><strong>SEO Title:</strong> Optimized to ~580 pixels (Google's limit)</li>
                <li><strong>Meta Description:</strong> Optimized to ~990 pixels (Google's limit)</li>
                <li><strong>Keywords:</strong> 6-12 relevant SEO keywords</li>
                <li><strong>Google SERP Preview:</strong> See exactly how it will look in search results</li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Edit if Needed:</strong> Click on any field in the Google SERP Preview to edit directly. Changes update the fields above automatically.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Copy to Use:</strong> Use the "Copy" buttons to copy titles, descriptions, or keywords to your clipboard for use in your CMS or SEO tools.
            </li>
          </ol>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            Key Features:
          </h3>
          <ul style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Pixel-Perfect Accuracy:</strong> Titles and descriptions are measured to match Google's exact pixel limits (580px for titles, 990px for descriptions)
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Google SERP Preview:</strong> See exactly how your result will appear in Google search results, with accurate clipping and formatting
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Editable Preview:</strong> Click directly on the preview to edit titles, URLs, or descriptions - changes sync automatically
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>State Persistence:</strong> Your work is saved automatically - navigate away and come back without losing your progress
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Smart Keywords:</strong> Keywords are extracted from the generated content, ensuring relevance without copying the topic name
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Free Usage:</strong> Get 5 free generates without registration, then sign up for unlimited access
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            Understanding Pixel Counts:
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "12px"
          }}>
            Google displays titles and descriptions with specific pixel limits. Our tool measures text exactly as Google does:
          </p>
          <ul style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Title Limit:</strong> 580 pixels (approximately 60-70 characters)
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Description Limit:</strong> 990 pixels across 2 lines (approximately 155-165 characters)
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Color Coding:</strong> Green = within limit, Red = over limit
            </li>
          </ul>
        </div>

        <div style={{ 
          background: "#1e3a5f", 
          padding: "16px", 
          borderRadius: "6px",
          border: "1px solid #3b82f6",
          marginBottom: "150px"
        }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "14px", 
            fontWeight: "600",
            marginTop: 0,
            marginBottom: "8px"
          }}>
            💡 Pro Tip:
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            For best results, use clear, descriptive topic names. The AI generates more accurate content when it understands what you're optimizing. You can generate multiple times for the same topic to get different variations.
          </p>
        </div>
      </aside>
    );
  }

  if (type === "seo-pro") {
    return (
      <aside
        style={{
          position: "fixed",
          right: 0,
          top: "79px",
          width: "360px",
          height: "calc(100vh - 79px)",
          background: "rgba(15, 23, 42, 0.98)",
          padding: "24px",
          paddingBottom: "500px",
          borderLeft: "1px solid #1f2937",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 997,
          color: "#e5e7eb"
        }}
      >
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: "600"
        }}>
          SEO-Pro Generator Guide
        </h2>
        
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            What is SEO-Pro?
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "12px"
          }}>
            SEO-Pro is an advanced tool for bulk SEO generation. Upload CSV files with product data, select a distributor, and generate optimized SEO metadata (titles, descriptions, keywords) for hundreds of products at once. Perfect for e-commerce stores, product catalogs, and large-scale SEO projects.
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            How to Use:
          </h3>
          <ol style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Select Distributor:</strong> Choose a distributor from the dropdown. Distributors help organize your products by supplier or brand. You can add new distributors using the "Show Management" section.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Upload CSV File:</strong> Click "Upload CSV" or drag and drop your CSV file. The file should contain product names in a column (common column names: "Product Name", "Name", "Title", or the first column).
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Review CSV Data:</strong> After upload, you'll see a preview of your CSV data. Verify that the product names are correctly identified.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Click Generate:</strong> Press "Generate SEO" to start processing. The system will generate SEO metadata for each product in your CSV file.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Monitor Progress:</strong> Watch the progress bar to see how many products have been processed. Processing continues even if you navigate away from the page.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ffffff" }}>Download Results:</strong> Once complete, click "Download CSV" to export all results. The downloaded file includes your original data plus the generated SEO Title, Meta Description, and Keywords columns.
            </li>
          </ol>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            Key Features:
          </h3>
          <ul style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>CSV Upload & Download:</strong> Easy import/export for bulk processing
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Distributor Management:</strong> Organize products by supplier or brand
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Template System:</strong> Create reusable SEO templates for consistent formatting
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Background Processing:</strong> Generation continues even if you navigate away
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>State Persistence:</strong> Your work is saved automatically - resume anytime
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Pixel-Perfect SEO:</strong> All titles and descriptions optimized to Google's exact pixel limits
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "#ffffff" }}>Smart Keywords:</strong> Relevant keywords extracted from generated content
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "16px", 
            fontWeight: "600",
            marginBottom: "12px"
          }}>
            CSV File Format:
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "12px"
          }}>
            Your CSV file should have product names in one of these columns:
          </p>
          <ul style={{ 
            paddingLeft: "20px", 
            color: "#d1d5db",
            lineHeight: "1.8"
          }}>
            <li style={{ marginBottom: "6px" }}>"Product Name"</li>
            <li style={{ marginBottom: "6px" }}>"product_name"</li>
            <li style={{ marginBottom: "6px" }}>"Name" or "name"</li>
            <li style={{ marginBottom: "6px" }}>"Title" or "title"</li>
            <li style={{ marginBottom: "6px" }}>Or the first column if none of the above</li>
          </ul>
        </div>

        <div style={{ 
          background: "#1e3a5f", 
          padding: "16px", 
          borderRadius: "6px",
          border: "1px solid #3b82f6",
          marginBottom: "150px"
        }}>
          <h3 style={{ 
            color: "#60a5fa", 
            fontSize: "14px", 
            fontWeight: "600",
            marginTop: 0,
            marginBottom: "8px"
          }}>
            💡 Pro Tip:
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            For best results, ensure your CSV has clear product names. The system processes products in parallel batches for speed, so large files (100+ products) may take a few minutes. You can safely navigate away - generation continues in the background.
          </p>
        </div>
      </aside>
    );
  }

  // Fallback for other types
  return null;
}
