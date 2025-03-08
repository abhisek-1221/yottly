"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const YouTubeComparison = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChart, setActiveChart] = useState('pie');
  
  const videos = {
    first: {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      channel: 'Rick Astley',
      views: 1200000000,
      viewsFormatted: '1.2B views',
      published: 'Oct 25, 2009',
      description: 'The classic music video for Rick Astley\'s "Never Gonna Give You Up"',
      likes: 15000000,
      likesFormatted: '15M',
      comments: 3200000,
      commentsFormatted: '3.2M'
    },
    second: {
      id: 'qeMFqkcPYcg',
      title: 'a-ha - Take On Me (Official Video)',
      channel: 'a-ha',
      views: 1500000000,
      viewsFormatted: '1.5B views',
      published: 'Feb 17, 2010',
      description: 'The official video for a-ha\'s "Take On Me"',
      likes: 12000000,
      likesFormatted: '12M',
      comments: 2100000,
      commentsFormatted: '2.1M'
    }
  };
  
  // Prepare chart data
  const pieData = [
    { name: videos.first.title, views: videos.first.views, likes: videos.first.likes, comments: videos.first.comments, color: '#3B82F6' },
    { name: videos.second.title, views: videos.second.views, likes: videos.second.likes, comments: videos.second.comments, color: '#A855F7' }
  ];
  
  const barData = [
    { name: 'Views (millions)', video1: videos.first.views / 1000000, video2: videos.second.views / 1000000 },
    { name: 'Likes (millions)', video1: videos.first.likes / 1000000, video2: videos.second.likes / 1000000 },
    { name: 'Comments (millions)', video1: videos.first.comments / 1000000, video2: videos.second.comments / 1000000 }
  ];
  
  const COLORS = ['#3B82F6', '#A855F7'];
  
  const tabs = [
    { id: 'visual', label: 'Visual' },
    { id: 'stats', label: 'Stats' },
    { id: 'comments', label: 'Comments' },
    { id: 'engagement', label: 'Engagement' }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Format number for tooltip
interface VideoData {
    id: string;
    title: string;
    channel: string;
    views: number;
    viewsFormatted: string;
    published: string;
    description: string;
    likes: number;
    likesFormatted: string;
    comments: number;
    commentsFormatted: string;
}

interface PieData {
    name: string;
    views: number;
    likes: number;
    comments: number;
    color: string;
}

interface BarData {
    name: string;
    video1: number;
    video2: number;
}

interface CustomTooltipProps {
    active: boolean;
    payload: { name: string; value: number; color?: string }[];
    label: string;
}

const formatNumber = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
          <p className="font-medium text-gray-200">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || COLORS[index % COLORS.length] }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          YouTube Video Comparison
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={itemVariants}
        >
          {/* Video 1 */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-black">
              <img 
                src={`/api/placeholder/640/360`} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white rounded-full p-4"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{videos.first.title}</h2>
              <p className="text-gray-400 mb-4">{videos.first.channel} • {videos.first.viewsFormatted}</p>
              <p className="text-sm text-gray-300">{videos.first.description}</p>
            </div>
          </div>
          
          {/* Video 2 */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-black">
              <img 
                src={`/api/placeholder/640/360`} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white rounded-full p-4"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{videos.second.title}</h2>
              <p className="text-gray-400 mb-4">{videos.second.channel} • {videos.second.viewsFormatted}</p>
              <p className="text-sm text-gray-300">{videos.second.description}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Comparison Tabs */}
        <motion.div 
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-8"
          variants={itemVariants}
        >
          <div className="flex border-b border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-6 py-3 font-medium relative ${
                  activeTab === tab.id ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400"
                    layoutId="activeTab"
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {activeTab === 'visual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-400">{videos.first.title}</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Video Quality</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map(i => (
                          <span key={i} className="w-6 h-2 bg-blue-500 rounded"></span>
                        ))}
                        <span className="w-6 h-2 bg-gray-600 rounded"></span>
                      </div>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Cinematography</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map(i => (
                          <span key={i} className="w-6 h-2 bg-blue-500 rounded"></span>
                        ))}
                        {[1, 2].map(i => (
                          <span key={i} className="w-6 h-2 bg-gray-600 rounded"></span>
                        ))}
                      </div>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Color Grading</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className="w-6 h-2 bg-blue-500 rounded"></span>
                        ))}
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">{videos.second.title}</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Video Quality</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map(i => (
                          <span key={i} className="w-6 h-2 bg-purple-500 rounded"></span>
                        ))}
                        {[1, 2].map(i => (
                          <span key={i} className="w-6 h-2 bg-gray-600 rounded"></span>
                        ))}
                      </div>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Cinematography</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className="w-6 h-2 bg-purple-500 rounded"></span>
                        ))}
                      </div>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Color Grading</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map(i => (
                          <span key={i} className="w-6 h-2 bg-purple-500 rounded"></span>
                        ))}
                        <span className="w-6 h-2 bg-gray-600 rounded"></span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Video Statistics Comparison</h3>
                  <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                    <button 
                      className={`px-4 py-2 text-sm ${activeChart === 'pie' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                      onClick={() => setActiveChart('pie')}
                    >
                      Pie Charts
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm ${activeChart === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                      onClick={() => setActiveChart('bar')}
                    >
                      Bar Charts
                    </button>
                  </div>
                </div>
                
                {activeChart === 'pie' && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-center mb-4 font-medium">Views Comparison</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="views"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-center mb-4 font-medium">Likes Comparison</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="likes"
                                nameKey="name"
                                label={({ name, percent }) => `${name.substring(0, 10)}...: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
                              </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-center mb-4 font-medium">Comments Comparison</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="comments"
                                nameKey="name"
                                label={({ name, percent }) => `${name.substring(0, 10)}...: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
                              </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeChart === 'bar' && (
                  <div>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
                          <Legend />
                          <Bar dataKey="video1" name={videos.first.title} fill="#3B82F6" />
                          <Bar dataKey="video2" name={videos.second.title} fill="#A855F7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-300">{videos.first.title}</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-300">{videos.second.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">Insights</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• {videos.second.title} has {Math.round((videos.second.views - videos.first.views) / 1000000)}M more views</li>
                    <li>• {videos.first.title} has {Math.round((videos.first.likes - videos.second.likes) / 1000000)}M more likes</li>
                    <li>• Comment-to-view ratio is higher for {videos.first.title}</li>
                    <li>• Both videos show strong engagement metrics overall</li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'comments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-400">{videos.first.title}</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                          <span className="font-medium">User {i}</span>
                          <span className="text-xs text-gray-400 ml-2">2 weeks ago</span>
                        </div>
                        <p className="text-sm">Sample comment for video 1. This shows how users are reacting to the content.</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">{videos.second.title}</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                          <span className="font-medium">Viewer {i}</span>
                          <span className="text-xs text-gray-400 ml-2">1 week ago</span>
                        </div>
                        <p className="text-sm">Sample comment for video 2. These comments help compare audience reactions.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'engagement' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-400">{videos.first.title}</h3>
                  <div className="bg-gray-700 p-4 rounded mb-4">
                    <h4 className="font-medium mb-2">Audience Retention</h4>
                    <div className="h-32 relative">
                      <div className="absolute bottom-0 left-0 w-8 h-28 bg-blue-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-10 w-8 h-24 bg-blue-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-20 w-8 h-20 bg-blue-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-30 w-8 h-16 bg-blue-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-40 w-8 h-14 bg-blue-500 rounded-t mx-2"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-2xl font-bold text-blue-400">92%</div>
                      <div className="text-xs text-gray-400">Like Ratio</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-2xl font-bold text-blue-400">4:32</div>
                      <div className="text-xs text-gray-400">Avg. Watch Time</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">{videos.second.title}</h3>
                  <div className="bg-gray-700 p-4 rounded mb-4">
                    <h4 className="font-medium mb-2">Audience Retention</h4>
                    <div className="h-32 relative">
                      <div className="absolute bottom-0 left-0 w-8 h-30 bg-purple-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-10 w-8 h-26 bg-purple-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-20 w-8 h-22 bg-purple-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-30 w-8 h-20 bg-purple-500 rounded-t mx-2"></div>
                      <div className="absolute bottom-0 left-40 w-8 h-16 bg-purple-500 rounded-t mx-2"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-2xl font-bold text-purple-400">96%</div>
                      <div className="text-xs text-gray-400">Like Ratio</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-2xl font-bold text-purple-400">5:17</div>
                      <div className="text-xs text-gray-400">Avg. Watch Time</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Conclusion Card */}
        <motion.div 
          className="bg-gray-800 rounded-lg shadow-lg p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold mb-4">Comparison Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-blue-400">{videos.first.title}</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Higher production quality</li>
                <li>Better color grading</li>
                <li>More comments and engagement</li>
                <li>Lower audience retention</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-purple-400">{videos.second.title}</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Superior cinematography</li>
                <li>Higher viewer retention</li>
                <li>Better like ratio</li>
                <li>Longer average watch time</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default YouTubeComparison;