"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Activity, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

interface SecurityDashboardData {
  totalEvents: number
  alertsByType: Record<string, number>
  eventsByType: Record<string, number>
  recentAlerts: any[]
  threatLevel: "low" | "medium" | "high" | "critical"
}

export function SecurityDashboard() {
  const [data, setData] = useState<SecurityDashboardData | null>(null)
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/security/dashboard?range=${timeRange}`)
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Failed to fetch security dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-green-100">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Security Dashboard</h2>
          <p className="text-green-600">Monitor security events and threats</p>
        </div>
        <div className="flex items-center space-x-2">
          {["24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range as any)}
              className={
                timeRange === range
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
              }
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Threat Level Indicator */}
      <Card className="border-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getThreatLevelColor(data.threatLevel)}`}></div>
              <div>
                <h3 className="font-semibold text-green-800">Current Threat Level</h3>
                <p className="text-sm text-gray-600 capitalize">{data.threatLevel}</p>
              </div>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-green-800">{data.totalEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-green-800">
                  {data.recentAlerts.filter((a) => !a.is_resolved).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-green-800">{data.eventsByType.failed_login || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful Logins</p>
                <p className="text-2xl font-bold text-green-800">{data.eventsByType.login || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-green-800">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.eventsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{type.replace("_", " ")}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / data.totalEvents) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-800">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-green-800">Alert Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.alertsByType).length > 0 ? (
                Object.entries(data.alertsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type.replace("_", " ")}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No alerts in this time period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Recent Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {data.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    <div>
                      <p className="text-sm font-medium text-green-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.is_resolved ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Resolved
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No recent security alerts</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
