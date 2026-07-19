"""Generate sample dataset.xlsx for bid history and capability library."""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "data" / "dataset.xlsx"

BID_HISTORY = [
    {"Project Name": "PITB Cloud Platform Upgrade", "Sector": "IT Services", "Outcome": "Win", "Year": 2024, "Contract Value": 78000000, "Evaluation Score": 81, "Loss Reason": "", "Budget": "85000000"},
    {"Project Name": "NADRA Biometric Services", "Sector": "IT Services", "Outcome": "Win", "Year": 2023, "Contract Value": 62000000, "Evaluation Score": 79, "Loss Reason": "", "Budget": "65000000"},
    {"Project Name": "PTA Portal Modernisation", "Sector": "IT Services", "Outcome": "Win", "Year": 2023, "Contract Value": 45000000, "Evaluation Score": 77, "Loss Reason": "", "Budget": "50000000"},
    {"Project Name": "SBP Core Banking DR", "Sector": "IT Services", "Outcome": "Win", "Year": 2022, "Contract Value": 92000000, "Evaluation Score": 74, "Loss Reason": "", "Budget": "95000000"},
    {"Project Name": "Pak Railways ERP Cloud", "Sector": "IT Services", "Outcome": "Lost", "Year": 2022, "Contract Value": 55000000, "Evaluation Score": 68, "Loss Reason": "Price too high", "Budget": "60000000"},
    {"Project Name": "KP Govt Digital Infra", "Sector": "IT Services", "Outcome": "Win", "Year": 2022, "Contract Value": 38000000, "Evaluation Score": 72, "Loss Reason": "", "Budget": "40000000"},
    {"Project Name": "WAPDA SCADA Cloud", "Sector": "IT Services", "Outcome": "Lost", "Year": 2021, "Contract Value": 71000000, "Evaluation Score": 65, "Loss Reason": "Missing certification", "Budget": "75000000"},
    {"Project Name": "NTC Network Virtualisation", "Sector": "Technology", "Outcome": "Win", "Year": 2021, "Contract Value": 49000000, "Evaluation Score": 76, "Loss Reason": "", "Budget": "52000000"},
    {"Project Name": "NHA SCADA System", "Sector": "Construction", "Outcome": "Win", "Year": 2024, "Contract Value": 110000000, "Evaluation Score": 73, "Loss Reason": "", "Budget": "120000000"},
    {"Project Name": "WAPDA Logistics System", "Sector": "Logistics", "Outcome": "Lost", "Year": 2023, "Contract Value": 38000000, "Evaluation Score": 62, "Loss Reason": "Weak local content proof", "Budget": "40000000"},
    {"Project Name": "FBR Tax Portal Upgrade", "Sector": "IT Services", "Outcome": "Win", "Year": 2024, "Contract Value": 58000000, "Evaluation Score": 80, "Loss Reason": "", "Budget": "62000000"},
    {"Project Name": "PITB Digital Transformation", "Sector": "Technology", "Outcome": "Win", "Year": 2024, "Contract Value": 52000000, "Evaluation Score": 83, "Loss Reason": "", "Budget": "55000000"},
    {"Project Name": "Govt Cloud Infrastructure", "Sector": "IT Services", "Outcome": "Win", "Year": 2023, "Contract Value": 82000000, "Evaluation Score": 78, "Loss Reason": "", "Budget": "85000000"},
    {"Project Name": "Ministry IT Helpdesk", "Sector": "IT Services", "Outcome": "Lost", "Year": 2020, "Contract Value": 25000000, "Evaluation Score": 58, "Loss Reason": "Insufficient references", "Budget": "28000000"},
]

CAPABILITY = [
    {"Cap ID": "CAP-001", "Domain": "Certification", "Project Summary": "ISO 27001:2022 Information Security Management System certified by Bureau Veritas. Cert No. BV-27001-2024-PK, valid until Dec 2026.", "Certification": "ISO 27001:2022", "Year Completed": 2024, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-002", "Domain": "Certification", "Project Summary": "ISO 9001:2015 Quality Management System certified by SGS. Valid through March 2026.", "Certification": "ISO 9001:2015", "Year Completed": 2023, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-003", "Domain": "Experience", "Project Summary": "PITB Data Center Migration — migrated 40+ government systems to hybrid cloud. 14-month delivery, PKR 32M contract, 99.6% uptime achieved.", "Certification": "", "Year Completed": 2021, "Contract Value": "32000000", "Client Type": "Government"},
    {"Cap ID": "CAP-004", "Domain": "Legal", "Project Summary": "PPRA Registered Vendor #PK-IT-08847. Active NTN 4823847-2, FBR compliant, renewed April 2025.", "Certification": "PPRA", "Year Completed": 2025, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-005", "Domain": "Financial", "Project Summary": "Audited financial statements FY22-24. FY24: PKR 87M, FY23: PKR 74M, FY22: PKR 61M turnover.", "Certification": "", "Year Completed": 2024, "Contract Value": "87000000", "Client Type": "Internal"},
    {"Cap ID": "CAP-006", "Domain": "Compliance", "Project Summary": "Data Protection Act 2023 readiness assessment completed. DPO appointed, data flow mapping in progress.", "Certification": "DPA 2023", "Year Completed": 2024, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-007", "Domain": "Technical", "Project Summary": "Local data residency via Nayatel Tier III IDC Islamabad. MoU signed for primary hosting in Pakistan.", "Certification": "", "Year Completed": 2024, "Contract Value": "N/A", "Client Type": "Partner"},
    {"Cap ID": "CAP-008", "Domain": "Experience", "Project Summary": "PTA Licensing Portal Upgrade — cloud-native replatforming, PKR 18.5M, 99.8% uptime, 8-month delivery.", "Certification": "", "Year Completed": 2022, "Contract Value": "18500000", "Client Type": "Government"},
    {"Cap ID": "CAP-009", "Domain": "Experience", "Project Summary": "NADRA Biometric Integration — secure API layer for CNIC verification across 12 agencies, PKR 27M.", "Certification": "", "Year Completed": 2023, "Contract Value": "27000000", "Client Type": "Government"},
    {"Cap ID": "CAP-010", "Domain": "Technical", "Project Summary": "99.9% uptime SLA commitment backed by redundant infrastructure and 24/7 NOC monitoring.", "Certification": "", "Year Completed": 2024, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-011", "Domain": "Technical", "Project Summary": "Disaster recovery plan with RTO 4 hours and RPO 1 hour. Secondary site at Cybernet DC Karachi.", "Certification": "", "Year Completed": 2023, "Contract Value": "N/A", "Client Type": "Internal"},
    {"Cap ID": "CAP-012", "Domain": "HR", "Project Summary": "Key personnel: PM, Solution Architect, Security Lead CVs available. PMI-certified project managers.", "Certification": "PMI", "Year Completed": 2024, "Contract Value": "N/A", "Client Type": "Internal"},
]

def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(OUT, engine="openpyxl") as writer:
        pd.DataFrame([["BidSense AI Dataset"], []]).to_excel(writer, sheet_name="PS1 – Bid History", index=False, header=False)
        pd.DataFrame(BID_HISTORY).to_excel(writer, sheet_name="PS1 – Bid History", index=False, startrow=2)
        pd.DataFrame([["BidSense AI Capability Library"], []]).to_excel(writer, sheet_name="PS1 – Capability Library", index=False, header=False)
        pd.DataFrame(CAPABILITY).to_excel(writer, sheet_name="PS1 – Capability Library", index=False, startrow=2)
    print(f"Created {OUT}")


if __name__ == "__main__":
    main()
