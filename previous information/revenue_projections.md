# Bureau.io Revenue Projections

## SaaS Model Overview
- **Suite Plan:** $15/bureau/month (1.5% conversion rate)
- **Société Plan:** $10/user/month, minimum 5 users per bureau (0.5% conversion rate)
- **Total Conversion Rate:** 2% (1.5% Suite + 0.5% Société)

## Revenue Projections: No Churn Scenario

**Assumption:** One-time signup pool with no customer loss over time.

| Signups | Suite Cust. | Société Cust. | Suite Rev. (Monthly) | Société Rev. (Monthly) | Total Rev. (Monthly) | **Total Rev. (Annual)** |
|---------|-------------|---------------|----------------------|------------------------|----------------------|-------------------------|
| 10      | 0           | 0             | $0                   | $0                     | $0                   | **$0**                 |
| 100     | 1           | 0             | $15                  | $0                     | $15                  | **$180**               |
| 1,000   | 15          | 5             | $225                 | $250                   | $475                 | **$5,700**             |
| 10,000  | 150         | 50            | $2,250               | $2,500                 | $4,750               | **$57,000**            |
| 100,000 | 1,500       | 500           | $22,500              | $25,000                | $47,500              | **$570,000**           |
| 1,000,000 | 15,000    | 5,000         | $225,000             | $250,000               | $475,000             | **$5,700,000**         |

## Revenue Projections: With Churn Scenario

**Assumptions:** 
- Start with the same customer numbers as Scenario 1
- Apply 5% monthly churn over 12 months
- Revenue and customer count decrease over time

| Signups | Suite Cust. (M12) | Société Cust. (M12) | Suite Rev. (M12) | Société Rev. (M12) | Total Rev. (M12) | **Total Rev. (Annualized)** |
|---------|-------------------|---------------------|------------------|--------------------|------------------|-----------------------------|
| 10      | 0                | 0                  | $0               | $0                 | $0               | **$0**                     |
| 100     | 0                | 0                  | $0               | $0                 | $0               | **$0**                     |
| 1,000   | 8                | 3                  | $120             | $150               | $270             | **$3,240**                 |
| 10,000  | 81               | 27                 | $1,215           | $1,350             | $2,565           | **$30,780**                |
| 100,000 | 814              | 271                | $12,210          | $13,550            | $25,760          | **$309,120**               |
| 1,000,000 | 8,144          | 2,714              | $122,160         | $135,700           | $257,860         | **$3,094,320**             |

## Revenue Comparison: No Churn vs With Churn

| Signup Level | No Churn (Annual) | With Churn (Annual) | Difference | Impact |
|--------------|-------------------|---------------------|------------|---------|
| 10           | $0                | $0                  | $0         | No customers to churn |
| 100          | $180              | $0                  | -$180      | All customers churned out |
| 1,000        | $5,700            | $3,240              | -$2,460    | Churn reduces revenue |
| 10,000       | $57,000           | $30,780             | -$26,220   | Churn reduces revenue |
| 100,000      | $570,000          | $309,120            | -$260,880  | Churn reduces revenue |
| 1,000,000    | $5,700,000        | $3,094,320          | -$2,605,680| Churn reduces revenue |

## Key Insights & Analysis

- **Churn has a significant negative impact on revenue.** After 12 months, only about 54% of the original customers remain (since (1-0.05)^12 ≈ 0.54).
- **Scenario 2 now correctly shows lower revenue** due to customer loss, as expected in a real SaaS business.
- **Retention is critical:** Reducing churn will dramatically increase your long-term revenue.
- **Both scenarios use the same conversion rates.** The only difference is the effect of churn over time.

## Next Steps
- Focus on retention strategies to minimize churn.
- Use these projections to set realistic growth and revenue targets.
- Consider modeling additional scenarios (e.g., ongoing acquisition, different churn rates, or upsell strategies) for deeper insight. 

## Break-Even & Milestone Analysis (With Churn)

**Assumptions:**
- Monthly cost: $2,150 (hosting, salary, etc.)
- Revenue per signup after churn: $0.2565/month
- Churn: 5% monthly, 12 months

### Break-Even Point
- **Break-even signups needed:** $2,150 / $0.2565 ≈ **8,400 signups**

### Milestone Table

| Signups | Suite Cust. (M12) | Société Cust. (M12) | Monthly Revenue (M12) | Milestone                |
|---------|-------------------|---------------------|-----------------------|--------------------------|
| 1,000   | 8                 | 3                   | $270                  | First paying users       |
| 5,000   | 41                | 14                  | $1,350                | Cover basic infra/tools  |
| 8,400   | 69                | 24                  | $2,180                | **Break-even**           |
| 10,000  | 81                | 27                  | $2,565                | Small salary + growth    |
| 25,000  | 203               | 68                  | $6,413                | Hire part-time help      |
| 50,000  | 407               | 135                 | $12,825               | Full-time team           |
| 100,000 | 814               | 271                 | $25,760               | Scale, invest in growth  |

### Analysis
- You need ~8,400 signups to break even at $2,150/month cost, after churn.
- $10,000/month requires ~39,000 signups; $25,000/month requires ~97,500 signups.
- Early revenue is modest; focus on conversion, ARPU, and retention to reduce signup requirements.
- Consider targeting higher-value customers or adding premium features to improve margins. 