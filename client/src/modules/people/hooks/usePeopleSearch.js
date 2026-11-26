import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { searchPeople } from "../state/peopleSlice"

export function usePeopleSearch() {
  const dispatch = useDispatch()
  const { query, sort, results, loading, nextCursor, loadedQuery, error, discoveryLoadingMore } = useSelector((state) => state.people)
  const pendingSearch = useRef(null)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const key = `${query}|${sort}`
      if (loadedQuery !== key) {
        pendingSearch.current?.abort()
        pendingSearch.current = dispatch(searchPeople({ query, sort }))
      }
    }, 250)
    return () => {
      window.clearTimeout(timer)
      pendingSearch.current?.abort()
    }
  }, [dispatch, query, sort, loadedQuery])
  return {
    query,
    sort,
    results,
    loading,
    nextCursor,
    error,
    discoveryLoadingMore,
    searchMore: () => !loading && nextCursor && dispatch(searchPeople({ query, sort, cursor: nextCursor })),
  }
}
