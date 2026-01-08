// // Next Imports
// import Link from 'next/link'
// import { useParams } from 'next/navigation'

// // Third-party Imports
// import classnames from 'classnames'

// // Component Imports
// import NavToggle from './NavToggle'
// import Logo from '@components/layout/shared/Logo'
// import NavSearch from '@components/layout/shared/search'
// import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
// import ModeDropdown from '@components/layout/shared/ModeDropdown'
// import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
// import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
// import UserDropdown from '@components/layout/shared/UserDropdown'

// // Hook Imports
// import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// // Util Imports
// import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
// import { getLocalizedUrl } from '@/utils/i18n'

// // Vars

// const NavbarContent = () => {
//   // Hooks
//   const { isBreakpointReached } = useHorizontalNav()
//   const { lang: locale } = useParams()

//   return (
//     <div
//       className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
//     >
//       <div className='flex items-center gap-4'>
//         <NavToggle />
//         {/* Hide Logo on Smaller screens */}
//         {!isBreakpointReached && (
//           <Link href={getLocalizedUrl('/', locale)}>
//             <Logo />
//           </Link>
//         )}
//       </div>

//       <div className='flex items-center'>
//         {/* <NavSearch />
//         <LanguageDropdown />
//         <ModeDropdown />
//         <ShortcutsDropdown shortcuts={shortcuts} /> */}
//         {/* <NotificationsDropdown notifications={notifications} /> */}
//         <UserDropdown />
//         {/* Language Dropdown, Notification Dropdown, quick access menu dropdown, user dropdown will be placed here */}
//       </div>
//     </div>
//   )
// }

// export default NavbarContent

'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsFetcher from '@components/layout/shared/NotificationsFetcher'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  const { lang: locale } = useParams()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && (
          <Link href={getLocalizedUrl('/', locale)} className='flex items-center'>
            <img src='/images/cards/login.png' style={{ width: 'auto', height: 'auto', maxWidth: '9%' }} alt='Logo' />
          </Link>
        )}
      </div>

      <div className='flex items-center'>
        {/* <NavSearch />
        <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <NotificationsFetcher />
        <UserDropdown />
        {/* Language Dropdown, Notification Dropdown, quick access menu dropdown, user dropdown will be placed here */}
      </div>
    </div>
  )
}

export default NavbarContent
