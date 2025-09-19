import { createClient } from "@/lib/supabase/server"

export interface SecurityEvent {
  userId?: string
  eventType: string
  severity: "low" | "medium" | "high" | "critical"
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface SecurityAlert {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  userId?: string
  metadata: Record<string, any>
  isResolved: boolean
  createdAt: string
}

export class SecurityMonitor {
  // Log security events
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const supabase = await createClient()

    try {
      await supabase.from("security_logs").insert({
        user_id: event.userId,
        event_type: event.eventType,
        severity: event.severity,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        metadata: event.metadata,
        created_at: event.timestamp,
      })

      // Check if event triggers an alert
      await this.checkForSecurityAlerts(event)
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  // Check for suspicious patterns and create alerts
  static async checkForSecurityAlerts(event: SecurityEvent): Promise<void> {
    const supabase = await createClient()

    try {
      // Check for multiple failed login attempts
      if (event.eventType === "failed_login") {
        const { data: recentFailures } = await supabase
          .from("security_logs")
          .select("*")
          .eq("user_id", event.userId)
          .eq("event_type", "failed_login")
          .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes

        if (recentFailures && recentFailures.length >= 5) {
          await this.createSecurityAlert({
            type: "brute_force_attempt",
            severity: "high",
            message: `Multiple failed login attempts detected for user ${event.userId}`,
            userId: event.userId,
            metadata: {
              attemptCount: recentFailures.length,
              ipAddress: event.ipAddress,
              timeWindow: "15 minutes",
            },
          })
        }
      }

      // Check for suspicious payment activity
      if (event.eventType === "payment_failed" && event.metadata?.fraud_score > 0.7) {
        await this.createSecurityAlert({
          type: "suspicious_payment",
          severity: "medium",
          message: "High fraud score detected in payment attempt",
          userId: event.userId,
          metadata: {
            fraudScore: event.metadata.fraud_score,
            orderId: event.metadata.order_id,
            ipAddress: event.ipAddress,
          },
        })
      }

      // Check for unusual access patterns
      if (event.eventType === "login" && event.ipAddress) {
        const { data: recentLogins } = await supabase
          .from("security_logs")
          .select("ip_address, metadata")
          .eq("user_id", event.userId)
          .eq("event_type", "login")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .limit(10)

        if (recentLogins) {
          const uniqueIPs = new Set(recentLogins.map((log) => log.ip_address))
          if (uniqueIPs.size >= 5) {
            await this.createSecurityAlert({
              type: "unusual_access_pattern",
              severity: "medium",
              message: "Multiple IP addresses detected for user login",
              userId: event.userId,
              metadata: {
                uniqueIPs: Array.from(uniqueIPs),
                timeWindow: "24 hours",
              },
            })
          }
        }
      }

      // Check for rapid order creation (potential fraud)
      if (event.eventType === "order_created") {
        const { data: recentOrders } = await supabase
          .from("security_logs")
          .select("*")
          .eq("user_id", event.userId)
          .eq("event_type", "order_created")
          .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour

        if (recentOrders && recentOrders.length >= 10) {
          await this.createSecurityAlert({
            type: "rapid_order_creation",
            severity: "high",
            message: "Unusually high order creation rate detected",
            userId: event.userId,
            metadata: {
              orderCount: recentOrders.length,
              timeWindow: "1 hour",
            },
          })
        }
      }
    } catch (error) {
      console.error("Failed to check security alerts:", error)
    }
  }

  // Create security alert
  static async createSecurityAlert(alert: Omit<SecurityAlert, "id" | "isResolved" | "createdAt">): Promise<void> {
    const supabase = await createClient()

    try {
      await supabase.from("security_alerts").insert({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        user_id: alert.userId,
        metadata: alert.metadata,
        is_resolved: false,
        created_at: new Date().toISOString(),
      })

      // Send notification for high/critical alerts
      if (alert.severity === "high" || alert.severity === "critical") {
        await this.sendSecurityNotification(alert)
      }
    } catch (error) {
      console.error("Failed to create security alert:", error)
    }
  }

  // Send security notification (email, webhook, etc.)
  static async sendSecurityNotification(alert: Omit<SecurityAlert, "id" | "isResolved" | "createdAt">): Promise<void> {
    // In production, integrate with email service, Slack, etc.
    console.log(`🚨 SECURITY ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`)

    // Example webhook notification
    try {
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Security Alert: ${alert.message}`,
            severity: alert.severity,
            metadata: alert.metadata,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error("Failed to send security notification:", error)
    }
  }

  // Get security dashboard data
  static async getSecurityDashboard(timeRange: "24h" | "7d" | "30d" = "24h"): Promise<{
    totalEvents: number
    alertsByType: Record<string, number>
    eventsByType: Record<string, number>
    recentAlerts: SecurityAlert[]
    threatLevel: "low" | "medium" | "high" | "critical"
  }> {
    const supabase = await createClient()

    const timeRangeHours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720
    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString()

    try {
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

      return {
        totalEvents: totalEvents || 0,
        alertsByType,
        eventsByType,
        recentAlerts: recentAlerts || [],
        threatLevel,
      }
    } catch (error) {
      console.error("Failed to get security dashboard data:", error)
      return {
        totalEvents: 0,
        alertsByType: {},
        eventsByType: {},
        recentAlerts: [],
        threatLevel: "low",
      }
    }
  }

  // Resolve security alert
  static async resolveAlert(alertId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    try {
      await supabase
        .from("security_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq("id", alertId)
    } catch (error) {
      console.error("Failed to resolve security alert:", error)
    }
  }
}
