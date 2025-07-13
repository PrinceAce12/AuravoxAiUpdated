import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Voice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface TTSSettingsProps {
  isSupported: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  availableVoices: Voice[];
  selectedVoice: Voice | null;
  onToggleMute: () => void;
  onVoiceChange: (voice: Voice) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  currentRate?: number;
  currentPitch?: number;
  currentVolume?: number;
  readFullResponse?: boolean;
  onReadFullResponseChange?: (readFull: boolean) => void;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({
  isSupported,
  isMuted,
  isSpeaking,
  availableVoices,
  selectedVoice,
  onToggleMute,
  onVoiceChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  currentRate = 1,
  currentPitch = 1,
  currentVolume = 1,
  readFullResponse = true,
  onReadFullResponseChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mute/Unmute Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleMute}
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={isMuted ? 'Unmute speech' : 'Mute speech'}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-gray-500" />
        ) : (
          <Volume2 className="h-4 w-4 text-gray-600" />
        )}
      </Button>

      {/* Settings Dropdown */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="TTS Settings"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Speech Settings
            </h3>
            
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice-select" className="text-xs text-gray-600 dark:text-gray-400">
                Voice
              </Label>
              <Select
                value={selectedVoice?.voiceURI || ''}
                onValueChange={(value) => {
                  const voice = availableVoices.find(v => v.voiceURI === value);
                  if (voice) onVoiceChange(voice);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Speed
                </Label>
                <span className="text-xs text-gray-500">
                  {Math.round(currentRate * 100)}%
                </span>
              </div>
              <Slider
                value={[currentRate]}
                onValueChange={([value]) => onRateChange(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Pitch
                </Label>
                <span className="text-xs text-gray-500">
                  {Math.round(currentPitch * 100)}%
                </span>
              </div>
              <Slider
                value={[currentPitch]}
                onValueChange={([value]) => onPitchChange(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Volume
                </Label>
                <span className="text-xs text-gray-500">
                  {Math.round(currentVolume * 100)}%
                </span>
              </div>
              <Slider
                value={[currentVolume]}
                onValueChange={([value]) => onVolumeChange(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Full Response Toggle */}
            {onReadFullResponseChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    Read Full Response
                  </Label>
                  <button
                    onClick={() => onReadFullResponseChange(!readFullResponse)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      readFullResponse 
                        ? 'bg-blue-600 dark:bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        readFullResponse ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {readFullResponse 
                    ? 'Will read the complete assistant response' 
                    : 'Will read only a summary of the response'
                  }
                </p>
              </div>
            )}

            {/* Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                Speaking...
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}; 