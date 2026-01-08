// // Third-party Imports
// import styled from '@emotion/styled'
// import classnames from 'classnames'

// // Component Imports
// import HorizontalMenu from './HorizontalMenu'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import { useSettings } from '@core/hooks/useSettings'
// import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// // Util Imports
// import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// const StyledDiv = styled.div`
//   ${({ isContentCompact, isBreakpointReached }) =>
//     !isBreakpointReached &&
//     `
//     padding: ${themeConfig.layoutPadding}px;

//     ${
//       isContentCompact &&
//       `
//       margin-inline: auto;
//       max-inline-size: ${themeConfig.compactContentWidth}px;
//     `
//     }
//   `}
// `

// const Navigation = ({ dictionary }) => {
//   // Hooks
//   const { settings } = useSettings()
//   const { isBreakpointReached } = useHorizontalNav()

//   // Vars
//   const headerContentCompact = settings.navbarContentWidth === 'compact'

//   return (
//     <div
//       {...(!isBreakpointReached && {
//         className: classnames(horizontalLayoutClasses.navigation, 'relative flex border-bs')
//       })}
//     >
//       <StyledDiv
//         isContentCompact={headerContentCompact}
//         isBreakpointReached={isBreakpointReached}
//         {...(!isBreakpointReached && {
//           className: classnames(horizontalLayoutClasses.navigationContentWrapper, 'flex items-center is-full plb-2')
//         })}
//       >
//         <HorizontalMenu dictionary={dictionary} />
//       </StyledDiv>
//     </div>
//   )
// }

// export default Navigation

// Third-party Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

import styled from '@emotion/styled'
import classnames from 'classnames'

// Component Imports
import HorizontalMenu from './HorizontalMenu'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'
import UserDropdown from '../shared/UserDropdown'
import NotificationsFetcher from '../shared/NotificationsFetcher'

const StyledDiv = styled.div`
  ${({ isContentCompact, isBreakpointReached }) =>
    !isBreakpointReached &&
    `
    padding: ${themeConfig.layoutPadding}px;
    display: flex;
    align-items: center;
    flex-grow: 1;

    ${
      isContentCompact &&
      `
      margin-inline: auto;
      max-inline-size: ${themeConfig.compactContentWidth}px;
    `
    }
  `}
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-inline-end: 24px; // Adjust this value to control the gap between logo and menu
  flex-shrink: 0;
`

const Navigation = ({ dictionary }) => {
  // Hooks
  const { settings } = useSettings()
  const { isBreakpointReached } = useHorizontalNav()
  const { lang: locale } = useParams()

  // Vars
  const headerContentCompact = settings.navbarContentWidth === 'compact'

  return (
    <div
      {...(!isBreakpointReached && {
        className: classnames(horizontalLayoutClasses.navigation, 'relative flex border-bs')
      })}
    >
      {!isBreakpointReached && (
        <LogoWrapper>
          <Link href={getLocalizedUrl('/', locale)} className='flex items-center'>
            <img
              src='/images/cards/login.png'
              style={{ height: '42px', width: 'auto', marginLeft: '20px' }}
              alt='Logo'
            />
          </Link>
        </LogoWrapper>
      )}
      <StyledDiv
        isContentCompact={headerContentCompact}
        isBreakpointReached={isBreakpointReached}
        {...(!isBreakpointReached && {
          className: classnames(horizontalLayoutClasses.navigationContentWrapper, 'flex items-center plb-2')
        })}
      >
        <HorizontalMenu dictionary={dictionary} />
        {!isBreakpointReached && (
          <div className='flex items-center gap-2'>
            <NotificationsFetcher />
            <UserDropdown />
          </div>
        )}
      </StyledDiv>
    </div>
  )
}

export default Navigation
