"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Waves, Bike, PersonStanding, Trophy, ArrowRight, Zap } from "lucide-react"

interface RaceData {
  name: string
  age?: number
  raceName: string
  swimDistance: number
  swimTime: string
  t1Time: string
  bikeDistance: number
  bikeTime: string
  bikePower?: number
  bikeElevation?: number
  t2Time: string
  runDistance: number
  runTime: string
}

interface TriathlonStandard {
  name: string
  swim: number
  bike: number
  run: number
}

// Actual triathlon race standards (not mathematical conversions)
const standardsKm: Record<string, TriathlonStandard> = {
  olympic: { name: "Olympic", swim: 1.5, bike: 40, run: 10 },
  "70.3": { name: "IRONMAN 70.3", swim: 1.9, bike: 90, run: 21.1 },
  full: { name: "Full IRONMAN", swim: 3.8, bike: 180, run: 42.2 },
}

const standardsMi: Record<string, TriathlonStandard> = {
  olympic: { name: "Olympic", swim: 0.93, bike: 24.8, run: 6.2 },
  "70.3": { name: "IRONMAN 70.3", swim: 1.2, bike: 56, run: 13.1 },
  full: { name: "Full IRONMAN", swim: 2.4, bike: 112, run: 26.2 },
}

// Conversion functions for user input conversion
const kmToMiles = (km: number) => km * 0.621371
const milesToKm = (miles: number) => miles * 1.60934

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(":")
  if (parts.length === 2) {
    // mm:ss format
    return Number.parseInt(parts[0]) + Number.parseInt(parts[1]) / 60
  } else if (parts.length === 3) {
    // hh:mm:ss format
    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1]) + Number.parseInt(parts[2]) / 60
  }
  return Number.parseInt(timeStr) || 0
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.round((minutes % 1) * 60)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function TriathlonNormalizer() {
  const [raceData, setRaceData] = useState<RaceData>({
    name: "",
    age: undefined,
    raceName: "",
    swimDistance: 1.9,
    swimTime: "",
    t1Time: "",
    bikeDistance: 90,
    bikeTime: "",
    bikePower: undefined,
    bikeElevation: undefined,
    t2Time: "",
    runDistance: 21.1,
    runTime: "",
  })

  const [targetStandard, setTargetStandard] = useState<string>("70.3")
  const [normalizedData, setNormalizedData] = useState<any>(null)
  const [useMetric, setUseMetric] = useState(true) // true for km, false for miles

  // Update distances when target standard or units change
  useEffect(() => {
    const standards = useMetric ? standardsKm : standardsMi
    const standard = standards[targetStandard]

    setRaceData((prev) => ({
      ...prev,
      swimDistance: standard.swim,
      bikeDistance: standard.bike,
      runDistance: standard.run,
    }))
  }, [targetStandard, useMetric])

  const handleInputChange = (field: keyof RaceData, value: string | number) => {
    setRaceData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleUnits = () => {
    setUseMetric(!useMetric)
  }

  const getPlaceholderValues = () => {
    const standards = useMetric ? standardsKm : standardsMi
    const standard = standards[targetStandard]
    return {
      swim: standard.swim.toString(),
      bike: standard.bike.toString(),
      run: standard.run.toString(),
    }
  }

  const normalizeRace = () => {
    // Use the appropriate standards based on current unit
    const standards = useMetric ? standardsKm : standardsMi
    const standard = standards[targetStandard]

    // Convert times to minutes
    const swimMinutes = timeToMinutes(raceData.swimTime)
    const bikeMinutes = timeToMinutes(raceData.bikeTime)
    const runMinutes = timeToMinutes(raceData.runTime)

    // Use 2 minutes default for transitions if not provided
    const t1Minutes = raceData.t1Time.trim() ? timeToMinutes(raceData.t1Time) : 2
    const t2Minutes = raceData.t2Time.trim() ? timeToMinutes(raceData.t2Time) : 2

    // Normalize distances and times using current unit standards
    const normalizedSwimTime = swimMinutes * (standard.swim / raceData.swimDistance)
    const normalizedBikeTime = bikeMinutes * (standard.bike / raceData.bikeDistance)
    const normalizedRunTime = runMinutes * (standard.run / raceData.runDistance)

    // Standardize transitions to 2 minutes each
    const standardT1 = 2
    const standardT2 = 2

    const totalNormalized = normalizedSwimTime + standardT1 + normalizedBikeTime + standardT2 + normalizedRunTime
    const totalActual = swimMinutes + t1Minutes + bikeMinutes + t2Minutes + runMinutes

    // Calculate timeline proportions correctly
    const swimMinutesNormalized = normalizedSwimTime
    const t1MinutesNormalized = standardT1
    const bikeMinutesNormalized = normalizedBikeTime
    const t2MinutesNormalized = standardT2
    const runMinutesNormalized = normalizedRunTime
    const totalMinutesNormalized =
      swimMinutesNormalized + t1MinutesNormalized + bikeMinutesNormalized + t2MinutesNormalized + runMinutesNormalized

    setNormalizedData({
      standard,
      swim: {
        time: minutesToTime(normalizedSwimTime),
        pace: minutesToTime(normalizedSwimTime / standard.swim / (useMetric ? 10 : 16.0934)), // per 100m or per 100yd
      },
      t1: minutesToTime(standardT1),
      bike: {
        time: minutesToTime(normalizedBikeTime),
        speed: (standard.bike / (normalizedBikeTime / 60)).toFixed(1), // km/h or mph
      },
      t2: minutesToTime(standardT2),
      run: {
        time: minutesToTime(normalizedRunTime),
        pace: minutesToTime(normalizedRunTime / standard.run),
      },
      total: minutesToTime(totalNormalized),
      actualTotal: minutesToTime(totalActual),
      timeSaved: minutesToTime(Math.abs(totalActual - totalNormalized)),
      // Add timeline proportions
      timeline: {
        swimPercent: (swimMinutesNormalized / totalMinutesNormalized) * 100,
        t1Percent: (t1MinutesNormalized / totalMinutesNormalized) * 100,
        bikePercent: (bikeMinutesNormalized / totalMinutesNormalized) * 100,
        t2Percent: (t2MinutesNormalized / totalMinutesNormalized) * 100,
        runPercent: (runMinutesNormalized / totalMinutesNormalized) * 100,
      },
    })
  }

  const isFormValid = () => {
    return raceData.swimTime.trim() !== "" && raceData.bikeTime.trim() !== "" && raceData.runTime.trim() !== ""
  }

  const distanceUnit = useMetric ? "km" : "mi"
  const speedUnit = useMetric ? "km/h" : "mph"
  const paceUnit = useMetric ? "/100m" : "/100yd"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full text-sm text-gray-600 mb-2 border border-gray-200">
            <Trophy className="w-4 h-4" />
            Prototype Number 1
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Triathlon Race Normalizer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Standardize your race times across different course variations and compare your true performance
          </p>
        </div>

        {/* Athlete Info & Settings */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Athlete Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* First Row: Target Distance, Distance Units, Race Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="standard" className="text-sm font-medium">
                    Target Distance
                  </Label>
                  <Select value={targetStandard} onValueChange={setTargetStandard}>
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="olympic">Olympic Distance</SelectItem>
                      <SelectItem value="70.3">IRONMAN 70.3</SelectItem>
                      <SelectItem value="full">Full IRONMAN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Distance Units</Label>
                  <div className="flex items-center justify-center gap-4 h-11 bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <span
                      className={`text-sm font-medium transition-colors ${useMetric ? "text-blue-600" : "text-gray-500"}`}
                    >
                      Metric (km)
                    </span>
                    <button
                      onClick={toggleUnits}
                      className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        useMetric ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          useMetric ? "translate-x-0" : "translate-x-7"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium transition-colors ${!useMetric ? "text-blue-600" : "text-gray-500"}`}
                    >
                      Imperial (mi)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raceName" className="text-sm font-medium">
                    Race Name (Optional)
                  </Label>
                  <Input
                    id="raceName"
                    placeholder="IRONMAN 70.3 Miami"
                    value={raceData.raceName}
                    onChange={(e) => handleInputChange("raceName", e.target.value)}
                    className="h-11 border-gray-200"
                  />
                </div>
              </div>

              {/* Second Row: Athlete Name and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Athlete Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={raceData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-11 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age (Optional)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="35"
                    value={raceData.age || ""}
                    onChange={(e) =>
                      handleInputChange("age", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    className="h-11 border-gray-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Race Data Input */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Race Data Input</h2>
            <p className="text-gray-600">Enter your actual race times and distances</p>
          </div>

          {/* Swim Section */}
          <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Waves className="w-5 h-5" />
                </div>
                Swim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="swimDistance" className="text-sm font-medium">
                    Distance ({distanceUnit})
                  </Label>
                  <Input
                    id="swimDistance"
                    type="number"
                    step="0.1"
                    value={raceData.swimDistance}
                    onChange={(e) => handleInputChange("swimDistance", Number.parseFloat(e.target.value))}
                    placeholder={getPlaceholderValues().swim}
                    className="h-11 border-blue-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swimTime" className="text-sm font-medium">
                    Time (mm:ss or hh:mm:ss)
                  </Label>
                  <Input
                    id="swimTime"
                    placeholder="33:00"
                    value={raceData.swimTime}
                    onChange={(e) => handleInputChange("swimTime", e.target.value)}
                    className="h-11 border-blue-200 bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* T1 Transition */}
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-slate-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-700">T1 Transition</h3>
              </div>
              <div className="max-w-md">
                <Label htmlFor="t1Time" className="text-sm font-medium">
                  Time (mm:ss)
                </Label>
                <Input
                  id="t1Time"
                  placeholder="4:19"
                  value={raceData.t1Time}
                  onChange={(e) => handleInputChange("t1Time", e.target.value)}
                  className="h-11 border-gray-200 bg-white mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bike Section */}
          <Card className="border border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-green-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bike className="w-5 h-5" />
                </div>
                Bike
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bikeDistance" className="text-sm font-medium">
                    Distance ({distanceUnit})
                  </Label>
                  <Input
                    id="bikeDistance"
                    type="number"
                    step="0.1"
                    value={raceData.bikeDistance}
                    onChange={(e) => handleInputChange("bikeDistance", Number.parseFloat(e.target.value))}
                    placeholder={getPlaceholderValues().bike}
                    className="h-11 border-green-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bikeTime" className="text-sm font-medium">
                    Time (hh:mm:ss)
                  </Label>
                  <Input
                    id="bikeTime"
                    placeholder="2:33:00"
                    value={raceData.bikeTime}
                    onChange={(e) => handleInputChange("bikeTime", e.target.value)}
                    className="h-11 border-green-200 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bikePower" className="text-sm font-medium">
                    Average Power (W) - Optional
                  </Label>
                  <Input
                    id="bikePower"
                    type="number"
                    placeholder="250"
                    value={raceData.bikePower || ""}
                    onChange={(e) =>
                      handleInputChange("bikePower", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    className="h-11 border-green-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bikeElevation" className="text-sm font-medium">
                    Elevation Gain (m) - Optional
                  </Label>
                  <Input
                    id="bikeElevation"
                    type="number"
                    placeholder="800"
                    value={raceData.bikeElevation || ""}
                    onChange={(e) =>
                      handleInputChange("bikeElevation", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    className="h-11 border-green-200 bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* T2 Transition */}
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-slate-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-700">T2 Transition</h3>
              </div>
              <div className="max-w-md">
                <Label htmlFor="t2Time" className="text-sm font-medium">
                  Time (mm:ss)
                </Label>
                <Input
                  id="t2Time"
                  placeholder="4:30"
                  value={raceData.t2Time}
                  onChange={(e) => handleInputChange("t2Time", e.target.value)}
                  className="h-11 border-gray-200 bg-white mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Run Section */}
          <Card className="border border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PersonStanding className="w-5 h-5" />
                </div>
                Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="runDistance" className="text-sm font-medium">
                    Distance ({distanceUnit})
                  </Label>
                  <Input
                    id="runDistance"
                    type="number"
                    step="0.1"
                    value={raceData.runDistance}
                    onChange={(e) => handleInputChange("runDistance", Number.parseFloat(e.target.value))}
                    placeholder={getPlaceholderValues().run}
                    className="h-11 border-orange-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runTime" className="text-sm font-medium">
                    Time (hh:mm:ss)
                  </Label>
                  <Input
                    id="runTime"
                    placeholder="1:28:00"
                    value={raceData.runTime}
                    onChange={(e) => handleInputChange("runTime", e.target.value)}
                    className="h-11 border-orange-200 bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Normalize Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={normalizeRace}
              disabled={!isFormValid()}
              size="lg"
              className={`px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                isFormValid()
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Zap className="w-6 h-6 mr-3" />
              Normalize Race Data
            </Button>
          </div>
        </div>

        {normalizedData && (
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Normalized Results - {normalizedData.standard.name}
              </CardTitle>
              <CardDescription className="text-base">
                Your race normalized to standard {normalizedData.standard.name} distances with 2-minute transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900">{raceData.name}</h3>
                  {raceData.age && <p className="text-lg text-gray-600">Age: {raceData.age}</p>}
                  {raceData.raceName && <p className="text-xl text-gray-700 font-medium">{raceData.raceName}</p>}
                </div>
                <div className="flex justify-center gap-6">
                  <Badge className="text-xl px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                    Normalized Total: {normalizedData.total}
                  </Badge>
                  <Badge variant="secondary" className="text-xl px-6 py-3 bg-gray-50 border-gray-200">
                    Your Actual Total: {normalizedData.actualTotal}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Waves className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-blue-700">Swim</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-900">{normalizedData.swim.time}</p>
                      <p className="text-sm text-blue-600">
                        {normalizedData.standard.swim}
                        {distanceUnit}
                      </p>
                      <p className="text-sm text-blue-600">
                        Pace: {normalizedData.swim.pace}
                        {paceUnit}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Bike className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-semibold text-green-700">Bike</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-green-900">{normalizedData.bike.time}</p>
                      <p className="text-sm text-green-600">
                        {normalizedData.standard.bike}
                        {distanceUnit}
                      </p>
                      <p className="text-sm text-green-600">
                        Speed: {normalizedData.bike.speed} {speedUnit}
                      </p>
                      {raceData.bikePower && <p className="text-sm text-green-600">Power: {raceData.bikePower}W</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <PersonStanding className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-semibold text-orange-700">Run</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-orange-900">{normalizedData.run.time}</p>
                      <p className="text-sm text-orange-600">
                        {normalizedData.standard.run}
                        {distanceUnit}
                      </p>
                      <p className="text-sm text-orange-600">
                        Pace: {normalizedData.run.pace}/{distanceUnit}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Race Timeline */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-center text-gray-900">Race Timeline</h4>
                <div className="relative">
                  {/* Timeline bar */}
                  <div className="flex w-full h-16 rounded-xl overflow-hidden border border-gray-200">
                    {/* Swim segment */}
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium relative"
                      style={{
                        width: `${normalizedData.timeline.swimPercent}%`,
                      }}
                    >
                      <Waves className="w-5 h-5" />
                    </div>

                    {/* T1 segment */}
                    <div
                      className="bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 text-xs font-medium"
                      style={{
                        width: `${normalizedData.timeline.t1Percent}%`,
                      }}
                    >
                      {/* Removed T1 text to prevent overflow */}
                    </div>

                    {/* Bike segment */}
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${normalizedData.timeline.bikePercent}%`,
                      }}
                    >
                      <Bike className="w-5 h-5" />
                    </div>

                    {/* T2 segment */}
                    <div
                      className="bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 text-xs font-medium"
                      style={{
                        width: `${normalizedData.timeline.t2Percent}%`,
                      }}
                    >
                      {/* Removed T2 text to prevent overflow */}
                    </div>

                    {/* Run segment */}
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${normalizedData.timeline.runPercent}%`,
                      }}
                    >
                      <PersonStanding className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Timeline labels */}
                  <div className="flex justify-between mt-3 text-sm text-gray-600">
                    <span className="font-medium">Start</span>
                    <span className="flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4" />
                      {normalizedData.total}
                    </span>
                    <span className="font-medium">Finish</span>
                  </div>
                </div>

                {/* Timeline legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
                    <span className="font-medium">Swim ({normalizedData.swim.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
                    <span className="font-medium">Bike ({normalizedData.bike.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded"></div>
                    <span className="font-medium">Run ({normalizedData.run.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
                    <span className="font-medium">
                      Transitions ({normalizedData.t1} + {normalizedData.t2})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-12 text-center pt-4">
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">T1 (Standardized)</p>
                  <p className="text-lg font-bold text-gray-900">{normalizedData.t1}</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">T2 (Standardized)</p>
                  <p className="text-lg font-bold text-gray-900">{normalizedData.t2}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
