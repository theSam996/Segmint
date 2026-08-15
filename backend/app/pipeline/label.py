"""
Segmint — Stage 6: Business Labeling
Translates cluster assignments into human-readable customer personas
with actionable business recommendations.

This is the "translation layer" that turns ML output into business value.
Uses RAW (unscaled) RFM values so labels are interpretable by non-technical
stakeholders — "Frequency = 12 purchases" not "Frequency_scaled = 1.8 std devs".
"""

import os
import pandas as pd
import numpy as np


# Persona definitions based on RFM profile relative to medians
PERSONA_RULES = [
    {
        "name": "Champions",
        "icon": "🏆",
        "condition": lambda r, f, m: r == "low" and f == "high" and m == "high",
        "description": "Best customers. Bought recently, buy often, and spend the most.",
        "action": "Reward them. Give early access to new products, loyalty programs, and make them brand ambassadors.",
        "color": "#10b981",
    },
    {
        "name": "Loyal Customers",
        "icon": "💎",
        "condition": lambda r, f, m: f == "high" and m in ("medium", "high"),
        "description": "Buy regularly with solid spending. Core revenue drivers.",
        "action": "Upsell higher-value products. Recommend based on purchase history. Engage with loyalty rewards.",
        "color": "#3b82f6",
    },
    {
        "name": "Potential Loyalists",
        "icon": "⭐",
        "condition": lambda r, f, m: r == "low" and f == "medium",
        "description": "Recent customers with moderate frequency. Could become loyal with the right engagement.",
        "action": "Offer membership programs, personalized recommendations, and follow-up engagement campaigns.",
        "color": "#8b5cf6",
    },
    {
        "name": "New Customers",
        "icon": "🌱",
        "condition": lambda r, f, m: r == "low" and f == "low",
        "description": "Bought recently but only once or twice. High potential, needs nurturing.",
        "action": "Provide onboarding support, welcome offers, and educational content about product range.",
        "color": "#06b6d4",
    },
    {
        "name": "At Risk",
        "icon": "⚠️",
        "condition": lambda r, f, m: r == "medium" and f in ("medium", "high"),
        "description": "Used to buy frequently but haven't purchased recently. Might be switching to competitors.",
        "action": "Send personalized win-back emails, limited-time offers, and request feedback on experience.",
        "color": "#f59e0b",
    },
    {
        "name": "Needs Attention",
        "icon": "🔔",
        "condition": lambda r, f, m: r == "medium" and m in ("medium", "high"),
        "description": "Above-average spenders who are becoming inactive. Worth re-engaging.",
        "action": "Make time-limited offers, recommend products based on past purchases, reactivate with incentives.",
        "color": "#f97316",
    },
    {
        "name": "About to Sleep",
        "icon": "😴",
        "condition": lambda r, f, m: r == "high" and f == "low" and m == "low",
        "description": "Low engagement across all metrics. Last chance before they become lost.",
        "action": "Send aggressive win-back campaigns, deep discounts, or 'we miss you' emails. Survey for churn reasons.",
        "color": "#ef4444",
    },
    {
        "name": "Hibernating",
        "icon": "❄️",
        "condition": lambda r, f, m: r == "high",
        "description": "Haven't purchased in a long time. May be lost but worth one final re-engagement attempt.",
        "action": "Last-resort reactivation campaign. If no response, reduce marketing spend on this segment.",
        "color": "#6b7280",
    },
]


def classify_rfm_level(value: float, low_threshold: float, high_threshold: float) -> str:
    """Classify a value as low/medium/high based on percentile thresholds."""
    if value <= low_threshold:
        return "low"
    elif value >= high_threshold:
        return "high"
    else:
        return "medium"


def assign_persona(r_level: str, f_level: str, m_level: str) -> dict:
    """Match an R/F/M level profile to a persona using rules."""
    for persona in PERSONA_RULES:
        if persona["condition"](r_level, f_level, m_level):
            return persona

    # Fallback
    return {
        "name": "Other",
        "icon": "📊",
        "description": "Customer segment that doesn't clearly match predefined personas.",
        "action": "Analyze further to understand behavior and tailor marketing strategy.",
        "color": "#9ca3af",
    }


def label_clusters(rfm_raw: pd.DataFrame, cluster_labels: np.ndarray,
                   cluster_col_name: str = "kmeans_cluster") -> dict:
    """
    Label each cluster with a business persona based on mean R/F/M values.

    Args:
        rfm_raw: Raw (unscaled) RFM DataFrame with CustomerID, Recency, Frequency, Monetary
        cluster_labels: Array of cluster assignments
        cluster_col_name: Name of the cluster column

    Returns:
        dict with 'summary' (DataFrame), 'labeled_customers' (DataFrame), 'persona_map' (dict)
    """
    rfm = rfm_raw.copy()
    rfm[cluster_col_name] = cluster_labels

    # Global thresholds (percentile-based)
    # For Recency: LOWER is better, so we invert the logic
    r_p33 = rfm["Recency"].quantile(0.33)
    r_p66 = rfm["Recency"].quantile(0.66)
    f_p33 = rfm["Frequency"].quantile(0.33)
    f_p66 = rfm["Frequency"].quantile(0.66)
    m_p33 = rfm["Monetary"].quantile(0.33)
    m_p66 = rfm["Monetary"].quantile(0.66)

    # --- Build cluster summary ---
    cluster_summary = rfm.groupby(cluster_col_name).agg(
        avg_recency=("Recency", "mean"),
        avg_frequency=("Frequency", "mean"),
        avg_monetary=("Monetary", "mean"),
        customer_count=("CustomerID", "count"),
    ).reset_index()

    total_customers = len(rfm)
    cluster_summary["pct_of_base"] = (
        cluster_summary["customer_count"] / total_customers * 100
    ).round(1)

    # Round values
    cluster_summary["avg_recency"] = cluster_summary["avg_recency"].round(1)
    cluster_summary["avg_frequency"] = cluster_summary["avg_frequency"].round(1)
    cluster_summary["avg_monetary"] = cluster_summary["avg_monetary"].round(2)

    # --- Assign personas to each cluster ---
    persona_map = {}
    persona_details = []

    for _, row in cluster_summary.iterrows():
        cluster_id = int(row[cluster_col_name])

        # For Recency: LOW value = RECENT (good), so swap the logic
        r_level = classify_rfm_level(row["avg_recency"], r_p33, r_p66)
        # Invert recency: low days = "low" recency = recent = good
        f_level = classify_rfm_level(row["avg_frequency"], f_p33, f_p66)
        m_level = classify_rfm_level(row["avg_monetary"], m_p33, m_p66)

        persona = assign_persona(r_level, f_level, m_level)
        persona_map[cluster_id] = persona["name"]

        persona_details.append({
            "cluster_id": cluster_id,
            "persona": persona["name"],
            "icon": persona["icon"],
            "description": persona["description"],
            "action": persona["action"],
            "color": persona["color"],
            "r_level": r_level,
            "f_level": f_level,
            "m_level": m_level,
        })

    # Merge persona info into summary
    persona_df = pd.DataFrame(persona_details)
    summary = cluster_summary.merge(persona_df, left_on=cluster_col_name, right_on="cluster_id")
    summary = summary.drop(columns=["cluster_id"])

    # --- Label individual customers ---
    rfm["persona"] = rfm[cluster_col_name].map(persona_map)
    action_map = {p["persona"]: p["action"] for p in persona_details}
    color_map = {p["persona"]: p["color"] for p in persona_details}
    icon_map = {p["persona"]: p["icon"] for p in persona_details}
    rfm["action"] = rfm["persona"].map(action_map)
    rfm["persona_color"] = rfm["persona"].map(color_map)
    rfm["persona_icon"] = rfm["persona"].map(icon_map)

    print(f"\n  🏷 Cluster Persona Assignments:")
    for _, row in summary.iterrows():
        print(f"    {row['icon']} Cluster {row[cluster_col_name]}: "
              f"{row['persona']} ({row['customer_count']} customers, "
              f"{row['pct_of_base']}%)")

    return {
        "summary": summary,
        "labeled_customers": rfm,
        "persona_map": persona_map,
    }


def run_labeling(rfm_raw_csv_path: str, clustered_csv_path: str,
                 output_dir: str) -> dict:
    """
    Full Stage 6 pipeline: load raw RFM + cluster labels → assign personas → save.

    Returns:
        dict with 'summary', 'labeled_customers', 'persona_map', output paths.
    """
    os.makedirs(output_dir, exist_ok=True)

    print(f"🏷 Assigning business personas...")

    rfm_raw = pd.read_csv(rfm_raw_csv_path)
    clustered = pd.read_csv(clustered_csv_path)

    # Get K-Means cluster labels
    kmeans_labels = clustered["kmeans_cluster"].values
    dbscan_labels = clustered["dbscan_cluster"].values

    # Label using K-Means (primary)
    result = label_clusters(rfm_raw, kmeans_labels, "kmeans_cluster")

    # Also add DBSCAN labels to the labeled customers table
    result["labeled_customers"]["dbscan_cluster"] = dbscan_labels

    # --- Save outputs ---
    summary_path = os.path.join(output_dir, "cluster_summary.csv")
    result["summary"].to_csv(summary_path, index=False)
    print(f"  💾 Saved cluster summary to {summary_path}")

    labeled_path = os.path.join(output_dir, "rfm_clusters_labeled.csv")
    result["labeled_customers"].to_csv(labeled_path, index=False)
    print(f"  💾 Saved labeled customers to {labeled_path}")

    result["summary_path"] = summary_path
    result["labeled_path"] = labeled_path

    return result
