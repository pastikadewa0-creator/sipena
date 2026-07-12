'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { 
  Stethoscope, 
  FileText, 
  Plane, 
  UserCog, 
  Wallet, 
  Clock, 
  Users, 
  ClipboardCheck, 
  LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function EmployeeDashboardPage() {
  const { data: session, isLoading } = useSWR('/api/users/me', (url: string) => fetch(url).then(r => r.json()))
  
  const firstName = session?.name ? session.name.split(' ')[0] : 'Karyawan'

  useEffect(() => {
    (window as any).showComingSoonToast = () => {
      toast.info('Fitur Segera Hadir!')
    }
  }, [])

  return (
    <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 min-h-screen bg-muted/30">
      {/* Teal Header Section */}
      <div className="bg-primary px-6 pb-24 pt-8 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.2,-55.4,77.7,-40.7C86.2,-26,93,-10.5,91.8,4.5C90.6,19.5,81.4,34,71.2,46.7C61,59.4,49.8,70.3,35.9,76.5C22,82.7,5.4,84.2,-10.5,81.4C-26.4,78.6,-41.6,71.5,-53.6,60.6C-65.6,49.7,-74.4,35,-79.6,19.3C-84.8,3.6,-86.4,-13.2,-81,-27.9C-75.6,-42.6,-63.2,-55.2,-49.1,-62.4C-35,-69.6,-19.2,-71.4,-2.2,-68.8C14.8,-66.2,29.6,-59.2,45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {isLoading ? '...' : firstName}!
          </h2>
          <p className="mt-1 text-primary-foreground/90 font-medium">
            Jangan lupa bahagia
          </p>
        </div>
      </div>

      {/* Main Content Area overlapping header */}
      <div className="-mt-12 relative z-20">
        
        {/* Quick Actions Card */}
        <div className="px-4 md:px-6 mb-8">
          <Card className="shadow-xl shadow-primary/10 border-none rounded-2xl overflow-hidden">
            <div className="p-4 bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Saya ingin membuat pengajuan</h3>
              <div className="grid grid-cols-4 gap-2">
                <QuickActionItem href="/employee/izin?type=sakit" icon={Stethoscope} label="Sakit" color="text-red-500" bgColor="bg-red-50" />
                <QuickActionItem href="/employee/izin?type=izin" icon={FileText} label="Izin" color="text-blue-500" bgColor="bg-blue-50" />
                <QuickActionItem href="/employee/izin?type=cuti" icon={Plane} label="Cuti" color="text-emerald-500" bgColor="bg-emerald-50" />
                <QuickActionItem href="#" icon={UserCog} label="Ubah data" color="text-amber-500" bgColor="bg-amber-50" isComingSoon />
              </div>
            </div>
          </Card>
        </div>

        {/* White Rounded Bottom Section */}
        <div className="bg-card rounded-t-[2.5rem] min-h-[60vh] px-6 pt-8 pb-32 shadow-sm border-t">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6">Kelola data pribadimu</h3>
          
          <div className="grid grid-cols-4 gap-y-8 gap-x-2">
            <GridActionItem href="#" icon={Wallet} label="Slip Gaji" color="text-teal-600" bgColor="bg-teal-50" isComingSoon />
            <GridActionItem href="/employee/absensi" icon={Clock} label="Kehadiran" color="text-indigo-600" bgColor="bg-indigo-50" />
            <GridActionItem href="#" icon={Users} label="Tim Saya" color="text-purple-600" bgColor="bg-purple-50" isComingSoon />
            <GridActionItem href="#" icon={ClipboardCheck} label="Persetujuan" color="text-pink-600" bgColor="bg-pink-50" isComingSoon />
            
            <GridActionItem href="/employee/izin?type=cuti" icon={Plane} label="Cuti" color="text-emerald-500" bgColor="bg-emerald-50" />
            <GridActionItem href="/employee/izin?type=sakit" icon={Stethoscope} label="Sakit" color="text-red-500" bgColor="bg-red-50" />
            <GridActionItem href="/employee/izin?type=izin" icon={FileText} label="Izin" color="text-blue-500" bgColor="bg-blue-50" />
            <GridActionItem href="#" icon={LayoutGrid} label="Lainnya" color="text-gray-600" bgColor="bg-gray-100" isComingSoon />
          </div>
        </div>

      </div>
    </div>
  )
}

function QuickActionItem({ 
  href, 
  icon: Icon, 
  label, 
  color, 
  bgColor,
  isComingSoon
}: { 
  href: string, 
  icon: any, 
  label: string, 
  color: string, 
  bgColor: string,
  isComingSoon?: boolean
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
      <div className={`h-12 w-12 rounded-2xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm`}>
        <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.5} />
      </div>
      <span className="text-[11px] font-medium text-center text-foreground">{label}</span>
    </div>
  )

  if (isComingSoon) {
    return (
      <div onClick={(e) => { e.preventDefault(); typeof window !== 'undefined' && (window as any).showComingSoonToast && (window as any).showComingSoonToast() }}>
        {content}
      </div>
    )
  }

  return <Link href={href}>{content}</Link>
}

function GridActionItem({ 
  href, 
  icon: Icon, 
  label, 
  color, 
  bgColor,
  isComingSoon
}: { 
  href: string, 
  icon: any, 
  label: string, 
  color: string, 
  bgColor: string,
  isComingSoon?: boolean
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
      <div className={`h-14 w-14 rounded-2xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 border shadow-sm`}>
        <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight min-h-[2rem] flex items-center">{label}</span>
    </div>
  )

  if (isComingSoon) {
    return (
      <div onClick={(e) => { e.preventDefault(); typeof window !== 'undefined' && (window as any).showComingSoonToast && (window as any).showComingSoonToast() }}>
        {content}
      </div>
    )
  }

  return <Link href={href}>{content}</Link>
}
