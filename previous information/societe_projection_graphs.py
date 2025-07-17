import pandas as pd
import matplotlib.pyplot as plt

# Signup levels
signups = [10, 100, 1000, 10000, 25000, 50000, 100000]

# Conversion rates (SAME FOR BOTH SCENARIOS)
suite_conv = 0.015  # 1.5%
societe_conv = 0.005  # 0.5%
total_conv = suite_conv + societe_conv  # 2% total

# Pricing
suite_price = 15  # $15/bureau/month
societe_price_per_user = 10  # $10/user/month
users_per_societe_bureau = 5  # min 5 users per bureau

# Churn parameters
churn_rate = 0.05  # 5% monthly
months = 12

# Break-even assumptions
monthly_cost = 2150  # Default monthly cost (hosting, salary, etc.)

print("=" * 80)
print("BUREAU.IO REVENUE PROJECTIONS")
print("=" * 80)
print(f"Conversion Rates: Suite {suite_conv*100}%, Société {societe_conv*100}%, Total {total_conv*100}%")
print("=" * 80)

# NO CHURN SCENARIO (One-time signup pool)
print("\n" + "=" * 60)
print("SCENARIO 1: NO CHURN (One-time signup pool)")
print("=" * 60)

no_churn_data = []
for s in signups:
    suite_customers = int(s * suite_conv)
    societe_customers = int(s * societe_conv)
    suite_revenue = suite_customers * suite_price
    societe_revenue = societe_customers * users_per_societe_bureau * societe_price_per_user
    total_revenue = suite_revenue + societe_revenue
    annual_revenue = total_revenue * 12
    no_churn_data.append({
        'Signups': s,
        'Suite Customers': suite_customers,
        'Société Customers': societe_customers,
        'Suite Revenue (Monthly)': suite_revenue,
        'Société Revenue (Monthly)': societe_revenue,
        'Total Revenue (Monthly)': total_revenue,
        'Total Revenue (Annual)': annual_revenue
    })

df_no_churn = pd.DataFrame(no_churn_data)
print(df_no_churn.to_string(index=False))

# WITH CHURN SCENARIO (Same customers, but churn applied over 12 months)
print("\n" + "=" * 60)
print("SCENARIO 2: WITH CHURN (Same customers, 5% monthly churn over 12 months)")
print("=" * 60)

churn_data = []
for s in signups:
    # Start with same customer numbers as Scenario 1
    initial_suite_customers = int(s * suite_conv)
    initial_societe_customers = int(s * societe_conv)
    
    # Apply churn over 12 months
    suite_customers = initial_suite_customers
    societe_customers = initial_societe_customers
    
    for month in range(1, months + 1):
        suite_customers = suite_customers * (1 - churn_rate)
        societe_customers = societe_customers * (1 - churn_rate)
    
    # Calculate revenue after 12 months of churn
    suite_revenue = int(round(suite_customers)) * suite_price
    societe_revenue = int(round(societe_customers)) * users_per_societe_bureau * societe_price_per_user
    total_revenue = suite_revenue + societe_revenue
    annual_revenue = total_revenue * 12
    
    churn_data.append({
        'Signups': s,
        'Suite Customers (M12)': int(round(suite_customers)),
        'Société Customers (M12)': int(round(societe_customers)),
        'Suite Revenue (M12)': suite_revenue,
        'Société Revenue (M12)': societe_revenue,
        'Total Revenue (M12)': total_revenue,
        'Total Revenue (Annualized)': annual_revenue
    })

df_churn = pd.DataFrame(churn_data)
print(df_churn.to_string(index=False))

# BREAK-EVEN & MILESTONE TABLES
print("\n" + "=" * 60)
print("BREAK-EVEN & MILESTONE ANALYSIS (With Churn)")
print("=" * 60)

# Revenue per signup after churn
revenue_per_signup = 0.2565  # $0.2565 per signup per month (from previous analysis)

milestones = [1000, 5000, 8400, 10000, 25000, 50000, 100000]
labels = ["First paying users", "Cover basic infra/tools", "Break-even", "Small salary + growth", "Hire part-time help", "Full-time team", "Scale, invest in growth"]

milestone_data = []
for i, s in enumerate(milestones):
    suite_cust = int(s * suite_conv * (1 - churn_rate) ** months)
    societe_cust = int(s * societe_conv * (1 - churn_rate) ** months)
    monthly_revenue = suite_cust * suite_price + societe_cust * users_per_societe_bureau * societe_price_per_user
    milestone_data.append({
        'Signups': s,
        'Suite Cust. (M12)': suite_cust,
        'Société Cust. (M12)': societe_cust,
        'Monthly Revenue (M12)': monthly_revenue,
        'Milestone': labels[i]
    })

# Calculate break-even signups
break_even_signups = int(monthly_cost / revenue_per_signup)
print(f"\nBreak-even point (monthly cost ${monthly_cost}): {break_even_signups} signups needed (after churn)")

# Print milestone table
df_milestone = pd.DataFrame(milestone_data)
print(df_milestone.to_string(index=False))

print("\nAnalysis:")
print("- You need ~8,400 signups to break even at $2,150/month cost, after churn.")
print("- $10,000/month requires ~39,000 signups; $25,000/month requires ~97,500 signups.")
print("- Early revenue is modest; focus on conversion, ARPU, and retention to reduce signup requirements.")
print("- Consider targeting higher-value customers or adding premium features to improve margins.")

# COMPARISON TABLE
print("\n" + "=" * 80)
print("REVENUE COMPARISON: NO CHURN vs WITH CHURN")
print("=" * 80)

comparison_data = []
for i, s in enumerate(signups):
    no_churn_annual = no_churn_data[i]['Total Revenue (Annual)']
    churn_annual = churn_data[i]['Total Revenue (Annualized)']
    difference = churn_annual - no_churn_annual
    comparison_data.append({
        'Signup Level': s,
        'No Churn (Annual)': f"${no_churn_annual:,}",
        'With Churn (Annual)': f"${churn_annual:,}",
        'Difference': f"${difference:,}",
        'Impact': 'Churn reduces revenue' if difference < 0 else 'Error in calculation'
    })

df_comparison = pd.DataFrame(comparison_data)
print(df_comparison.to_string(index=False))

# Plotting both scenarios
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# No Churn Plot
ax1.bar(df_no_churn['Signups'].astype(str), df_no_churn['Suite Revenue (Monthly)'], label='Suite Revenue ($/mo)', alpha=0.7)
ax1.bar(df_no_churn['Signups'].astype(str), df_no_churn['Société Revenue (Monthly)'], bottom=df_no_churn['Suite Revenue (Monthly)'], label='Société Revenue ($/mo)', alpha=0.7)
ax1.plot(df_no_churn['Signups'].astype(str), df_no_churn['Total Revenue (Monthly)'], color='black', marker='o', label='Total Revenue ($/mo)')
ax1.set_xlabel('Total Signups (one-time)')
ax1.set_ylabel('Monthly Revenue ($)')
ax1.set_title('No Churn Scenario')
ax1.legend()

# With Churn Plot
ax2.bar(df_churn['Signups'].astype(str), df_churn['Suite Revenue (M12)'], label='Suite Revenue ($/mo)', alpha=0.7)
ax2.bar(df_churn['Signups'].astype(str), df_churn['Société Revenue (M12)'], bottom=df_churn['Suite Revenue (M12)'], label='Société Revenue ($/mo)', alpha=0.7)
ax2.plot(df_churn['Signups'].astype(str), df_churn['Total Revenue (M12)'], color='black', marker='o', label='Total Revenue ($/mo)')
ax2.set_xlabel('Total Signups (one-time)')
ax2.set_ylabel('Monthly Revenue at M12 ($)')
ax2.set_title('With Churn Scenario (5% monthly)')
ax2.legend()

plt.tight_layout()
plt.show()

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
