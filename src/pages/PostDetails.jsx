

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = 'https://route-posts.routemisr.com'

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function fetchPost(postId) {
  const response = await fetch(`${API}/posts/${postId}`, { headers: authHeader() })
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to load post')
  }

  return data.data.post
}

async function fetchComments(postId) {
  const response = await fetch(`${API}/posts/${postId}/comments?page=1&limit=10`, {
    headers: authHeader(),
  })
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to load comments')
  }

  return data.data.comments
}

function PostDetails() {
  const { postId } = useParams()
  const queryClient = useQueryClient()
  const userId = localStorage.getItem('userId')

  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const { data: post, isLoading: postLoading, isError: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  })

  function refreshComments() {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] })
  }

  const createMutation = useMutation({
    mutationFn: async (text) => {
      const formData = new FormData()
      formData.append('content', text)

      const response = await fetch(`${API}/posts/${postId}/comments`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to add comment')
      }
    },
    onSuccess: () => {
      setContent('')
      refreshComments()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ commentId, text }) => {
      const formData = new FormData()
      formData.append('content', text)

      const response = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }
    },
    onSuccess: () => {
      setEditingId(null)
      refreshComments()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (commentId) => {
      const response = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeader(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
    },
    onSuccess: refreshComments,
  })

  function handleCreateComment(e) {
    e.preventDefault()
    createMutation.mutate(content)
  }

  function startEdit(comment) {
    setEditingId(comment._id)
    setEditContent(comment.content)
  }

  function handleDeleteComment(commentId) {
    if (window.confirm('Delete this comment?')) {
      deleteMutation.mutate(commentId)
    }
  }

  return (
    <div>
      {postLoading && <p>Loading post...</p>}
      {postError && <p className="form-message">Could not load this post</p>}

      {post && (
        <article className="post-card">
          <div className="post-header">
            <img className="avatar" src={post.user.photo} alt={post.user.name} />
            <div>
              <h3 className="post-author">{post.user.name}</h3>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="post-body">{post.body}</p>
          <div className="post-stats">
            <span>{post.likesCount} Likes · {comments.length} Comments</span>
          </div>
        </article>
      )}

      <form onSubmit={handleCreateComment}>
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="row-between">
          <span></span>
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Sending...' : 'Comment'}
          </button>
        </div>
        {createMutation.isError && (
          <p className="form-message">{createMutation.error.message}</p>
        )}
      </form>

      <h3 className="comments-title">Comments ({comments.length})</h3>

      {comments.map((comment) => {
        const creator = comment.user || comment.commentCreator

        return (
          <div className="comment" key={comment._id}>
            <img className="avatar avatar-sm" src={creator?.photo} alt={creator?.name} />

            <div className="comment-bubble">
              <div className="comment-author">{creator?.name}</div>

              {editingId === comment._id ? (
                <div className="edit-box">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className="row">
                    <button
                      onClick={() => updateMutation.mutate({ commentId: comment._id, text: editContent })}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </button>
                    <button className="btn-light" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p>{comment.content}</p>
              )}

              {creator?._id === userId && editingId !== comment._id && (
                <div className="comment-actions">
                  <button className="btn-light" onClick={() => startEdit(comment)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PostDetails