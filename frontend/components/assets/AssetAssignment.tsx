import React from 'react'
import { Asset } from '../../types/asset'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { User, Building, Briefcase, RefreshCw } from 'lucide-react'

interface Props {
  asset: Asset
  onTransfer: () => void
}

export function AssetAssignment({ asset, onTransfer }: Props) {
  const isAssigned = asset.assigned_employee_id || asset.assigned_department_id || asset.assigned_project_id

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-slate-200">Current Assignment</CardTitle>
          <CardDescription className="text-slate-400">Who currently has this asset</CardDescription>
        </div>
        <Button onClick={onTransfer} variant="outline" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200">
          <RefreshCw className="h-4 w-4 mr-2" />
          {isAssigned ? 'Transfer Asset' : 'Assign Asset'}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {!isAssigned ? (
          <div className="text-center py-6 text-slate-400 bg-slate-900 rounded-md border border-dashed border-slate-700">
            This asset is currently not assigned to anyone.
          </div>
        ) : (
          <div className="grid gap-4">
            {asset.assigned_employee && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Assigned Employee</p>
                  <p className="text-sm text-slate-400">
                    {asset.assigned_employee.first_name} {asset.assigned_employee.last_name}
                  </p>
                </div>
              </div>
            )}
            
            {asset.assigned_department && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Assigned Department</p>
                  <p className="text-sm text-slate-400">
                    {asset.assigned_department.name}
                  </p>
                </div>
              </div>
            )}
            
            {asset.assigned_project && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Assigned Project</p>
                  <p className="text-sm text-slate-400">
                    {asset.assigned_project.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
