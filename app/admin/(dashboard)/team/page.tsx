'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const teamMembers = [
  { id: 1, name: 'Jason Price', role: 'Admin', email: 'janick_parisian@yahoo.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: 2, name: 'Jukkoe Sisao', role: 'CEO', email: 'sibyl_kozey@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { id: 3, name: 'Harriet King', role: 'CTO', email: 'nadia_block@hotmail.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: 4, name: 'Lenora Benson', role: 'Lead', email: 'feil.wallace@kunde.us', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
  { id: 5, name: 'Olivia Reese', role: 'Strategist', email: 'kemmer.hattie@cremin.us', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: 6, name: 'Bertha Valdez', role: 'CEO', email: 'loraine.koelpin@tromp.io', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop&crop=face' },
  { id: 7, name: 'Harriett Payne', role: 'Digital Marketer', email: 'nannie_west@estrella.tv', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
  { id: 8, name: 'George Bryant', role: 'Social Media', email: 'delmer.kling@gmail.com', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face' },
  { id: 9, name: 'Lily French', role: 'Strategist', email: 'lucienne.herman@hotmail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { id: 10, name: 'Howard Adkins', role: 'CEO', email: 'wiegand.leonor@herman.us', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
  { id: 11, name: 'Earl Bowman', role: 'Digital Marketer', email: 'waino_altenwerth@nicolette.tv', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
  { id: 12, name: 'Patrick Padilla', role: 'Social Media', email: 'octavia.nienow@gleichner.net', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150&h=150&fit=crop&crop=face' },
]

export default function TeamPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <Button 
          onClick={() => router.push('/admin/team/add')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-4 gap-6">
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={100}
                  height={100}
                  className="rounded-full mx-auto"
                />
              </div>
              <h3 className="font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
