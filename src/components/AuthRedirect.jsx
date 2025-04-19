'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }) => {
  const pathname = usePathname()

  // ℹ️ Bring me `lang`
  const redirectUrl = `/${lang}/vendor?redirectTo=${pathname}`
  const login = `/${lang}/vendor`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
