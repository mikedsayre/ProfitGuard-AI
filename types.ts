
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum LogType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  revenue: number;
  roas: number;
  margin: number;
  recommendation: string;
  riskLevel: RiskLevel;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogType;
}
