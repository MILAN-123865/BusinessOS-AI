import { User } from './auth'
import { Department } from './department'
import { Role } from './role'

export interface Employee extends User {
  job_title?: string
  employee_code?: string
  employment_type?: string
  joining_date?: string
  last_login?: string
  department?: Department
  user_roles?: { role: Role }[]
}
