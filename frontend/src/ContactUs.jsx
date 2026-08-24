import { useState } from "react";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact form:", formData);

    alert("Thank you! Your message has been received.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <style>{`
        .contact-page {
          min-height: 100vh;
          padding: 48px 24px 80px;

          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(93, 61, 255, 0.22),
              transparent 42%
            ),
            linear-gradient(
              145deg,
              #080e18,
              #111827
            );

          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
        }

        .contact-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .contact-heading {
          text-align: center;
          margin-bottom: 42px;
        }

        .contact-heading h1 {
          margin: 0 0 14px;

          font-size: clamp(2.3rem, 4vw, 3.5rem);
          font-weight: 800;

          letter-spacing: -0.03em;
        }

        .contact-heading p {
          max-width: 650px;
          margin: 0 auto;

          color: #bac4d8;

          font-size: 1rem;
          line-height: 1.7;
        }

        .contact-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.3fr);

          gap: 28px;

          align-items: stretch;
        }

        .contact-info,
        .contact-form-card {
          border-radius: 26px;

          border:
            1px solid rgba(255, 255, 255, 0.1);

          background:
            rgba(18, 27, 42, 0.82);

          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.22);

          backdrop-filter: blur(12px);
        }

        .contact-info {
          padding: 36px;
        }

        .contact-info h2 {
          margin: 0 0 14px;

          font-size: 1.7rem;
          font-weight: 800;
        }

        .contact-info > p {
          margin: 0 0 30px;

          color: #b6c0d3;

          line-height: 1.7;
        }

        .contact-detail {
          padding: 18px 0;

          border-bottom:
            1px solid rgba(255, 255, 255, 0.08);
        }

        .contact-detail:last-child {
          border-bottom: none;
        }

        .contact-label {
          display: block;

          margin-bottom: 7px;

          color: #a78bfa;

          font-size: 0.78rem;
          font-weight: 700;

          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .contact-value {
          margin: 0;

          color: #ffffff;

          font-size: 0.98rem;

          line-height: 1.6;
        }

        .contact-form-card {
          padding: 36px;
        }

        .contact-form-card h2 {
          margin: 0 0 24px;

          font-size: 1.7rem;
          font-weight: 800;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #c7cfdd;

          font-size: 0.84rem;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;

          box-sizing: border-box;

          border:
            1px solid rgba(255, 255, 255, 0.13);

          border-radius: 14px;

          background:
            rgba(8, 15, 24, 0.8);

          color: #ffffff;

          font-family: inherit;

          font-size: 0.95rem;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-group input {
          height: 48px;
          padding: 0 15px;
        }

        .form-group textarea {
          min-height: 150px;

          resize: vertical;

          padding: 14px 15px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color:
            rgba(139, 92, 246, 0.8);

          box-shadow:
            0 0 0 3px
            rgba(139, 92, 246, 0.12);
        }

        .contact-submit {
          align-self: flex-start;

          border: none;

          border-radius: 999px;

          padding: 13px 28px;

          background:
            linear-gradient(
              135deg,
              #3626ce,
              #5f0b7e
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 0.95rem;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 12px 28px
            rgba(31, 22, 81, 0.4);

          transition:
            transform 0.22s ease,
            filter 0.22s ease;
        }

        .contact-submit:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        @media (max-width: 850px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .contact-page {
            padding:
              36px 16px 60px;
          }

          .contact-info,
          .contact-form-card {
            padding: 26px 22px;
            border-radius: 22px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .contact-submit {
            width: 100%;
          }
        }
      `}</style>

      <div className="contact-container">

        <div className="contact-heading">
          <h1>Get in Touch</h1>

          <p>
            Have a question, need support, or want to share feedback?
            Send us a message and we’ll be happy to help.
          </p>
        </div>

        <div className="contact-grid">

          <section className="contact-info">

            <h2>Contact Us</h2>

            <p>
              Reach out to the VirtuFit 3D team for assistance
              with your virtual try-on experience.
            </p>

            <div className="contact-detail">
              <span className="contact-label">
                General Support
              </span>

              <p className="contact-value">
                Get help with account access,
                avatar generation, garment selection,
                or fit feedback.
              </p>
            </div>

            <div className="contact-detail">
              <span className="contact-label">
                Feedback
              </span>

              <p className="contact-value">
                Share your suggestions and experience
                to help us improve VirtuFit 3D.
              </p>
            </div>

            <div className="contact-detail">
              <span className="contact-label">
                Response
              </span>

              <p className="contact-value">
                We’ll review your message and respond
                as soon as possible.
              </p>
            </div>

          </section>


          <section className="contact-form-card">

            <h2>Send a Message</h2>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="name">
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>


                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>

              </div>


              <div className="form-group">
                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="message">
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                />
              </div>


              <button
                type="submit"
                className="contact-submit"
              >
                Send Message
              </button>

            </form>

          </section>

        </div>

      </div>
    </div>
  );
}

export default ContactUs;