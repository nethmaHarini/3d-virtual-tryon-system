import { useState } from "react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create my 3D avatar?",
      answer:
        "Upload your front, side, and back photos and enter your height. For the best result, use clear full-body photos with your entire body visible.",
    },
    {
      question: "What photos do I need to upload?",
      answer:
        "You'll need three full-body photos: one from the front, one from the side, and one from the back. Use good lighting, a clear background, and stand naturally so your body is clearly visible.",
    },
    {
      question: "What garments can I try on?",
      answer:
        "You can explore the available T-shirts and trousers in the garment catalog. Choose a garment you like to view it on your personalized 3D avatar.",
    },
    {
      question: "Can I view my avatar in 3D?",
      answer:
        "Yes. Once your avatar is ready, you can view it in 3D and rotate it to see your personalized body representation from different angles.",
    },
    {
      question: "How does fit feedback work?",
      answer:
        "After trying on a garment, VirtuFit 3D helps you understand how it fits your body by showing whether the fit is Tight, Perfect, or Loose in the relevant body areas. This makes it easier to choose a garment that suits you.",
    },
    {
      question:
        "Do I need to create a new avatar every time I try on a garment?",
      answer:
        "No. Once your personalized avatar has been created, you can use it to try different available garments without repeating the avatar creation process.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex((currentIndex) =>
      currentIndex === index ? null : index
    );
  };

  return (
    <div className="faq-page">
      <style>{`
        /* ==============================
           PAGE
        ============================== */

        .faq-page {
          min-height: 100vh;

          padding: 55px 24px 80px;

          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(92, 60, 255, 0.20),
              transparent 40%
            ),
            linear-gradient(
              145deg,
              #080e18,
              #111827
            );

          font-family:
            'Plus Jakarta Sans',
            sans-serif;

          color: #ffffff;

          box-sizing: border-box;
        }

        .faq-container {
          width: 100%;

          max-width: 1100px;

          margin: 0 auto;
        }


        /* ==============================
           HERO SECTION
        ============================== */

        .faq-hero {
          position: relative;

          overflow: hidden;

          padding: 48px 52px;

          border-radius: 28px;

          background:
            linear-gradient(
              135deg,
              rgba(71, 45, 180, 0.35),
              rgba(19, 28, 45, 0.95)
            );

          border:
            1px solid
            rgba(255, 255, 255, 0.10);

          margin-bottom: 32px;
        }

        .faq-label {
          display: inline-block;

          margin-bottom: 12px;

          color: #a78bfa;

          font-size: 0.82rem;

          font-weight: 700;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .faq-hero h1 {
          max-width: 650px;

          margin: 0 0 18px;

          font-size:
            clamp(2.4rem, 5vw, 4rem);

          line-height: 1.08;

          font-weight: 800;

          letter-spacing:
            -0.03em;
        }

        .faq-hero p {
          max-width: 650px;

          margin: 0;

          color: #c5cee0;

          font-size: 1rem;

          line-height: 1.75;
        }


        /* ==============================
           HERO DECORATION
        ============================== */

        .faq-decoration {
          position: absolute;

          right: 60px;

          top: 50%;

          width: 115px;

          height: 115px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 28px;

          background:
            linear-gradient(
              135deg,
              #4c2ee8,
              #7d1399
            );

          font-size: 4rem;

          font-weight: 800;

          box-shadow:
            0 20px 60px
            rgba(93, 46, 232, 0.30);

          transform:
            translateY(-50%)
            rotate(7deg);
        }


        /* ==============================
           FAQ SECTION
        ============================== */

        .faq-section {
          padding: 38px 44px;

          border-radius: 28px;

          background:
            rgba(18, 27, 42, 0.82);

          border:
            1px solid
            rgba(255, 255, 255, 0.10);

          box-shadow:
            0 20px 50px
            rgba(0, 0, 0, 0.22);
        }

        .faq-section h2 {
          margin:
            0 0 28px;

          font-size:
            clamp(1.8rem, 3vw, 2.4rem);

          font-weight: 800;

          letter-spacing:
            -0.02em;
        }


        /* ==============================
           FAQ ITEM
        ============================== */

        .faq-item {
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.09);
        }

        .faq-item:last-child {
          border-bottom: none;
        }


        /* ==============================
           QUESTION
        ============================== */

        .faq-question {
          width: 100%;

          padding: 24px 0;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          background:
            transparent;

          border: none;

          color: #ffffff;

          text-align: left;

          font-family: inherit;

          font-size: 1.08rem;

          font-weight: 700;

          line-height: 1.5;

          cursor: pointer;

          transition:
            color 0.25s ease;

          box-sizing:
            border-box;
        }

        .faq-question:hover {
          color: #c4b5fd;
        }


        /* ==============================
           + ICON
        ============================== */

        .faq-icon {
          flex-shrink: 0;

          width: 36px;

          height: 36px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background:
            rgba(109, 61, 255, 0.14);

          color: #a78bfa;

          font-size: 1.35rem;

          font-weight: 700;

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            color 0.25s ease;
        }

        .faq-icon.open {
          transform:
            rotate(45deg);

          background:
            rgba(109, 61, 255, 0.25);

          color: #ffffff;
        }


        /* ==============================
           ANSWER
        ============================== */

        .faq-answer {
          padding:
            0 60px 24px 0;

          color: #c5cee0;

          font-size: 1rem;

          font-weight: 400;

          line-height: 1.75;

          animation:
            faqAnswerOpen
            0.24s ease;
        }

        @keyframes faqAnswerOpen {
          from {
            opacity: 0;
            transform:
              translateY(-6px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }


        /* ==============================
           TABLET
        ============================== */

        @media (max-width: 850px) {
          .faq-page {
            padding:
              45px 22px 70px;
          }

          .faq-hero {
            padding:
              42px 38px;
          }

          .faq-hero h1,
          .faq-hero p {
            max-width: 70%;
          }

          .faq-decoration {
            right: 35px;

            width: 90px;

            height: 90px;

            font-size: 3rem;
          }

          .faq-section {
            padding:
              34px 36px;
          }
        }


        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 640px) {
          .faq-page {
            padding:
              30px 16px 55px;
          }

          .faq-hero {
            padding:
              34px 26px;

            border-radius: 22px;
          }

          .faq-hero h1 {
            max-width: 100%;

            font-size:
              clamp(
                2rem,
                10vw,
                2.7rem
              );
          }

          .faq-hero p {
            max-width: 100%;

            font-size: 0.95rem;
          }

          .faq-decoration {
            display: none;
          }

          .faq-section {
            padding:
              30px 24px;

            border-radius: 22px;
          }

          .faq-section h2 {
            font-size: 1.65rem;

            margin-bottom: 18px;
          }

          .faq-question {
            padding:
              21px 0;

            font-size: 1rem;
          }

          .faq-icon {
            width: 34px;

            height: 34px;

            font-size: 1.2rem;
          }

          .faq-answer {
            padding:
              0 10px 22px 0;

            font-size: 0.95rem;

            line-height: 1.7;
          }
        }


        /* ==============================
           SMALL MOBILE
        ============================== */

        @media (max-width: 400px) {
          .faq-page {
            padding-left: 12px;

            padding-right: 12px;
          }

          .faq-hero {
            padding:
              30px 22px;
          }

          .faq-section {
            padding:
              26px 20px;
          }

          .faq-question {
            gap: 14px;
          }
        }
      `}</style>

      <div className="faq-container">
        {/* HERO */}
        <section className="faq-hero">
          <span className="faq-label">
            FAQ
          </span>

          <h1>
            Questions? We've
            <br />
            Got You Covered.
          </h1>

          <p>
            Find quick answers about your 3D
            avatar, virtual try-on experience,
            garments and personalized fit
            feedback.
          </p>

          <div className="faq-decoration">
            ?
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="faq-section">
          <h2>
            Frequently Asked Questions
          </h2>

          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <div
                className="faq-item"
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    toggleFAQ(index)
                  }
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>
                    {faq.question}
                  </span>

                  <span
                    className={`faq-icon ${
                      isOpen
                        ? "open"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="faq-answer"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default FAQ;