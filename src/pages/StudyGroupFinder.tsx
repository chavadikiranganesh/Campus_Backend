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
  createdBy?: string
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
    if (!user) return false
    return user.role === 'admin' || group.postedByUserId === user.id
  }

  const canDelete = (group: StudyGroup) => {
    if (!user) return false
    return user.role === 'admin' || group.postedByUserId === user.id
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Study Group Finder Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Study Group Finder</h1>
          <p className="text-gray-400 mb-8">Find or create study groups by subject.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <span className="text-xl">+</span> Create group
          </button>
        </section>

        {/* Filter Section */}
        <section className="mb-8">
          <div className="flex justify-center">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 min-w-[150px]"
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
          <h2 className="text-2xl font-bold mb-6">Available Study Groups</h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading study groups...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No study groups found. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((group) => {
                const currentMembers = group.members?.length || 0
                const isJoined = user?.id && group.members?.includes(user.id)
                const isFull = currentMembers >= group.size
                
                return (
                  <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                    <h3 className="text-lg font-semibold mb-3">{group.subject}</h3>
                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <p>Course: {group.course}</p>
                      <p>Semester: {group.semester}</p>
                      <p>Members: {currentMembers} / {group.size}</p>
                    </div>
                    <div className="text-xs text-gray-400 mb-6">
                      <p>Creator: {group.creatorEmail}</p>
                    </div>
                    <div className="flex gap-3">
                      {canEdit(group) && (
                        <button
                          onClick={() => handleEdit(group)}
                          className="flex-1 py-2 px-4 border border-gray-600 rounded font-medium hover:bg-amber-600 transition-colors text-sm text-gray-300 hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={isJoined || isFull || joiningId === group.id}
                        className={`flex-1 py-2 px-4 rounded font-medium transition-colors text-sm ${
                          isJoined
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : isFull
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : joiningId === group.id
                            ? 'bg-blue-600 text-blue-100'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isJoined ? 'Joined' : isFull ? 'Full' : joiningId === group.id ? 'Joining...' : 'Join Group'}
                      </button>
                      <button
                        onClick={() => handleContact(group.contact)}
                        className="flex-1 py-2 px-4 border border-gray-600 rounded font-medium hover:bg-gray-700 transition-colors text-sm text-gray-300 hover:text-white"
                      >
                        Contact
                      </button>
                      {canDelete(group) && (
                        <button
                          onClick={() => setDeleteConfirm(group)}
                          className="flex-1 py-2 px-4 bg-red-600 rounded font-medium hover:bg-red-700 transition-colors text-sm text-white"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create Study Group</h2>
              <form onSubmit={editItem ? handleUpdate : handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Data Structures"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.E. CSE"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Members</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What you'll cover, schedule, etc."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                {formError && (
                  <p className="text-red-400 text-sm">{formError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="flex-1 py-2 px-4 border border-gray-600 rounded font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded font-medium text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? (editItem ? 'Updating...' : 'Creating...') : (editItem ? 'Update Group' : 'Create Group')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-red-400">Delete Study Group</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{deleteConfirm.subject}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 border border-gray-600 rounded font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded font-medium text-white transition-colors"
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
