import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "24h"

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  try {
    // Convert range to hours
    const timeRangeHours = range === "24h" ? 24 : range === "7d" ? 168 : 720
    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString()

    // Get total events
    const { count: totalEvents } = await supabase
      .from("security_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startTime)

    // Get events by type
    const { data: events } = await supabase.from("security_logs").select("event_type").gte("created_at", startTime)

    const eventsByType =
      events?.reduce(
        (acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Get alerts by type
    const { data: alerts } = await supabase
      .from("security_alerts")
      .select("type, severity")
      .gte("created_at", startTime)

    const alertsByType =
      alerts?.reduce(
        (acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Get recent alerts
    const { data: recentAlerts } = await supabase
      .from("security_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate threat level
    const criticalAlerts = alerts?.filter((a) => a.severity === "critical").length || 0
    const highAlerts = alerts?.filter((a) => a.severity === "high").length || 0

    let threatLevel: "low" | "medium" | "high" | "critical" = "low"
    if (criticalAlerts > 0) threatLevel = "critical"
    else if (highAlerts > 2) threatLevel = "high"
    else if (highAlerts > 0 || (alerts?.length || 0) > 5) threatLevel = "medium"

    return NextResponse.json({
      totalEvents: totalEvents || 0,
      alertsByType,
      eventsByType,
      recentAlerts: recentAlerts || [],
      threatLevel,
    })
  } catch (error) {
    console.error("Security dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch security data" }, { status: 500 })
  }
}
