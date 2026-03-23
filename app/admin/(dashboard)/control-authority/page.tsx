'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const admins = [
  { id: 1, name: 'Jason Price', email: 'janick_parisian@yahoo.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: 2, name: 'Jukkoe Sisao', email: 'sibyl_kozey@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { id: 3, name: 'Harriet King', email: 'nadia_block@hotmail.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: 4, name: 'Lenora Benson', email: 'feil.wallace@kunde.us', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
  { id: 5, name: 'Olivia Reese', email: 'kemmer.hattie@cremin.us', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: 6, name: 'Bertha Valdez', email: 'loraine.koelpin@tromp.io', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop&crop=face' },
  { id: 7, name: 'Harriett Payne', email: 'nannie_west@estrella.tv', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
  { id: 8, name: 'George Bryant', email: 'delmer.kling@gmail.com', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face' },
  { id: 9, name: 'Lily French', email: 'lucienne.herman@hotmail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { id: 10, name: 'Howard Adkins', email: 'wiegand.leonor@herman.us', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
  { id: 11, name: 'Earl Bowman', email: 'waino_altenwerth@nicolette.tv', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
  { id: 12, name: 'Patrick Padilla', email: 'octavia.nienow@gleichner.net', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150&h=150&fit=crop&crop=face' },
]

export default function ControlAuthorityPage() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState<number | null>(null)

  const handleRemove = (id: number) => {
    setShowConfirm(null)
    // Handle removal
    alert('Admin removed successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Control Authority</h1>
        <Button 
          onClick={() => router.push('/admin/control-authority/add')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Admin
        </Button>
      </div>

      {/* Admin Grid */}
      <div className="grid grid-cols-4 gap-6">
        {admins.map((admin) => (
          <div 
            key={admin.id} 
            className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Image
                  src={admin.avatar}
                  alt={admin.name}
                  width={100}
                  height={100}
                  className="rounded-full mx-auto"
                />
              </div>
              <h3 className="font-semibold mb-1">{admin.name}</h3>
              <p className="text-xs text-muted-foreground truncate mb-4">{admin.email}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setShowConfirm(admin.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Remove Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Remove Admin?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this admin? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleRemove(showConfirm)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
