// Next Imports
import dynamic from 'next/dynamic'


// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getProfileData } from '@/app/server/actions'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))


// Vars
const tabContentList = data => ({
  profile: <ProfileTab data={data?.users.profile} />,
})

const ProfilePage = async () => {
  // Vars
  const data = await getProfileData()

  
return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage


