import { UserProfile } from '@/components/core/UserProfile'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import React from 'react'

const MainPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className='min-h-screen flex items-center justify-center bg-green-300'>
      <div
        className="backdrop-blur-md bg-white/30 rounded-xl shadow-xl p-8 flex flex-col items-center"
      >
        <UserProfile />
      </div>
    </div >
  )
}

export default MainPage
