import React, { useState } from 'react'
import { Asset } from '../../types/asset'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { AssetOverview } from './AssetOverview'
import { AssetAssignment } from './AssetAssignment'
import { MaintenanceHistory } from './MaintenanceHistory'
import { AssetHistory } from './AssetHistory'
import { TransferDialog } from './TransferDialog'

interface Props {
  asset: Asset
}

export function AssetDetails({ asset }: Props) {
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 w-full flex overflow-x-auto justify-start">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">Overview</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-slate-800">Maintenance</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-800">History Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
              <AssetOverview asset={asset} />
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-6 focus-visible:outline-none">
              <MaintenanceHistory assetId={asset.id} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6 focus-visible:outline-none bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
              <AssetHistory assetId={asset.id} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-1 space-y-6">
          <AssetAssignment asset={asset} onTransfer={() => setIsTransferOpen(true)} />
        </div>
      </div>

      {isTransferOpen && (
        <TransferDialog
          asset={asset}
          open={isTransferOpen}
          onOpenChange={setIsTransferOpen}
        />
      )}
    </div>
  )
}
