import { useMemo } from "react"
import { useSelector } from "react-redux"

export function useConversationFilters(search = "") {
  const { items, filter, statusFilter, showUnreadOnly } = useSelector((state) => state.conversations)
  const blockedIds = useSelector((state) => state.people.blockedIds)
  return useMemo(() => items.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "personal" ? item.type === "direct" : item.type === filter)
    const matchesUnread = !showUnreadOnly || item.unreadCount > 0
    const isBlocked = blockedIds.includes(item.userId)
    const matchesStatus = statusFilter === "all" || (statusFilter === "blocked" ? isBlocked || !item.canSendMessages : statusFilter === "unread" ? item.unreadCount > 0 : !item.unreadCount && !isBlocked)
    const matchesSearch = !search || `${item.name} ${item.preview}`.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesUnread && matchesStatus && matchesSearch
  }), [items, filter, statusFilter, showUnreadOnly, blockedIds, search])
}
