import { SurplusCase, OwnerContact, CrmLead, County, User } from '@prisma/client'

export type SurplusCaseWithContacts = SurplusCase & {
  ownerContacts: OwnerContact[]
}

export type CrmLeadWithCase = CrmLead & {
  case: SurplusCase | null
}

export interface SearchParams {
  [key: string]: string | undefined
  name?: string
  state?: string
  county?: string
  apn?: string
  minAmount?: string
  maxAmount?: string
  status?: string
  page?: string
  limit?: string
  sort?: string
  order?: string
}

export interface DashboardStats {
  totalCases: number
  totalSurplus: number
  activeCases: number
  recoveredCases: number
  monthlyRevenue: number
  activeLeads: number
  conversionRate: number
  avgSurplusAmount: number
}

export interface RevenueData {
  month: string
  saas: number
  leads: number
  recovery: number
  total: number
}

export interface CountyWithStats extends County {
  surplusCaseCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
