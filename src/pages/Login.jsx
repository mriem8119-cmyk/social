


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

function Login() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(formData) {
    setMessage('')

    const response = await fetch('https://route-posts.routemisr.com/users/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userId', data.data.user._id)
      navigate('/')
    } else {
      setMessage(data.message || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Login</h2>

      <label htmlFor="email">Email</label>
      <input type="email" id="email" {...register('email')} />
      {errors.email && <p className="field-error">{errors.email.message}</p>}

      <label htmlFor="password">Password</label>
      <input type="password" id="password" {...register('password')} />
      {errors.password && <p className="field-error">{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  )
}

export default Login