import React from 'react'
import { QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'

interface Props {
  assetCode: string
}

export function AssetQRCode({ assetCode }: Props) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 flex flex-col items-center justify-center p-6 text-center">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-slate-200">Asset QR Code</CardTitle>
        <CardDescription className="text-slate-400">Scan to view details</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="bg-white p-4 rounded-md inline-block">
          {/* Placeholder for actual QR code */}
          <QrCode className="w-32 h-32 text-slate-900" />
        </div>
        <p className="font-mono text-sm text-slate-300">{assetCode}</p>
        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
          Download QR
        </Button>
      </CardContent>
    </Card>
  )
}
