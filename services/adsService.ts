import { Campaign, CampaignStatus, RiskLevel } from '../types';

// --- CONFIGURATION ---
// Set to true only if you have configured .env locally with real Google Ads credentials
// KEEP THIS FALSE FOR THE LIVE PORTFOLIO DEMO
export const USE_LIVE_API = false; 

export const calculateProfitAwareMetrics = (spend: number, revenue: number, cogsRate: number): { margin: number; roas: number } => {
  const roas = spend > 0 ? revenue / spend : 0;
  const netProfit = revenue - (revenue * cogsRate) - spend;
  return { margin: netProfit, roas };
};

export const getMockCampaigns = (cogsRate: number): Campaign[] => {
  const rawData = [
    {
      id: 'c1',
      name: 'Competitor_Search',
      spend: 1250,
      revenue: 2800,
      baseStatus: CampaignStatus.ACTIVE
    },
    {
      id: 'c2',
      name: 'Brand_Keywords_Alpha',
      spend: 450,
      revenue: 4200,
      baseStatus: CampaignStatus.ACTIVE
    },
    {
      id: 'c3',
      name: 'PMax_Global_Scale',
      spend: 3200,
      revenue: 8500,
      baseStatus: CampaignStatus.ACTIVE
    },
    {
      id: 'c4',
      name: 'Display_Retargeting',
      spend: 800,
      revenue: 1600,
      baseStatus: CampaignStatus.ACTIVE
    }
  ];

  return rawData.map(c => {
    const { margin, roas } = calculateProfitAwareMetrics(c.spend, c.revenue, cogsRate);
    
    let recommendation = "Maintain spend levels.";
    let riskLevel = RiskLevel.LOW;

    if (margin < 0) {
      recommendation = "CRITICAL: Negative Margin detected. High ROAS is deceptive. Immediate Pause Recommended.";
      riskLevel = RiskLevel.HIGH;
    } else if (roas > 4) {
      recommendation = "High efficiency. Consider scaling budget by 20%.";
      riskLevel = RiskLevel.LOW;
    } else if (margin < 100) {
      recommendation = "Thin margins. Monitor conversion costs closely.";
      riskLevel = RiskLevel.MEDIUM;
    }

    return {
      ...c,
      status: c.baseStatus,
      margin,
      roas,
      recommendation,
      riskLevel
    };
  });
};
