

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = 'https://route-posts.routemisr.com'

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function fetchPosts() {
  const response = await fetch(`${API}/posts`, { headers: authHeader() })
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to load posts')
  }

  return data.data.posts
}

function Home() {
  const queryClient = useQueryClient()
  const userId = localStorage.getItem('userId')

  const [body, setBody] = useState('')
  const [image, setImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editBody, setEditBody] = useState('')

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  function refreshPosts() {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create post')
      }
    },
    onSuccess: refreshPosts,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ postId, newBody }) => {
      const formData = new FormData()
      formData.append('body', newBody)

      const response = await fetch(`${API}/posts/${postId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }
    },
    onSuccess: () => {
      setEditingId(null)
      refreshPosts()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await fetch(`${API}/posts/${postId}`, {
        method: 'DELETE',
        headers: authHeader(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
    },
    onSuccess: refreshPosts,
  })

  function handleCreate(e) {
    e.preventDefault()
    const form = e.target

    const formData = new FormData()
    formData.append('body', body)
    if (image) {
      formData.append('image', image)
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        form.reset()
        setBody('')
        setImage(null)
      },
    })
  }

  function startEdit(post) {
    setEditingId(post._id)
    setEditBody(post.body)
  }

  function handleDelete(postId) {
    if (window.confirm('Delete this post?')) {
      deleteMutation.mutate(postId)
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate}>
        <textarea
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="row-between">
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
        {createMutation.isError && (
          <p className="form-message">{createMutation.error.message}</p>
        )}
      </form>

      {isLoading && <p>Loading posts...</p>}
      {isError && <p className="form-message">{error.message}</p>}

      {posts.map((post) => (
        <article className="post-card" key={post._id}>
          <div className="post-header">
            <img className="avatar" src={post.user.photo} alt={post.user.name} />
            <div>
              <h3 className="post-author">{post.user.name}</h3>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {editingId === post._id ? (
            <div className="edit-box">
              <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} />
              <div className="row">
                <button
                  onClick={() => updateMutation.mutate({ postId: post._id, newBody: editBody })}
                  disabled={updateMutation.isPending}
                >
                  Save
                </button>
                <button className="btn-light" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="post-body">{post.body}</p>
          )}

          <div className="post-stats">
            <span>{post.likesCount} Likes · {post.commentsCount} Comments</span>
            <Link to={`/posts/${post._id}`}>View details</Link>
          </div>

          {post.user._id === userId && editingId !== post._id && (
            <div className="post-actions">
              <button className="btn-light" onClick={() => startEdit(post)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(post._id)}>Delete</button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

export default Home