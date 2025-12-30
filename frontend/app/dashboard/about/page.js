"use client";

export default function AboutPage() {
  return (
    <div style={{ 
      maxWidth: "1200px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "32px", marginBottom: "16px", paddingLeft: "8px" }}>About</h1>
      <p style={{ color: "#9ca3af", marginBottom: "32px", paddingLeft: "8px" }}>Learn more about MySEOGenerator and our mission.</p>

      <div style={{
        maxWidth: "900px",
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "40px",
        textAlign: "center"
      }}>
        <h2 style={{ 
          color: "#4dabff", 
          fontSize: "28px", 
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          Who We Are
        </h2>

        <div style={{
          textAlign: "left",
          color: "#d1d5db",
          lineHeight: "1.8",
          fontSize: "16px"
        }}>
          <p style={{ marginBottom: "20px" }}>
            MySEOGenerator was built to give creators, entrepreneurs, and 
            businesses a fast, modern way to generate perfect SEO metadata 
            in seconds.
          </p>

          <p style={{ marginBottom: "20px" }}>
            From single-topic titles to full batch processing, everything 
            is designed to remove stress, save time, and supercharge your 
            workflow.
          </p>

          <p style={{ marginBottom: "0" }}>
            Our mission is simple:
            <br />
            <strong style={{ 
              color: "#4dabff", 
              fontSize: "18px",
              display: "block",
              marginTop: "12px"
            }}>
              Make SEO automation beautiful, powerful, and effortless.
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

