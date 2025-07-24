// Navigation Data Index - Site structure and navigation information

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  description?: string
  children?: NavigationItem[]
  badge?: string
  external?: boolean
  requiresAuth?: boolean
  adminOnly?: boolean
}

// Main Navigation Structure
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'Home',
    description: 'HoopMetrix homepage'
  },
  {
    id: 'teams',
    label: 'Teams',
    href: '/teams',
    icon: 'Users',
    description: 'Browse NBA and WNBA teams',
    children: [
      { id: 'nba-teams', label: 'NBA Teams', href: '/teams?league=NBA' },
      { id: 'wnba-teams', label: 'WNBA Teams', href: '/teams?league=WNBA' }
    ]
  },
  {
    id: 'players',
    label: 'Players',
    href: '/players',
    icon: 'User',
    description: 'Explore player profiles and stats',
    children: [
      { id: 'nba-players', label: 'NBA Players', href: '/players?league=NBA' },
      { id: 'wnba-players', label: 'WNBA Players', href: '/players?league=WNBA' },
      { id: 'top-scorers', label: 'Top Scorers', href: '/players/leaders/scoring' },
      { id: 'rookies', label: 'Rookies', href: '/players/rookies' }
    ]
  },
  {
    id: 'shop',
    label: 'Shop',
    href: '/shop',
    icon: 'ShoppingBag',
    description: 'Basketball merchandise and collectibles',
    children: [
      { id: 'jerseys', label: 'Jerseys', href: '/shop/jerseys' },
      { id: 'apparel', label: 'Apparel', href: '/shop/apparel' },
      { id: 'accessories', label: 'Accessories', href: '/shop/accessories' },
      { id: 'collectibles', label: 'Collectibles', href: '/shop/collectibles' },
      { id: 'equipment', label: 'Equipment', href: '/shop/equipment' },
      { id: 'sale', label: 'Sale', href: '/shop/sale', badge: 'Hot' }
    ]
  },
  {
    id: 'stats',
    label: 'Stats',
    href: '/stats',
    icon: 'BarChart3',
    description: 'Basketball statistics and analytics',
    children: [
      { id: 'team-stats', label: 'Team Stats', href: '/stats/teams' },
      { id: 'player-stats', label: 'Player Stats', href: '/stats/players' },
      { id: 'league-leaders', label: 'League Leaders', href: '/stats/leaders' },
      { id: 'advanced-stats', label: 'Advanced Analytics', href: '/stats/advanced' }
    ]
  }
]

// Footer Navigation
export const FOOTER_NAVIGATION: NavigationItem[] = [
  {
    id: 'company',
    label: 'Company',
    href: '#',
    children: [
      { id: 'about', label: 'About Us', href: '/about' },
      { id: 'careers', label: 'Careers', href: '/careers' },
      { id: 'press', label: 'Press', href: '/press' },
      { id: 'contact', label: 'Contact', href: '/contact' }
    ]
  },
  {
    id: 'support',
    label: 'Support',
    href: '#',
    children: [
      { id: 'help-center', label: 'Help Center', href: '/help' },
      { id: 'shipping', label: 'Shipping Info', href: '/shipping' },
      { id: 'returns', label: 'Returns & Exchanges', href: '/returns' },
      { id: 'size-guide', label: 'Size Guide', href: '/size-guide' }
    ]
  },
  {
    id: 'legal',
    label: 'Legal',
    href: '#',
    children: [
      { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { id: 'terms', label: 'Terms of Service', href: '/terms' },
      { id: 'cookies', label: 'Cookie Policy', href: '/cookies' },
      { id: 'disclaimer', label: 'Disclaimer', href: '/disclaimer' }
    ]
  },
  {
    id: 'social',
    label: 'Follow Us',
    href: '#',
    children: [
      { id: 'twitter', label: 'Twitter', href: 'https://twitter.com/hoopmetrix', external: true },
      { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/hoopmetrix', external: true },
      { id: 'facebook', label: 'Facebook', href: 'https://facebook.com/hoopmetrix', external: true },
      { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/hoopmetrix', external: true }
    ]
  }
]

// User Account Navigation (requires auth)
export const USER_NAVIGATION: NavigationItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: 'User',
    requiresAuth: true
  },
  {
    id: 'orders',
    label: 'My Orders',
    href: '/orders',
    icon: 'Package',
    requiresAuth: true
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    href: '/wishlist',
    icon: 'Heart',
    requiresAuth: true
  },
  {
    id: 'subscription',
    label: 'Membership',
    href: '/subscription',
    icon: 'Crown',
    requiresAuth: true
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    requiresAuth: true
  }
]

// Admin Navigation (admin only)
export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    adminOnly: true
  },
  {
    id: 'admin-teams',
    label: 'Manage Teams',
    href: '/admin/teams',
    icon: 'Users',
    adminOnly: true
  },
  {
    id: 'admin-players',
    label: 'Manage Players',
    href: '/admin/players',
    icon: 'User',
    adminOnly: true
  },
  {
    id: 'admin-products',
    label: 'Manage Products',
    href: '/admin/products',
    icon: 'Package',
    adminOnly: true
  },
  {
    id: 'admin-orders',
    label: 'Orders',
    href: '/admin/orders',
    icon: 'ShoppingCart',
    adminOnly: true
  },
  {
    id: 'admin-users',
    label: 'Users',
    href: '/admin/users',
    icon: 'UserCheck',
    adminOnly: true
  },
  {
    id: 'admin-analytics',
    label: 'Analytics',
    href: '/admin/analytics',
    icon: 'TrendingUp',
    adminOnly: true
  }
]

// Breadcrumb patterns for different pages
export const BREADCRUMB_PATTERNS: Record<string, NavigationItem[]> = {
  '/teams': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'teams', label: 'Teams', href: '/teams' }
  ],
  '/teams/[id]': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'teams', label: 'Teams', href: '/teams' },
    { id: 'team', label: '{teamName}', href: '/teams/{teamId}' }
  ],
  '/players': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'players', label: 'Players', href: '/players' }
  ],
  '/players/[id]': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'players', label: 'Players', href: '/players' },
    { id: 'player', label: '{playerName}', href: '/players/{playerId}' }
  ],
  '/shop': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'shop', label: 'Shop', href: '/shop' }
  ],
  '/shop/[category]': [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'shop', label: 'Shop', href: '/shop' },
    { id: 'category', label: '{categoryName}', href: '/shop/{category}' }
  ]
}

// Quick Actions / Search Suggestions
export const QUICK_ACTIONS: NavigationItem[] = [
  { id: 'search-lebron', label: 'LeBron James', href: '/players/lebron-james' },
  { id: 'search-curry', label: 'Stephen Curry', href: '/players/stephen-curry' },
  { id: 'search-lakers', label: 'Los Angeles Lakers', href: '/teams/lakers' },
  { id: 'search-warriors', label: 'Golden State Warriors', href: '/teams/warriors' },
  { id: 'search-jerseys', label: 'NBA Jerseys', href: '/shop/jerseys' },
  { id: 'search-wnba', label: 'WNBA Teams', href: '/teams?league=WNBA' }
]

// Utility functions for navigation
export const getNavigationByPath = (path: string): NavigationItem | null => {
  const findInNav = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.href === path) return item
      if (item.children) {
        const found = findInNav(item.children)
        if (found) return found
      }
    }
    return null
  }
  
  return findInNav([...MAIN_NAVIGATION, ...USER_NAVIGATION, ...ADMIN_NAVIGATION])
}

export const getBreadcrumbs = (path: string, params?: Record<string, string>): NavigationItem[] => {
  const pattern = BREADCRUMB_PATTERNS[path]
  if (!pattern) return []
  
  return pattern.map(item => ({
    ...item,
    label: params ? item.label.replace(/{(\w+)}/g, (_, key) => params[key] || item.label) : item.label,
    href: params ? item.href.replace(/{(\w+)}/g, (_, key) => params[key] || item.href) : item.href
  }))
}

export const getMainNavigationItems = (): NavigationItem[] => MAIN_NAVIGATION

export const getUserNavigationItems = (): NavigationItem[] => USER_NAVIGATION

export const getAdminNavigationItems = (): NavigationItem[] => ADMIN_NAVIGATION