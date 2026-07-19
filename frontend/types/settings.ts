export interface SystemSettings {
  general: {
    companyName: string
    supportEmail: string
    timezone: string
    dateFormat: string
    currency: string
  }
  security: {
    mfaRequired: boolean
    passwordExpiryDays: number
    sessionTimeoutMinutes: number
    allowedIpRanges: string[]
  }
  notifications: {
    emailEnabled: boolean
    slackIntegration: boolean
    webhookUrl?: string
  }
  features: {
    aiEnabled: boolean
    workflowsEnabled: boolean
    clientPortalEnabled: boolean
  }
}
