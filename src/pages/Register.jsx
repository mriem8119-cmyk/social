


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    username: z
      .string()
      .regex(/^[a-z0-9_]{3,30}$/, 'Username: 3-30 lowercase letters, numbers or _'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female']),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        'Password: 8+ characters with upper, lower, number and symbol'
      ),
    rePassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'],
  })

function Register() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'male' },
  })

  async function onSubmit(formData) {
    setMessage('')

    const response = await fetch('https://route-posts.routemisr.com/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.success) {
      navigate('/login')
    } else {
      setMessage(data.message || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Register</h2>

      <label htmlFor="name">Name</label>
      <input type="text" id="name" {...register('name')} />
      {errors.name && <p className="field-error">{errors.name.message}</p>}

      <label htmlFor="username">Username</label>
      <input type="text" id="username" {...register('username')} />
      {errors.username && <p className="field-error">{errors.username.message}</p>}

      <label htmlFor="email">Email</label>
      <input type="email" id="email" {...register('email')} />
      {errors.email && <p className="field-error">{errors.email.message}</p>}

      <label htmlFor="dateOfBirth">Date of birth</label>
      <input type="date" id="dateOfBirth" {...register('dateOfBirth')} />
      {errors.dateOfBirth && <p className="field-error">{errors.dateOfBirth.message}</p>}

      <label htmlFor="gender">Gender</label>
      <select id="gender" {...register('gender')}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <label htmlFor="password">Password</label>
      <input type="password" id="password" {...register('password')} />
      {errors.password && <p className="field-error">{errors.password.message}</p>}

      <label htmlFor="rePassword">Confirm password</label>
      <input type="password" id="rePassword" {...register('rePassword')} />
      {errors.rePassword && <p className="field-error">{errors.rePassword.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing up...' : 'Sign up'}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  )
}

export default Register