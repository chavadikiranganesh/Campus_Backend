import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface StudyGroup {
  id: number
  subject: string
  course: string
  semester: string
  size: number
  contact: string
  description: string
  members?: number[]
  postedByUserId?: number
  creatorEmail: string
  createdBy?: any
}

export function StudyGroupFinder() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<StudyGroup[]>([
    {
      id: 1,
      subject: 'Data Structures',
      course: 'B.E. CSE',
      semester: '3',
      size: 4,
      contact: '2022cse.r17@svce.edu.in',
      description: 'Study group for data structures and algorithms',
      members: [1, 2],
      creatorEmail: '2022cse.r17@svce.edu.in'
    },
    {
      id: 2,
      subject: 'Thermodynamics',
      course: 'B.E. Mechanical',
      semester: '5',
      size: 5,
      contact: 'student2@gmail.com',
      description: 'Thermodynamics problem solving sessions',
      members: [3, 4, 5],
      creatorEmail: 'student2@gmail.com'
    },
    {
      id: 3,
      subject: 'Operating Systems',
      course: 'B.E. ECE',
      semester: '4',
      size: 4,
      contact: 'student3@gmail.com',
      description: 'OS concepts and practical implementations',
      members: [6],
      creatorEmail: 'student3@gmail.com'
    },
    {
      id: 4,
      subject: 'Engineering Math II',
      course: 'B.E. CSE',
      semester: '2',
      size: 6,
      contact: 'student4@gmail.com',
      description: 'Mathematics study group for second semester',
      members: [],
      creatorEmail: 'student4@gmail.com'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [courseFilter, setCourseFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState('')
  const [size, setSize] = useState(4)
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState(user?.email ?? '')
  const [joiningId, setJoiningId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<StudyGroup | null>(null)
  const [editItem, setEditItem] = useState<StudyGroup | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE}/api/study-groups`)
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
        } else {
          // Fallback to sample data if API fails
          console.warn('API failed, using sample data')
        }
      } catch (error) {
        console.error('Failed to fetch study groups:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const payload = {
        subject,
        course,
        semester,
        size,
        contact: contact || user?.email || '',
        description,
        userId: user?.id
      }
      
      const response = await fetch(`${API_BASE}/api/study-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id || '')
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create group')
      }
      
      const newGroup = await response.json()
      setGroups((prev) => [...prev, newGroup])
      resetForm()
      setShowCreateModal(false)
    } catch (error) {
      setFormError((error as Error).message || 'Could not create group. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (group: StudyGroup) => {
    setEditItem(group)
    setSubject(group.subject)
    setCourse(group.course)
    setSemester(group.semester)
    setSize(group.size)
    setDescription(group.description)
    setContact(group.contact)
    setShowCreateModal(true)
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!editItem || !user) return

    setFormError(null)
    setSaving(true)
    try {
      const payload = {
        subject,
        course,
        semester,
        size,
        contact: contact || user?.email || '',
        description,
      }
      
      const response = await fetch(`${API_BASE}/api/study-groups/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id)
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update group')
      }
      
      const updatedGroup = await response.json()
      setGroups(prev => prev.map(g => g.id === editItem.id ? updatedGroup : g))
      resetForm()
      setShowCreateModal(false)
    } catch (error) {
      setFormError((error as Error).message || 'Could not update group. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSubject('')
    setCourse('')
    setSemester('')
    setSize(4)
    setDescription('')
    setContact(user?.email ?? '')
    setEditItem(null)
    setFormError(null)
  }

  const handleDelete = async (group: StudyGroup) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/study-groups/${group.id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete group')
      }

      setGroups((prev) => prev.filter((g) => g.id !== group.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    }
  }

  const canEdit = (group: StudyGroup) => {
    if (!user) {
      console.log('StudyGroup canEdit: No user logged in')
      return false
    }
    
    // Handle different data types and null values for createdBy
    const groupCreatorId = group.createdBy?.id
    const currentUserId = user.id
    
    // Convert both to numbers for comparison, handle null/undefined
    const groupCreatorIdNum = groupCreatorId != null ? Number(groupCreatorId) : null
    const currentUserIdNum = currentUserId != null ? Number(currentUserId) : null
    
    const isAdmin = user.role === 'admin'
    const isOwner = groupCreatorIdNum !== null && groupCreatorIdNum === currentUserIdNum
    
    console.log('StudyGroup canEdit check:', {
      userId: currentUserId,
      groupCreatorId,
      groupCreatorIdNum,
      currentUserIdNum,
      userRole: user.role,
      isAdmin,
      isOwner,
      canEditResult: isAdmin || isOwner
    })
    
    return isAdmin || isOwner
  }

  const canDelete = (group: StudyGroup) => {
    if (!user) {
      console.log('StudyGroup canDelete: No user logged in')
      return false
    }
    
    // Handle different data types and null values for createdBy
    const groupCreatorId = group.createdBy?.id
    const currentUserId = user.id
    
    // Convert both to numbers for comparison, handle null/undefined
    const groupCreatorIdNum = groupCreatorId != null ? Number(groupCreatorId) : null
    const currentUserIdNum = currentUserId != null ? Number(currentUserId) : null
    
    const isAdmin = user.role === 'admin'
    const isOwner = groupCreatorIdNum !== null && groupCreatorIdNum === currentUserIdNum
    
    console.log('StudyGroup canDelete check:', {
      userId: currentUserId,
      groupCreatorId,
      groupCreatorIdNum,
      currentUserIdNum,
      isAdmin,
      isOwner,
      canDeleteResult: isAdmin || isOwner
    })
    
    return isAdmin || isOwner
  }


  const filtered = groups.filter((g) => {
    const matchCourse = !courseFilter.trim() || g.course.toLowerCase().includes(courseFilter.toLowerCase())
    return matchCourse
  })

  const courses = [...new Set(groups.map((g) => g.course).filter(Boolean))].sort()

  const handleJoinGroup = async (groupId: number) => {
    if (!user?.id) return
    setJoiningId(groupId)
    try {
      const response = await fetch(`${API_BASE}/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'X-User-Id': String(user.id) }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to join group')
      }
      
      const updatedGroup = await response.json()
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g))
    } catch (error) {
      alert((error as Error).message || 'Failed to join group')
    } finally {
      setJoiningId(null)
    }
  }

  const handleContact = (email: string) => {
    window.open(`mailto:${email}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <main>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Study Groups
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find or create study groups by subject.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          + Create Group
        </button>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

        {/* Available Study Groups */}
        <section>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading study groups…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No study groups found. Create one to get started!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((group) => {
                const currentMembers = group.members?.length || 0
                const isJoined = user?.id && group.members?.includes(user.id)
                const isFull = currentMembers >= group.size
                
                return (
                  <article
                    key={group.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-slate-900/60"
                  >
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                          {group.subject}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {group.course} • Semester {group.semester}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Members: {currentMembers} / {group.size}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Creator: {group.createdBy?.name || group.contact}
                        </p>
                        {group.description && (
                          <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 dark:text-slate-300">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                          isJoined
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-200'
                            : isFull
                            ? 'bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-200'
                            : 'bg-blue-500/10 border border-blue-500/40 text-blue-700 dark:text-blue-200'
                        }`}
                      >
                        {isJoined ? 'Joined' : isFull ? 'Full' : `${currentMembers}/${group.size} members`}
                      </span>
                      <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                        <p>Contact: {group.contact}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 text-[11px]">
                      {canEdit(group) && (
                        <button
                          type="button"
                          onClick={() => handleEdit(group)}
                          className="rounded-full bg-amber-500 px-3 py-1 font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={isJoined || isFull || joiningId === group.id}
                        className={`rounded-full px-3 py-1 font-medium transition-colors ${
                          isJoined
                            ? 'bg-emerald-500 text-white cursor-not-allowed'
                            : isFull
                            ? 'bg-rose-500 text-white cursor-not-allowed'
                            : joiningId === group.id
                            ? 'bg-blue-500 text-blue-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                        }`}
                      >
                        {isJoined ? 'Joined' : isFull ? 'Full' : joiningId === group.id ? 'Joining...' : 'Join Group'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleContact(group.contact)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Contact
                      </button>
                      {canDelete(group) && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(group)}
                          className="rounded-full bg-rose-500 px-3 py-1 font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Create/Edit Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 sm:text-sm max-w-md w-full">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {editItem ? 'Edit Study Group' : 'Create Study Group'}
              </h2>
              <form onSubmit={editItem ? handleUpdate : handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Data Structures"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.E. CSE"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Max Members</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What's this study group about?"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>

                {formError && <p className="text-xs text-rose-500 dark:text-rose-400">{formError}</p>}

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    {saving ? (editItem ? 'Updating…' : 'Creating…') : (editItem ? 'Update Group' : 'Create Group')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 sm:text-sm max-w-md w-full">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 text-rose-600">
                Delete Study Group
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Are you sure you want to delete "{deleteConfirm.subject}"? This action cannot be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-full bg-rose-500 px-4 py-2 text-xs font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
