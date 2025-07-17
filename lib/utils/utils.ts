export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} s`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds * 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    if (remainingSeconds > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${hours}h`
    }
  } else {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${minutes}m`
    }
  }
}

export const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown Date"

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {weekday: "long", month: "long", day: "numeric", year: "numeric"})
}
export const formatTime = (dateString: string) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {hour: "numeric", minute: "2-digit", hour12: true})
}

export const formatWorkoutDuration = (seconds?: number) => {
  if (!seconds) return "Duration not recorded"
  return formatDuration(seconds)
}
