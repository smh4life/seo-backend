"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("https://formspree.io/f/mwpgzylj", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "1200px",
      backgroundImage: "url('/ai-wave.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>Contact</h1>
      <p style={{ color: "#9ca3af", marginBottom: "32px" }}>Get in touch with us. We'd love to hear from you.</p>

      <div style={{
        maxWidth: "600px",
        width: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(20px)"
      }}>
        {submitted ? (
          <div style={{
            padding: "24px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
            <h3 style={{ color: "#22c55e", marginBottom: "8px" }}>Message Sent!</h3>
            <p style={{ color: "#d1d5db" }}>Thank you for contacting us. We'll get back to you soon.</p>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "#ffffff",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.4)";
              }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ color: "#ffffff", fontSize: "20px", marginBottom: "24px", fontWeight: "600" }}>Send us a Message</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #22c55e",
                    color: "#fff",
                    fontSize: "18px",
                    fontFamily: "Arial, sans-serif",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>
                  Your Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #22c55e",
                    color: "#fff",
                    fontSize: "18px",
                    fontFamily: "Arial, sans-serif",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>
                  Your Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #22c55e",
                    color: "#fff",
                    fontSize: "18px",
                    fontFamily: "Arial, sans-serif",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background: isSubmitting 
                    ? "#374151" 
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  color: "#ffffff",
                  fontWeight: "600",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSubmitting 
                    ? "none" 
                    : "0 4px 16px rgba(59, 130, 246, 0.4)",
                  opacity: isSubmitting ? 0.7 : 1,
                  fontSize: "18px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

