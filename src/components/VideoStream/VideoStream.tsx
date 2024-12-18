'use client'

import React, { useRef, useEffect } from "react"

interface VideoStreamProps {
    streamUrl: string
}

const VideoStream: React.FC<VideoStreamProps> = ({ streamUrl}) => {
    const videoRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = streamUrl
        }
    }, [streamUrl])

    return (
        <div className="video-stream">
            <img ref={videoRef} alt="Video stream" className="w-full h-auto" />
        </div>
    )
}

export default VideoStream