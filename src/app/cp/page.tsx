'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

// Types
interface ChannelData {
  name: string;
  username: string;
  videosCount: number;
  subscribers: number;
  subscriberRank: number;
  totalViews: number;
  viewsRank: number;
}

interface ViewData {
  name: string;
  views: number;
}

interface RecentVideo {
  title: string;
  views: number;
  uploadTime: string;
}

// Sample data
const channelData: ChannelData = {
  name: "Smosh",
  username: "@smosh",
  videosCount: 2010,
  subscribers: 26800000,
  subscriberRank: 221,
  totalViews: 10999491126,
  viewsRank: 668,
}

const viewsData: ViewData[] = [
  { name: '1', views: 1100000 },
  { name: '2', views: 670000 },
  { name: '3', views: 610000 },
  { name: '4', views: 590000 },
  { name: '5', views: 560000 },
  { name: '6', views: 530000 },
]

const recentVideo: RecentVideo = {
  title: "The Women's Episode | Bit City",
  views: 239000,
  uploadTime: "First 17 hours",
}

const videoTypeData = [
  { name: 'Short Videos', value: 15.7 },
  { name: 'Long Videos', value: 5.8 },
]

const COLORS = ['#f3f4f6', '#ef4444']

export default function Home() {
  return (
    <div className="min-h-screen text-white p-6">
      <Card className="border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-md overflow-hidden flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-4xl font-bold">S</div>
              </motion.div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{channelData.name}</h1>
                <span className="text-sm text-gray-400">🇺🇸</span>
              </div>
              <p className="text-gray-400">{channelData.username} • {channelData.videosCount.toLocaleString()} videos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-400">Subscribers</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{(channelData.subscribers / 1000000).toLocaleString()}M</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">#221</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400">Total Views</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{(channelData.totalViews / 1000000000).toFixed(2)}B</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">#668</span>
                </div>
              </div>
            </div>
            
            <div>
              <button className="bg-gray-700 p-2 rounded">
                <Star className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 mt-6">
            <div className="col-span-1 bg-gray-700 py-3 text-center rounded-l">
              <p>Analytics</p>
            </div>
            <div className="col-span-1 bg-gray-800 py-3 text-center">
              <p>Videos</p>
            </div>
            <div className="col-span-1 bg-gray-800 py-3 text-center">
              <p>Projections</p>
            </div>
            <div className="col-span-1 bg-gray-800 py-3 text-center">
              <p>Similar Channels</p>
            </div>
            <div className="col-span-1 bg-gray-800 py-3 text-center rounded-r">
              <p>About</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-12 gap-4 mt-4">
        <Card className="col-span-3 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-gray-400 text-sm mb-2">VIEWS</h2>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">2.41M</span>
              <div className="bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center">
                <span>5.1M</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">LAST 7 DAYS</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-gray-400 text-sm mb-2">SUBS</h2>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">0</span>
              <div className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex items-center">
                <span>--</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">LAST 7 DAYS</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-gray-400 text-sm mb-2">EST REV</h2>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">$1.6K-$4.6K</span>
              <div className="bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center">
                <span>$5.9K</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">LAST 7 DAYS</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-gray-700 row-span-2">
          <CardHeader>
            <CardTitle className="text-md">Most Recent Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-700 rounded mb-3 overflow-hidden">
              <img 
                src="https://media.licdn.com/dms/image/v2/D5612AQEC2GNEaVOqHQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1709846879463?e=2147483647&v=beta&t=3oEOdpoAqT2j-2fuf4KzvbuNtxTkQVdaoy3wwqnMdrM" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">{recentVideo.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{recentVideo.uploadTime}</p>
            
            <div className="mt-4">
              <h4 className="text-sm text-gray-400">Estimated Rank by Views</h4>
              <div className="flex items-center mt-1">
                <span>N/A</span>
              </div>
              
              <h4 className="text-sm text-gray-400 mt-3">Total Views</h4>
              <div className="flex items-center gap-2 mt-1">
                <span>{recentVideo.views.toLocaleString()}</span>
              </div>
              
              <button className="w-full bg-gray-700 text-gray-300 py-2 rounded mt-4">
                More video analytics
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-9 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Views</h2>
                <span className="text-lg text-gray-400">Subscribers</span>
              </div>
              
              <div className="flex gap-2">
                {['7D', '28D', '3M', '1Y', 'Max'].map((period) => (
                  <button 
                    key={period}
                    className={`px-3 py-1 rounded ${period === '7D' ? 'bg-gray-600' : 'bg-gray-700'}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold">2.41M</span>
              <div className="flex items-center text-red-500 text-sm">
                <span>5.9M (71.1%)</span>
                <span className="ml-1">Past 7 days</span>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={viewsData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-gray-700">
          <CardHeader>
            <CardTitle className="text-md">Longs vs Shorts Views</CardTitle>
            <p className="text-xs text-gray-400">Last 7 Days • Estimated</p>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span className="text-sm text-gray-400">Long Views</span>
                </div>
                <div className="text-xl font-bold">5.8M</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300"></div>
                  <span className="text-sm text-gray-400">Short Views</span>
                </div>
                <div className="text-xl font-bold">15.7M</div>
              </div>
            </div>
            
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={videoTypeData}
                    cx="50%"
                    cy="50%"
                    startAngle={0}
                    endAngle={360}
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {videoTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}