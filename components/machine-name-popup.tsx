"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MachineNamePopupProps {
  isOpen: boolean
  onSave: (machineName: string) => void
  onCancel: () => void
}

export default function MachineNamePopup({ isOpen, onSave, onCancel }: MachineNamePopupProps) {
  const [machineName, setMachineName] = useState("")
  const [error, setError] = useState("")

  const handleSave = () => {
    if (!machineName.trim()) {
      setError("Machine name is required")
      return
    }
    onSave(machineName.trim())
    setMachineName("")
    setError("")
  }

  const handleCancel = () => {
    setMachineName("")
    setError("")
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Machine Name</DialogTitle>
          <DialogDescription>
            Please provide a name for your machine to continue with the calculation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="machine-name">Machine Name *</Label>
            <Input
              id="machine-name"
              value={machineName}
              onChange={(e) => {
                setMachineName(e.target.value)
                if (error) setError("")
              }}
              placeholder="e.g., CNC Lathe Machine"
              className={error ? "border-red-400" : ""}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
