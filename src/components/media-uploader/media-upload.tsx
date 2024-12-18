'use client'

import React, { useState, useRef, ChangeEvent } from 'react'

export default function CustomFramedFileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else if (selectedFile.type.startsWith('video/')) {
        setPreview(URL.createObjectURL(selectedFile))
      } else {
        setPreview(null)
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">File Uploader</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
            aria-label="Upload file"
          />
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600  transition duration-150 ease-in-out"
          >
            Add File
          </button>
          {file && (
            <div className="flex items-center space-x-2 flex-grow">
              <span className="text-sm text-gray-600 truncate max-w-[150px]">
                {file.name}
              </span>
              <button
                onClick={handleClear}
                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200  transition duration-150 ease-in-out"
                aria-label="Clear selection"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {preview && (
          <div className="mt-4 relative">
            {file?.type.startsWith('image/') ? (
              <img src={preview} alt="Preview" className="max-w-full h-auto max-h-64 rounded-lg object-contain" />
            ) : file?.type.startsWith('video/') ? (
              <video src={preview} controls className="max-w-full h-auto max-h-64 rounded-lg">
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}