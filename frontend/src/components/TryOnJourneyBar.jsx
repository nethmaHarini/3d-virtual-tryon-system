import React from "react";
import { useAppTheme } from "../theme";

const steps = [
  { id: 1, label: "SELECT GARMENT", icon: "◈" },
  { id: 2, label: "CHOOSE SIZE", icon: "◌" },
  { id: 3, label: "TRY-ON & FIT ANALYSIS", icon: "◍" },
];

export default function TryOnJourneyBar({ currentStep = 1 }) {
  const { isDark } = useAppTheme();

  const resolvedStep = Math.min(3, Math.max(1, Number(currentStep) || 1));

  const styles = {
    wrapper: {
      width: "100%",
      display: "flex",
      alignItems: "stretch",
      gap: 12,
      background: isDark ? "rgba(13, 18, 31, 0.9)" : "rgba(255, 255, 255, 0.84)",
      border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(148, 163, 184, 0.22)",
      borderRadius: 18,
      padding: "14px 16px",
      boxSizing: "border-box",
      boxShadow: isDark ? "0 18px 28px rgba(2, 6, 23, 0.18)" : "0 18px 28px rgba(15, 23, 42, 0.06)",
    },
    step: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      border: "1px solid transparent",
      padding: "10px 12px",
      boxSizing: "border-box",
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      display: "grid",
      placeItems: "center",
      fontSize: "0.9rem",
      fontWeight: 800,
      flexShrink: 0,
    },
    textWrap: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      gap: 2,
    },
    label: {
      fontSize: "0.74rem",
      fontWeight: 800,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    stepNumber: {
      fontSize: "0.62rem",
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      lineHeight: 1.2,
      opacity: 0.8,
    },
    connector: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      color: isDark ? "rgba(167, 176, 192, 0.7)" : "rgba(71, 85, 105, 0.6)",
      fontSize: "1.2rem",
      fontWeight: 700,
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.wrapper}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < resolvedStep;
        const isActive = stepNumber === resolvedStep;
        const isUpcoming = stepNumber > resolvedStep;

        const stepStyle = {
          ...styles.step,
          background: isActive
            ? isDark
              ? "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(139,92,246,0.12))"
              : "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(139,92,246,0.08))"
            : isComplete
              ? isDark
                ? "rgba(15, 23, 42, 0.7)"
                : "rgba(248, 250, 252, 0.9)"
              : "transparent",
          borderColor: isActive
            ? "rgba(124, 58, 237, 0.46)"
            : isComplete
              ? "rgba(34, 197, 94, 0.22)"
              : isDark
                ? "rgba(148, 163, 184, 0.08)"
                : "rgba(148, 163, 184, 0.16)",
          opacity: isUpcoming ? 0.6 : 1,
        };

        const iconStyle = {
          ...styles.iconWrap,
          background: isActive
            ? "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)"
            : isComplete
              ? "linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(34, 197, 94, 0.08))"
              : isDark
                ? "rgba(15, 23, 42, 0.9)"
                : "rgba(241, 245, 249, 0.95)",
          border: isActive
            ? "1px solid rgba(124, 58, 237, 0.4)"
            : isComplete
              ? "1px solid rgba(34, 197, 94, 0.24)"
              : isDark
                ? "1px solid rgba(148, 163, 184, 0.12)"
                : "1px solid rgba(148, 163, 184, 0.16)",
          color: isActive ? "#ffffff" : isComplete ? "#22C55E" : isDark ? "#DDE7FF" : "#475569",
          boxShadow: isActive ? "0 10px 18px rgba(124, 58, 237, 0.18)" : "none",
        };

        const labelStyle = {
          ...styles.label,
          color: isActive ? (isDark ? "#F8FAFC" : "#0F172A") : isComplete ? (isDark ? "#E2E8F0" : "#0F172A") : isDark ? "#A7B0C0" : "#475569",
        };

        const stepNumberStyle = {
          ...styles.stepNumber,
          color: isActive ? (isDark ? "#E9D5FF" : "#7C3AED") : isComplete ? "#22C55E" : isDark ? "#7F8AA2" : "#64748B",
        };

        return (
          <React.Fragment key={step.id}>
            <div style={stepStyle}>
              <div style={iconStyle}>{isComplete ? "✓" : step.icon}</div>
              <div style={styles.textWrap}>
                <span style={labelStyle}>{step.label}</span>
                <span style={stepNumberStyle}>STEP {step.id}</span>
              </div>
            </div>

            {index < steps.length - 1 && <div style={styles.connector}>→</div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
