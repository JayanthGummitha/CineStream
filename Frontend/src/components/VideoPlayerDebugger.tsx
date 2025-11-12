/**
 * VideoPlayer Debugger Component
 * 
 * This component helps debug why Skip Intro and Next Episode buttons are not visible
 */

'use client';

import { useEffect, useState } from 'react';

interface VideoPlayerDebuggerProps {
  // Skip Intro Button props
  introData: { start: number; end: number } | null;
  currentTime: number;
  
  // Next Episode Button props
  nextEpisodeData: any;
  duration: number;
  contentType: string;
  triggerTime: number;
  
  // Episode data
  episodes?: any[];
  currentEpisodeIndex?: number;
  seasonNumber?: number;
}

export function VideoPlayerDebugger({
  introData,
  currentTime,
  nextEpisodeData,
  duration,
  contentType,
  triggerTime,
  episodes,
  currentEpisodeIndex,
  seasonNumber
}: VideoPlayerDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Skip Intro Button conditions
    const isIntroSkipAvailable = introData !== null && introData.start < introData.end;
    const isInIntroRange = introData && currentTime >= introData.start && currentTime <= introData.end;
    const shouldShowSkipIntro = introData && isIntroSkipAvailable;

    // Next Episode Button conditions
    const showTime = duration - triggerTime;
    const shouldShowNextEpisode = contentType === 'episode' && 
                                  nextEpisodeData && 
                                  duration && 
                                  currentTime >= showTime && 
                                  currentTime < duration && 
                                  showTime > 0;

    const newDebugInfo = {
      timestamp: new Date().toLocaleTimeString(),
      
      // Skip Intro Debug
      skipIntro: {
        introData,
        isIntroSkipAvailable,
        isInIntroRange,
        shouldShowSkipIntro,
        currentTime,
        conditions: {
          hasIntroData: !!introData,
          validIntroRange: introData ? introData.start < introData.end : false,
          inTimeRange: isInIntroRange
        }
      },
      
      // Next Episode Debug
      nextEpisode: {
        nextEpisodeData: nextEpisodeData ? {
          id: nextEpisodeData.id,
          title: nextEpisodeData.title
        } : null,
        shouldShowNextEpisode,
        showTime,
        currentTime,
        duration,
        triggerTime,
        contentType,
        conditions: {
          isEpisode: contentType === 'episode',
          hasNextEpisodeData: !!nextEpisodeData,
          hasDuration: !!duration,
          inTimeRange: currentTime >= showTime && currentTime < duration,
          validShowTime: showTime > 0
        }
      },
      
      // Episode Data Debug
      episodeData: {
        hasEpisodes: !!episodes,
        episodeCount: episodes?.length || 0,
        currentEpisodeIndex,
        seasonNumber,
        currentEpisode: episodes && currentEpisodeIndex !== undefined ? 
          episodes[currentEpisodeIndex] : null
      }
    };

    setDebugInfo(newDebugInfo);
  }, [
    introData, 
    currentTime, 
    nextEpisodeData, 
    duration, 
    contentType, 
    triggerTime,
    episodes,
    currentEpisodeIndex,
    seasonNumber
  ]);

  return (
    <></>
    // <div className="fixed top-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-y-auto z-[9999] font-mono">
    //   <h3 className="text-yellow-400 font-bold mb-2">VideoPlayer Debug Info</h3>
      
    //   <div className="mb-3">
    //     <h4 className="text-green-400 font-semibold">Skip Intro Button</h4>
    //     <div className="ml-2">
    //       <div className={`${debugInfo.skipIntro?.shouldShowSkipIntro ? 'text-green-400' : 'text-red-400'}`}>
    //         Should Show: {debugInfo.skipIntro?.shouldShowSkipIntro ? 'YES' : 'NO'}
    //       </div>
    //       <div>Has Intro Data: {debugInfo.skipIntro?.conditions?.hasIntroData ? 'YES' : 'NO'}</div>
    //       <div>Valid Range: {debugInfo.skipIntro?.conditions?.validIntroRange ? 'YES' : 'NO'}</div>
    //       <div>In Time Range: {debugInfo.skipIntro?.conditions?.inTimeRange ? 'YES' : 'NO'}</div>
    //       {debugInfo.skipIntro?.introData && (
    //         <div>Intro: {debugInfo.skipIntro.introData.start}s - {debugInfo.skipIntro.introData.end}s</div>
    //       )}
    //       <div>Current Time: {debugInfo.skipIntro?.currentTime?.toFixed(1)}s</div>
    //     </div>
    //   </div>

    //   <div className="mb-3">
    //     <h4 className="text-blue-400 font-semibold">Next Episode Button</h4>
    //     <div className="ml-2">
    //       <div className={`${debugInfo.nextEpisode?.shouldShowNextEpisode ? 'text-green-400' : 'text-red-400'}`}>
    //         Should Show: {debugInfo.nextEpisode?.shouldShowNextEpisode ? 'YES' : 'NO'}
    //       </div>
    //       <div>Is Episode: {debugInfo.nextEpisode?.conditions?.isEpisode ? 'YES' : 'NO'}</div>
    //       <div>Has Next Episode: {debugInfo.nextEpisode?.conditions?.hasNextEpisodeData ? 'YES' : 'NO'}</div>
    //       <div>Has Duration: {debugInfo.nextEpisode?.conditions?.hasDuration ? 'YES' : 'NO'}</div>
    //       <div>In Time Range: {debugInfo.nextEpisode?.conditions?.inTimeRange ? 'YES' : 'NO'}</div>
    //       <div>Valid Show Time: {debugInfo.nextEpisode?.conditions?.validShowTime ? 'YES' : 'NO'}</div>
    //       <div>Show Time: {debugInfo.nextEpisode?.showTime?.toFixed(1)}s</div>
    //       <div>Duration: {debugInfo.nextEpisode?.duration?.toFixed(1)}s</div>
    //       <div>Current Time: {debugInfo.nextEpisode?.currentTime?.toFixed(1)}s</div>
    //       <div>Trigger Time: {debugInfo.nextEpisode?.triggerTime}s</div>
    //       {debugInfo.nextEpisode?.nextEpisodeData && (
    //         <div>Next: {debugInfo.nextEpisode.nextEpisodeData.title}</div>
    //       )}
    //     </div>
    //   </div>

    //   <div className="mb-3">
    //     <h4 className="text-purple-400 font-semibold">Episode Data</h4>
    //     <div className="ml-2">
    //       <div>Has Episodes: {debugInfo.episodeData?.hasEpisodes ? 'YES' : 'NO'}</div>
    //       <div>Episode Count: {debugInfo.episodeData?.episodeCount}</div>
    //       <div>Current Index: {debugInfo.episodeData?.currentEpisodeIndex}</div>
    //       <div>Season: {debugInfo.episodeData?.seasonNumber}</div>
    //       {debugInfo.episodeData?.currentEpisode && (
    //         <div>Current: {debugInfo.episodeData.currentEpisode.title}</div>
    //       )}
    //     </div>
    //   </div>

    //   <div className="text-gray-400 text-xs">
    //     Last Update: {debugInfo.timestamp}
    //   </div>
    // </div>
  );
}