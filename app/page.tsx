'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerImage } from "@/components/ui/player-image";
import { Star, Trophy, Users, ShoppingBag, Crown, ArrowRight, Plus } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useCart } from "@/lib/contexts/cart-context";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

// Player data interface
interface Player {
  id: string
  apiId: string
  name: string
  position: string
  team: string
  league: string
  stats: {
    points?: number
    rebounds?: number
    assists?: number
  }
}

// Featured products interface
interface FeaturedProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
}

// Team color mappings
const getTeamColors = (team: string) => {
  const teamColors: { [key: string]: string } = {
    'Lakers': 'from-purple-600 to-yellow-500',
    'Warriors': 'from-blue-600 to-yellow-400',
    'Aces': 'from-red-600 to-black',
    'Liberty': 'from-teal-500 to-green-600',
    'Celtics': 'from-green-600 to-green-800',
    'Heat': 'from-red-600 to-black',
    'Nuggets': 'from-yellow-500 to-blue-600',
    'Suns': 'from-orange-500 to-purple-600'
  }
  return teamColors[team] || 'from-kentucky-blue-600 to-kentucky-blue-800'
}

export default function Home() {
  const [topPlayers, setTopPlayers] = useState<Player[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  // Fetch top players from API
  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        // This would fetch from your API - using mock data for now
        const mockPlayers: Player[] = [
          { id: "lebron-james", apiId: "2544", name: "LeBron James", position: "SF", team: "Lakers", league: "NBA", stats: { points: 25.3, rebounds: 7.3, assists: 7.4 } },
          { id: "stephen-curry", apiId: "201939", name: "Stephen Curry", position: "PG", team: "Warriors", league: "NBA", stats: { points: 26.4, rebounds: 4.5, assists: 5.1 } },
          { id: "aja-wilson", apiId: "1629659", name: "A'ja Wilson", position: "F", team: "Aces", league: "WNBA", stats: { points: 22.8, rebounds: 9.4, assists: 2.3 } },
          { id: "breanna-stewart", apiId: "1628932", name: "Breanna Stewart", position: "F", team: "Liberty", league: "WNBA", stats: { points: 23.0, rebounds: 9.3, assists: 3.8 } }
        ]
        setTopPlayers(mockPlayers)
        
        // Use actual featured products from the products service
        const mockProducts: FeaturedProduct[] = [
          { id: "1", name: "LeBron James Los Angeles Lakers Jersey", price: 119.99, image: "/products/lebron-jersey-1.jpg", category: "Jerseys" },
          { id: "2", name: "Stephen Curry Golden State Warriors Jersey", price: 119.99, image: "/products/curry-jersey-1.jpg", category: "Jerseys" },
          { id: "3", name: "WNBA All-Star Basketball", price: 89.99, image: "/products/wnba-basketball-1.jpg", category: "Equipment" },
          { id: "4", name: "Warriors Championship Hat", price: 34.99, image: "/products/warriors-hat-1.jpg", category: "Accessories" }
        ]
        setFeaturedProducts(mockProducts)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopPlayers()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Custom CSS for scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0%, 20% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
      `}</style>
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Player Images */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-2 opacity-35">
          <div className="relative h-full">
            <Image
              src="/Damien Daniels Hoop Metrix.jpg"
              alt="Damien Daniels"
              fill
              className="object-cover grayscale"
            />
          </div>
          <div className="relative h-full">
            <Image
              src="/Justice Brantley Hoop Metrix.jpg"
              alt="Justice Brantley"
              fill
              className="object-cover grayscale"
            />
          </div>
          <div className="relative h-full">
            <Image
              src="/RJ McGee Hoop Metrix.jpg"
              alt="RJ McGee"
              fill
              className="object-cover grayscale"
            />
          </div>
          <div className="relative h-full">
            <Image
              src="/Seth Compas Hoop Metrix.jpg"
              alt="Seth Compas"
              fill
              className="object-cover grayscale"
            />
          </div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <Image
              src="/HM_logo_black.png"
              alt="HoopMetrix Logo"
              width={120}
              height={120}
              className="mx-auto mb-6 rounded-full bg-white/10 p-4"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            The Ultimate
            <span className="block text-kentucky-blue-400">Basketball Hub</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover comprehensive player profiles, team stats, exclusive merchandise, and premium basketball content all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/players">
              <Button size="lg" className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white font-semibold px-8 py-6 text-lg">
                Explore Players
              </Button>
            </Link>
            <Link href="/membership">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg font-semibold">
                Join Premium
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/60 text-sm">NBA Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-white/60 text-sm">WNBA Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">32</div>
              <div className="text-white/60 text-sm">Teams Total</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-[scroll_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* All-Star Teams Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              All-Star Teams
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Championship Contenders
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The elite teams competing for NBA and WNBA championships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* NBA Elite Teams */}
            {[
              { 
                name: "Boston Celtics", 
                logo: "🍀", 
                record: "64-18", 
                conference: "Eastern",
                colors: "from-green-600 to-green-800",
                borderColor: "border-green-500/30",
                stats: { ppg: "120.6", oppg: "109.2", ranking: "#1 Seed" }
              },
              { 
                name: "Denver Nuggets", 
                logo: "⛰️", 
                record: "53-29", 
                conference: "Western",
                colors: "from-yellow-500 to-blue-600",
                borderColor: "border-yellow-500/30",
                stats: { ppg: "114.9", oppg: "112.4", ranking: "Champions" }
              },
              { 
                name: "Las Vegas Aces", 
                logo: "♠️", 
                record: "34-6", 
                conference: "WNBA Western",
                colors: "from-red-600 to-black",
                borderColor: "border-red-500/30",
                stats: { ppg: "87.3", oppg: "77.1", ranking: "#1 Seed" }
              },
              { 
                name: "New York Liberty", 
                logo: "🗽", 
                record: "32-8", 
                conference: "WNBA Eastern",
                colors: "from-teal-500 to-green-600",
                borderColor: "border-teal-500/30",
                stats: { ppg: "83.4", oppg: "76.8", ranking: "#1 Seed" }
              }
            ].map((team, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className={`bg-gradient-to-br ${team.colors}/20 ${team.borderColor} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
                  <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-2">{team.logo}</div>
                    <CardTitle className="text-lg font-bold text-white">{team.name}</CardTitle>
                    <p className="text-sm text-gray-300">{team.conference}</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-sm text-gray-300 mb-1">Season Record</p>
                      <p className="text-xl font-bold text-white">{team.record}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-gray-400">PPG</p>
                        <p className="text-sm font-bold text-white">{team.stats.ppg}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-gray-400">OPPG</p>
                        <p className="text-sm font-bold text-white">{team.stats.oppg}</p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/20 rounded-lg p-2">
                      <p className="text-xs text-yellow-300">{team.stats.ranking}</p>
                    </div>
                    
                    <Link href="/teams">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 border-white bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full font-semibold"
                      >
                        View Roster
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/teams">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8">
                View All Teams
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Basketball's Elite Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-kentucky-blue-500/10 text-kentucky-blue-600 border-kentucky-blue-500/20">
              Top Performers
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Basketball's Elite
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The highest performing players in the NBA and WNBA based on current stats
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {topPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Link href={`/players/${player.id}?from=home`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                      <div className={`relative h-64 bg-gradient-to-br ${getTeamColors(player.team)}`}>
                        <PlayerImage
                          playerId={player.apiId}
                          playerName={player.name}
                          league={player.league}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-kentucky-blue-600 transition-colors">{player.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-sm">{player.position}</Badge>
                          <span className="text-sm text-gray-700">{player.team}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{player.stats.points}</div>
                            <div className="text-xs text-gray-700">PPG</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{player.stats.rebounds}</div>
                            <div className="text-xs text-gray-700">RPG</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{player.stats.assists}</div>
                            <div className="text-xs text-gray-700">APG</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link href="/players">
              <Button size="lg" className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 text-white px-8">
                View All Players
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shop Items Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20">
              Featured Items
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Exclusive Merchandise
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Official jerseys, collectibles, and exclusive basketball merchandise
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Link href={`/shop/products/${product.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-orange-500 text-white">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-gray-900 font-semibold text-sm">${product.price}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-orange-600">${product.price}</span>
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                category: product.category,
                                inStock: true
                              })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Basketball
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your one-stop destination for comprehensive basketball content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-kentucky-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-kentucky-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Player Profiles</h3>
              <p className="text-gray-600 mb-6">
                Detailed stats, career highlights, and comprehensive information for every NBA and WNBA player.
              </p>
              <Link href="/players">
                <Button variant="outline" className="border-kentucky-blue-600 text-kentucky-blue-600 hover:bg-kentucky-blue-50">
                  Explore Players
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Merchandise Store</h3>
              <p className="text-gray-600 mb-6">
                Official jerseys, collectibles, and exclusive basketball merchandise from your favorite teams.
              </p>
              <Link href="/shop">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                  Shop Now
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Access</h3>
              <p className="text-gray-600 mb-6">
                Exclusive content, advanced stats, and premium features for the ultimate basketball experience.
              </p>
              <Link href="/membership">
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  Go Premium
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership CTA Section */}
      <section className="py-20 bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Crown className="h-16 w-16 mx-auto mb-6 text-kentucky-blue-200" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Join HoopMetrix Premium
            </h2>
            <p className="text-xl text-kentucky-blue-100 mb-8 max-w-2xl mx-auto">
              Get unlimited access to advanced player analytics, exclusive content, and premium features for just $9.99/month.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto mb-3 text-kentucky-blue-200" />
                <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                <p className="text-sm text-kentucky-blue-100">Deep dive into player performance metrics</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-kentucky-blue-200" />
                <h4 className="font-semibold mb-2">Exclusive Content</h4>
                <p className="text-sm text-kentucky-blue-100">Behind-the-scenes interviews and stories</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-kentucky-blue-200" />
                <h4 className="font-semibold mb-2">Community Access</h4>
                <p className="text-sm text-kentucky-blue-100">Connect with other basketball enthusiasts</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/membership">
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg font-semibold">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
