'use client'

import { EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import { Project } from '@/types/project'
import { User } from '@/types/auth'
import { Department } from '@/types/department'
import { Filter, X, Check } from 'lucide-react'

interface CalendarFiltersProps {
  selectedTypes: EventType[]
  onTypesChange: (types: EventType[]) => void
  selectedProjects: string[]
  onProjectsChange: (ids: string[]) => void
  selectedEmployees: string[]
  onEmployeesChange: (ids: string[]) => void
  selectedDepartments: string[]
  onDepartmentsChange: (ids: string[]) => void
  projects: Project[]
  employees: User[]
  departments: Department[]
  onReset: () => void
}

export function CalendarFilters({
  selectedTypes,
  onTypesChange,
  selectedProjects,
  onProjectsChange,
  selectedEmployees,
  onEmployeesChange,
  selectedDepartments,
  onDepartmentsChange,
  projects = [],
  employees = [],
  departments = [],
  onReset,
}: CalendarFiltersProps) {
  const toggleType = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const toggleProject = (id: string) => {
    if (selectedProjects.includes(id)) {
      onProjectsChange(selectedProjects.filter((p) => p !== id))
    } else {
      onProjectsChange([...selectedProjects, id])
    }
  }

  const toggleEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      onEmployeesChange(selectedEmployees.filter((e) => e !== id))
    } else {
      onEmployeesChange([...selectedEmployees, id])
    }
  }

  const toggleDepartment = (id: string) => {
    if (selectedDepartments.includes(id)) {
      onDepartmentsChange(selectedDepartments.filter((d) => d !== id))
    } else {
      onDepartmentsChange([...selectedDepartments, id])
    }
  }

  const totalActiveFilters =
    selectedTypes.length +
    selectedProjects.length +
    selectedEmployees.length +
    selectedDepartments.length

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter size={16} className="text-accent" />
          Filter Station
        </span>
        {totalActiveFilters > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline"
          >
            <X size={12} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Event Types */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Event Category
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((type) => {
            const config = EVENT_TYPE_CONFIG[type]
            const active = selectedTypes.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                  active
                    ? `${config.bg} ${config.border} ${config.color}`
                    : 'border-border/40 text-muted-foreground hover:bg-card/40'
                }`}
              >
                <span>{config.label}</span>
                {active && <Check size={12} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Projects
          </label>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {projects.map((proj) => {
              const active = selectedProjects.includes(proj.id)
              return (
                <button
                  key={proj.id}
                  onClick={() => toggleProject(proj.id)}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium border border-transparent transition-all ${
                    active
                      ? 'bg-primary/20 border-accent/20 text-accent'
                      : 'text-muted-foreground hover:bg-card/40'
                  }`}
                >
                  <span className="truncate">{proj.name}</span>
                  {active && <Check size={12} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Departments */}
      {departments.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Departments
          </label>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {departments.map((dep) => {
              const active = selectedDepartments.includes(dep.id)
              return (
                <button
                  key={dep.id}
                  onClick={() => toggleDepartment(dep.id)}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium border border-transparent transition-all ${
                    active
                      ? 'bg-primary/20 border-accent/20 text-accent'
                      : 'text-muted-foreground hover:bg-card/40'
                  }`}
                >
                  <span className="truncate">{dep.name}</span>
                  {active && <Check size={12} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Employees */}
      {employees.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Employees
          </label>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {employees.map((emp) => {
              const active = selectedEmployees.includes(emp.id)
              return (
                <button
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium border border-transparent transition-all ${
                    active
                      ? 'bg-primary/20 border-accent/20 text-accent'
                      : 'text-muted-foreground hover:bg-card/40'
                  }`}
                >
                  <span className="truncate">
                    {emp.first_name} {emp.last_name}
                  </span>
                  {active && <Check size={12} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
