'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerImage } from "@/components/ui/player-image";
import { Star, Trophy, Users, ShoppingBag, Crown, ArrowRight } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
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
            <Badge className="mb-4 bg-kentucky-blue-500/20 text-kentucky-blue-300 border-kentucky-blue-500/30">
              Basketball Encyclopedia
            </Badge>
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
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
              Join Premium
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/60 text-sm">NBA Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">144+</div>
              <div className="text-white/60 text-sm">WNBA Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">32</div>
              <div className="text-white/60 text-sm">Teams Total</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Players Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-kentucky-blue-500/10 text-kentucky-blue-600 border-kentucky-blue-500/20">
              Featured Players
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Basketball's Elite
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore comprehensive profiles of the game's greatest players
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "LeBron James", team: "Lakers", image: "/Damien Daniels Hoop Metrix.jpg", jersey: "23", position: "SF", pts: "25.3", reb: "7.3", ast: "7.4", id: "lebron-james" },
              { name: "Stephen Curry", team: "Warriors", image: "/Justice Brantley Hoop Metrix.jpg", jersey: "30", position: "PG", pts: "26.4", reb: "4.5", ast: "5.1", id: "stephen-curry" },
              { name: "A'ja Wilson", team: "Aces", image: "/RJ McGee Hoop Metrix.jpg", jersey: "22", position: "F", pts: "22.8", reb: "9.4", ast: "2.3", id: "aja-wilson" },
              { name: "Breanna Stewart", team: "Liberty", image: "/Seth Compas Hoop Metrix.jpg", jersey: "30", position: "F", pts: "23.0", reb: "9.3", ast: "3.8", id: "breanna-stewart" }
            ].map((player, index) => (
              <Link key={index} href={`/players/${player.id}?from=home`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  {/* Player Photo */}
                  <div className="relative h-64 bg-gradient-to-br from-kentucky-blue-600 to-kentucky-blue-800 overflow-hidden">
                    <Image
                      src={player.image}
                      alt={player.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Jersey Number Overlay */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{player.jersey}</span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Player Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-kentucky-blue-600 transition-colors mb-2">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-sm">
                          {player.position}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {player.team}
                        </span>
                      </div>
                    </div>

                    {/* Player Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{player.pts}</div>
                        <div className="text-xs text-gray-500">PPG</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{player.reb}</div>
                        <div className="text-xs text-gray-500">RPG</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{player.ast}</div>
                        <div className="text-xs text-gray-500">APG</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/players">
              <Button size="lg" className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700">
                View All Players
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Players Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Players
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the stars making headlines in the NBA and WNBA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Featured Player 1 - LeBron James */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-purple-600 to-yellow-500">
                <PlayerImage
                  playerId="2544"
                  playerName="LeBron James"
                  league="NBA"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#6</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">LeBron James</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-sm">SF</Badge>
                  <span className="text-sm text-gray-500">Lakers</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">23.2</div>
                    <div className="text-xs text-gray-500">PPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">9.0</div>
                    <div className="text-xs text-gray-500">RPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">8.9</div>
                    <div className="text-xs text-gray-500">APG</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Player 2 - Stephen Curry */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-blue-600 to-yellow-400">
                <PlayerImage
                  playerId="201939"
                  playerName="Stephen Curry"
                  league="NBA"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#30</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Stephen Curry</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-sm">PG</Badge>
                  <span className="text-sm text-gray-500">Warriors</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">26.4</div>
                    <div className="text-xs text-gray-500">PPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">4.5</div>
                    <div className="text-xs text-gray-500">RPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">5.1</div>
                    <div className="text-xs text-gray-500">APG</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Player 3 - A'ja Wilson */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-red-600 to-black">
                <PlayerImage
                  playerId="1628886"
                  playerName="A'ja Wilson"
                  league="WNBA"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#22</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">A'ja Wilson</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-sm">F</Badge>
                  <span className="text-sm text-gray-500">Aces</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">22.8</div>
                    <div className="text-xs text-gray-500">PPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">9.4</div>
                    <div className="text-xs text-gray-500">RPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">2.3</div>
                    <div className="text-xs text-gray-500">APG</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Player 4 - Breanna Stewart */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-teal-500 to-black">
                <PlayerImage
                  playerId="203399"
                  playerName="Breanna Stewart"
                  league="WNBA"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#30</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Breanna Stewart</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-sm">F</Badge>
                  <span className="text-sm text-gray-500">Liberty</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">23.0</div>
                    <div className="text-xs text-gray-500">PPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">9.3</div>
                    <div className="text-xs text-gray-500">RPG</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">3.8</div>
                    <div className="text-xs text-gray-500">APG</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                <Button size="lg" className="bg-white text-kentucky-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
