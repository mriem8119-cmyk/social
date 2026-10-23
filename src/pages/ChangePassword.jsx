

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

async function changePassword(formData) {
  const response = await fetch('https://route-posts.routemisr.com/users/change-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(formData),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

function ChangePassword() {
  const [formData, setFormData] = useState({
    password: '',
    newPassword: '',
  })

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token)
      }
      setFormData({ password: '', newPassword: '' })
    },
  })

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Change Password</h2>

      <label htmlFor="password">Current password</label>
      <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />

      <label htmlFor="newPassword">New password</label>
      <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Change password'}
      </button>

      {mutation.isError && <p className="form-message">{mutation.error.message}</p>}
      {mutation.isSuccess && <p className="form-success">Password changed successfully</p>}
    </form>
  )
}

export default ChangePassword